import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  full_name: string;
  email: string | null;
  phone: string;
  country: string | null;
  tags: string[] | null;
  notes: string | null;
  total_bookings: number;
  total_spent: number;
  created_at: string;
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
    .maybeSingle<{ role: "owner" | "staff" }>();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("guests")
    .select(
      "id, full_name, email, phone, country, tags, notes, total_bookings, total_spent, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "ID",
    "Nombre",
    "Email",
    "Teléfono",
    "País",
    "Tags",
    "Total reservas",
    "Total gastado (COP)",
    "Notas",
    "Fecha registro",
  ];

  const lines = [csvRow(header)];
  for (const r of data ?? []) {
    lines.push(
      csvRow([
        r.id,
        r.full_name,
        r.email ?? "",
        r.phone,
        r.country ?? "",
        (r.tags ?? []).join("; "),
        r.total_bookings,
        Math.round(Number(r.total_spent)),
        r.notes ?? "",
        r.created_at,
      ]),
    );
  }

  const csv = "﻿" + lines.join("\r\n");
  const filename = `esenza-huespedes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
