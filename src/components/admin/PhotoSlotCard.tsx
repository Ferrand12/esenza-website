"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadSiteImage,
  updateAltText,
  resetSiteImage,
} from "@/app/admin/fotos/actions";

export type PhotoSlotProps = {
  section: string;
  slot: string;
  label: string;
  description: string;
  aspect: "landscape" | "portrait" | "square";
  currentUrl: string;
  currentAlt: string;
  isCustom: boolean;
  updatedAt: string | null;
};

const ASPECT_CLASS = {
  landscape: "aspect-[16/10]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

export default function PhotoSlotCard(props: PhotoSlotProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(props.currentAlt);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage({ kind: "error", text: "Seleccioná una imagen primero." });
      return;
    }
    setMessage(null);
    const fd = new FormData();
    fd.set("section", props.section);
    fd.set("slot", props.slot);
    fd.set("alt_text", alt);
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadSiteImage(fd);
      if (res.ok) {
        setMessage({ kind: "ok", text: "Imagen actualizada." });
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setMessage({ kind: "error", text: res.error });
      }
    });
  }

  function onSaveAlt() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateAltText(props.section, props.slot, alt);
      setMessage(
        res.ok
          ? { kind: "ok", text: "Texto alternativo guardado." }
          : { kind: "error", text: res.error },
      );
    });
  }

  function onReset() {
    if (!confirm("¿Volver a la imagen por defecto?")) return;
    setMessage(null);
    startTransition(async () => {
      const res = await resetSiteImage(props.section, props.slot);
      if (res.ok) {
        setAlt("");
        setMessage({ kind: "ok", text: "Restaurado al valor por defecto." });
      } else {
        setMessage({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className={`bg-stone-100 ${ASPECT_CLASS[props.aspect]} relative`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview || props.currentUrl}
          alt={props.currentAlt}
          className="w-full h-full object-cover"
        />
        {props.isCustom && !preview && (
          <span className="absolute top-2 right-2 bg-primary text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
            Personalizada
          </span>
        )}
        {preview && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
            Vista previa
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500">
            {props.section} · {props.slot}
          </p>
          <h3 className="font-editorial text-lg text-primary mt-0.5">
            {props.label}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{props.description}</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
            Texto alternativo
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción breve para accesibilidad"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          {props.isCustom && alt !== props.currentAlt && (
            <button
              type="button"
              onClick={onSaveAlt}
              disabled={pending}
              className="mt-2 text-xs text-primary hover:underline disabled:opacity-50"
            >
              Guardar texto
            </button>
          )}
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPickFile}
            className="block w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
          />
        </div>

        {message && (
          <div
            className={`text-xs rounded px-3 py-2 ${
              message.kind === "ok"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onUpload}
            disabled={pending || !preview}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              upload
            </span>
            {pending ? "Subiendo…" : "Guardar"}
          </button>
          {props.isCustom && (
            <button
              type="button"
              onClick={onReset}
              disabled={pending}
              className="inline-flex items-center justify-center gap-1.5 text-stone-600 hover:text-rose-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                restart_alt
              </span>
              Restaurar
            </button>
          )}
        </div>

        {props.updatedAt && (
          <p className="text-[10px] text-stone-400">
            Actualizada: {new Date(props.updatedAt).toLocaleString("es-CO")}
          </p>
        )}
      </div>
    </div>
  );
}
