import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/bookings/availability?from=2026-04-01&to=2026-06-30
 * Returns all blocked date ranges (bookings + calendar_blocks).
 * Public endpoint — used by the date picker on /reservar.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing from/to query params" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // Fetch confirmed/pending bookings that overlap with the range
  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .in("status", ["pending", "confirmed"])
    .lte("check_in", to)
    .gte("check_out", from);

  if (bErr) {
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  // Fetch calendar blocks that overlap with the range
  const { data: blocks, error: blErr } = await supabase
    .from("calendar_blocks")
    .select("start_date, end_date")
    .lte("start_date", to)
    .gte("end_date", from);

  if (blErr) {
    return NextResponse.json({ error: blErr.message }, { status: 500 });
  }

  // Build a flat array of blocked date ranges
  const blockedRanges = [
    ...(bookings ?? []).map((b) => ({
      from: b.check_in,
      to: b.check_out,
    })),
    ...(blocks ?? []).map((b) => ({
      from: b.start_date,
      to: b.end_date,
    })),
  ];

  return NextResponse.json(
    { blockedRanges },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
