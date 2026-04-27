"use client";

import { useState, useTransition } from "react";
import { updateInternalNotes } from "@/app/admin/reservas/[id]/actions";

export default function InternalNotesForm({
  bookingId,
  initial,
}: {
  bookingId: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (value === initial) return;
    setStatus("idle");
    startTransition(async () => {
      const res = await updateInternalNotes(bookingId, value);
      if (res.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Notas privadas del equipo (no visibles para el huésped)…"
        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-stone-500">
          {status === "saved" && (
            <span className="text-emerald-700">✓ Guardado</span>
          )}
          {status === "error" && (
            <span className="text-rose-700">{error}</span>
          )}
        </p>
        <button
          onClick={save}
          disabled={pending || value === initial}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Guardando…" : "Guardar notas"}
        </button>
      </div>
    </div>
  );
}
