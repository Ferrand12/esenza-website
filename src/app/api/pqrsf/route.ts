import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePublicBucket } from "@/lib/storage";
import {
  COMPLAINT_TYPES,
  addBusinessDays,
  generateTrackingCode,
  loadSlaConfig,
  type ComplaintType,
} from "@/lib/pqrsf";
import {
  sendComplaintAcknowledgment,
  sendComplaintAdminNotification,
} from "@/lib/email/resend";
import { classifyComplaintIfAvailable } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ATTACHMENT_BUCKET = "pqrsf-attachments";
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

function isValidType(t: string): t is ComplaintType {
  return COMPLAINT_TYPES.includes(t as ComplaintType);
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  if (mime === "application/pdf") return "pdf";
  return "bin";
}

type Attachment = {
  path: string;
  name: string;
  size: number;
  mime: string;
};

async function parseInput(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const files: File[] = [];
    for (const v of fd.getAll("files")) {
      if (v instanceof File && v.size > 0) files.push(v);
    }
    return {
      type: String(fd.get("type") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      description: String(fd.get("description") ?? ""),
      guest_name: String(fd.get("guest_name") ?? ""),
      guest_email: String(fd.get("guest_email") ?? ""),
      guest_phone: fd.get("guest_phone")
        ? String(fd.get("guest_phone"))
        : null,
      booking_id: fd.get("booking_id")
        ? String(fd.get("booking_id"))
        : null,
      accept_privacy: fd.get("accept_privacy") === "true",
      files,
    };
  }
  const body = await request.json().catch(() => ({}));
  return {
    type: String(body.type ?? ""),
    subject: String(body.subject ?? ""),
    description: String(body.description ?? ""),
    guest_name: String(body.guest_name ?? ""),
    guest_email: String(body.guest_email ?? ""),
    guest_phone: body.guest_phone ? String(body.guest_phone) : null,
    booking_id: body.booking_id ? String(body.booking_id) : null,
    accept_privacy: Boolean(body.accept_privacy),
    files: [] as File[],
  };
}

export async function POST(request: Request) {
  const input = await parseInput(request);

  if (!input.accept_privacy) {
    return NextResponse.json(
      {
        error:
          "Debés aceptar la política de tratamiento de datos personales para radicar.",
      },
      { status: 400 },
    );
  }

  const type = input.type.trim();
  const subject = input.subject.trim();
  const description = input.description.trim();
  const guestName = input.guest_name.trim();
  const guestEmail = input.guest_email.trim().toLowerCase();
  const guestPhone = input.guest_phone?.trim() || null;
  const bookingId = input.booking_id?.trim() || null;

  if (!isValidType(type)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  if (subject.length < 3) {
    return NextResponse.json(
      { error: "El asunto debe tener al menos 3 caracteres." },
      { status: 400 },
    );
  }
  if (description.length < 10) {
    return NextResponse.json(
      { error: "La descripción debe tener al menos 10 caracteres." },
      { status: 400 },
    );
  }
  if (!guestName) {
    return NextResponse.json(
      { error: "Ingresá tu nombre completo." },
      { status: 400 },
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
    return NextResponse.json(
      { error: "Email inválido." },
      { status: 400 },
    );
  }
  if (input.files.length > MAX_ATTACHMENTS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_ATTACHMENTS} archivos.` },
      { status: 400 },
    );
  }
  for (const f of input.files) {
    if (f.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json(
        { error: `"${f.name}" supera 5 MB.` },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME.has(f.type)) {
      return NextResponse.json(
        { error: `"${f.name}" formato no permitido (usá JPG, PNG, WebP, PDF).` },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();
  const sla = await loadSlaConfig();
  const slaDue = addBusinessDays(new Date(), sla[type]).toISOString();
  const tracking = await generateTrackingCode();

  // Prioridad inicial por tipo
  const priority = type === "reclamo" ? "alta" : "media";

  // AI classification (opcional)
  const ai = await classifyComplaintIfAvailable({
    subject,
    description,
  });

  // Subir attachments si los hay
  let attachments: Attachment[] = [];
  if (input.files.length > 0) {
    await ensurePublicBucket(ATTACHMENT_BUCKET);
    for (const f of input.files) {
      const ext = extFromMime(f.type);
      const path = `${tracking}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const buffer = Buffer.from(await f.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, buffer, {
          contentType: f.type,
          upsert: false,
        });
      if (upErr) {
        console.error("[pqrsf] upload:", upErr.message);
        continue;
      }
      attachments.push({
        path,
        name: f.name.slice(0, 120),
        size: f.size,
        mime: f.type,
      });
    }
  }

  const { data: inserted, error } = await admin
    .from("complaints")
    .insert({
      tracking_code: tracking,
      type,
      subject,
      description,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      booking_id: bookingId,
      status: "nuevo",
      priority,
      channel: "web",
      sla_due_at: slaDue,
      attachments,
      ai_classification: ai ?? null,
      ai_sentiment: ai?.sentiment ?? null,
    })
    .select("id, tracking_code, type, subject, sla_due_at")
    .single();

  if (error || !inserted) {
    // Cleanup uploads if insert failed
    if (attachments.length > 0) {
      await admin.storage
        .from(ATTACHMENT_BUCKET)
        .remove(attachments.map((a) => a.path));
    }
    return NextResponse.json(
      { error: error?.message || "No se pudo radicar." },
      { status: 500 },
    );
  }

  await admin.from("complaint_events").insert({
    complaint_id: inserted.id,
    event_type: "created",
    to_value: "nuevo",
    note: `Radicado vía web por ${guestName}${attachments.length > 0 ? ` · ${attachments.length} adjunto${attachments.length === 1 ? "" : "s"}` : ""}`,
  });

  // Fire-and-forget emails
  const notifyEmail = await getAdminNotifyEmail(admin);
  Promise.all([
    sendComplaintAcknowledgment(guestEmail, {
      guestName,
      trackingCode: inserted.tracking_code,
      type: inserted.type,
      subject: inserted.subject,
      slaDueAt: inserted.sla_due_at,
    }).catch((e) => console.error("[pqrsf] ack email:", e)),
    notifyEmail
      ? sendComplaintAdminNotification(notifyEmail, {
          guestName,
          guestEmail,
          guestPhone,
          trackingCode: inserted.tracking_code,
          type: inserted.type,
          subject: inserted.subject,
          description,
          complaintId: inserted.id,
        }).catch((e) => console.error("[pqrsf] admin email:", e))
      : Promise.resolve(),
  ]);

  return NextResponse.json({
    ok: true,
    tracking_code: inserted.tracking_code,
  });
}

async function getAdminNotifyEmail(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string | null> {
  const { data } = await admin
    .from("site_config")
    .select("value")
    .eq("key", "pqrsf_admin_email")
    .maybeSingle();
  const v = data?.value;
  const str = typeof v === "string" ? v.trim() : "";
  if (str) return str;
  return process.env.ADMIN_NOTIFICATION_EMAIL || null;
}
