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

function nightsBetween(ci: string, co: string): number {
  return Math.round(
    (new Date(co).getTime() - new Date(ci).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

type Row = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  package: string;
  total_price: number;
  status: string;
  source: string;
  special_requests: string | null;
  internal_notes: string | null;
  created_at: string;
  guest: {
    full_name: string;
    email: string | null;
    phone: string;
    country: string | null;
  } | null;
};

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const q = url.searchParams.get("q");

  let query = supabase
    .from("bookings")
    .select(
      "id, check_in, check_out, num_guests, package, total_price, status, source, special_requests, internal_notes, created_at, guest:guests(full_name, email, phone, country)",
    )
    .order("check_in", { ascending: false });

  if (
    status &&
    ["pending", "confirmed", "cancelled", "completed"].includes(status)
  ) {
    query = query.eq("status", status);
  }
  if (source && ["web", "airbnb", "manual", "whatsapp"].includes(source)) {
    query = query.eq("source", source);
  }

  const { data, error } = await query.returns<Row[]>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let rows = data ?? [];
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.guest?.full_name?.toLowerCase().includes(needle) ||
        r.guest?.email?.toLowerCase().includes(needle) ||
        r.guest?.phone?.toLowerCase().includes(needle),
    );
  }

  const header = [
    "ID",
    "Creada",
    "Check-in",
    "Check-out",
    "Noches",
    "Pax",
    "Paquete",
    "Precio total (COP)",
    "Estado",
    "Origen",
    "Huésped",
    "Email",
    "Teléfono",
    "País",
    "Pedidos especiales",
    "Notas internas",
  ];

  const lines = [csvRow(header)];
  for (const r of rows) {
    lines.push(
      csvRow([
        r.id,
        r.created_at,
        r.check_in,
        r.check_out,
        nightsBetween(r.check_in, r.check_out),
        r.num_guests,
        r.package,
        Math.round(Number(r.total_price)),
        r.status,
        r.source,
        r.guest?.full_name ?? "",
        r.guest?.email ?? "",
        r.guest?.phone ?? "",
        r.guest?.country ?? "",
        r.special_requests ?? "",
        r.internal_notes ?? "",
      ]),
    );
  }

  const csv = "﻿" + lines.join("\r\n");
  const filename = `esenza-reservas-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
