import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSlaBreached } from "@/lib/pqrsf";

type BookingRow = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
  created_at: string;
};

type ComplaintMini = {
  id: string;
  tracking_code: string;
  status: "nuevo" | "en_proceso" | "resuelto" | "cerrado";
  sla_due_at: string;
  priority: string;
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [bookingsRes, guestsRes, pendingRes, complaintsRes, reviewsRes] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, check_in, check_out, status, total_price, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<BookingRow[]>(),
      supabase.from("guests").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("complaints")
        .select("id, tracking_code, status, sla_due_at, priority")
        .in("status", ["nuevo", "en_proceso"])
        .returns<ComplaintMini[]>(),
      supabase
        .from("reviews")
        .select("id, rating, status, response")
        .in("status", ["pending", "approved", "featured"]),
    ]);

  const openComplaints = complaintsRes.data ?? [];
  const slaBreached = openComplaints.filter(isSlaBreached).length;
  const urgentComplaints = openComplaints.filter(
    (c) => c.priority === "urgente",
  ).length;

  const reviews = reviewsRes.data ?? [];
  const pendingReviews = reviews.filter(
    (r) => (r as { status: string }).status === "pending",
  ).length;
  const lowUnanswered = reviews.filter(
    (r) =>
      (r as { rating: number; response: string | null }).rating <= 3 &&
      !(r as { response: string | null }).response,
  ).length;

  const stats = [
    {
      label: "Reservas pendientes",
      value: pendingRes.count ?? 0,
      href: "/admin/reservas?status=pending",
      icon: "schedule",
    },
    {
      label: "Total huéspedes",
      value: guestsRes.count ?? 0,
      href: "/admin/huespedes",
      icon: "group",
    },
    {
      label: "PQRSF vencidas",
      value: slaBreached,
      href: "/admin/pqrsf",
      icon: "warning",
      tone: slaBreached > 0 ? "rose" : undefined,
    },
    {
      label: "Reseñas por moderar",
      value: pendingReviews,
      href: "/admin/reviews?status=pending",
      icon: "reviews",
      tone: pendingReviews > 0 ? "amber" : undefined,
    },
  ];

  return (
    <div>
      <h1 className="font-editorial text-4xl text-primary">Dashboard</h1>
      <p className="mt-2 text-stone-600">
        Bienvenido al panel de administración de Esenza.
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const toneBorder =
            s.tone === "rose"
              ? "border-rose-300 hover:border-rose-500"
              : s.tone === "amber"
                ? "border-amber-300 hover:border-amber-500"
                : "border-stone-200 hover:border-primary";
          const toneValue =
            s.tone === "rose"
              ? "text-rose-700"
              : s.tone === "amber"
                ? "text-amber-700"
                : "text-primary";
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`group bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all ${toneBorder}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`material-symbols-outlined text-3xl ${toneValue}`}
                >
                  {s.icon}
                </span>
                <span className={`text-4xl font-headline ${toneValue}`}>
                  {s.value}
                </span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-stone-600">
                {s.label}
              </p>
            </Link>
          );
        })}
      </div>

      {(urgentComplaints > 0 || lowUnanswered > 0) && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentComplaints > 0 && (
            <Link
              href="/admin/pqrsf"
              className="bg-rose-50 border border-rose-200 rounded-2xl p-5 hover:bg-rose-100 transition-colors"
            >
              <p className="text-xs uppercase tracking-wider text-rose-700 font-semibold">
                ⚠️ Atención
              </p>
              <p className="mt-2 text-sm text-rose-900">
                Tenés <strong>{urgentComplaints}</strong> PQRSF con prioridad
                urgente abiertas.
              </p>
            </Link>
          )}
          {lowUnanswered > 0 && (
            <Link
              href="/admin/reviews"
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:bg-amber-100 transition-colors"
            >
              <p className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                Reviews a responder
              </p>
              <p className="mt-2 text-sm text-amber-900">
                <strong>{lowUnanswered}</strong>{" "}
                {lowUnanswered === 1 ? "reseña" : "reseñas"} con rating bajo sin
                respuesta pública.
              </p>
            </Link>
          )}
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-editorial text-2xl text-primary mb-4">
          Últimas reservas
        </h2>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {bookingsRes.data && bookingsRes.data.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-stone-700">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-stone-700">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-stone-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-stone-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookingsRes.data.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-6 py-3">{b.check_in}</td>
                    <td className="px-6 py-3">{b.check_out}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      ${Number(b.total_price).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-stone-500">
              No hay reservas todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
