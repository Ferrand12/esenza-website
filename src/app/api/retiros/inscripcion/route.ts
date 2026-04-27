import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRetreatRegistrationAck } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

type Body = {
  language?: "es" | "en";
  full_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  motivation?: string;
  traveling_from_out_of_town?: boolean;
  arrival_details?: string;
  dietary_restrictions?: string;
  injuries_notes?: string;
  ground_transport?: "yes" | "no" | "unknown";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  additional_notes?: string;
  waiver_accepted?: boolean;
  signature?: string;
  retreat_type?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const fullName = String(body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const country = String(body.country || "").trim();
  const signature = String(body.signature || "").trim();

  if (!fullName || fullName.length < 2) {
    return NextResponse.json(
      { error: "Ingresá tu nombre completo." },
      { status: 400 },
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }
  if (phone.length < 7) {
    return NextResponse.json(
      { error: "Teléfono requerido." },
      { status: 400 },
    );
  }
  if (!country) {
    return NextResponse.json(
      { error: "Indica tu país de residencia." },
      { status: 400 },
    );
  }
  if (!body.waiver_accepted) {
    return NextResponse.json(
      { error: "Debés aceptar el acuerdo de responsabilidad." },
      { status: 400 },
    );
  }
  if (!signature) {
    return NextResponse.json(
      { error: "Escribí tu nombre como firma." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Find or create guest (reutilizamos el CRM)
  let guestId: string | null = null;
  const { data: existingGuest } = await admin
    .from("guests")
    .select("id")
    .or(`email.eq.${email},phone.eq.${phone}`)
    .limit(1)
    .maybeSingle();
  if (existingGuest) {
    guestId = existingGuest.id;
  } else {
    const { data: created } = await admin
      .from("guests")
      .insert({
        full_name: fullName,
        email,
        phone,
        country,
        tags: ["retiro"],
      })
      .select("id")
      .single();
    guestId = created?.id ?? null;
  }

  const { data: inserted, error } = await admin
    .from("retreat_registrations")
    .insert({
      full_name: fullName,
      email,
      phone,
      country,
      motivation: body.motivation?.trim() || null,
      traveling_from_out_of_town: Boolean(body.traveling_from_out_of_town),
      arrival_details: body.arrival_details?.trim() || null,
      dietary_restrictions: body.dietary_restrictions?.trim() || null,
      injuries_notes: body.injuries_notes?.trim() || null,
      ground_transport:
        body.ground_transport === "yes" ||
        body.ground_transport === "no" ||
        body.ground_transport === "unknown"
          ? body.ground_transport
          : "unknown",
      emergency_contact_name: body.emergency_contact_name?.trim() || null,
      emergency_contact_phone: body.emergency_contact_phone?.trim() || null,
      additional_notes: body.additional_notes?.trim() || null,
      waiver_accepted: true,
      signature,
      language: body.language === "en" ? "en" : "es",
      retreat_type: body.retreat_type?.trim() || null,
      guest_id: guestId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message || "No se pudo registrar." },
      { status: 500 },
    );
  }

  // Fire-and-forget emails
  const notify = process.env.ADMIN_NOTIFICATION_EMAIL;
  Promise.all([
    sendRetreatRegistrationAck(email, {
      guestName: fullName,
      language: body.language === "en" ? "en" : "es",
      registrationId: inserted.id,
    }).catch((e) => console.error("[retreat] ack:", e)),
    notify
      ? sendRetreatRegistrationAck(notify, {
          guestName: fullName,
          language: "es",
          registrationId: inserted.id,
          isAdminCopy: true,
        }).catch((e) => console.error("[retreat] admin:", e))
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true, id: inserted.id });
}
