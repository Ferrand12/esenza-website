"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ConfigValues = {
  packages: {
    esencia: number;
    armonia: number;
    plenitud: number;
  };
  contact: {
    whatsapp: string;
    email: string;
    location: string;
  };
  airbnb_ical_url: string;
  max_guests: number;
};

type Result = { ok: true } | { ok: false; error: string };

function parseMoney(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export async function updateSiteConfig(formData: FormData): Promise<Result> {
  const esencia = parseMoney(formData.get("esencia"));
  const armonia = parseMoney(formData.get("armonia"));
  const plenitud = parseMoney(formData.get("plenitud"));

  if (esencia === null || armonia === null || plenitud === null) {
    return { ok: false, error: "Los precios deben ser números positivos." };
  }
  if (esencia === 0 || armonia === 0 || plenitud === 0) {
    return { ok: false, error: "Los precios no pueden ser cero." };
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!whatsapp || !email || !location) {
    return { ok: false, error: "Completá todos los datos de contacto." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "El email no tiene un formato válido." };
  }

  const icalUrl = String(formData.get("airbnb_ical_url") ?? "").trim();
  if (icalUrl && !/^https?:\/\/.+/.test(icalUrl)) {
    return {
      ok: false,
      error: "La URL de iCal debe empezar con http:// o https://",
    };
  }

  const maxGuestsRaw = Number(formData.get("max_guests"));
  if (!Number.isInteger(maxGuestsRaw) || maxGuestsRaw < 1 || maxGuestsRaw > 50) {
    return {
      ok: false,
      error: "Capacidad máxima debe ser un entero entre 1 y 50.",
    };
  }

  const supabase = await createClient();

  const rows = [
    { key: "packages", value: { esencia, armonia, plenitud } },
    { key: "contact", value: { whatsapp, email, location } },
    { key: "airbnb_ical_url", value: icalUrl },
    { key: "max_guests", value: maxGuestsRaw },
  ];

  const { error } = await supabase.from("site_config").upsert(rows, {
    onConflict: "key",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/config");
  revalidatePath("/admin/sync");
  revalidatePath("/");
  revalidatePath("/reservar");
  return { ok: true };
}

// ----------------------------------------------------------------------------
// PQRSF response templates
// ----------------------------------------------------------------------------
export type ResponseTemplate = {
  id: string;
  name: string;
  body: string;
};

export async function saveResponseTemplates(
  templates: ResponseTemplate[],
): Promise<Result> {
  const cleaned = templates
    .map((t) => ({
      id: String(t.id || "").trim() || crypto.randomUUID(),
      name: String(t.name || "").trim().slice(0, 80),
      body: String(t.body || "").trim(),
    }))
    .filter((t) => t.name && t.body);

  const supabase = await createClient();
  const { error } = await supabase.from("site_config").upsert(
    {
      key: "pqrsf_response_templates",
      value: cleaned,
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  revalidatePath("/admin/pqrsf");
  return { ok: true };
}
