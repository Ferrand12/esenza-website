import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodeReviewToken, isReviewWindowOpen } from "@/lib/reviews";
import { sendReviewAdminNotification } from "@/lib/email/resend";
import { ensurePublicBucket } from "@/lib/storage";
import { analyzeReviewIfAvailable } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PHOTO_BUCKET = "review-photos";
const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const SUBRATING_KEYS = [
  "comida",
  "limpieza",
  "atencion",
  "ubicacion",
  "valor",
] as const;

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "bin";
}

async function parseInput(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const subRatings: Record<string, number> = {};
    for (const k of SUBRATING_KEYS) {
      const v = fd.get(`sub_${k}`);
      const n = Number(v);
      if (Number.isInteger(n) && n >= 1 && n <= 5) subRatings[k] = n;
    }
    const photos: File[] = [];
    for (const v of fd.getAll("photos")) {
      if (v instanceof File && v.size > 0) photos.push(v);
    }
    return {
      token: String(fd.get("token") ?? ""),
      rating: Number(fd.get("rating")),
      title: fd.get("title") ? String(fd.get("title")) : null,
      content: String(fd.get("content") ?? ""),
      display_name: String(fd.get("display_name") ?? ""),
      language: (fd.get("language") === "en" ? "en" : "es") as "es" | "en",
      accept_privacy: fd.get("accept_privacy") === "true",
      subRatings,
      photos,
    };
  }
  const body = await request.json().catch(() => ({}));
  return {
    token: String(body.token ?? ""),
    rating: Number(body.rating),
    title: body.title ?? null,
    content: String(body.content ?? ""),
    display_name: String(body.display_name ?? ""),
    language: body.language === "en" ? ("en" as const) : ("es" as const),
    accept_privacy: Boolean(body.accept_privacy),
    subRatings: (body.sub_ratings ?? {}) as Record<string, number>,
    photos: [] as File[],
  };
}

export async function POST(request: Request) {
  const input = await parseInput(request);

  const decoded = decodeReviewToken(input.token);
  if (!decoded.ok) {
    return NextResponse.json(
      { error: "Token inválido o vencido." },
      { status: 400 },
    );
  }

  if (!input.accept_privacy) {
    return NextResponse.json(
      { error: "Aceptá el tratamiento de datos para publicar tu reseña." },
      { status: 400 },
    );
  }

  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating debe ser un entero entre 1 y 5." },
      { status: 400 },
    );
  }

  const content = input.content.trim();
  if (content.length < 10) {
    return NextResponse.json(
      { error: "La reseña debe tener al menos 10 caracteres." },
      { status: 400 },
    );
  }
  const title = input.title ? String(input.title).trim().slice(0, 120) : null;
  const displayName = input.display_name.trim();
  if (!displayName) {
    return NextResponse.json(
      { error: "Nombre requerido." },
      { status: 400 },
    );
  }
  if (input.photos.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_PHOTOS} fotos.` },
      { status: 400 },
    );
  }
  for (const p of input.photos) {
    if (p.size > MAX_PHOTO_SIZE) {
      return NextResponse.json(
        { error: `"${p.name}" supera 5 MB.` },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME.has(p.type)) {
      return NextResponse.json(
        { error: `"${p.name}" formato no permitido.` },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();

  const { data: booking } = await admin
    .from("bookings")
    .select("id, guest_id, check_out, status")
    .eq("id", decoded.bookingId)
    .maybeSingle();
  if (!booking) {
    return NextResponse.json(
      { error: "Reserva no encontrada." },
      { status: 404 },
    );
  }
  if (!isReviewWindowOpen(booking.check_out)) {
    return NextResponse.json(
      { error: "El período para dejar reseña ya cerró." },
      { status: 400 },
    );
  }

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Ya hay una reseña registrada para esta estadía." },
      { status: 409 },
    );
  }

  // Upload fotos
  const photos: { path: string; name: string }[] = [];
  if (input.photos.length > 0) {
    await ensurePublicBucket(PHOTO_BUCKET);
    for (const f of input.photos) {
      const ext = extFromMime(f.type);
      const path = `${booking.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const buffer = Buffer.from(await f.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(PHOTO_BUCKET)
        .upload(path, buffer, {
          contentType: f.type,
          upsert: false,
        });
      if (!upErr) {
        photos.push({ path, name: f.name.slice(0, 120) });
      }
    }
  }

  // AI sentiment (opcional)
  const ai = await analyzeReviewIfAvailable({
    rating: input.rating,
    title,
    content,
  });

  // Auto-approve if configured and rating>=4
  const { data: autoCfg } = await admin
    .from("site_config")
    .select("value")
    .eq("key", "reviews_auto_approve")
    .maybeSingle();
  const autoApprove =
    autoCfg?.value === true || autoCfg?.value === "true";
  const status =
    autoApprove && input.rating >= 4 && ai?.sentiment !== "negative"
      ? "approved"
      : "pending";

  const { data: inserted, error } = await admin
    .from("reviews")
    .insert({
      booking_id: booking.id,
      guest_id: booking.guest_id,
      source: "internal",
      rating: input.rating,
      title,
      content,
      display_name: displayName,
      language: input.language,
      status,
      sub_ratings:
        Object.keys(input.subRatings).length > 0 ? input.subRatings : null,
      photos,
      ai_sentiment: ai?.sentiment ?? null,
      ai_tags: ai?.tags ?? null,
    })
    .select("id, rating, title, content")
    .single();

  if (error || !inserted) {
    if (photos.length > 0) {
      await admin.storage
        .from(PHOTO_BUCKET)
        .remove(photos.map((p) => p.path));
    }
    return NextResponse.json(
      { error: error?.message || "No se pudo guardar." },
      { status: 500 },
    );
  }

  const notify =
    process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (notify) {
    sendReviewAdminNotification(notify, {
      guestName: displayName,
      rating: inserted.rating,
      title: inserted.title,
      content: inserted.content,
      reviewId: inserted.id,
    }).catch((e) => console.error("[reviews] admin notify:", e));
  }

  return NextResponse.json({ ok: true });
}
