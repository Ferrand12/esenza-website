"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReviewStatus } from "@/lib/reviews";

type Result = { ok: true } | { ok: false; error: string };

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/resenas");
  return { ok: true };
}

export async function respondToReview(
  id: string,
  response: string,
): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };
  const trimmed = response.trim();
  if (trimmed.length < 5) {
    return { ok: false, error: "Respuesta muy corta." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({
      response: trimmed,
      response_at: new Date().toISOString(),
      response_by: user.id,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/resenas");
  return { ok: true };
}

export async function clearResponse(id: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ response: null, response_at: null, response_by: null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/resenas");
  return { ok: true };
}
