import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  COMPLAINT_STATUS_BADGE,
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_TYPE_LABEL,
  COMPLAINT_PRIORITY_BADGE,
  COMPLAINT_PRIORITY_LABEL,
  isSlaBreached,
  isSlaSoon,
  type ComplaintPriority,
  type ComplaintStatus,
  type ComplaintType,
} from "@/lib/pqrsf";

type Row = {
  id: string;
  tracking_code: string;
  type: ComplaintType;
  subject: string;
  guest_name: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  sla_due_at: string;
  created_at: string;
  assigned_to: string | null;
  assigned_profile: { full_name: string | null; email: string } | null;
};

const STATUS_TABS: (ComplaintStatus | "todos")[] = [
  "todos",
  "nuevo",
  "en_proceso",
  "resuelto",
  "cerrado",
];

const STATUS_TAB_LABEL: Record<string, string> = {
  todos: "Todos",
  nuevo: "Nuevos",
  en_proceso: "En proceso",
  resuelto: "Resueltos",
  cerrado: "Cerrados",
};

export default async function PqrsfInboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
  }>;
}) {
  const { status, type, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("complaints")
    .select(
      "id, tracking_code, type, subject, guest_name, status, priority, sla_due_at, created_at, assigned_to, assigned_profile:profiles!complaints_assigned_to_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const VALID_STATUS = ["nuevo", "en_proceso", "resuelto", "cerrado"] as const;
  const VALID_TYPES = [
    "peticion",
    "queja",
    "reclamo",
    "sugerencia",
    "felicitacion",
  ] as const;
  if (
    status &&
    status !== "todos" &&
    VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])
  ) {
    query = query.eq("status", status as (typeof VALID_STATUS)[number]);
  }
  if (type && VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    query = query.eq("type", type as (typeof VALID_TYPES)[number]);
  }

  const { data, error } = await query.returns<Row[]>();
  let rows = data ?? [];
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.tracking_code.toLowerCase().includes(needle) ||
        r.subject.toLowerCase().includes(needle) ||
        r.guest_name.toLowerCase().includes(needle),
    );
  }

  // Counters
  const allOpen = (data ?? []).filter(
    (r) => r.status === "nuevo" || r.status === "en_proceso",
  );
  const vencidas = allOpen.filter((r) => isSlaBreached(r)).length;
  const proximas = allOpen.filter(
    (r) => !isSlaBreached(r) && isSlaSoon(r, 3),
  ).length;
  const urgentes = allOpen.filter((r) => r.priority === "urgente").length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-editorial text-4xl text-primary">PQRSF</h1>
          <p className="mt-1 text-stone-600 text-sm">
            Peticiones, quejas, reclamos, sugerencias y felicitaciones.
          </p>
        </div>
        <a
          href="/api/export/pqrsf"
          className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            file_download
          </span>
          Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat
          label="Vencidas"
          value={vencidas}
          tone={vencidas > 0 ? "rose" : "stone"}
          hint="Incumplen SLA"
        />
        <Stat
          label="Próximas a vencer"
          value={proximas}
          tone={proximas > 0 ? "amber" : "stone"}
          hint="En 3 días"
        />
        <Stat
          label="Urgentes"
          value={urgentes}
          tone={urgentes > 0 ? "orange" : "stone"}
          hint="Prioridad urgente"
        />
        <Stat
          label="Abiertas"
          value={allOpen.length}
          tone="sky"
          hint="Nuevo + en proceso"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_TABS.map((s) => {
          const href =
            s === "todos"
              ? "/admin/pqrsf"
              : `/admin/pqrsf?status=${s}`;
          const isActive = (status ?? "todos") === s;
          return (
            <Link
              key={s}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {STATUS_TAB_LABEL[s]}
            </Link>
          );
        })}
        <form
          method="GET"
          action="/admin/pqrsf"
          className="ml-auto flex gap-2"
        >
          {status && status !== "todos" && (
            <input type="hidden" name="status" value={status} />
          )}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar código, asunto, remitente…"
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:border-primary outline-none"
          />
        </form>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 mb-4">
          {error.message}
          {error.code === "42P01" && (
            <p className="mt-1 text-xs">
              La tabla <code>complaints</code> no existe. Corré la migración
              0003 en Supabase SQL Editor.
            </p>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            forum
          </span>
          <p className="mt-4 text-stone-500">
            No hay PQRSF con estos filtros.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
                  <th className="px-6 py-3 font-medium">Código</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Asunto</th>
                  <th className="px-6 py-3 font-medium">Remitente</th>
                  <th className="px-6 py-3 font-medium">Prioridad</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const breached = isSlaBreached(r);
                  const soon = !breached && isSlaSoon(r, 3);
                  const slaDate = new Date(r.sla_due_at);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/pqrsf/${r.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {r.tracking_code}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-700">
                        {COMPLAINT_TYPE_LABEL[r.type]}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/pqrsf/${r.id}`}
                          className="font-medium text-stone-900 hover:text-primary"
                        >
                          {r.subject}
                        </Link>
                        {r.assigned_profile && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            Asignado a{" "}
                            {r.assigned_profile.full_name ||
                              r.assigned_profile.email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-stone-700">
                        {r.guest_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${COMPLAINT_PRIORITY_BADGE[r.priority]}`}
                        >
                          {COMPLAINT_PRIORITY_LABEL[r.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${COMPLAINT_STATUS_BADGE[r.status]}`}
                        >
                          {COMPLAINT_STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={
                            breached
                              ? "text-rose-700 font-semibold"
                              : soon
                                ? "text-amber-700 font-medium"
                                : "text-stone-600"
                          }
                        >
                          {breached ? "Vencida " : soon ? "Vence " : ""}
                          {slaDate.toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "rose" | "amber" | "orange" | "sky" | "stone";
}) {
  const tones: Record<string, string> = {
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    sky: "bg-sky-50 border-sky-200 text-sky-900",
    stone: "bg-white border-stone-200 text-stone-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs opacity-70">{hint}</p>
    </div>
  );
}
