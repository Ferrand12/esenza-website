import Link from "next/link";

export const metadata = {
  title: "Gracias · Esenza",
  robots: "noindex,nofollow",
};

export default async function GraciasReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ already?: string }>;
}) {
  const { already } = await searchParams;

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6 flex items-center">
      <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-stone-200 p-10">
        <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-5xl text-secondary">
            favorite
          </span>
        </div>
        <h1 className="mt-6 font-editorial text-3xl text-primary">
          {already ? "Ya tenés reseña" : "¡Gracias por escribirnos!"}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {already
            ? "Ya registramos una reseña para esta estadía. Si querés editarla, escribinos."
            : "Tu reseña fue recibida. Luego de una breve revisión, la publicaremos en nuestro sitio."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-sm text-primary hover:underline"
        >
          Volver al inicio →
        </Link>
      </div>
    </div>
  );
}
