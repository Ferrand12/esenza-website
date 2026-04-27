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
  rating: number;
  title: string | null;
  content: string;
  display_name: string;
  source: string;
  status: string;
  language: string;
  response: string | null;
  response_at: string | null;
  ai_sentiment: string | null;
  submitted_at: string;
  booking_id: string | null;
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
    .from("reviews")
    .select(
      "id, rating, title, content, display_name, source, status, language, response, response_at, ai_sentiment, submitted_at, booking_id",
    )
    .order("submitted_at", { ascending: false })
    .returns<Row[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "ID",
    "Enviada",
    "Rating",
    "Título",
    "Contenido",
    "Nombre",
    "Origen",
    "Estado",
    "Idioma",
    "Sentiment (AI)",
    "Respuesta",
    "Respondida",
    "Booking",
  ];
  const lines = [csvRow(header)];
  for (const r of data ?? []) {
    lines.push(
      csvRow([
        r.id,
        r.submitted_at,
        r.rating,
        r.title ?? "",
        r.content,
        r.display_name,
        r.source,
        r.status,
        r.language,
        r.ai_sentiment ?? "",
        r.response ?? "",
        r.response_at ?? "",
        r.booking_id ?? "",
      ]),
    );
  }

  const csv = "﻿" + lines.join("\r\n");
  const filename = `esenza-reviews-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
