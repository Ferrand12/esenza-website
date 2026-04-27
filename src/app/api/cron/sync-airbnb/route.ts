import { NextResponse } from "next/server";
import ical from "node-ical";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST/GET /api/cron/sync-airbnb
 * Imports blocked dates from the Airbnb iCal URL stored in site_config
 * into calendar_blocks (source='airbnb_sync'). Idempotent via (source, external_id).
 *
 * Auth: requires Authorization: Bearer <CRON_SECRET>.
 * Vercel Cron sends this header automatically when configured in vercel.json.
 */
async function handle(request: Request) {
  // Auth
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get iCal URL from config
  const { data: cfg, error: cfgErr } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "airbnb_ical_url")
    .single();

  if (cfgErr) {
    return NextResponse.json(
      { error: `Config read failed: ${cfgErr.message}` },
      { status: 500 },
    );
  }

  const url =
    typeof cfg?.value === "string"
      ? cfg.value
      : (cfg?.value as { url?: string } | null)?.url ?? "";

  if (!url || !/^https?:\/\//.test(url)) {
    await supabase.from("sync_log").insert({
      source: "airbnb",
      status: "failed",
      events_imported: 0,
      errors: { reason: "airbnb_ical_url not configured" },
    });
    return NextResponse.json(
      { error: "airbnb_ical_url is not configured in site_config" },
      { status: 400 },
    );
  }

  // Fetch + parse iCal
  let events: ical.CalendarResponse;
  try {
    events = await ical.async.fromURL(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("sync_log").insert({
      source: "airbnb",
      status: "failed",
      events_imported: 0,
      errors: { reason: "fetch_failed", message: msg },
    });
    return NextResponse.json(
      { error: `Failed to fetch iCal: ${msg}` },
      { status: 502 },
    );
  }

  type BlockRow = {
    start_date: string;
    end_date: string;
    reason: string | null;
    source: "airbnb_sync";
    external_id: string;
  };

  const rows: BlockRow[] = [];
  const errors: { uid?: string; reason: string }[] = [];

  for (const [, ev] of Object.entries(events)) {
    if (!ev || ev.type !== "VEVENT") continue;
    const uid = ev.uid;
    const start = ev.start;
    const end = ev.end;
    if (!uid || !start || !end) {
      errors.push({ uid, reason: "missing uid/start/end" });
      continue;
    }
    const startDate = toDateOnly(start);
    const endDate = toDateOnly(end);
    if (endDate <= startDate) {
      errors.push({ uid, reason: "invalid range" });
      continue;
    }
    rows.push({
      start_date: startDate,
      end_date: endDate,
      reason: ev.summary?.toString() ?? "Airbnb",
      source: "airbnb_sync",
      external_id: uid,
    });
  }

  let imported = 0;
  if (rows.length > 0) {
    const { error: upsertErr, count } = await supabase
      .from("calendar_blocks")
      .upsert(rows, { onConflict: "source,external_id", count: "exact" });

    if (upsertErr) {
      await supabase.from("sync_log").insert({
        source: "airbnb",
        status: "failed",
        events_imported: 0,
        errors: { reason: "upsert_failed", message: upsertErr.message },
      });
      return NextResponse.json(
        { error: `Upsert failed: ${upsertErr.message}` },
        { status: 500 },
      );
    }
    imported = count ?? rows.length;
  }

  // Remove stale blocks (events no longer in feed)
  const seenIds = rows.map((r) => r.external_id);
  if (seenIds.length > 0) {
    await supabase
      .from("calendar_blocks")
      .delete()
      .eq("source", "airbnb_sync")
      .not("external_id", "in", `(${seenIds.map((id) => `"${id}"`).join(",")})`);
  }

  const status = errors.length > 0 ? "partial" : "success";
  await supabase.from("sync_log").insert({
    source: "airbnb",
    status,
    events_imported: imported,
    errors: errors.length > 0 ? errors : null,
  });

  return NextResponse.json({
    ok: true,
    imported,
    skipped: errors.length,
    status,
  });
}

function toDateOnly(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
