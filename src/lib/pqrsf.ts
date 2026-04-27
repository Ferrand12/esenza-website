import { createAdminClient } from "@/lib/supabase/admin";

export type ComplaintType =
  | "peticion"
  | "queja"
  | "reclamo"
  | "sugerencia"
  | "felicitacion";

export type ComplaintStatus =
  | "nuevo"
  | "en_proceso"
  | "resuelto"
  | "cerrado";

export type ComplaintPriority = "baja" | "media" | "alta" | "urgente";

export const COMPLAINT_TYPES: ComplaintType[] = [
  "peticion",
  "queja",
  "reclamo",
  "sugerencia",
  "felicitacion",
];

export const COMPLAINT_TYPE_LABEL: Record<ComplaintType, string> = {
  peticion: "Petición",
  queja: "Queja",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
  felicitacion: "Felicitación",
};

export const COMPLAINT_TYPE_DESCRIPTION: Record<ComplaintType, string> = {
  peticion:
    "Solicitud de información, documento o actuación administrativa.",
  queja: "Descontento con la atención o el servicio recibido.",
  reclamo:
    "Insatisfacción con el servicio que exige una respuesta formal.",
  sugerencia: "Propuesta para mejorar nuestro servicio.",
  felicitacion: "Reconocimiento a un buen servicio.",
};

export const COMPLAINT_STATUS_LABEL: Record<ComplaintStatus, string> = {
  nuevo: "Nuevo",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

export const COMPLAINT_STATUS_BADGE: Record<ComplaintStatus, string> = {
  nuevo: "bg-amber-100 text-amber-800",
  en_proceso: "bg-sky-100 text-sky-800",
  resuelto: "bg-emerald-100 text-emerald-800",
  cerrado: "bg-stone-100 text-stone-600",
};

export const COMPLAINT_PRIORITY_LABEL: Record<ComplaintPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const COMPLAINT_PRIORITY_BADGE: Record<ComplaintPriority, string> = {
  baja: "bg-stone-100 text-stone-700",
  media: "bg-sky-100 text-sky-800",
  alta: "bg-orange-100 text-orange-800",
  urgente: "bg-rose-100 text-rose-800",
};

// SLA por defecto (días hábiles) — configurable vía site_config.pqrsf_sla_business_days
const DEFAULT_SLA: Record<ComplaintType, number> = {
  peticion: 15,
  queja: 10,
  reclamo: 15,
  sugerencia: 15,
  felicitacion: 15,
};

export async function loadSlaConfig(): Promise<Record<ComplaintType, number>> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_config")
      .select("value")
      .eq("key", "pqrsf_sla_business_days")
      .maybeSingle();
    const v = data?.value as Partial<Record<ComplaintType, number>> | null;
    if (!v) return DEFAULT_SLA;
    return {
      peticion: Number(v.peticion) || DEFAULT_SLA.peticion,
      queja: Number(v.queja) || DEFAULT_SLA.queja,
      reclamo: Number(v.reclamo) || DEFAULT_SLA.reclamo,
      sugerencia: Number(v.sugerencia) || DEFAULT_SLA.sugerencia,
      felicitacion: Number(v.felicitacion) || DEFAULT_SLA.felicitacion,
    };
  } catch {
    return DEFAULT_SLA;
  }
}

// Agrega N días hábiles (lun-vie) a una fecha
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setUTCDate(result.getUTCDate() + 1);
    const dow = result.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

/**
 * Genera el próximo tracking_code para un año dado.
 * Formato: PQRSF-YYYY-NNNN (ej: PQRSF-2026-0042)
 * Lee el máximo existente para ese año y suma 1.
 */
export async function generateTrackingCode(
  year = new Date().getUTCFullYear(),
): Promise<string> {
  const admin = createAdminClient();
  const prefix = `PQRSF-${year}-`;
  const { data } = await admin
    .from("complaints")
    .select("tracking_code")
    .like("tracking_code", `${prefix}%`)
    .order("tracking_code", { ascending: false })
    .limit(1);
  const last = data?.[0]?.tracking_code as string | undefined;
  let next = 1;
  if (last) {
    const n = Number(last.slice(prefix.length));
    if (Number.isFinite(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function isSlaBreached(complaint: {
  status: ComplaintStatus;
  sla_due_at: string;
}): boolean {
  if (complaint.status === "resuelto" || complaint.status === "cerrado") {
    return false;
  }
  return new Date(complaint.sla_due_at).getTime() < Date.now();
}

export function isSlaSoon(
  complaint: { status: ComplaintStatus; sla_due_at: string },
  daysWarning = 3,
): boolean {
  if (complaint.status === "resuelto" || complaint.status === "cerrado") {
    return false;
  }
  const warn = Date.now() + daysWarning * 24 * 60 * 60 * 1000;
  return new Date(complaint.sla_due_at).getTime() < warn;
}
