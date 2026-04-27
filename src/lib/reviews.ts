import { createHmac, timingSafeEqual } from "node:crypto";

export type ReviewStatus = "pending" | "approved" | "rejected" | "featured";
export type ReviewSource =
  | "internal"
  | "google"
  | "airbnb"
  | "tripadvisor"
  | "booking_com";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  featured: "Destacada",
};

export const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-stone-100 text-stone-500",
  featured: "bg-secondary-container text-secondary",
};

export const REVIEW_SOURCE_LABEL: Record<ReviewSource, string> = {
  internal: "Interna",
  google: "Google",
  airbnb: "Airbnb",
  tripadvisor: "TripAdvisor",
  booking_com: "Booking.com",
};

const REVIEW_TOKEN_VALID_DAYS = 30;
const HMAC_LEN_CHARS = 22;

function tokenSecret(): string {
  const s = process.env.REVIEW_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("Missing REVIEW_SECRET/CRON_SECRET");
  return s;
}

function hmac(bookingId: string): string {
  return createHmac("sha256", tokenSecret())
    .update(bookingId)
    .digest("base64url")
    .slice(0, HMAC_LEN_CHARS);
}

/**
 * Token autónomo que embebe booking_id + HMAC verificador.
 * Formato: base64url(<booking_id>|<hmac22>).
 */
export function buildReviewToken(bookingId: string): string {
  const raw = `${bookingId}|${hmac(bookingId)}`;
  return Buffer.from(raw).toString("base64url");
}

export type DecodedToken = {
  ok: true;
  bookingId: string;
} | { ok: false };

export function decodeReviewToken(token: string): DecodedToken {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [bookingId, sig] = raw.split("|");
    if (!bookingId || !sig) return { ok: false };
    const expected = hmac(bookingId);
    if (expected.length !== sig.length) return { ok: false };
    if (
      !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return { ok: false };
    }
    return { ok: true, bookingId };
  } catch {
    return { ok: false };
  }
}

/**
 * La ventana de reseña está abierta si check_out ocurrió dentro de los
 * últimos REVIEW_TOKEN_VALID_DAYS días.
 */
export function isReviewWindowOpen(checkOutISO: string): boolean {
  const co = new Date(checkOutISO + "T00:00:00Z").getTime();
  const now = Date.now();
  const windowEnd = co + REVIEW_TOKEN_VALID_DAYS * 24 * 60 * 60 * 1000;
  return now >= co && now <= windowEnd;
}

export function buildReviewUrl(bookingId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}/resena/${buildReviewToken(bookingId)}`;
}
