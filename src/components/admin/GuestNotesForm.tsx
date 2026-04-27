"use client";

import { useState, useTransition } from "react";
import { updateGuestNotes } from "@/app/admin/huespedes/[id]/actions";

export default function GuestNotesForm({
  id,
  initial,
}: {
  id: string;
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
      const res = await updateGuestNotes(id, value);
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
        placeholder="Preferencias, alergias, fechas importantes…"
        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs">
          {status === "saved" && (
            <span className="text-emerald-700">✓ Guardado</span>
          )}
          {status === "error" && <span className="text-rose-700">{error}</span>}
        </p>
        <button
          onClick={save}
          disabled={pending || value === initial}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-container disabled:opacity-40"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
