import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CHANNEL_LABEL,
  formatDateTime,
  formatPriceCOP,
  SOURCE_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/format";
import StatusActions from "@/components/admin/StatusActions";
import InternalNotesForm from "@/components/admin/InternalNotesForm";
import CommunicationForm from "@/components/admin/CommunicationForm";
import EditBookingDetails from "@/components/admin/EditBookingDetails";

type Booking = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  package: string;
  total_price: number;
  status: string;
  source: string;
  external_id: string | null;
  special_requests: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  guest_id: string | null;
  guest: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string;
    country: string | null;
    total_bookings: number;
    total_spent: number;
  } | null;
};

type Comm = {
  id: string;
  channel: string;
  direction: string;
  content: string;
  created_at: string;
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, check_in, check_out, num_guests, package, total_price, status, source, external_id, special_requests, internal_notes, created_at, updated_at, guest_id, guest:guests(id, full_name, email, phone, country, total_bookings, total_spent)",
    )
    .eq("id", id)
    .single<Booking>();

  if (!booking) notFound();

  // Config para el editor (max_guests)
  const { data: cfgMaxGuests } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "max_guests")
    .maybeSingle();
  const maxGuests = Number(cfgMaxGuests?.value) || 20;

  const { data: comms } = await supabase
    .from("communications")
    .select("id, channel, direction, content, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: false })
    .returns<Comm[]>();

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/reservas"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Volver a reservas
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-editorial text-4xl text-primary">
            {booking.guest?.full_name || "Reserva"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            ID {booking.id.slice(0, 8)} · Creada{" "}
            {formatDateTime(booking.created_at)}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_BADGE[booking.status] || "bg-stone-100"}`}
        >
          {STATUS_LABEL[booking.status] || booking.status}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: booking data + comms */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <EditBookingDetails
              id={booking.id}
              checkIn={booking.check_in}
              checkOut={booking.check_out}
              numGuests={booking.num_guests}
              pkg={booking.package}
              totalPrice={Number(booking.total_price)}
              specialRequests={booking.special_requests}
              maxGuests={maxGuests}
            />
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500">
              Origen:{" "}
              <span className="text-stone-700 font-medium">
                {SOURCE_LABEL[booking.source] || booking.source}
                {booking.external_id ? ` · ${booking.external_id}` : ""}
              </span>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">
              Notas internas
            </h2>
            <InternalNotesForm
              bookingId={booking.id}
              initial={booking.internal_notes ?? ""}
            />
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-editorial text-xl text-primary">
                Comunicaciones
              </h2>
              <span className="text-xs text-stone-500">
                {comms?.length ?? 0} registros
              </span>
            </div>

            {booking.guest_id && (
              <CommunicationForm
                bookingId={booking.id}
                guestId={booking.guest_id}
              />
            )}

            <div className="mt-6 space-y-3">
              {(comms ?? []).length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-6">
                  Sin comunicaciones registradas.
                </p>
              ) : (
                (comms ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-3 p-4 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${c.direction === "inbound" ? "text-sky-600" : "text-emerald-600"}`}
                    >
                      {c.direction === "inbound" ? "call_received" : "call_made"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                          {CHANNEL_LABEL[c.channel] || c.channel} ·{" "}
                          {c.direction === "inbound" ? "Entrada" : "Salida"}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatDateTime(c.created_at)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-stone-800 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right: guest + status actions */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">
              Acciones
            </h2>
            <StatusActions id={booking.id} currentStatus={booking.status} />
          </section>

          {booking.guest && (
            <section className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-editorial text-xl text-primary mb-4">
                Huésped
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-500">
                    Nombre
                  </dt>
                  <dd className="mt-0.5 font-medium text-stone-900">
                    {booking.guest.full_name}
                  </dd>
                </div>
                {booking.guest.email && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-stone-500">
                      Email
                    </dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${booking.guest.email}`}
                        className="text-primary hover:underline break-all"
                      >
                        {booking.guest.email}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-500">
                    Teléfono
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={`https://wa.me/${booking.guest.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {booking.guest.phone}
                      <span className="material-symbols-outlined text-base">
                        open_in_new
                      </span>
                    </a>
                  </dd>
                </div>
                {booking.guest.country && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-stone-500">
                      País
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {booking.guest.country}
                    </dd>
                  </div>
                )}
                <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-stone-500">
                      Reservas
                    </dt>
                    <dd className="mt-0.5 text-lg font-editorial text-primary">
                      {booking.guest.total_bookings}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-stone-500">
                      Gastado
                    </dt>
                    <dd className="mt-0.5 text-lg font-editorial text-primary">
                      {formatPriceCOP(booking.guest.total_spent)}
                    </dd>
                  </div>
                </div>
                <Link
                  href={`/admin/huespedes/${booking.guest.id}`}
                  className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Ver perfil completo
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </Link>
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
