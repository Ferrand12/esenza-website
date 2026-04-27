"use client";

import { useState, useTransition } from "react";
import { logCommunication } from "@/app/admin/reservas/[id]/actions";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Llamada" },
  { value: "note", label: "Nota interna" },
];

export default function CommunicationForm({
  bookingId,
  guestId,
}: {
  bookingId: string;
  guestId: string;
}) {
  const [channel, setChannel] = useState("whatsapp");
  const [direction, setDirection] = useState<"inbound" | "outbound">("outbound");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await logCommunication(
        bookingId,
        guestId,
        channel,
        direction,
        content,
      );
      if (res.ok) {
        setContent("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {channel !== "note" && (
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as "inbound" | "outbound")
            }
            className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
          >
            <option value="outbound">Enviado por nosotros</option>
            <option value="inbound">Recibido del huésped</option>
          </select>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Resumen del contacto…"
        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
      />
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-xs text-rose-700">{error}</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-container disabled:opacity-40"
        >
          {pending ? "Registrando…" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
