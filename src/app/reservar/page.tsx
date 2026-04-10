import BookingWizard from "@/components/booking/BookingWizard";

export const metadata = {
  title: "Reservar · Esenza | Natural Wellness Stay",
  description:
    "Reserva tu estadía en Esenza, un refugio de bienestar en los Andes colombianos.",
};

export default function ReservarPage() {
  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <a href="/" className="font-script text-5xl text-primary">
            Esenza
          </a>
          <h1 className="mt-6 font-editorial text-4xl md:text-5xl text-primary">
            Reserva tu experiencia
          </h1>
          <p className="mt-4 text-on-surface-variant max-w-xl mx-auto">
            Selecciona tus fechas, elige tu paquete y déjanos el resto. Te
            contactaremos por WhatsApp para confirmar los detalles.
          </p>
        </div>
        <BookingWizard />
      </div>
    </main>
  );
}
