"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  setReviewStatus,
  respondToReview,
  clearResponse,
} from "@/app/admin/reviews/actions";
import type { ReviewStatus } from "@/lib/reviews";

export type ReviewCard = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  display_name: string;
  source: string;
  sourceLabel: string;
  status: ReviewStatus;
  statusBadge: string;
  response: string | null;
  response_at: string | null;
  submitted_at: string;
  language: string;
  booking_id: string | null;
  guestEmail: string | null;
};

export default function ReviewModerationCard({
  review,
}: {
  review: ReviewCard;
}) {
  const [pending, startTransition] = useTransition();
  const [responseText, setResponseText] = useState(review.response ?? "");
  const [editingResponse, setEditingResponse] = useState(false);
  const [msg, setMsg] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  function flash(kind: "ok" | "error", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 3000);
  }

  function onSetStatus(next: ReviewStatus) {
    startTransition(async () => {
      const res = await setReviewStatus(review.id, next);
      flash(res.ok ? "ok" : "error", res.ok ? "Estado actualizado." : res.error);
    });
  }

  function onRespond() {
    startTransition(async () => {
      const res = await respondToReview(review.id, responseText);
      if (res.ok) {
        setEditingResponse(false);
        flash("ok", "Respuesta guardada.");
      } else {
        flash("error", res.error);
      }
    });
  }

  function onClearResponse() {
    if (!confirm("¿Borrar la respuesta pública?")) return;
    startTransition(async () => {
      const res = await clearResponse(review.id);
      if (res.ok) {
        setResponseText("");
        setEditingResponse(false);
        flash("ok", "Respuesta eliminada.");
      } else {
        flash("error", res.error);
      }
    });
  }

  const isLowRating = review.rating <= 3;

  return (
    <article
      className={`bg-white rounded-2xl border p-5 ${
        isLowRating && !review.response
          ? "border-rose-300"
          : "border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg text-secondary tracking-tight">
              {"★".repeat(review.rating)}
              <span className="text-stone-200">
                {"★".repeat(5 - review.rating)}
              </span>
            </span>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${review.statusBadge}`}
            >
              {review.status}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-500">
              {review.sourceLabel} · {review.language}
            </span>
            {isLowRating && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                Rating bajo
              </span>
            )}
          </div>
          {review.title && (
            <h3 className="font-editorial text-lg text-primary">
              {review.title}
            </h3>
          )}
        </div>
        <p className="text-xs text-stone-500 whitespace-nowrap">
          {new Date(review.submitted_at).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
        {review.content}
      </p>

      <p className="mt-3 text-xs text-stone-500">
        {review.display_name}
        {review.guestEmail && ` · ${review.guestEmail}`}
        {review.booking_id && (
          <>
            {" · "}
            <Link
              href={`/admin/reservas/${review.booking_id}`}
              className="text-primary hover:underline"
            >
              ver reserva
            </Link>
          </>
        )}
      </p>

      {/* Response section */}
      {!editingResponse && review.response ? (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-secondary-container bg-stone-50 rounded-r-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] uppercase tracking-wider text-secondary font-semibold">
              Respuesta pública
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingResponse(true)}
                className="text-[10px] text-stone-600 hover:text-primary"
              >
                Editar
              </button>
              <button
                onClick={onClearResponse}
                disabled={pending}
                className="text-[10px] text-rose-600 hover:text-rose-800"
              >
                Borrar
              </button>
            </div>
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {review.response}
          </p>
        </div>
      ) : editingResponse ? (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <textarea
            rows={3}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Respuesta pública del dueño…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onRespond}
              disabled={pending || responseText.trim().length < 5}
              className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-container disabled:opacity-50"
            >
              Guardar respuesta
            </button>
            <button
              onClick={() => {
                setEditingResponse(false);
                setResponseText(review.response ?? "");
              }}
              className="text-xs text-stone-600 hover:text-primary px-3 py-1.5"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingResponse(true)}
          className="mt-3 text-xs text-primary hover:underline"
        >
          + Responder públicamente
        </button>
      )}

      {msg && (
        <div
          className={`mt-3 text-xs rounded px-3 py-2 ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
        {(["pending", "approved", "featured", "rejected"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => onSetStatus(s)}
              disabled={pending || review.status === s}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                review.status === s
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              }`}
            >
              {s === "approved" && "Aprobar"}
              {s === "featured" && "★ Destacar"}
              {s === "rejected" && "Rechazar"}
              {s === "pending" && "Pendiente"}
            </button>
          ),
        )}
      </div>
    </article>
  );
}
