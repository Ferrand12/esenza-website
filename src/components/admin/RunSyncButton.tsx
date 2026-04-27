"use client";

import { useState, useTransition } from "react";
import { runAirbnbSync } from "@/app/admin/sync/actions";

export default function RunSyncButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function go() {
    setResult(null);
    setIsError(false);
    startTransition(async () => {
      const r = await runAirbnbSync();
      if (r.ok) {
        setIsError(false);
        setResult(`✓ ${r.imported} eventos importados (${r.skipped} omitidos)`);
      } else {
        setIsError(true);
        setResult(r.error);
      }
    });
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={disabled || pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className={`material-symbols-outlined text-base ${pending ? "animate-spin" : ""}`}>
          sync
        </span>
        {pending ? "Sincronizando…" : "Sincronizar ahora"}
      </button>
      {result && (
        <p
          className={`mt-3 text-xs ${isError ? "text-rose-700" : "text-emerald-700"}`}
        >
          {result}
        </p>
      )}
    </div>
  );
}
