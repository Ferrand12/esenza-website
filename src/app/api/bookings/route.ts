import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createBookingSchema,
  calculateTotalPrice,
} from "@/lib/validators/booking";
import {
  sendBookingConfirmationToGuest,
  sendBookingNotificationToAdmin,
} from "@/lib/email/resend";

/**
 * POST /api/bookings — Create a new booking (public)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400 },
    );
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const totalPrice = calculateTotalPrice(
    input.package,
    input.check_in,
    input.check_out,
  );

  const supabase = createAdminClient();

  // 1. Find or create guest
  const { data: existingGuests } = await supabase
    .from("guests")
    .select("id")
    .or(`email.eq.${input.guest.email},phone.eq.${input.guest.phone}`)
    .limit(1);

  let guestId: string;

  if (existingGuests && existingGuests.length > 0) {
    guestId = existingGuests[0].id;
    await supabase
      .from("guests")
      .update({
        full_name: input.guest.full_name,
        email: input.guest.email,
        phone: input.guest.phone,
        country: input.guest.country || null,
      })
      .eq("id", guestId);
  } else {
    const { data: newGuest, error: guestErr } = await supabase
      .from("guests")
      .insert({
        full_name: input.guest.full_name,
        email: input.guest.email,
        phone: input.guest.phone,
        country: input.guest.country || null,
      })
      .select("id")
      .single();

    if (guestErr || !newGuest) {
      return NextResponse.json(
        { error: "Error al registrar huésped" },
        { status: 500 },
      );
    }
    guestId = newGuest.id;
  }

  // 2. Create booking
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      guest_id: guestId,
      check_in: input.check_in,
      check_out: input.check_out,
      num_guests: input.num_guests,
      package: input.package,
      total_price: totalPrice,
      source: "web",
      special_requests: input.special_requests || null,
    })
    .select("id")
    .single();

  if (bookingErr) {
    // Check for overlap constraint violation
    if (bookingErr.code === "23P01") {
      return NextResponse.json(
        {
          error:
            "Las fechas seleccionadas ya no están disponibles. Por favor elige otras.",
        },
        { status: 409 },
      );
    }
    console.error("[booking] Error creating booking:", bookingErr);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 },
    );
  }

  // 3. Send emails (non-blocking)
  const emailData = {
    guestName: input.guest.full_name,
    checkIn: input.check_in,
    checkOut: input.check_out,
    numGuests: input.num_guests,
    packageName: input.package,
    totalPrice,
    specialRequests: input.special_requests,
  };

  // Fire and forget — don't fail the booking if emails fail
  Promise.allSettled([
    sendBookingConfirmationToGuest(input.guest.email, emailData),
    sendBookingNotificationToAdmin(
      process.env.ADMIN_NOTIFICATION_EMAIL || "",
      {
        ...emailData,
        guestEmail: input.guest.email,
        guestPhone: input.guest.phone,
        bookingId: booking.id,
      },
    ),
  ]).catch((e) => console.error("[email] Error sending emails:", e));

  return NextResponse.json(
    {
      id: booking.id,
      message: "Reserva creada exitosamente",
      total_price: totalPrice,
    },
    { status: 201 },
  );
}
