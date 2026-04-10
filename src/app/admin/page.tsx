import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type BookingRow = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
  created_at: string;
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [bookingsRes, guestsRes, pendingRes] = await Promise.all([
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
  ]);

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
      label: "Últimas reservas",
      value: bookingsRes.data?.length ?? 0,
      href: "/admin/reservas",
      icon: "event",
    },
  ];

  return (
    <div>
      <h1 className="font-editorial text-4xl text-primary">Dashboard</h1>
      <p className="mt-2 text-stone-600">
        Bienvenido al panel de administración de Esenza.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-primary text-3xl">
                {s.icon}
              </span>
              <span className="text-4xl font-headline text-primary">
                {s.value}
              </span>
            </div>
            <p className="mt-4 text-sm uppercase tracking-wider text-stone-600">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

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
