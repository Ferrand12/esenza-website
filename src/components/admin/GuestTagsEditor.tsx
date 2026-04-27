"use client";

import { useState, useTransition } from "react";
import { updateGuestTags } from "@/app/admin/huespedes/[id]/actions";

export default function GuestTagsEditor({
  id,
  initial,
}: {
  id: string;
  initial: string[];
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function persist(next: string[]) {
    setTags(next);
    startTransition(async () => {
      const res = await updateGuestTags(id, next);
      if (!res.ok) setError(res.error);
      else setError(null);
    });
  }

  function add() {
    const t = draft.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setDraft("");
      return;
    }
    persist([...tags, t]);
    setDraft("");
  }

  function remove(t: string) {
    persist(tags.filter((x) => x !== t));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
        {tags.length === 0 ? (
          <p className="text-xs text-stone-400 italic">Sin tags</p>
        ) : (
          tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-stone-800 text-xs font-medium"
            >
              {t}
              <button
                onClick={() => remove(t)}
                disabled={pending}
                className="text-stone-500 hover:text-rose-700"
                aria-label={`Quitar tag ${t}`}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Nuevo tag…"
          className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={add}
          disabled={pending || !draft.trim()}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-container disabled:opacity-40"
        >
          Agregar
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
    </div>
  );
}
