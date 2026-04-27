import RetreatRegistrationForm from "@/components/RetreatRegistrationForm";

export const metadata = {
  title: "Inscripción a retiros · Esenza",
  description:
    "Formulario de inscripción a los retiros de Esenza. Completá tus datos para asegurar tu cupo.",
  robots: "noindex,nofollow",
};

export default function RetreatRegistrationPage() {
  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-script text-4xl text-secondary">Esenza</p>
          <h1 className="font-editorial text-4xl md:text-5xl text-primary mt-2">
            Inscripción a retiros
            <br />
            <span className="font-editorial text-2xl md:text-3xl text-on-surface-variant italic">
              Retreat registration
            </span>
          </h1>
          <p className="mt-4 text-on-surface-variant max-w-xl mx-auto">
            Estamos muy felices de darte la bienvenida a nuestro retiro. Por
            favor completá el formulario a continuación. Si tenés preguntas,
            escribinos a{" "}
            <a
              href="mailto:hola@esenza.co"
              className="text-primary underline"
            >
              hola@esenza.co
            </a>
            .
          </p>
        </div>

        <RetreatRegistrationForm />
      </div>
    </div>
  );
}
