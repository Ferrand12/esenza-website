import Link from "next/link";

export const metadata = {
  title: "Recibido · Esenza",
  robots: "noindex,nofollow",
};

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6 flex items-center">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-emerald-700 text-5xl">
            check_circle
          </span>
        </div>
        <h1 className="mt-6 font-editorial text-4xl text-primary">
          Recibimos tu solicitud
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Te enviamos un email de confirmación. Revisaremos tu mensaje con
          atención y te responderemos dentro del tiempo legal.
        </p>

        {code && (
          <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">
              Código de seguimiento
            </p>
            <p className="font-mono text-3xl text-primary font-semibold">
              {code}
            </p>
            <p className="mt-3 text-xs text-stone-500">
              Guardalo para consultar el estado cuando quieras.
            </p>
            <Link
              href={`/pqrsf/consultar/${code}`}
              className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
            >
              Consultar estado →
            </Link>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-10 text-sm text-stone-600 hover:text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
