import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodeReviewToken, isReviewWindowOpen } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";

export const metadata = {
  title: "Dejar reseña · Esenza",
  robots: "noindex,nofollow",
};

type BookingInfo = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  guest: { full_name: string } | null;
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const decoded = decodeReviewToken(token);
  if (!decoded.ok) {
    return (
      <Notice
        title="Link inválido"
        body="Este link ya no es válido. Si creés que es un error, contactanos por WhatsApp."
      />
    );
  }

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, check_in, check_out, status, guest:guests(full_name)")
    .eq("id", decoded.bookingId)
    .maybeSingle<BookingInfo>();

  if (!booking) {
    return (
      <Notice
        title="Reserva no encontrada"
        body="No pudimos ubicar tu reserva. Escribinos por WhatsApp y lo resolvemos."
      />
    );
  }

  if (!isReviewWindowOpen(booking.check_out)) {
    return (
      <Notice
        title="Período cerrado"
        body="El período de 30 días para dejar reseña ya pasó. ¡Gracias igual por tu estadía!"
      />
    );
  }

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();
  if (existing) {
    redirect("/resena/gracias?already=1");
  }

  const guestName = booking.guest?.full_name || "";

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-script text-4xl text-secondary">Esenza</p>
          <h1 className="font-editorial text-4xl md:text-5xl text-primary mt-2">
            Dejanos tu reseña
          </h1>
          <p className="mt-4 text-on-surface-variant">
            Tu opinión honesta nos ayuda a mejorar y a que otras personas
            encuentren su espacio de calma.
          </p>
        </div>

        <ReviewForm token={token} defaultName={guestName} />
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6 flex items-center">
      <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-stone-200 p-10">
        <span className="material-symbols-outlined text-5xl text-stone-300">
          info
        </span>
        <h1 className="mt-4 font-editorial text-3xl text-primary">{title}</h1>
        <p className="mt-3 text-stone-600">{body}</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 mt-6 text-sm text-primary hover:underline"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
