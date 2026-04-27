import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendPreCheckinReminder,
  sendPostStayFollowup,
} from "@/lib/email/resend";
import { buildReviewUrl } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MARKER_PRE = "[AUTO:pre_checkin]";
const MARKER_POST = "[AUTO:post_stay]";

type BookingWithGuest = {
  id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  package: string;
  total_price: number;
  status: string;
  guest: { full_name: string; email: string | null } | null;
};

function todayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function handle(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = todayISO();
  const inTwoDays = shiftDays(today, 2);
  const yesterday = shiftDays(today, -1);

  const errors: string[] = [];
  let preCheckinSent = 0;
  let postStaySent = 0;
  let closedStays = 0;
  let slaAlerts = 0;

  // --- Load contact config for email body links ---
  const { data: contactCfg } = await admin
    .from("site_config")
    .select("value")
    .eq("key", "contact")
    .single();
  const contact =
    (contactCfg?.value as {
      whatsapp?: string;
      location?: string;
    } | null) ?? {};
  const whatsapp = contact.whatsapp || "+573001234567";
  const location = contact.location || "Cundinamarca, Colombia";

  // --- Step 1: close past confirmed stays ---
  {
    const { data, error } = await admin
      .from("bookings")
      .update({ status: "completed" })
      .eq("status", "confirmed")
      .lte("check_out", today)
      .select("id");
    if (error) {
      errors.push(`close-past: ${error.message}`);
    } else {
      closedStays = data?.length ?? 0;
    }
  }

  // --- Step 2: pre-check-in reminders (check_in = today + 2, status=confirmed) ---
  {
    const { data: candidates, error } = await admin
      .from("bookings")
      .select(
        "id, guest_id, check_in, check_out, num_guests, package, total_price, status, guest:guests(full_name, email)",
      )
      .eq("check_in", inTwoDays)
      .eq("status", "confirmed")
      .returns<BookingWithGuest[]>();

    if (error) {
      errors.push(`pre-checkin query: ${error.message}`);
    } else if (candidates && candidates.length > 0) {
      // Find bookings that already got the reminder.
      const ids = candidates.map((c) => c.id);
      const { data: existingComms } = await admin
        .from("communications")
        .select("booking_id")
        .in("booking_id", ids)
        .like("content", `${MARKER_PRE}%`);
      const alreadySent = new Set(
        (existingComms ?? []).map((c) => c.booking_id),
      );

      for (const b of candidates) {
        if (alreadySent.has(b.id)) continue;
        if (!b.guest?.email) continue;

        try {
          await sendPreCheckinReminder(b.guest.email, {
            guestName: b.guest.full_name,
            checkIn: b.check_in,
            checkOut: b.check_out,
            numGuests: b.num_guests,
            packageName: b.package,
            totalPrice: Number(b.total_price),
            whatsapp,
            location,
          });

          await admin.from("communications").insert({
            guest_id: b.guest_id,
            booking_id: b.id,
            channel: "email",
            direction: "outbound",
            content: `${MARKER_PRE} Recordatorio automatizado enviado 2 días antes del check-in (${b.check_in}).`,
          });
          preCheckinSent++;
        } catch (e) {
          errors.push(
            `pre-checkin send ${b.id}: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  // --- Step 3: post-stay followups (check_out = yesterday, status in completed) ---
  {
    const { data: candidates, error } = await admin
      .from("bookings")
      .select(
        "id, guest_id, check_in, check_out, num_guests, package, total_price, status, guest:guests(full_name, email)",
      )
      .eq("check_out", yesterday)
      .in("status", ["completed", "confirmed"])
      .returns<BookingWithGuest[]>();

    if (error) {
      errors.push(`post-stay query: ${error.message}`);
    } else if (candidates && candidates.length > 0) {
      const ids = candidates.map((c) => c.id);
      const { data: existingComms } = await admin
        .from("communications")
        .select("booking_id")
        .in("booking_id", ids)
        .like("content", `${MARKER_POST}%`);
      const alreadySent = new Set(
        (existingComms ?? []).map((c) => c.booking_id),
      );

      for (const b of candidates) {
        if (alreadySent.has(b.id)) continue;
        if (!b.guest?.email) continue;

        try {
          const reviewUrl = buildReviewUrl(b.id);
          await sendPostStayFollowup(b.guest.email, {
            guestName: b.guest.full_name,
            whatsapp,
            reviewUrl,
          });
          await admin.from("communications").insert({
            guest_id: b.guest_id,
            booking_id: b.id,
            channel: "email",
            direction: "outbound",
            content: `${MARKER_POST} Follow-up automatizado enviado el día después del check-out (${b.check_out}).`,
          });
          postStaySent++;
        } catch (e) {
          errors.push(
            `post-stay send ${b.id}: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  // --- Step 4: PQRSF SLA breach alert ---
  {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data: overdue, error } = await admin
      .from("complaints")
      .select("id, tracking_code, type, subject, guest_name, sla_due_at, priority")
      .in("status", ["nuevo", "en_proceso"])
      .lte("sla_due_at", new Date().toISOString())
      .limit(50);

    if (error && error.code !== "42P01") {
      errors.push(`sla query: ${error.message}`);
    } else if (overdue && overdue.length > 0) {
      // Buscar el último alert enviado por comment/event (marker)
      const alertKey = `[AUTO:sla_alert:${todayISO()}]`;
      const { data: existingEvents } = await admin
        .from("complaint_events")
        .select("complaint_id, note")
        .in(
          "complaint_id",
          overdue.map((o) => o.id),
        )
        .like("note", `${alertKey}%`);
      const alertedToday = new Set(
        (existingEvents ?? []).map((e) => e.complaint_id),
      );

      const toAlert = overdue.filter((o) => !alertedToday.has(o.id));
      if (toAlert.length > 0 && process.env.ADMIN_NOTIFICATION_EMAIL) {
        const { sendSlaBreachAlert } = await import("@/lib/email/resend");
        try {
          await sendSlaBreachAlert(process.env.ADMIN_NOTIFICATION_EMAIL, {
            complaints: toAlert.map((o) => ({
              trackingCode: o.tracking_code,
              type: o.type,
              subject: o.subject,
              guestName: o.guest_name,
              slaDueAt: o.sla_due_at,
              priority: o.priority,
              url: `${siteUrl}/admin/pqrsf/${o.id}`,
            })),
          });
          // Marcar como alertadas hoy para no duplicar
          await admin.from("complaint_events").insert(
            toAlert.map((o) => ({
              complaint_id: o.id,
              event_type: "sla_alert_sent",
              note: `${alertKey} Alerta automática a admin.`,
            })),
          );
          slaAlerts = toAlert.length;
        } catch (e) {
          errors.push(
            `sla alert: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  // --- Log run ---
  const totalEvents = preCheckinSent + postStaySent + closedStays + slaAlerts;
  const status =
    errors.length === 0
      ? "success"
      : totalEvents > 0
        ? "partial"
        : "failed";

  await admin.from("sync_log").insert({
    source: "daily-automations",
    status,
    events_imported: totalEvents,
    errors: errors.length > 0 ? errors : null,
  });

  return NextResponse.json({
    ok: errors.length === 0,
    preCheckinSent,
    postStaySent,
    closedStays,
    slaAlerts,
    errors,
  });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
