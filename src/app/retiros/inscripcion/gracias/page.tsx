import Link from "next/link";

export const metadata = {
  title: "¡Gracias! · Esenza",
  robots: "noindex,nofollow",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6 flex items-center">
      <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-stone-200 p-10">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-emerald-700 text-5xl">
            self_improvement
          </span>
        </div>
        <h1 className="mt-6 font-editorial text-3xl text-primary">
          ¡Recibimos tu inscripción!
        </h1>
        <p className="mt-3 text-on-surface-variant">
          En los próximos días te contactaremos por email o WhatsApp para
          coordinar los detalles finales y el pago.
        </p>
        <p className="mt-2 text-xs text-stone-500 italic">
          We received your registration! We&apos;ll contact you soon to
          coordinate the final details and payment.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-sm text-primary hover:underline"
        >
          Volver al inicio / Back to home →
        </Link>
      </div>
    </div>
  );
}
