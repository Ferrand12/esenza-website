"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createBlock, deleteBlock } from "@/app/admin/calendario/actions";
import { STATUS_LABEL } from "@/lib/format";

export type BookingRef = {
  id: string;
  guest_name: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  check_in: string;
  check_out: string;
  num_guests: number;
  is_start: boolean;
};

export type BlockRef = {
  id: string;
  reason: string | null;
  source: "manual" | "airbnb_sync" | "booking_com_sync" | "vrbo_sync";
  start_date: string;
  end_date: string;
  is_start: boolean;
};

export type DayCell = {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  isToday: boolean;
  bookings: BookingRef[];
  blocks: BlockRef[];
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-stone-100 text-stone-500 border-stone-300 line-through",
  completed: "bg-sky-100 text-sky-900 border-sky-300",
};

const BLOCK_PILL: Record<string, string> = {
  manual: "bg-stone-200 text-stone-800 border-stone-400",
  airbnb_sync: "bg-rose-100 text-rose-900 border-rose-300",
  booking_com_sync: "bg-indigo-100 text-indigo-900 border-indigo-300",
  vrbo_sync: "bg-purple-100 text-purple-900 border-purple-300",
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function CalendarGrid({ cells }: { cells: DayCell[] }) {
  const [selected, setSelected] = useState<DayCell | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-3 py-2 text-xs uppercase tracking-wider text-stone-600 text-center font-medium"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell) => (
            <DayCellView
              key={cell.date}
              cell={cell}
              onPickDate={() => setSelected(cell)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <BlockModal
          day={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function DayCellView({
  cell,
  onPickDate,
}: {
  cell: DayCell;
  onPickDate: () => void;
}) {
  return (
    <div
      className={`min-h-[120px] border-r border-b border-stone-100 p-2 relative group ${
        cell.inMonth ? "bg-white" : "bg-stone-50/60"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs font-medium ${
            cell.isToday
              ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
              : cell.inMonth
                ? "text-stone-700"
                : "text-stone-400"
          }`}
        >
          {cell.day}
        </span>
        {cell.inMonth && (
          <button
            type="button"
            onClick={onPickDate}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-primary"
            aria-label={`Bloquear ${cell.date}`}
          >
            <span className="material-symbols-outlined text-base">add</span>
          </button>
        )}
      </div>

      <div className="space-y-1">
        {cell.bookings.map((b) => (
          <Link
            key={b.id}
            href={`/admin/reservas/${b.id}`}
            className={`block text-[10px] px-1.5 py-0.5 rounded border truncate ${STATUS_PILL[b.status] || ""}`}
            title={`${b.guest_name} · ${STATUS_LABEL[b.status] || b.status} · ${b.num_guests} pax`}
          >
            {b.is_start ? "→ " : ""}
            {b.guest_name}
          </Link>
        ))}
        {cell.blocks.map((blk) => (
          <div
            key={blk.id}
            className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${BLOCK_PILL[blk.source] || ""}`}
            title={
              blk.source === "manual"
                ? `Bloqueo manual${blk.reason ? ": " + blk.reason : ""}`
                : `Bloqueo ${blk.source.replace("_sync", "")}`
            }
          >
            {blk.source === "manual"
              ? blk.reason || "Bloqueo"
              : `◆ ${blk.source.replace("_sync", "")}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockModal({
  day,
  onClose,
}: {
  day: DayCell;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState(day.date);
  const [endDate, setEndDate] = useState(addDays(day.date, 1));
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const manualBlocksHere = day.blocks.filter((b) => b.source === "manual");

  function onCreate() {
    setError(null);
    startTransition(async () => {
      const res = await createBlock({
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      if (res.ok) {
        onClose();
      } else {
        setError(res.error);
      }
    });
  }

  function onDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteBlock(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-editorial text-xl text-primary">
              Bloquear fechas
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Evita que estos días estén disponibles para reservar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {manualBlocksHere.length > 0 && (
          <div className="mb-5 border-b border-stone-100 pb-4">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">
              Bloqueos manuales en este día
            </p>
            <ul className="space-y-1.5">
              {manualBlocksHere.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-3 py-2"
                >
                  <span className="text-stone-700 truncate">
                    {b.reason || "Sin motivo"}
                    <span className="text-xs text-stone-500 ml-2">
                      {b.start_date} → {b.end_date}
                    </span>
                  </span>
                  <button
                    onClick={() => onDelete(b.id)}
                    disabled={pending}
                    className="text-rose-600 hover:text-rose-800 disabled:opacity-50"
                    aria-label="Eliminar bloqueo"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Hasta (excl.)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mantenimiento, uso propio, retiro privado…"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onCreate}
            disabled={pending}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">block</span>
            {pending ? "Guardando…" : "Bloquear"}
          </button>
        </div>
      </div>
    </div>
  );
}
