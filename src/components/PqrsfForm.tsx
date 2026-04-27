"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPLAINT_TYPES,
  COMPLAINT_TYPE_DESCRIPTION,
  COMPLAINT_TYPE_LABEL,
  type ComplaintType,
} from "@/lib/pqrsf";

export default function PqrsfForm() {
  const router = useRouter();
  const [type, setType] = useState<ComplaintType>("queja");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 3);
    setFiles(selected);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.set("type", type);
      fd.set("guest_name", guestName);
      fd.set("guest_email", guestEmail);
      if (guestPhone) fd.set("guest_phone", guestPhone);
      fd.set("subject", subject);
      fd.set("description", description);
      fd.set("accept_privacy", acceptPrivacy ? "true" : "false");
      for (const f of files) fd.append("files", f);

      const res = await fetch("/api/pqrsf", {
        method: "POST",
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "No se pudo radicar.");
        setLoading(false);
        return;
      }
      router.push(`/pqrsf/gracias?code=${body.tracking_code}`);
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
      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Tipo de solicitud
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {COMPLAINT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                type === t
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {COMPLAINT_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-600">
          {COMPLAINT_TYPE_DESCRIPTION[type]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Nombre completo"
          required
          value={guestName}
          onChange={setGuestName}
        />
        <Field
          label="Email"
          required
          type="email"
          value={guestEmail}
          onChange={setGuestEmail}
        />
      </div>

      <Field
        label="Teléfono (opcional)"
        placeholder="+57..."
        value={guestPhone}
        onChange={setGuestPhone}
      />

      <Field
        label="Asunto"
        required
        placeholder="Resumí tu solicitud en una línea"
        value={subject}
        onChange={setSubject}
      />

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Descripción detallada <span className="text-rose-600">*</span>
        </label>
        <textarea
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contanos con el mayor detalle posible. Fechas, nombres, circunstancias."
          className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          Adjuntos (opcional · máx 3 archivos, 5 MB c/u)
        </label>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={onPickFiles}
          className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
        />
        {files.length > 0 && (
          <ul className="mt-2 text-xs text-stone-600 space-y-0.5">
            {files.map((f, i) => (
              <li key={i}>
                · {f.name} ({(f.size / 1024).toFixed(0)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
        <input
          type="checkbox"
          id="accept-privacy"
          checked={acceptPrivacy}
          onChange={(e) => setAcceptPrivacy(e.target.checked)}
          className="mt-1"
          required
        />
        <label
          htmlFor="accept-privacy"
          className="text-xs text-stone-600 leading-relaxed"
        >
          Acepto la{" "}
          <a
            href="/privacidad"
            target="_blank"
            className="text-primary underline"
          >
            política de tratamiento de datos personales
          </a>
          . Autorizo a Esenza a usar esta información para atender mi
          solicitud y contactarme al respecto.
        </label>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !acceptPrivacy}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">send</span>
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-900 mb-2">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
      />
    </div>
  );
}
