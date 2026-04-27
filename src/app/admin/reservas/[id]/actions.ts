"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const VALID_CHANNELS = ["email", "whatsapp", "phone", "note"] as const;

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateBookingStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { ok: false, error: "Estado inválido" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    if (error.code === "23P01") {
      return {
        ok: false,
        error:
          "No se puede confirmar: hay un solape con otra reserva en esas fechas.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/reservas/${id}`);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateInternalNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ internal_notes: notes.trim() || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/reservas/${id}`);
  return { ok: true };
}

const VALID_PACKAGES = [
  "escapada_basica",
  "esencia",
  "armonia",
  "plenitud",
] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function updateBookingDetails(
  id: string,
  input: {
    check_in: string;
    check_out: string;
    num_guests: number;
    package: string;
    total_price: number;
    special_requests?: string | null;
  },
): Promise<ActionResult> {
  if (!DATE_RE.test(input.check_in) || !DATE_RE.test(input.check_out)) {
    return { ok: false, error: "Fechas con formato inválido." };
  }
  if (input.check_out <= input.check_in) {
    return {
      ok: false,
      error: "El check-out debe ser posterior al check-in.",
    };
  }
  if (!Number.isInteger(input.num_guests) || input.num_guests < 1) {
    return { ok: false, error: "Número de huéspedes inválido." };
  }
  if (
    !VALID_PACKAGES.includes(input.package as (typeof VALID_PACKAGES)[number])
  ) {
    return { ok: false, error: "Paquete inválido." };
  }
  if (!Number.isFinite(input.total_price) || input.total_price <= 0) {
    return { ok: false, error: "Precio total inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      check_in: input.check_in,
      check_out: input.check_out,
      num_guests: input.num_guests,
      package: input.package as (typeof VALID_PACKAGES)[number],
      total_price: Math.round(input.total_price),
      special_requests: input.special_requests?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23P01") {
      return {
        ok: false,
        error:
          "Hay otra reserva pendiente/confirmada que se solapa con esas fechas.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/reservas/${id}`);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin");
  return { ok: true };
}

export async function logCommunication(
  bookingId: string,
  guestId: string,
  channel: string,
  direction: string,
  content: string,
): Promise<ActionResult> {
  if (!VALID_CHANNELS.includes(channel as (typeof VALID_CHANNELS)[number])) {
    return { ok: false, error: "Canal inválido" };
  }
  if (!["inbound", "outbound"].includes(direction)) {
    return { ok: false, error: "Dirección inválida" };
  }
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "El contenido es requerido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("communications").insert({
    guest_id: guestId,
    booking_id: bookingId,
    channel,
    direction,
    content: trimmed,
    created_by: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/reservas/${bookingId}`);
  return { ok: true };
}
