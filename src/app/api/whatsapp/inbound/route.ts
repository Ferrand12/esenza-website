import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Webhook receiver for inbound WhatsApp messages via Twilio.
 *
 * Setup (requiere cuenta Twilio + WhatsApp Business):
 * 1. En Twilio Console → Messaging → Services → WhatsApp, creá o activá un
 *    sender (número de WhatsApp Business).
 * 2. Copiá el Auth Token desde Twilio Console → Account Info.
 * 3. Configurá estas env vars en Vercel + .env.local:
 *      TWILIO_AUTH_TOKEN=...
 *      TWILIO_WEBHOOK_URL=https://tu-dominio.com/api/whatsapp/inbound
 *    (TWILIO_WEBHOOK_URL debe coincidir exactamente con lo registrado en Twilio).
 * 4. En Twilio Sandbox / Sender → "When a message comes in", pegá la URL del
 *    webhook (la misma de TWILIO_WEBHOOK_URL). Method: POST.
 *
 * Formato que envía Twilio (application/x-www-form-urlencoded):
 *   From=whatsapp:+573001112233
 *   To=whatsapp:+14155238886
 *   Body=Hola, quiero reservar
 *   MessageSid=SMxxx...
 *   ProfileName=Ana Restrepo
 *
 * Si no está configurado TWILIO_AUTH_TOKEN, el endpoint rechaza todo.
 */

function validateTwilioSignature(
  authToken: string,
  signatureHeader: string,
  webhookUrl: string,
  params: URLSearchParams,
): boolean {
  // Twilio algorithm: HMAC-SHA1(url + sortedConcatenatedParams)
  const entries: [string, string][] = [];
  params.forEach((value, key) => entries.push([key, value]));
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const data = webhookUrl + entries.map(([k, v]) => k + v).join("");
  const computed = createHmac("sha1", authToken).update(data).digest("base64");
  try {
    return timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signatureHeader),
    );
  } catch {
    return false;
  }
}

function normalizePhone(from: string): string {
  // "whatsapp:+573001112233" → "+573001112233"
  return from.replace(/^whatsapp:/i, "").trim();
}

export async function POST(request: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;

  if (!authToken || !webhookUrl) {
    return NextResponse.json(
      { error: "Webhook not configured (set TWILIO_AUTH_TOKEN + TWILIO_WEBHOOK_URL)" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);

  const ok = validateTwilioSignature(
    authToken,
    signature,
    webhookUrl,
    params,
  );
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const from = params.get("From") ?? "";
  const body = params.get("Body") ?? "";
  const profileName = params.get("ProfileName") ?? "";
  const messageSid = params.get("MessageSid") ?? "";

  if (!from || !body) {
    return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
  }

  const phone = normalizePhone(from);
  const admin = createAdminClient();

  // Evitar duplicados si Twilio reintenta.
  if (messageSid) {
    const { data: existing } = await admin
      .from("communications")
      .select("id")
      .eq("channel", "whatsapp")
      .eq("direction", "inbound")
      .like("content", `%[sid:${messageSid}]%`)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  // Find or create guest by phone.
  const { data: guest } = await admin
    .from("guests")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  let guestId = guest?.id;
  if (!guestId) {
    const { data: created, error: createErr } = await admin
      .from("guests")
      .insert({
        full_name: profileName || `WhatsApp ${phone}`,
        phone,
      })
      .select("id")
      .single();
    if (createErr || !created) {
      return NextResponse.json(
        { error: `No se pudo crear huésped: ${createErr?.message}` },
        { status: 500 },
      );
    }
    guestId = created.id;
  }

  // Find active booking for this guest (if any) to attach the message.
  const { data: activeBooking } = await admin
    .from("bookings")
    .select("id")
    .eq("guest_id", guestId)
    .in("status", ["pending", "confirmed"])
    .order("check_in", { ascending: true })
    .limit(1)
    .maybeSingle();

  const content = messageSid
    ? `${body}\n\n[sid:${messageSid}]`
    : body;

  const { error: commErr } = await admin.from("communications").insert({
    guest_id: guestId,
    booking_id: activeBooking?.id ?? null,
    channel: "whatsapp",
    direction: "inbound",
    content,
  });

  if (commErr) {
    return NextResponse.json({ error: commErr.message }, { status: 500 });
  }

  // Twilio espera TwiML — contestamos vacío para no auto-responder.
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    {
      headers: { "Content-Type": "text/xml" },
    },
  );
}

// Útil para probar en browser que la ruta existe.
export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "WhatsApp inbound webhook. Configurá TWILIO_AUTH_TOKEN y TWILIO_WEBHOOK_URL y apuntá Twilio acá por POST.",
  });
}
