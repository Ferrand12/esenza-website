import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CHANNEL_LABEL,
  formatDateLong,
  formatDateTime,
  formatPriceCOP,
  PACKAGE_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/format";
import GuestTagsEditor from "@/components/admin/GuestTagsEditor";
import GuestNotesForm from "@/components/admin/GuestNotesForm";
import EditGuestInfo from "@/components/admin/EditGuestInfo";

type Guest = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  country: string | null;
  notes: string | null;
  tags: string[];
  total_bookings: number;
  total_spent: number;
  created_at: string;
};

type Booking = {
  id: string;
  check_in: string;
  check_out: string;
  package: string;
  status: string;
  total_price: number;
};

type Comm = {
  id: string;
  channel: string;
  direction: string;
  content: string;
  created_at: string;
  booking_id: string | null;
};

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("guests")
    .select(
      "id, full_name, email, phone, country, notes, tags, total_bookings, total_spent, created_at",
    )
    .eq("id", id)
    .single<Guest>();

  if (!guest) notFound();

  const [bookingsRes, commsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, check_in, check_out, package, status, total_price")
      .eq("guest_id", id)
      .order("check_in", { ascending: false })
      .returns<Booking[]>(),
    supabase
      .from("communications")
      .select("id, channel, direction, content, created_at, booking_id")
      .eq("guest_id", id)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<Comm[]>(),
  ]);

  const bookings = bookingsRes.data ?? [];
  const comms = commsRes.data ?? [];
  const waPhone = guest.phone.replace(/\D/g, "");

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/huespedes"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Volver a huéspedes
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-editorial text-4xl text-primary">
            {guest.full_name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Cliente desde {formatDateTime(guest.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            WhatsApp
          </a>
          {guest.email && (
            <a
              href={`mailto:${guest.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bookings history */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">
              Historial de reservas ({bookings.length})
            </h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">
                Sin reservas registradas.
              </p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/reservas/${b.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-primary hover:bg-stone-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-stone-900">
                        {formatDateLong(b.check_in)} →{" "}
                        {formatDateLong(b.check_out)}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Paquete {PACKAGE_LABEL[b.package] || b.package}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">
                        {formatPriceCOP(b.total_price)}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[b.status] || "bg-stone-100"}`}
                      >
                        {STATUS_LABEL[b.status] || b.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Communications */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">
              Comunicaciones ({comms.length})
            </h2>
            {comms.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">
                Sin comunicaciones.
              </p>
            ) : (
              <div className="space-y-3">
                {comms.map((c) => (
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
                          {CHANNEL_LABEL[c.channel] || c.channel}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatDateTime(c.created_at)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-stone-800 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                      {c.booking_id && (
                        <Link
                          href={`/admin/reservas/${c.booking_id}`}
                          className="mt-2 text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Ver reserva relacionada
                          <span className="material-symbols-outlined text-sm">
                            open_in_new
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <section className="bg-primary text-white rounded-2xl p-6">
            <h2 className="font-editorial text-xl mb-4">Resumen</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">
                  Reservas confirmadas
                </dt>
                <dd className="mt-1 text-3xl font-editorial">
                  {guest.total_bookings}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">
                  Total gastado
                </dt>
                <dd className="mt-1 text-3xl font-editorial">
                  {formatPriceCOP(guest.total_spent)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Contact (editable) */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <EditGuestInfo
              id={guest.id}
              fullName={guest.full_name}
              email={guest.email}
              phone={guest.phone}
              country={guest.country}
            />
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">Tags</h2>
            <GuestTagsEditor id={guest.id} initial={guest.tags} />
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-xl text-primary mb-4">
              Notas del huésped
            </h2>
            <GuestNotesForm id={guest.id} initial={guest.notes ?? ""} />
          </section>
        </div>
      </div>
    </div>
  );
}
