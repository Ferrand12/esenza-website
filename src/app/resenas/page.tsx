import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_SOURCE_LABEL, type ReviewSource } from "@/lib/reviews";

export const metadata = {
  title: "Reseñas · Esenza",
  description:
    "Lo que nuestras huéspedes dicen de Esenza. Opiniones reales de quienes ya se alojaron con nosotros.",
};

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  display_name: string;
  response: string | null;
  source: ReviewSource;
  status: "approved" | "featured";
  sub_ratings: Record<string, number> | null;
  photos: { path: string; name: string }[] | null;
  submitted_at: string;
};

export default async function ResenasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, title, content, display_name, response, source, status, sub_ratings, photos, submitted_at",
    )
    .in("status", ["approved", "featured"])
    .order("submitted_at", { ascending: false })
    .limit(60)
    .returns<Review[]>();

  const reviews = data ?? [];
  const avg =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-script text-4xl text-secondary">Esenza</p>
          <h1 className="font-editorial text-4xl md:text-5xl text-primary mt-2">
            Reseñas de nuestros huéspedes
          </h1>
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm">
              <span className="text-3xl text-secondary tracking-widest">
                {"★".repeat(Math.round(avg))}
                <span className="text-stone-200">
                  {"★".repeat(5 - Math.round(avg))}
                </span>
              </span>
              <div className="text-left">
                <p className="font-semibold text-primary">
                  {avg.toFixed(1)} / 5
                </p>
                <p className="text-xs text-stone-500">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
            Error cargando reseñas: {error.message}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <p className="text-stone-500">
              Todavía no hay reseñas publicadas. ¡Sé la primera!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-2xl border border-stone-200 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg text-secondary">
                    {"★".repeat(r.rating)}
                    <span className="text-stone-200">
                      {"★".repeat(5 - r.rating)}
                    </span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500">
                    {REVIEW_SOURCE_LABEL[r.source]}
                  </span>
                </div>
                {r.title && (
                  <h3 className="font-editorial text-xl text-primary mb-2">
                    {r.title}
                  </h3>
                )}
                <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {r.content}
                </p>

                {r.photos && r.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {r.photos.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={p.path}
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-photos/${p.path}`}
                        alt={p.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {r.sub_ratings && Object.keys(r.sub_ratings).length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(r.sub_ratings).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-stone-600"
                      >
                        <dt className="capitalize">{k}</dt>
                        <dd className="text-secondary">
                          {"★".repeat(v)}
                          <span className="text-stone-200">
                            {"★".repeat(5 - v)}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mt-4 text-xs text-stone-500">
                  {r.display_name} ·{" "}
                  {new Date(r.submitted_at).toLocaleDateString("es-CO", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {r.response && (
                  <div className="mt-4 ml-3 pl-4 border-l-2 border-secondary-container bg-stone-50 rounded-r-lg p-3 text-sm">
                    <p className="text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">
                      Respuesta de Esenza
                    </p>
                    <p className="text-stone-700 whitespace-pre-wrap">
                      {r.response}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-primary"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
