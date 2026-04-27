import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMonthlyPqrsfReport } from "@/lib/email/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Rango: primer día del mes pasado hasta el primer día de este mes (exclusivo)
  const now = new Date();
  const startOfThisMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const startOfLastMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  const { data, error } = await admin
    .from("complaints")
    .select(
      "id, type, status, priority, sla_due_at, resolved_at, created_at, ai_classification",
    )
    .gte("created_at", startOfLastMonth.toISOString())
    .lt("created_at", startOfThisMonth.toISOString())
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const complaints = data ?? [];
  const total = complaints.length;

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byArea: Record<string, number> = {};
  let slaBreached = 0;
  let resolvedCount = 0;
  let resolutionTotalHours = 0;

  for (const c of complaints) {
    byType[c.type] = (byType[c.type] ?? 0) + 1;
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    const area = (c.ai_classification as { area?: string } | null)?.area;
    if (area) byArea[area] = (byArea[area] ?? 0) + 1;

    const sla = new Date(c.sla_due_at).getTime();
    if (c.resolved_at) {
      resolvedCount++;
      const resolved = new Date(c.resolved_at).getTime();
      const created = new Date(c.created_at).getTime();
      resolutionTotalHours += (resolved - created) / (1000 * 60 * 60);
      if (resolved > sla) slaBreached++;
    } else if (Date.now() > sla) {
      slaBreached++;
    }
  }

  const avgResolutionDays =
    resolvedCount > 0
      ? resolutionTotalHours / resolvedCount / 24
      : null;
  const slaCompliance =
    total > 0 ? ((total - slaBreached) / total) * 100 : 100;

  const notify = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (notify && total > 0) {
    try {
      await sendMonthlyPqrsfReport(notify, {
        monthLabel: startOfLastMonth.toLocaleDateString("es-CO", {
          month: "long",
          year: "numeric",
        }),
        total,
        byType,
        byStatus,
        byArea,
        slaBreached,
        slaCompliance,
        avgResolutionDays,
      });
    } catch (e) {
      console.error("[monthly-pqrsf] email:", e);
    }
  }

  await admin.from("sync_log").insert({
    source: "monthly-pqrsf-report",
    status: "success",
    events_imported: total,
    errors: null,
  });

  await admin.from("site_config").upsert(
    {
      key: "monthly_report_last_run",
      value: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  return NextResponse.json({
    ok: true,
    total,
    slaBreached,
    slaCompliance: slaCompliance.toFixed(1),
    avgResolutionDays: avgResolutionDays?.toFixed(1) ?? null,
  });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
