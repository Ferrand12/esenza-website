import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPriceCOP, PACKAGE_LABEL, SOURCE_LABEL } from "@/lib/format";

type Booking = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  package: string;
  total_price: number;
  status: string;
  source: string;
  created_at: string;
};

type Guest = {
  id: string;
  full_name: string;
  email: string | null;
  country: string | null;
  total_bookings: number;
  total_spent: number;
};

const MONTH_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

function overlapDays(
  startA: string,
  endAExcl: string,
  startB: string,
  endBExcl: string,
): number {
  const s = startA > startB ? startA : startB;
  const e = endAExcl < endBExcl ? endAExcl : endBExcl;
  if (s >= e) return 0;
  return Math.round(
    (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default async function ReportesPage() {
  const supabase = await createClient();
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
  );
  const startISO = startDate.toISOString().slice(0, 10);

  // Bookings that overlap the last 12 months and are not cancelled.
  const [bookingsRes, guestsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, check_in, check_out, num_guests, package, total_price, status, source, created_at",
      )
      .gt("check_out", startISO)
      .in("status", ["confirmed", "completed", "pending"])
      .returns<Booking[]>(),
    supabase
      .from("guests")
      .select("id, full_name, email, country, total_bookings, total_spent")
      .gt("total_spent", 0)
      .order("total_spent", { ascending: false })
      .limit(5)
      .returns<Guest[]>(),
  ]);

  const bookings = bookingsRes.data ?? [];
  const guests = guestsRes.data ?? [];

  // --- Monthly buckets (last 12 months) ---
  const months: { year: number; month0: number; key: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    months.push({
      year: d.getUTCFullYear(),
      month0: d.getUTCMonth(),
      key: monthKey(d),
    });
  }

  const revenueByMonth = new Map<string, number>();
  const occupancyByMonth = new Map<string, number>();
  const bookingsByMonth = new Map<string, number>();

  for (const m of months) {
    revenueByMonth.set(m.key, 0);
    occupancyByMonth.set(m.key, 0);
    bookingsByMonth.set(m.key, 0);
  }

  const firmBookings = bookings.filter((b) =>
    ["confirmed", "completed"].includes(b.status),
  );

  for (const b of firmBookings) {
    // Revenue = attribute to check-in month (simpler & matches most hotel KPIs).
    const ciDate = new Date(b.check_in + "T00:00:00Z");
    const ciKey = monthKey(ciDate);
    if (revenueByMonth.has(ciKey)) {
      revenueByMonth.set(
        ciKey,
        (revenueByMonth.get(ciKey) ?? 0) + Number(b.total_price),
      );
      bookingsByMonth.set(
        ciKey,
        (bookingsByMonth.get(ciKey) ?? 0) + 1,
      );
    }

    // Occupancy = sum of nights each booking contributes to each month.
    for (const m of months) {
      const monthStart = `${m.year}-${String(m.month0 + 1).padStart(2, "0")}-01`;
      const monthEndDate = new Date(Date.UTC(m.year, m.month0 + 1, 1));
      const monthEnd = monthEndDate.toISOString().slice(0, 10);
      const days = overlapDays(b.check_in, b.check_out, monthStart, monthEnd);
      if (days > 0) {
        occupancyByMonth.set(
          m.key,
          (occupancyByMonth.get(m.key) ?? 0) + days,
        );
      }
    }
  }

  // --- Breakdown by source & package (last 12 months) ---
  const sourceCount = new Map<string, number>();
  const packageCount = new Map<string, number>();
  const sourceRevenue = new Map<string, number>();
  for (const b of firmBookings) {
    sourceCount.set(b.source, (sourceCount.get(b.source) ?? 0) + 1);
    sourceRevenue.set(
      b.source,
      (sourceRevenue.get(b.source) ?? 0) + Number(b.total_price),
    );
    packageCount.set(b.package, (packageCount.get(b.package) ?? 0) + 1);
  }

  // --- Summary stats ---
  const yearStart = `${now.getUTCFullYear()}-01-01`;
  const revenueYTD = firmBookings
    .filter((b) => b.check_in >= yearStart)
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const bookingsYTD = firmBookings.filter((b) => b.check_in >= yearStart).length;
  const totalNights = firmBookings
    .filter((b) => b.check_in >= yearStart)
    .reduce(
      (sum, b) =>
        sum +
        Math.round(
          (new Date(b.check_out).getTime() -
            new Date(b.check_in).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      0,
    );
  const avgStay = bookingsYTD > 0 ? totalNights / bookingsYTD : 0;
  const avgBookingValue = bookingsYTD > 0 ? revenueYTD / bookingsYTD : 0;

  const maxRevenue = Math.max(...Array.from(revenueByMonth.values()), 1);
  const totalSources =
    Array.from(sourceCount.values()).reduce((a, b) => a + b, 0) || 1;
  const totalPackages =
    Array.from(packageCount.values()).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-editorial text-4xl text-primary">Reportes</h1>
        <p className="mt-1 text-stone-600 text-sm">
          Performance del negocio — últimos 12 meses.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KPI
          label="Revenue del año"
          value={formatPriceCOP(revenueYTD)}
          hint={`${bookingsYTD} reservas confirmadas`}
        />
        <KPI
          label="Valor promedio"
          value={formatPriceCOP(avgBookingValue)}
          hint="por reserva"
        />
        <KPI
          label="Estancia promedio"
          value={`${avgStay.toFixed(1)} noches`}
          hint="duración típica"
        />
        <KPI
          label="Total noches"
          value={String(totalNights)}
          hint="YTD"
        />
      </div>

      {/* Revenue chart */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <h2 className="font-editorial text-xl text-primary mb-1">
          Revenue mensual
        </h2>
        <p className="text-xs text-stone-500 mb-5">
          Reservas confirmadas y completadas, por mes de check-in.
        </p>
        <div className="flex items-end gap-2 h-56">
          {months.map((m) => {
            const rev = revenueByMonth.get(m.key) ?? 0;
            const h = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
            return (
              <div
                key={m.key}
                className="flex-1 flex flex-col items-center justify-end gap-2 group"
              >
                <span className="text-[10px] text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatPriceCOP(rev)}
                </span>
                <div
                  className="w-full bg-primary rounded-t-md hover:bg-primary-container transition-colors"
                  style={{ height: `${Math.max(h, 2)}%` }}
                  title={`${MONTH_SHORT[m.month0]} ${m.year} · ${formatPriceCOP(rev)}`}
                />
                <span className="text-[10px] text-stone-500">
                  {MONTH_SHORT[m.month0]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Occupancy */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <h2 className="font-editorial text-xl text-primary mb-1">
          Ocupación mensual
        </h2>
        <p className="text-xs text-stone-500 mb-5">
          Porcentaje de noches reservadas sobre los días disponibles del mes.
        </p>
        <div className="space-y-3">
          {months.map((m) => {
            const nights = occupancyByMonth.get(m.key) ?? 0;
            const total = daysInMonth(m.year, m.month0);
            const pct = Math.min((nights / total) * 100, 100);
            const count = bookingsByMonth.get(m.key) ?? 0;
            return (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-xs text-stone-600 w-14">
                  {MONTH_SHORT[m.month0]} {String(m.year).slice(2)}
                </span>
                <div className="flex-1 h-6 bg-stone-100 rounded-md overflow-hidden relative">
                  <div
                    className={`h-full transition-all ${
                      pct >= 70
                        ? "bg-emerald-500"
                        : pct >= 40
                          ? "bg-amber-500"
                          : "bg-stone-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] text-stone-700 font-medium">
                    {pct.toFixed(0)}% · {nights}/{total} noches · {count}{" "}
                    {count === 1 ? "reserva" : "reservas"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-column: Source + Package breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-editorial text-xl text-primary mb-1">
            Origen de reservas
          </h2>
          <p className="text-xs text-stone-500 mb-5">
            Distribución por canal de adquisición.
          </p>
          <div className="space-y-3">
            {Array.from(sourceCount.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => {
                const pct = (count / totalSources) * 100;
                const revenue = sourceRevenue.get(source) ?? 0;
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-stone-700">
                        {SOURCE_LABEL[source] || source}
                      </span>
                      <span className="text-stone-500 text-xs">
                        {count} · {formatPriceCOP(revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {sourceCount.size === 0 && (
              <p className="text-sm text-stone-500">Sin datos todavía.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-editorial text-xl text-primary mb-1">
            Paquetes más reservados
          </h2>
          <p className="text-xs text-stone-500 mb-5">
            Distribución por paquete elegido.
          </p>
          <div className="space-y-3">
            {Array.from(packageCount.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([pkg, count]) => {
                const pct = (count / totalPackages) * 100;
                return (
                  <div key={pkg}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-stone-700">
                        {PACKAGE_LABEL[pkg] || pkg}
                      </span>
                      <span className="text-stone-500 text-xs">
                        {count} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {packageCount.size === 0 && (
              <p className="text-sm text-stone-500">Sin datos todavía.</p>
            )}
          </div>
        </section>
      </div>

      {/* Top guests */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-editorial text-xl text-primary mb-1">
          Top huéspedes
        </h2>
        <p className="text-xs text-stone-500 mb-5">
          Mayores valores acumulados de reservas confirmadas.
        </p>
        {guests.length === 0 ? (
          <p className="text-sm text-stone-500">
            Todavía no hay huéspedes con reservas confirmadas.
          </p>
        ) : (
          <ol className="space-y-3">
            {guests.map((g, i) => (
              <li
                key={g.id}
                className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <Link
                  href={`/admin/huespedes/${g.id}`}
                  className="flex-1 text-stone-900 font-medium hover:text-primary"
                >
                  {g.full_name}
                  <span className="block text-xs text-stone-500 font-normal">
                    {g.country || "—"} · {g.total_bookings}{" "}
                    {g.total_bookings === 1 ? "reserva" : "reservas"}
                  </span>
                </Link>
                <span className="text-sm font-semibold text-stone-900">
                  {formatPriceCOP(g.total_spent)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function KPI({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}
