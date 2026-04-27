import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * GET /api/ical/esenza.ics
 * Outbound iCal feed of confirmed/pending bookings + manual blocks.
 * Import URL into Airbnb / Booking.com so they don't double-book.
 * Public endpoint — exposes only date ranges, no PII.
 */
export async function GET(request: Request) {
  const supabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const domain = new URL(siteUrl).hostname;

  const todayMinus30 = new Date(Date.now() - 30 * 86400_000)
    .toISOString()
    .slice(0, 10);

  const [bookingsRes, blocksRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, check_in, check_out, status, updated_at")
      .in("status", ["pending", "confirmed"])
      .gte("check_out", todayMinus30),
    supabase
      .from("calendar_blocks")
      .select("id, start_date, end_date, reason, source")
      .eq("source", "manual")
      .gte("end_date", todayMinus30),
  ]);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Esenza//Reservations//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Esenza · Reservas",
    "X-WR-TIMEZONE:America/Bogota",
  ];

  const stamp = formatICalDateTime(new Date());

  for (const b of bookingsRes.data ?? []) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@${domain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICalDate(b.check_in)}`,
      `DTEND;VALUE=DATE:${toICalDate(b.check_out)}`,
      `SUMMARY:Reservado (${b.status === "confirmed" ? "Confirmada" : "Pendiente"})`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  for (const k of blocksRes.data ?? []) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:block-${k.id}@${domain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICalDate(k.start_date)}`,
      `DTEND;VALUE=DATE:${toICalDate(k.end_date)}`,
      `SUMMARY:Bloqueado${k.reason ? ` · ${escape(k.reason)}` : ""}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n") + "\r\n", {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="esenza.ics"',
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function toICalDate(iso: string): string {
  return iso.replaceAll("-", "");
}

function formatICalDateTime(d: Date): string {
  return (
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "").slice(0, 15) + "Z"
  );
}

function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
