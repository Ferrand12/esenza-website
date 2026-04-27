import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  COMPLAINT_STATUS_BADGE,
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_TYPE_LABEL,
  COMPLAINT_TYPE_DESCRIPTION,
  COMPLAINT_PRIORITY_LABEL,
  COMPLAINT_PRIORITY_BADGE,
  isSlaBreached,
  type ComplaintPriority,
  type ComplaintStatus,
  type ComplaintType,
} from "@/lib/pqrsf";
import PqrsfDetailActions from "@/components/admin/PqrsfDetailActions";
import type { ResponseTemplate } from "@/app/admin/config/actions";

type Complaint = {
  id: string;
  tracking_code: string;
  type: ComplaintType;
  subject: string;
  description: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  booking_id: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_to: string | null;
  channel: string;
  sla_due_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  attachments: { path: string; name: string; size: number; mime: string }[] | null;
  ai_classification: {
    suggested_type?: string;
    area?: string;
    summary?: string;
    sentiment?: string;
  } | null;
  ai_sentiment: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

type EventRow = {
  id: string;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
  actor: { full_name: string | null; email: string } | null;
};

export default async function PqrsfDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select(
      "id, tracking_code, type, subject, description, guest_name, guest_email, guest_phone, booking_id, status, priority, assigned_to, channel, sla_due_at, resolved_at, resolution_notes, attachments, ai_classification, ai_sentiment, created_at",
    )
    .eq("id", id)
    .maybeSingle<Complaint>();

  if (!complaint) notFound();

  const [{ data: profiles }, { data: events }, { data: templatesCfg }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .returns<Profile[]>(),
      supabase
        .from("complaint_events")
        .select(
          "id, event_type, from_value, to_value, note, created_at, actor:profiles!complaint_events_actor_id_fkey(full_name, email)",
        )
        .eq("complaint_id", id)
        .order("created_at", { ascending: true })
        .returns<EventRow[]>(),
      supabase
        .from("site_config")
        .select("value")
        .eq("key", "pqrsf_response_templates")
        .maybeSingle(),
    ]);

  const templates: ResponseTemplate[] = Array.isArray(templatesCfg?.value)
    ? (templatesCfg.value as ResponseTemplate[])
    : [];

  const breached = isSlaBreached(complaint);

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/pqrsf"
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-primary mb-6"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver a PQRSF
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-mono text-xs text-stone-500">
            {complaint.tracking_code}
          </p>
          <h1 className="font-editorial text-3xl text-primary mt-1">
            {complaint.subject}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {COMPLAINT_TYPE_LABEL[complaint.type]} ·{" "}
            {COMPLAINT_TYPE_DESCRIPTION[complaint.type]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${COMPLAINT_PRIORITY_BADGE[complaint.priority]}`}
          >
            {COMPLAINT_PRIORITY_LABEL[complaint.priority]}
          </span>
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${COMPLAINT_STATUS_BADGE[complaint.status]}`}
          >
            {COMPLAINT_STATUS_LABEL[complaint.status]}
          </span>
        </div>
      </div>

      {breached && (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center gap-2">
          <span className="material-symbols-outlined">schedule</span>
          <span>
            <strong>SLA vencido.</strong> Debió resolverse el{" "}
            {new Date(complaint.sla_due_at).toLocaleDateString("es-CO")}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-lg text-primary mb-3">
              Descripción
            </h2>
            <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mt-5 pt-4 border-t border-stone-100">
                <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">
                  Adjuntos ({complaint.attachments.length})
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((a) => (
                    <li key={a.path}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pqrsf-attachments/${a.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block group"
                      >
                        {a.mime.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pqrsf-attachments/${a.path}`}
                            alt={a.name}
                            className="w-full aspect-square object-cover rounded-lg border border-stone-200 group-hover:border-primary"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center group-hover:border-primary">
                            <span className="material-symbols-outlined text-4xl text-stone-400">
                              description
                            </span>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-stone-600 truncate group-hover:text-primary">
                          {a.name}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {complaint.ai_classification && (
              <div className="mt-5 pt-4 border-t border-stone-100">
                <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  Análisis automático
                </h3>
                <div className="text-sm text-stone-700 space-y-1">
                  {complaint.ai_classification.summary && (
                    <p className="italic">
                      &ldquo;{complaint.ai_classification.summary}&rdquo;
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {complaint.ai_classification.suggested_type && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-xs">
                        Tipo sugerido:{" "}
                        <strong>
                          {complaint.ai_classification.suggested_type}
                        </strong>
                      </span>
                    )}
                    {complaint.ai_classification.area && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-xs">
                        Área: <strong>{complaint.ai_classification.area}</strong>
                      </span>
                    )}
                    {complaint.ai_sentiment && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          complaint.ai_sentiment === "urgent"
                            ? "bg-rose-100 text-rose-800"
                            : complaint.ai_sentiment === "negative"
                              ? "bg-orange-100 text-orange-800"
                              : complaint.ai_sentiment === "positive"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100"
                        }`}
                      >
                        {complaint.ai_sentiment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {complaint.resolution_notes && (
            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h2 className="font-editorial text-lg text-emerald-900 mb-3">
                Resolución
              </h2>
              <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_at && (
                <p className="text-xs text-emerald-800 mt-3">
                  Resuelto{" "}
                  {new Date(complaint.resolved_at).toLocaleString("es-CO")}
                </p>
              )}
            </section>
          )}

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-lg text-primary mb-4">
              Línea de tiempo
            </h2>
            {(events ?? []).length === 0 ? (
              <p className="text-sm text-stone-500">Sin eventos registrados.</p>
            ) : (
              <ol className="space-y-4">
                {(events ?? []).map((ev) => (
                  <li key={ev.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-stone-800">
                        {describeEventAdmin(ev)}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {new Date(ev.created_at).toLocaleString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {ev.actor && (
                          <>
                            {" "}
                            · por{" "}
                            {ev.actor.full_name || ev.actor.email}
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-editorial text-lg text-primary mb-4">
              Remitente
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-500">
                  Nombre
                </dt>
                <dd className="mt-0.5 text-stone-900">
                  {complaint.guest_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-500">
                  Email
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${complaint.guest_email}`}
                    className="text-primary hover:underline"
                  >
                    {complaint.guest_email}
                  </a>
                </dd>
              </div>
              {complaint.guest_phone && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-500">
                    Teléfono
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={`https://wa.me/${complaint.guest_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {complaint.guest_phone}
                    </a>
                  </dd>
                </div>
              )}
              {complaint.booking_id && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-500">
                    Reserva
                  </dt>
                  <dd className="mt-0.5">
                    <Link
                      href={`/admin/reservas/${complaint.booking_id}`}
                      className="text-primary hover:underline text-xs font-mono"
                    >
                      {complaint.booking_id.slice(0, 8)}…
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-500">
                  Canal
                </dt>
                <dd className="mt-0.5 text-stone-900 capitalize">
                  {complaint.channel}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-500">
                  SLA
                </dt>
                <dd
                  className={`mt-0.5 ${breached ? "text-rose-700 font-semibold" : "text-stone-900"}`}
                >
                  {new Date(complaint.sla_due_at).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </section>

          <PqrsfDetailActions
            id={complaint.id}
            status={complaint.status}
            priority={complaint.priority}
            assignedTo={complaint.assigned_to}
            profiles={(profiles ?? []).map((p) => ({
              id: p.id,
              name: p.full_name || p.email,
            }))}
            canResolve={complaint.status !== "resuelto"}
            templates={templates}
            complaintContext={{
              nombre: complaint.guest_name,
              tracking: complaint.tracking_code,
              asunto: complaint.subject,
            }}
          />
        </aside>
      </div>
    </div>
  );
}

function describeEventAdmin(ev: EventRow): string {
  switch (ev.event_type) {
    case "created":
      return ev.note || "Radicada en el sistema.";
    case "status_changed":
      return `Estado: ${ev.from_value || "—"} → ${ev.to_value || "—"}`;
    case "priority_changed":
      return `Prioridad: ${ev.from_value || "—"} → ${ev.to_value || "—"}`;
    case "assigned":
      return ev.to_value ? "Asignada" : "Desasignada";
    case "resolved":
      return `Resuelta${ev.note ? ": " + ev.note.slice(0, 80) + (ev.note.length > 80 ? "…" : "") : ""}`;
    case "note_added":
      return ev.note || "Nota interna agregada.";
    default:
      return ev.note || ev.event_type;
  }
}
