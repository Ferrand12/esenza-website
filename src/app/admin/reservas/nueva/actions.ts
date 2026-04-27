"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type NewBookingInput = {
  // Guest: either existing_guest_id OR new guest fields
  existing_guest_id?: string | null;
  new_guest?: {
    full_name: string;
    phone: string;
    email?: string | null;
    country?: string | null;
    tags?: string[];
  };
  // Booking
  check_in: string;
  check_out: string;
  num_guests: number;
  package: "escapada_basica" | "esencia" | "armonia";
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source: "web" | "airbnb" | "manual" | "whatsapp";
  special_requests?: string | null;
  internal_notes?: string | null;
};

type Result = { ok: true; id: string } | { ok: false; error: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PACKAGES = ["escapada_basica", "esencia", "armonia"] as const;
const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const SOURCES = ["web", "airbnb", "manual", "whatsapp"] as const;

export async function createBooking(
  input: NewBookingInput,
): Promise<Result> {
  // Validación básica
  if (!DATE.test(input.check_in) || !DATE.test(input.check_out)) {
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
  if (!PACKAGES.includes(input.package)) {
    return { ok: false, error: "Paquete inválido." };
  }
  if (!Number.isFinite(input.total_price) || input.total_price <= 0) {
    return { ok: false, error: "Precio total debe ser mayor a 0." };
  }
  if (!STATUSES.includes(input.status)) {
    return { ok: false, error: "Estado inválido." };
  }
  if (!SOURCES.includes(input.source)) {
    return { ok: false, error: "Origen inválido." };
  }

  const supabase = await createClient();

  // Obtener (o crear) guest_id
  let guestId = input.existing_guest_id || null;
  if (!guestId) {
    if (!input.new_guest?.full_name?.trim() || !input.new_guest?.phone?.trim()) {
      return {
        ok: false,
        error: "Para un huésped nuevo se requieren nombre y teléfono.",
      };
    }
    const cleanedTags = (input.new_guest.tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 30);

    const { data: guestInsert, error: guestErr } = await supabase
      .from("guests")
      .insert({
        full_name: input.new_guest.full_name.trim(),
        phone: input.new_guest.phone.trim(),
        email: input.new_guest.email?.trim().toLowerCase() || null,
        country: input.new_guest.country?.trim() || null,
        tags: cleanedTags,
      })
      .select("id")
      .single();
    if (guestErr || !guestInsert) {
      return {
        ok: false,
        error: `Error al crear huésped: ${guestErr?.message || "desconocido"}`,
      };
    }
    guestId = guestInsert.id;
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      guest_id: guestId,
      check_in: input.check_in,
      check_out: input.check_out,
      num_guests: input.num_guests,
      package: input.package,
      total_price: Math.round(input.total_price),
      status: input.status,
      source: input.source,
      special_requests: input.special_requests?.trim() || null,
      internal_notes: input.internal_notes?.trim() || null,
    })
    .select("id")
    .single();

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

  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  revalidatePath("/admin/calendario");
  return { ok: true, id: booking.id };
}

export async function searchGuests(term: string) {
  const q = term.trim();
  if (q.length < 2) return [];
  const supabase = await createClient();
  const escaped = q.replace(/[%,]/g, "");
  const { data } = await supabase
    .from("guests")
    .select("id, full_name, email, phone, country, total_bookings")
    .or(
      `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`,
    )
    .order("full_name", { ascending: true })
    .limit(10);
  return data ?? [];
}

export async function redirectAfterCreate(id: string): Promise<never> {
  redirect(`/admin/reservas/${id}`);
}
