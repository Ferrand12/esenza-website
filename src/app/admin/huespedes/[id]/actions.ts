"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateGuestTags(
  id: string,
  tags: string[],
): Promise<ActionResult> {
  const cleaned = Array.from(
    new Set(
      tags
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30),
    ),
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({ tags: cleaned })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/huespedes/${id}`);
  revalidatePath("/admin/huespedes");
  return { ok: true };
}

export async function updateGuestNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({ notes: notes.trim() || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/huespedes/${id}`);
  return { ok: true };
}

export async function updateGuestInfo(
  id: string,
  input: {
    full_name: string;
    phone: string;
    email: string | null;
    country: string | null;
  },
): Promise<ActionResult> {
  const fullName = input.full_name.trim();
  const phone = input.phone.trim();
  if (!fullName) return { ok: false, error: "El nombre es requerido." };
  if (!phone) return { ok: false, error: "El teléfono es requerido." };
  const email = input.email?.trim().toLowerCase() || null;
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Email inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("guests")
    .update({
      full_name: fullName,
      phone,
      email,
      country: input.country?.trim() || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/huespedes/${id}`);
  revalidatePath("/admin/huespedes");
  return { ok: true };
}
