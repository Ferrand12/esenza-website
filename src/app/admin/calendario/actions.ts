"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function createBlock(input: {
  start_date: string;
  end_date: string;
  reason: string;
}): Promise<Result> {
  if (!DATE_RE.test(input.start_date) || !DATE_RE.test(input.end_date)) {
    return { ok: false, error: "Fechas con formato inválido." };
  }
  if (input.end_date <= input.start_date) {
    return {
      ok: false,
      error: "La fecha de fin debe ser posterior a la de inicio.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_blocks").insert({
    start_date: input.start_date,
    end_date: input.end_date,
    reason: input.reason.trim() || null,
    source: "manual",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/calendario");
  return { ok: true };
}

export async function deleteBlock(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_blocks")
    .delete()
    .eq("id", id)
    .eq("source", "manual");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/calendario");
  return { ok: true };
}
