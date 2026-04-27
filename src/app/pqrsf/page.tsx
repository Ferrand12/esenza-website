import PqrsfForm from "@/components/PqrsfForm";

export const metadata = {
  title: "PQRSF · Esenza",
  description:
    "Peticiones, quejas, reclamos, sugerencias y felicitaciones. Te respondemos dentro de los tiempos legales.",
};

export default function PqrsfPage() {
  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-script text-4xl text-secondary">Esenza</p>
          <h1 className="font-editorial text-4xl md:text-5xl text-primary mt-2">
            Peticiones, Quejas, Reclamos,
            <br />
            Sugerencias y Felicitaciones
          </h1>
          <p className="mt-6 text-on-surface-variant max-w-xl mx-auto">
            Tu opinión es importante. Completá este formulario para
            contactarnos formalmente. Recibirás un código de seguimiento y
            responderemos dentro de los plazos legales (hasta 15 días hábiles
            según el tipo).
          </p>
        </div>

        <PqrsfForm />

        <div className="mt-8 text-center text-sm text-stone-500">
          <p>
            ¿Ya radicaste y querés consultar?{" "}
            <a href="#consultar" className="text-primary underline">
              Consultar por código
            </a>
          </p>
        </div>

        <section
          id="consultar"
          className="mt-16 bg-white rounded-2xl border border-stone-200 p-8"
        >
          <h2 className="font-editorial text-2xl text-primary mb-2">
            Consultar por código
          </h2>
          <p className="text-sm text-stone-600 mb-5">
            Si ya radicaste, ingresá tu código de seguimiento (formato
            PQRSF-AAAA-NNNN) para ver el estado.
          </p>
          <form
            method="GET"
            action="/pqrsf/consultar"
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              name="code"
              required
              pattern="PQRSF-\d{4}-\d{4}"
              placeholder="PQRSF-2026-0001"
              className="flex-1 px-4 py-3 rounded-lg border border-stone-300 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined">search</span>
              Consultar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
