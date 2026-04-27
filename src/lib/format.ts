export function formatPriceCOP(n: number | string): string {
  return `$${Number(n).toLocaleString("es-CO")}`;
}

export function formatDateLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-600 line-through",
  completed: "bg-sky-100 text-sky-800",
};

export const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  airbnb: "Airbnb",
  manual: "Manual",
  whatsapp: "WhatsApp",
};

export const PACKAGE_LABEL: Record<string, string> = {
  escapada_basica: "Escapada Básica",
  esencia: "Esencia",
  armonia: "Armonía",
  plenitud: "Plenitud (histórico)",
};

export const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Llamada",
  note: "Nota interna",
};
