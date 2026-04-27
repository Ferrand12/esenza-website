"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

async function requireOwner(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "owner" | "staff" }>();

  if (profile?.role !== "owner") {
    return {
      ok: false,
      error: "Solo los usuarios con rol owner pueden administrar usuarios.",
    };
  }
  return { ok: true, userId: user.id };
}

export async function inviteUser(input: {
  email: string;
  full_name: string;
  role: "owner" | "staff";
}): Promise<Result> {
  const auth = await requireOwner();
  if (!auth.ok) return auth;

  const email = input.email.trim().toLowerCase();
  const fullName = input.full_name.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Email inválido." };
  }
  if (!fullName) {
    return { ok: false, error: "Ingresá el nombre completo." };
  }
  if (input.role !== "owner" && input.role !== "staff") {
    return { ok: false, error: "Rol inválido." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });

  if (error || !data?.user) {
    return {
      ok: false,
      error: `No se pudo invitar: ${error?.message ?? "error desconocido"}`,
    };
  }

  // El trigger crea el perfil con role='staff' por defecto.
  // Si el owner pidió otro rol, lo ajustamos ahora.
  if (input.role !== "staff") {
    const { error: updErr } = await admin
      .from("profiles")
      .update({ role: input.role, full_name: fullName })
      .eq("id", data.user.id);
    if (updErr) return { ok: false, error: updErr.message };
  } else {
    // Aseguramos que el full_name quede consistente.
    await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", data.user.id);
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function changeRole(
  userId: string,
  role: "owner" | "staff",
): Promise<Result> {
  const auth = await requireOwner();
  if (!auth.ok) return auth;

  if (userId === auth.userId && role !== "owner") {
    return {
      ok: false,
      error: "No podés cambiar tu propio rol.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function revokeUser(userId: string): Promise<Result> {
  const auth = await requireOwner();
  if (!auth.ok) return auth;

  if (userId === auth.userId) {
    return {
      ok: false,
      error: "No podés eliminar tu propia cuenta desde acá.",
    };
  }

  const admin = createAdminClient();
  // Asegurar que quede al menos un owner activo.
  const { data: owners } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "owner");
  if (
    (owners?.length ?? 0) <= 1 &&
    owners?.some((o) => o.id === userId)
  ) {
    return {
      ok: false,
      error: "No podés eliminar al único owner.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
