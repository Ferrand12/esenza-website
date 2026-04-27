"use client";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/app/admin/reservas/[id]/actions";
import { STATUS_LABEL } from "@/lib/format";

const TRANSITIONS: Record<string, { to: string; label: string; color: string; icon: string }[]> = {
  pending: [
    { to: "confirmed", label: "Confirmar", color: "bg-emerald-600 hover:bg-emerald-700 text-white", icon: "check" },
    { to: "cancelled", label: "Cancelar", color: "bg-stone-100 hover:bg-stone-200 text-stone-700", icon: "close" },
  ],
  confirmed: [
    { to: "completed", label: "Marcar completada", color: "bg-sky-600 hover:bg-sky-700 text-white", icon: "task_alt" },
    { to: "cancelled", label: "Cancelar", color: "bg-stone-100 hover:bg-stone-200 text-stone-700", icon: "close" },
  ],
  cancelled: [
    { to: "pending", label: "Reabrir como pendiente", color: "bg-amber-500 hover:bg-amber-600 text-white", icon: "undo" },
  ],
  completed: [],
};

export default function StatusActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const actions = TRANSITIONS[currentStatus] ?? [];

  function go(to: string, label: string) {
    if (to === "cancelled" && !confirm(`¿Cancelar esta reserva?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await updateBookingStatus(id, to);
      if (!res.ok) setError(res.error);
    });
    void label;
  }

  if (actions.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Estado actual: <strong>{STATUS_LABEL[currentStatus]}</strong>. No hay acciones disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <button
          key={a.to}
          onClick={() => go(a.to, a.label)}
          disabled={pending}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${a.color}`}
        >
          <span className="material-symbols-outlined text-base">{a.icon}</span>
          {a.label}
        </button>
      ))}
      {error && (
        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
