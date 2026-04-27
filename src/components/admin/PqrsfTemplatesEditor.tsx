"use client";

import { useState, useTransition } from "react";
import {
  saveResponseTemplates,
  type ResponseTemplate,
} from "@/app/admin/config/actions";

function genId() {
  return (
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

export default function PqrsfTemplatesEditor({
  initial,
}: {
  initial: ResponseTemplate[];
}) {
  const [templates, setTemplates] = useState<ResponseTemplate[]>(
    initial.length > 0 ? initial : [],
  );
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  function add() {
    setTemplates((t) => [...t, { id: genId(), name: "", body: "" }]);
  }
  function remove(id: string) {
    setTemplates((t) => t.filter((x) => x.id !== id));
  }
  function update(id: string, patch: Partial<ResponseTemplate>) {
    setTemplates((t) =>
      t.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveResponseTemplates(templates);
      if (res.ok) {
        setMsg({ kind: "ok", text: "Plantillas guardadas." });
      } else {
        setMsg({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="font-editorial text-xl text-primary">
            Plantillas de respuesta PQRSF
          </h2>
          <p className="mt-1 text-sm text-stone-600 max-w-2xl">
            Textos base para responder PQRSF. Usá{" "}
            <code className="bg-stone-100 px-1 rounded">
              &#123;&#123;nombre&#125;&#125;
            </code>
            ,{" "}
            <code className="bg-stone-100 px-1 rounded">
              &#123;&#123;tracking&#125;&#125;
            </code>
            ,{" "}
            <code className="bg-stone-100 px-1 rounded">
              &#123;&#123;asunto&#125;&#125;
            </code>{" "}
            como placeholders.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {templates.length === 0 && (
          <p className="text-sm text-stone-500">
            Aún no hay plantillas. Agregá la primera.
          </p>
        )}
        {templates.map((t) => (
          <div
            key={t.id}
            className="border border-stone-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={t.name}
                onChange={(e) => update(t.id, { name: e.target.value })}
                placeholder="Nombre (ej: Disculpa por queja de servicio)"
                className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-rose-600 hover:text-rose-800 p-2"
                aria-label="Eliminar plantilla"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={t.body}
              onChange={(e) => update(t.id, { body: e.target.value })}
              placeholder="Hola {{nombre}}, en respuesta a tu {{tracking}}…"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono focus:border-primary outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Agregar plantilla
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">save</span>
          {pending ? "Guardando…" : "Guardar plantillas"}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-3 text-sm ${msg.kind === "ok" ? "text-emerald-700" : "text-rose-700"}`}
        >
          {msg.text}
        </p>
      )}
    </section>
  );
}
