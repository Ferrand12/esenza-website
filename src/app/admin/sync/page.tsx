import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import RunSyncButton from "@/components/admin/RunSyncButton";

type SyncLog = {
  id: string;
  source: string;
  status: string;
  events_imported: number;
  errors: unknown;
  ran_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
};

export default async function SyncPage() {
  const supabase = await createClient();

  const [cfgRes, logsRes] = await Promise.all([
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "airbnb_ical_url")
      .single(),
    supabase
      .from("sync_log")
      .select("id, source, status, events_imported, errors, ran_at")
      .order("ran_at", { ascending: false })
      .limit(30)
      .returns<SyncLog[]>(),
  ]);

  const rawUrl = cfgRes.data?.value;
  const currentUrl =
    typeof rawUrl === "string"
      ? rawUrl
      : (rawUrl as { url?: string } | null)?.url ?? "";
  const configured = Boolean(currentUrl && /^https?:\/\//.test(currentUrl));

  return (
    <div className="max-w-4xl">
      <h1 className="font-editorial text-4xl text-primary">Sync Airbnb</h1>
      <p className="mt-1 text-stone-600 text-sm">
        Importa las fechas bloqueadas desde el calendario iCal de Airbnb.
      </p>

      <section className="mt-8 bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-editorial text-xl text-primary mb-4">Estado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              URL configurada
            </p>
            <p
              className={`mt-1 text-sm font-medium ${configured ? "text-emerald-700" : "text-rose-700"}`}
            >
              {configured ? "✓ Sí" : "✗ No — configúralo en Configuración"}
            </p>
            {configured && (
              <p className="mt-2 text-xs text-stone-500 break-all">
                {currentUrl}
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Ejecución manual
            </p>
            <p className="mt-1 text-sm text-stone-600 mb-3">
              Corre la importación ahora mismo.
            </p>
            <RunSyncButton disabled={!configured} />
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          <strong>Feed saliente:</strong>{" "}
          <code className="bg-stone-100 px-2 py-0.5 rounded text-[11px]">
            /api/ical/esenza.ics
          </code>{" "}
          — importá esta URL en Airbnb / Booking para que no te sobrevendan.
        </p>
      </section>

      <section className="mt-8 bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-editorial text-xl text-primary">
            Historial de sincronizaciones
          </h2>
        </div>
        {(logsRes.data ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">
            Sin sincronizaciones todavía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
                <th className="px-6 py-3 font-medium">Cuándo</th>
                <th className="px-6 py-3 font-medium">Fuente</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">
                  Eventos importados
                </th>
              </tr>
            </thead>
            <tbody>
              {(logsRes.data ?? []).map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-stone-100 last:border-0"
                >
                  <td className="px-6 py-3 text-stone-700">
                    {formatDateTime(l.ran_at)}
                  </td>
                  <td className="px-6 py-3 text-stone-700">{l.source}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[l.status] || "bg-stone-100"}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium">
                    {l.events_imported}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
