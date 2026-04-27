import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort, formatPriceCOP } from "@/lib/format";
import HuespedesSearch from "@/components/admin/HuespedesSearch";

const PAGE_SIZE = 50;

type Row = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  country: string | null;
  tags: string[];
  total_bookings: number;
  total_spent: number;
  created_at: string;
};

export default async function HuespedesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const supabase = await createClient();
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("guests")
    .select(
      "id, full_name, email, phone, country, tags, total_bookings, total_spent, created_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (q && q.trim()) {
    const needle = q.trim();
    const escaped = needle.replace(/[%,]/g, "");
    query = query.or(
      `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`,
    );
  }

  const { data, count, error } = await query.returns<Row[]>();
  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-editorial text-4xl text-primary">Huéspedes</h1>
          <p className="mt-1 text-stone-600 text-sm">
            {count ?? 0} huéspedes en total
          </p>
        </div>
        <a
          href="/api/export/huespedes"
          className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            file_download
          </span>
          Exportar CSV
        </a>
      </div>

      <HuespedesSearch />

      {error ? (
        <div className="mt-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            person_search
          </span>
          <p className="mt-4 text-stone-500">
            {q ? "Sin resultados para esa búsqueda." : "Aún no hay huéspedes."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
                    <th className="px-6 py-3 font-medium">Nombre</th>
                    <th className="px-6 py-3 font-medium">Contacto</th>
                    <th className="px-6 py-3 font-medium">País</th>
                    <th className="px-6 py-3 font-medium">Tags</th>
                    <th className="px-6 py-3 font-medium text-center">
                      Reservas
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      Gastado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/huespedes/${g.id}`}
                          className="font-medium text-stone-900 hover:text-primary"
                        >
                          {g.full_name}
                        </Link>
                        <p className="text-xs text-stone-500">
                          Desde {formatDateShort(g.created_at.slice(0, 10))}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-stone-700">
                        {g.email && (
                          <p className="truncate max-w-[200px]">{g.email}</p>
                        )}
                        <p className="text-xs text-stone-500">{g.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-stone-700">
                        {g.country || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {g.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-stone-800"
                            >
                              {t}
                            </span>
                          ))}
                          {g.tags.length > 3 && (
                            <span className="text-[10px] text-stone-500">
                              +{g.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {g.total_bookings}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatPriceCOP(g.total_spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <p className="text-stone-500">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/admin/huespedes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage - 1) })}`}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
                  >
                    Anterior
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/admin/huespedes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage + 1) })}`}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
