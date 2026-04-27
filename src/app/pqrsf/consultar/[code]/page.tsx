import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_STATUS_BADGE,
  COMPLAINT_TYPE_LABEL,
  type ComplaintStatus,
  type ComplaintType,
} from "@/lib/pqrsf";

export const metadata = {
  title: "Consultar PQRSF · Esenza",
  robots: "noindex,nofollow",
};

type ComplaintPublic = {
  id: string;
  tracking_code: string;
  type: ComplaintType;
  subject: string;
  description: string;
  status: ComplaintStatus;
  sla_due_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  attachments: { path: string; name: string; mime: string }[] | null;
  created_at: string;
};

type EventRow = {
  id: string;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
};

export default async function ConsultarPqrsfPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!/^PQRSF-\d{4}-\d{4}$/.test(code)) notFound();

  const admin = createAdminClient();
  const { data: complaint } = await admin
    .from("complaints")
    .select(
      "id, tracking_code, type, subject, description, status, sla_due_at, resolved_at, resolution_notes, attachments, created_at",
    )
    .eq("tracking_code", code)
    .maybeSingle<ComplaintPublic>();

  if (!complaint) notFound();

  const { data: events } = await admin
    .from("complaint_events")
    .select("id, event_type, from_value, to_value, note, created_at")
    .eq("complaint_id", complaint.id)
    .order("created_at", { ascending: true })
    .returns<EventRow[]>();

  const badgeClass = COMPLAINT_STATUS_BADGE[complaint.status];

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/pqrsf"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-primary mb-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </Link>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500">
                {COMPLAINT_TYPE_LABEL[complaint.type]}
              </p>
              <p className="font-mono text-xl text-primary font-semibold">
                {complaint.tracking_code}
              </p>
            </div>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${badgeClass}`}
            >
              {COMPLAINT_STATUS_LABEL[complaint.status]}
            </span>
          </div>

          <h1 className="mt-6 font-editorial text-3xl text-primary">
            {complaint.subject}
          </h1>

          <div className="mt-6 bg-stone-50 rounded-lg p-4 text-sm text-stone-700 whitespace-pre-wrap">
            {complaint.description}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <InfoBox
              label="Radicado"
              value={new Date(complaint.created_at).toLocaleDateString(
                "es-CO",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            />
            <InfoBox
              label={
                complaint.resolved_at
                  ? "Resuelto"
                  : "Compromiso de respuesta"
              }
              value={new Date(
                complaint.resolved_at || complaint.sla_due_at,
              ).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </div>

          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">
                Adjuntos
              </p>
              <ul className="flex flex-wrap gap-2">
                {complaint.attachments.map((a) => (
                  <li key={a.path}>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pqrsf-attachments/${a.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs text-stone-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        {a.mime?.startsWith("image/") ? "image" : "description"}
                      </span>
                      {a.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {complaint.resolution_notes && (
            <div className="mt-6 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg p-4">
              <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">
                Respuesta
              </p>
              <p className="text-sm text-stone-800 whitespace-pre-wrap">
                {complaint.resolution_notes}
              </p>
            </div>
          )}
        </div>

        {events && events.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="font-editorial text-xl text-primary mb-5">
              Línea de tiempo
            </h2>
            <ol className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex gap-3 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-stone-800">
                      {describeEvent(ev)}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(ev.created_at).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function describeEvent(ev: EventRow): string {
  switch (ev.event_type) {
    case "created":
      return "Radicada en el sistema.";
    case "status_changed":
      return `Estado actualizado: ${ev.from_value || "—"} → ${ev.to_value || "—"}`;
    case "resolved":
      return "Marcada como resuelta.";
    case "note_added":
      return ev.note || "Nota interna agregada.";
    default:
      return ev.note || `Evento: ${ev.event_type}`;
  }
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 rounded-lg p-3">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-800">{value}</p>
    </div>
  );
}
