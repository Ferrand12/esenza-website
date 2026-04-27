"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBRATINGS = [
  { key: "comida", label: "Comida" },
  { key: "limpieza", label: "Limpieza" },
  { key: "atencion", label: "Atención del staff" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "valor", label: "Relación precio-valor" },
] as const;

export default function ReviewForm({
  token,
  defaultName,
}: {
  token: string;
  defaultName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [displayName, setDisplayName] = useState(defaultName);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [photos, setPhotos] = useState<File[]>([]);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(e.target.files ?? []).slice(0, 3));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("Elegí una calificación general.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.set("token", token);
      fd.set("rating", String(rating));
      if (title) fd.set("title", title);
      fd.set("content", content);
      fd.set("display_name", displayName);
      fd.set("language", language);
      fd.set("accept_privacy", acceptPrivacy ? "true" : "false");
      for (const [k, v] of Object.entries(subRatings)) {
        fd.set(`sub_${k}`, String(v));
      }
      for (const p of photos) fd.append("photos", p);

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "No se pudo enviar.");
        setLoading(false);
        return;
      }
      router.push("/resena/gracias");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6"
    >
      {/* Main rating */}
      <div className="text-center">
        <p className="text-sm text-stone-600 mb-3">
          ¿Cómo calificarías tu estadía?
        </p>
        <div
          className="flex justify-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hoverRating || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                className="text-5xl leading-none transition-transform hover:scale-110"
                aria-label={`${n} estrellas`}
              >
                <span
                  className={active ? "text-secondary" : "text-stone-200"}
                >
                  ★
                </span>
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm text-stone-500">
            {rating} {rating === 1 ? "estrella" : "estrellas"}
          </p>
        )}
      </div>

      {/* Subratings */}
      <details className="border-t border-stone-100 pt-5">
        <summary className="cursor-pointer text-sm font-medium text-stone-700 hover:text-primary">
          Calificar por categorías (opcional)
        </summary>
        <div className="mt-4 space-y-3">
          {SUBRATINGS.map((sr) => (
            <div key={sr.key} className="flex items-center justify-between">
              <span className="text-sm text-stone-700">{sr.label}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      setSubRatings((s) => ({ ...s, [sr.key]: n }))
                    }
                    className="text-2xl leading-none"
                    aria-label={`${sr.label} ${n}/5`}
                  >
                    <span
                      className={
                        (subRatings[sr.key] ?? 0) >= n
                          ? "text-secondary"
                          : "text-stone-200"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Tu nombre (se muestra públicamente)
          <span className="text-rose-600"> *</span>
        </label>
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Título (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ej: "Un refugio increíble"'
          className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Tu experiencia <span className="text-rose-600">*</span>
        </label>
        <textarea
          required
          rows={6}
          minLength={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contanos qué te llevaste de tu estadía. Lo que amaste, lo que podríamos mejorar."
          className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Fotos (opcional · máx 3)
        </label>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickPhotos}
          className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
        />
        {photos.length > 0 && (
          <ul className="mt-2 text-xs text-stone-600 space-y-0.5">
            {photos.map((p, i) => (
              <li key={i}>
                · {p.name} ({(p.size / 1024).toFixed(0)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Idioma
        </label>
        <div className="flex gap-2">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`px-4 py-1.5 rounded-full border text-sm ${
                language === l
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {l === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
        <input
          type="checkbox"
          id="accept-privacy"
          checked={acceptPrivacy}
          onChange={(e) => setAcceptPrivacy(e.target.checked)}
          required
          className="mt-1"
        />
        <label
          htmlFor="accept-privacy"
          className="text-xs text-stone-600 leading-relaxed"
        >
          Acepto que Esenza publique mi reseña y nombre en su sitio web y
          cumpla con la{" "}
          <a
            href="/privacidad"
            target="_blank"
            className="text-primary underline"
          >
            política de tratamiento de datos personales
          </a>
          .
        </label>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !acceptPrivacy || !rating}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined">send</span>
        {loading ? "Enviando…" : "Publicar reseña"}
      </button>
    </form>
  );
}
