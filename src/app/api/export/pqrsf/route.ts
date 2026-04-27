import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_TYPE_LABEL, COMPLAINT_STATUS_LABEL } from "@/lib/pqrsf";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields: unknown[]): string {
  return fields.map(csvEscape).join(",");
}

type Row = {
  id: string;
  tracking_code: string;
  type: string;
  subject: string;
  description: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  status: string;
  priority: string;
  channel: string;
  sla_due_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  assigned: { full_name: string | null; email: string } | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("complaints")
    .select(
      "id, tracking_code, type, subject, description, guest_name, guest_email, guest_phone, status, priority, channel, sla_due_at, resolved_at, resolution_notes, created_at, assigned:profiles!complaints_assigned_to_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Código",
    "Tipo",
    "Asunto",
    "Descripción",
    "Estado",
    "Prioridad",
    "Canal",
    "Remitente",
    "Email",
    "Teléfono",
    "Asignado a",
    "Radicada",
    "SLA",
    "Resuelta",
    "Respuesta",
  ];
  const lines = [csvRow(header)];
  for (const r of data ?? []) {
    lines.push(
      csvRow([
        r.tracking_code,
        COMPLAINT_TYPE_LABEL[r.type as keyof typeof COMPLAINT_TYPE_LABEL] || r.type,
        r.subject,
        r.description,
        COMPLAINT_STATUS_LABEL[
          r.status as keyof typeof COMPLAINT_STATUS_LABEL
        ] || r.status,
        r.priority,
        r.channel,
        r.guest_name,
        r.guest_email,
        r.guest_phone ?? "",
        r.assigned?.full_name ?? r.assigned?.email ?? "",
        r.created_at,
        r.sla_due_at,
        r.resolved_at ?? "",
        r.resolution_notes ?? "",
      ]),
    );
  }

  const csv = "﻿" + lines.join("\r\n");
  const filename = `esenza-pqrsf-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
