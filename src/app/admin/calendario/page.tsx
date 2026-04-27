import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CalendarGrid, {
  type DayCell,
  type BookingRef,
  type BlockRef,
} from "@/components/admin/CalendarGrid";

const MONTH_LABEL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type BookingRow = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  status: BookingRef["status"];
  guest: { full_name: string } | null;
};

type BlockRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  source: BlockRef["source"];
};

function parseMonth(param: string | undefined): { year: number; month: number } {
  const now = new Date();
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonth(monthParam);

  // Build the 6-week grid starting from the Monday on/before the 1st.
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - firstWeekday);

  const gridEnd = new Date(gridStart);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 42); // 6 weeks, exclusive

  const gridStartISO = gridStart.toISOString().slice(0, 10);
  const gridEndISO = gridEnd.toISOString().slice(0, 10);

  const supabase = await createClient();

  const [bookingsRes, blocksRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, check_in, check_out, num_guests, status, guest:guests(full_name)",
      )
      .lt("check_in", gridEndISO)
      .gt("check_out", gridStartISO)
      .in("status", ["pending", "confirmed", "completed"])
      .returns<BookingRow[]>(),
    supabase
      .from("calendar_blocks")
      .select("id, start_date, end_date, reason, source")
      .lt("start_date", gridEndISO)
      .gt("end_date", gridStartISO)
      .returns<BlockRow[]>(),
  ]);

  const bookings = bookingsRes.data ?? [];
  const blocks = blocksRes.data ?? [];

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const dayBookings: BookingRef[] = bookings
      .filter((b) => b.check_in <= date && b.check_out > date)
      .map((b) => ({
        id: b.id,
        guest_name: b.guest?.full_name || "Sin nombre",
        status: b.status,
        check_in: b.check_in,
        check_out: b.check_out,
        num_guests: b.num_guests,
        is_start: b.check_in === date,
      }));
    const dayBlocks: BlockRef[] = blocks
      .filter((b) => b.start_date <= date && b.end_date > date)
      .map((b) => ({
        id: b.id,
        reason: b.reason,
        source: b.source,
        start_date: b.start_date,
        end_date: b.end_date,
        is_start: b.start_date === date,
      }));

    cells.push({
      date,
      day: d.getUTCDate(),
      inMonth: d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month,
      isToday: date === todayISO,
      bookings: dayBookings,
      blocks: dayBlocks,
    });
  }

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const prevHref = `/admin/calendario?month=${prev.year}-${String(prev.month).padStart(2, "0")}`;
  const nextHref = `/admin/calendario?month=${next.year}-${String(next.month).padStart(2, "0")}`;

  // Stats for the current visible month (not full 6 weeks)
  const monthStart = toISO(year, month, 1);
  const monthEndExcl = toISO(
    shiftMonth(year, month, 1).year,
    shiftMonth(year, month, 1).month,
    1,
  );
  const inMonth = (a: string, b: string) =>
    a < monthEndExcl && b > monthStart;
  const monthBookings = bookings.filter((b) => inMonth(b.check_in, b.check_out));
  const confirmed = monthBookings.filter((b) => b.status === "confirmed").length;
  const pending = monthBookings.filter((b) => b.status === "pending").length;
  const monthBlocks = blocks.filter((b) =>
    inMonth(b.start_date, b.end_date),
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-editorial text-4xl text-primary">Calendario</h1>
          <p className="mt-1 text-stone-600 text-sm">
            Reservas y bloqueos para {MONTH_LABEL[month - 1]} {year}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
            aria-label="Mes anterior"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <Link
            href="/admin/calendario"
            className="px-4 h-10 flex items-center rounded-lg border border-stone-200 hover:bg-stone-100 text-sm text-stone-700"
          >
            Hoy
          </Link>
          <Link
            href={nextHref}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
            aria-label="Mes siguiente"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Confirmadas" value={confirmed} tone="emerald" />
        <StatCard label="Pendientes" value={pending} tone="amber" />
        <StatCard label="Bloqueos" value={monthBlocks} tone="stone" />
      </div>

      {bookingsRes.error || blocksRes.error ? (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          Error cargando el calendario:{" "}
          {bookingsRes.error?.message || blocksRes.error?.message}
        </div>
      ) : null}

      <CalendarGrid cells={cells} />

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-stone-600">
        <Legend tone="amber" label="Reserva pendiente" />
        <Legend tone="emerald" label="Reserva confirmada" />
        <Legend tone="sky" label="Completada" />
        <Legend tone="stone" label="Bloqueo manual" />
        <Legend tone="rose" label="Bloqueo Airbnb" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "stone";
}) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    stone: "bg-stone-50 border-stone-200 text-stone-800",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 ${tones}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Legend({
  tone,
  label,
}: {
  tone: "amber" | "emerald" | "sky" | "stone" | "rose";
  label: string;
}) {
  const tones = {
    amber: "bg-amber-100 border-amber-300",
    emerald: "bg-emerald-100 border-emerald-300",
    sky: "bg-sky-100 border-sky-300",
    stone: "bg-stone-200 border-stone-400",
    rose: "bg-rose-100 border-rose-300",
  }[tone];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded border ${tones}`} />
      {label}
    </span>
  );
}
