"use client";

import { useState, useTransition } from "react";
import {
  addInternalNote,
  assign,
  changePriority,
  changeStatus,
  draftAiResponse,
  resolve,
} from "@/app/admin/pqrsf/actions";
import {
  COMPLAINT_PRIORITY_LABEL,
  COMPLAINT_STATUS_LABEL,
  type ComplaintPriority,
  type ComplaintStatus,
} from "@/lib/pqrsf";

type Template = { id: string; name: string; body: string };

type Props = {
  id: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedTo: string | null;
  profiles: { id: string; name: string }[];
  canResolve: boolean;
  templates?: Template[];
  complaintContext?: {
    nombre: string;
    tracking: string;
    asunto: string;
  };
};

function applyTemplate(
  body: string,
  ctx: { nombre: string; tracking: string; asunto: string } | undefined,
): string {
  if (!ctx) return body;
  return body
    .replaceAll("{{nombre}}", ctx.nombre)
    .replaceAll("{{tracking}}", ctx.tracking)
    .replaceAll("{{asunto}}", ctx.asunto);
}

const STATUSES: ComplaintStatus[] = [
  "nuevo",
  "en_proceso",
  "resuelto",
  "cerrado",
];
const PRIORITIES: ComplaintPriority[] = ["baja", "media", "alta", "urgente"];

export default function PqrsfDetailActions({
  id,
  status,
  priority,
  assignedTo,
  profiles,
  canResolve,
  templates = [],
  complaintContext,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);
  const [resolution, setResolution] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [note, setNote] = useState("");

  function flash(kind: "ok" | "error", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 3500);
  }

  function onStatus(next: ComplaintStatus) {
    startTransition(async () => {
      const res = await changeStatus(id, next);
      flash(res.ok ? "ok" : "error", res.ok ? "Estado actualizado." : res.error);
    });
  }
  function onPriority(next: ComplaintPriority) {
    startTransition(async () => {
      const res = await changePriority(id, next);
      flash(
        res.ok ? "ok" : "error",
        res.ok ? "Prioridad actualizada." : res.error,
      );
    });
  }
  function onAssign(next: string) {
    startTransition(async () => {
      const res = await assign(id, next || null);
      flash(
        res.ok ? "ok" : "error",
        res.ok ? "Asignación actualizada." : res.error,
      );
    });
  }
  function onNote(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addInternalNote(id, note);
      if (res.ok) {
        setNote("");
        flash("ok", "Nota agregada.");
      } else {
        flash("error", res.error);
      }
    });
  }
  function onDraftAi() {
    flash("ok", "Generando borrador con AI…");
    startTransition(async () => {
      const res = await draftAiResponse(id);
      if (res.ok) {
        setResolution(res.text);
        flash("ok", "Borrador generado.");
      } else {
        flash("error", res.error);
      }
    });
  }

  function onResolve(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await resolve(id, resolution, sendEmail);
      if (res.ok) {
        setResolution("");
        flash("ok", sendEmail ? "Resuelta y email enviado." : "Resuelta.");
      } else {
        flash("error", res.error);
      }
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div>
        <h3 className="font-editorial text-lg text-primary mb-3">Estado</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onStatus(s)}
              disabled={pending || status === s}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                status === s
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              }`}
            >
              {COMPLAINT_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-editorial text-lg text-primary mb-3">Prioridad</h3>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => onPriority(p)}
              disabled={pending || priority === p}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                priority === p
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              }`}
            >
              {COMPLAINT_PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-editorial text-lg text-primary mb-3">
          Asignado a
        </h3>
        <select
          value={assignedTo ?? ""}
          onChange={(e) => onAssign(e.target.value)}
          disabled={pending}
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
        >
          <option value="">Sin asignar</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {canResolve && (
        <form onSubmit={onResolve} className="border-t border-stone-100 pt-5">
          <h3 className="font-editorial text-lg text-primary mb-3">
            Responder y resolver
          </h3>
          {templates.length > 0 && (
            <div className="mb-2">
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
                Usar plantilla
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const t = templates.find((x) => x.id === e.target.value);
                  if (t) {
                    setResolution(applyTemplate(t.body, complaintContext));
                  }
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
              >
                <option value="">— Elegir plantilla —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <textarea
            rows={5}
            required
            minLength={10}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Redactá la respuesta formal al remitente…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
          <button
            type="button"
            onClick={onDraftAi}
            disabled={pending}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              auto_awesome
            </span>
            Sugerir respuesta con AI
          </button>
          <label className="flex items-center gap-2 mt-2 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            Enviar respuesta por email al remitente
          </label>
          <button
            type="submit"
            disabled={pending || resolution.trim().length < 10}
            className="mt-3 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              task_alt
            </span>
            {pending ? "Guardando…" : "Marcar como resuelta"}
          </button>
        </form>
      )}

      <form onSubmit={onNote} className="border-t border-stone-100 pt-5">
        <h3 className="font-editorial text-lg text-primary mb-3">
          Nota interna
        </h3>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota visible solo para el equipo…"
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
        />
        <button
          type="submit"
          disabled={pending || !note.trim()}
          className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">
            sticky_note_2
          </span>
          Agregar nota
        </button>
      </form>

      {msg && (
        <div
          className={`text-sm rounded-lg px-3 py-2 ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}
    </section>
  );
}
