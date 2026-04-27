import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  REVIEW_SOURCE_LABEL,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_BADGE,
  type ReviewSource,
  type ReviewStatus,
} from "@/lib/reviews";
import ReviewModerationCard from "@/components/admin/ReviewModerationCard";

type Row = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  display_name: string;
  source: ReviewSource;
  status: ReviewStatus;
  response: string | null;
  response_at: string | null;
  submitted_at: string;
  language: string;
  booking_id: string | null;
  guest: { full_name: string; email: string | null } | null;
};

const STATUS_TABS: (ReviewStatus | "todos")[] = [
  "todos",
  "pending",
  "approved",
  "featured",
  "rejected",
];

export default async function ReviewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string }>;
}) {
  const { status, source } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select(
      "id, rating, title, content, display_name, source, status, response, response_at, submitted_at, language, booking_id, guest:guests(full_name, email)",
    )
    .order("submitted_at", { ascending: false })
    .limit(200);

  const VALID_STATUS = [
    "pending",
    "approved",
    "rejected",
    "featured",
  ] as const;
  const VALID_SOURCES = [
    "internal",
    "google",
    "airbnb",
    "tripadvisor",
    "booking_com",
  ] as const;
  if (
    status &&
    status !== "todos" &&
    VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])
  ) {
    query = query.eq("status", status as (typeof VALID_STATUS)[number]);
  }
  if (
    source &&
    VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number])
  ) {
    query = query.eq("source", source as (typeof VALID_SOURCES)[number]);
  }

  const { data, error } = await query.returns<Row[]>();
  const reviews = data ?? [];

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    featured: reviews.filter((r) => r.status === "featured").length,
    lowRating: reviews.filter(
      (r) => r.rating <= 3 && r.status !== "rejected" && !r.response,
    ).length,
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-editorial text-4xl text-primary">Reseñas</h1>
          <p className="mt-1 text-stone-600 text-sm">
            Moderá, respondé y destacá reseñas de huéspedes.
          </p>
        </div>
        <a
          href="/api/export/reviews"
          className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            file_download
          </span>
          Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Pendientes" value={counts.pending} tone="amber" />
        <Stat label="Destacadas" value={counts.featured} tone="primary" />
        <Stat
          label="Rating bajo sin responder"
          value={counts.lowRating}
          tone={counts.lowRating > 0 ? "rose" : "stone"}
        />
        <Stat label="Promedio" value={avg.toFixed(1) + "/5"} tone="sky" />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map((s) => {
          const href =
            s === "todos" ? "/admin/reviews" : `/admin/reviews?status=${s}`;
          const isActive = (status ?? "todos") === s;
          return (
            <Link
              key={s}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {s === "todos" ? "Todas" : REVIEW_STATUS_LABEL[s]}
            </Link>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 mb-4">
          {error.message}
          {error.code === "42P01" && (
            <p className="mt-1 text-xs">
              La tabla <code>reviews</code> no existe. Corré la migración 0003.
            </p>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            reviews
          </span>
          <p className="mt-4 text-stone-500">No hay reseñas con este filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewModerationCard
              key={r.id}
              review={{
                id: r.id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                display_name: r.display_name,
                source: r.source,
                sourceLabel: REVIEW_SOURCE_LABEL[r.source],
                status: r.status,
                statusBadge: REVIEW_STATUS_BADGE[r.status],
                response: r.response,
                response_at: r.response_at,
                submitted_at: r.submitted_at,
                language: r.language,
                booking_id: r.booking_id,
                guestEmail: r.guest?.email ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "amber" | "primary" | "rose" | "stone" | "sky";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    primary: "bg-secondary-container border-secondary text-secondary",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    sky: "bg-sky-50 border-sky-200 text-sky-900",
    stone: "bg-white border-stone-200 text-stone-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
