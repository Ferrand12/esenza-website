"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { KNOWN_SLOTS } from "@/lib/site-images";

type Result = { ok: true } | { ok: false; error: string };

const BUCKET = "site-images";
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "bin";
}

function isKnown(section: string, slot: string): boolean {
  return KNOWN_SLOTS.some((k) => k.section === section && k.slot === slot);
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function uploadSiteImage(formData: FormData): Promise<Result> {
  const section = String(formData.get("section") ?? "").trim();
  const slot = String(formData.get("slot") ?? "").trim();
  const alt = String(formData.get("alt_text") ?? "").trim();
  const file = formData.get("file");

  if (!section || !slot || !isKnown(section, slot)) {
    return { ok: false, error: "Sección o slot inválido." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Seleccioná un archivo de imagen." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "La imagen supera 8 MB." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: "Formato no soportado. Usá JPG, PNG, WebP o AVIF.",
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sesión expirada." };

  const admin = createAdminClient();
  const ext = extFromMime(file.type);
  const path = `${section}/${slot}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });
  if (upErr) {
    return { ok: false, error: `Error al subir: ${upErr.message}` };
  }

  // Borrar el archivo anterior si había uno.
  const { data: existing } = await admin
    .from("site_images")
    .select("storage_path")
    .eq("section", section)
    .eq("slot", slot)
    .maybeSingle();

  if (existing?.storage_path && existing.storage_path !== path) {
    await admin.storage.from(BUCKET).remove([existing.storage_path]);
  }

  const { error: rowErr } = await admin.from("site_images").upsert(
    {
      section,
      slot,
      storage_path: path,
      alt_text: alt || null,
      updated_by: userId,
    },
    { onConflict: "section,slot" },
  );

  if (rowErr) {
    await admin.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `Error guardando registro: ${rowErr.message}` };
  }

  revalidatePath("/admin/fotos");
  revalidatePath("/");
  return { ok: true };
}

export async function updateAltText(
  section: string,
  slot: string,
  alt: string,
): Promise<Result> {
  if (!isKnown(section, slot)) {
    return { ok: false, error: "Slot inválido." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_images")
    .update({ alt_text: alt.trim() || null })
    .eq("section", section)
    .eq("slot", slot);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/fotos");
  revalidatePath("/");
  return { ok: true };
}

export async function resetSiteImage(
  section: string,
  slot: string,
): Promise<Result> {
  if (!isKnown(section, slot)) {
    return { ok: false, error: "Slot inválido." };
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("site_images")
    .select("storage_path")
    .eq("section", section)
    .eq("slot", slot)
    .maybeSingle();

  if (!existing) return { ok: true };

  await admin.storage.from(BUCKET).remove([existing.storage_path]);

  const { error } = await admin
    .from("site_images")
    .delete()
    .eq("section", section)
    .eq("slot", slot);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/fotos");
  revalidatePath("/");
  return { ok: true };
}
