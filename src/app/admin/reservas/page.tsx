import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateShort,
  formatPriceCOP,
  PACKAGE_LABEL,
  SOURCE_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/format";
import ReservasFilters from "@/components/admin/ReservasFilters";

type Status = "pending" | "confirmed" | "cancelled" | "completed";

const STATUSES: Status[] = ["pending", "confirmed", "cancelled", "completed"];

type Row = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  package: string;
  total_price: number;
  status: string;
  source: string;
  created_at: string;
  guest: { full_name: string; email: string | null; phone: string } | null;
};

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; source?: string }>;
}) {
  const { status, q, source } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      "id, check_in, check_out, num_guests, package, total_price, status, source, created_at, guest:guests(full_name, email, phone)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && STATUSES.includes(status as Status)) {
    query = query.eq("status", status);
  }
  if (source && ["web", "airbnb", "manual", "whatsapp"].includes(source)) {
    query = query.eq("source", source);
  }

  const { data, error } = await query.returns<Row[]>();

  let rows = data ?? [];
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.guest?.full_name?.toLowerCase().includes(needle) ||
        r.guest?.email?.toLowerCase().includes(needle) ||
        r.guest?.phone?.toLowerCase().includes(needle),
    );
  }

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (data ?? []).filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-editorial text-4xl text-primary">Reservas</h1>
          <p className="mt-1 text-stone-600 text-sm">
            {rows.length} {rows.length === 1 ? "reserva" : "reservas"}
            {status ? ` con estado "${STATUS_LABEL[status]}"` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/reservas${
              (status || source || q)
                ? `?${new URLSearchParams({
                    ...(status ? { status } : {}),
                    ...(source ? { source } : {}),
                    ...(q ? { q } : {}),
                  }).toString()}`
                : ""
            }`}
            className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              file_download
            </span>
            Exportar CSV
          </a>
          <Link
            href="/admin/reservas/nueva"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Nueva reserva
          </Link>
        </div>
      </div>

      <ReservasFilters counts={counts} />

      {error ? (
        <div className="mt-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          Error cargando reservas: {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            event_busy
          </span>
          <p className="mt-4 text-stone-500">No hay reservas con estos filtros.</p>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
                  <th className="px-6 py-3 font-medium">Huésped</th>
                  <th className="px-6 py-3 font-medium">Fechas</th>
                  <th className="px-6 py-3 font-medium">Pax</th>
                  <th className="px-6 py-3 font-medium">Paquete</th>
                  <th className="px-6 py-3 font-medium">Origen</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/reservas/${r.id}`}
                        className="font-medium text-stone-900 hover:text-primary"
                      >
                        {r.guest?.full_name || "—"}
                      </Link>
                      <p className="text-xs text-stone-500">
                        {r.guest?.email || r.guest?.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-stone-700">
                      <p>{formatDateShort(r.check_in)}</p>
                      <p className="text-xs text-stone-500">
                        → {formatDateShort(r.check_out)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-stone-700">{r.num_guests}</td>
                    <td className="px-6 py-4 text-stone-700">
                      {PACKAGE_LABEL[r.package] || r.package}
                    </td>
                    <td className="px-6 py-4 text-stone-700">
                      {SOURCE_LABEL[r.source] || r.source}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-stone-100"}`}
                      >
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-stone-900">
                      {formatPriceCOP(r.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
