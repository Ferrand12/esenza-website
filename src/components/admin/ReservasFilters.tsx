"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { STATUS_LABEL } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const SOURCES = [
  { value: "", label: "Todos los orígenes" },
  { value: "web", label: "Web" },
  { value: "airbnb", label: "Airbnb" },
  { value: "manual", label: "Manual" },
  { value: "whatsapp", label: "WhatsApp" },
];

export default function ReservasFilters({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const currentStatus = params.get("status") ?? "";
  const currentSource = params.get("source") ?? "";

  function buildHref(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function applySource(value: string) {
    startTransition(() => router.push(buildHref({ source: value || null })));
  }

  function applySearch(value: string) {
    startTransition(() => router.push(buildHref({ q: value || null })));
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link
          href={buildHref({ status: null })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !currentStatus
              ? "bg-primary text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Todas
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref({ status: s })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
              currentStatus === s
                ? "bg-primary text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {STATUS_LABEL[s]}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${currentStatus === s ? "bg-white/20" : "bg-white"}`}>
              {counts[s] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch(q);
            }}
            onBlur={() => {
              if ((params.get("q") ?? "") !== q) applySearch(q);
            }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={currentSource}
          onChange={(e) => applySource(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="text-xs text-stone-500 self-center">Cargando…</span>
        )}
      </div>
    </div>
  );
}
