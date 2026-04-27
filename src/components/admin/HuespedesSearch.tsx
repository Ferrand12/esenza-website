"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function HuespedesSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function apply(value: string) {
    const next = new URLSearchParams();
    if (value.trim()) next.set("q", value.trim());
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply(q);
          }}
          onBlur={() => {
            if ((params.get("q") ?? "") !== q) apply(q);
          }}
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {pending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">
            Buscando…
          </span>
        )}
      </div>
    </div>
  );
}
