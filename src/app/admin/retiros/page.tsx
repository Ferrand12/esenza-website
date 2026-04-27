import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  retreat_type: string | null;
  status: "nuevo" | "confirmada" | "cancelada";
  language: "es" | "en";
  created_at: string;
};

const RETREAT_LABEL: Record<string, string> = {
  yoga: "Yoga & Meditación",
  digital_detox: "Desintoxicación Digital",
  purpose: "Propósito / Ikigai",
  corporate: "Corporativo",
};

const STATUS_BADGE: Record<string, string> = {
  nuevo: "bg-amber-100 text-amber-800",
  confirmada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-stone-100 text-stone-500",
};

export default async function RetirosAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("retreat_registrations")
    .select(
      "id, full_name, email, phone, country, retreat_type, status, language, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(300)
    .returns<Row[]>();

  const rows = data ?? [];
  const counts = {
    nuevo: rows.filter((r) => r.status === "nuevo").length,
    confirmada: rows.filter((r) => r.status === "confirmada").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-editorial text-4xl text-primary">
          Inscripciones a retiros
        </h1>
        <p className="mt-1 text-stone-600 text-sm">
          {rows.length}{" "}
          {rows.length === 1 ? "inscripción" : "inscripciones"} ·{" "}
          {counts.nuevo} nuevas · {counts.confirmada} confirmadas
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 mb-4">
          {error.message}
          {error.code === "42P01" && (
            <p className="mt-1 text-xs">
              Corré la migración 0006 en Supabase SQL Editor.
            </p>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            self_improvement
          </span>
          <p className="mt-4 text-stone-500">
            Aún no hay inscripciones a retiros.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
                <th className="px-6 py-3 font-medium">Participante</th>
                <th className="px-6 py-3 font-medium">Retiro</th>
                <th className="px-6 py-3 font-medium">País</th>
                <th className="px-6 py-3 font-medium">Idioma</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Recibida</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/retiros/${r.id}`}
                      className="font-medium text-stone-900 hover:text-primary"
                    >
                      {r.full_name}
                    </Link>
                    <p className="text-xs text-stone-500">{r.email}</p>
                  </td>
                  <td className="px-6 py-4 text-stone-700 text-xs">
                    {r.retreat_type
                      ? RETREAT_LABEL[r.retreat_type] || r.retreat_type
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-stone-700">{r.country}</td>
                  <td className="px-6 py-4 text-stone-700 text-xs uppercase">
                    {r.language}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500">
                    {new Date(r.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
