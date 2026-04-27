"use client";

import { useState, useTransition } from "react";
import { updateGuestInfo } from "@/app/admin/huespedes/[id]/actions";

type Props = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  country: string | null;
};

export default function EditGuestInfo(props: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(props.fullName);
  const [email, setEmail] = useState(props.email ?? "");
  const [phone, setPhone] = useState(props.phone);
  const [country, setCountry] = useState(props.country ?? "");

  function cancel() {
    setFullName(props.fullName);
    setEmail(props.email ?? "");
    setPhone(props.phone);
    setCountry(props.country ?? "");
    setError(null);
    setEditing(false);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateGuestInfo(props.id, {
        full_name: fullName,
        email: email || null,
        phone,
        country: country || null,
      });
      if (res.ok) {
        setEditing(false);
      } else {
        setError(res.error);
      }
    });
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-editorial text-xl text-primary">
            Información de contacto
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Editar
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Nombre
            </dt>
            <dd className="mt-0.5 font-medium text-stone-900">
              {props.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Email
            </dt>
            <dd className="mt-0.5">
              {props.email ? (
                <a
                  href={`mailto:${props.email}`}
                  className="text-primary hover:underline break-all"
                >
                  {props.email}
                </a>
              ) : (
                <span className="text-stone-400">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Teléfono
            </dt>
            <dd className="mt-0.5">
              <a
                href={`https://wa.me/${props.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {props.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              País
            </dt>
            <dd className="mt-0.5 font-medium">
              {props.country || (
                <span className="text-stone-400">—</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form onSubmit={save}>
      <h2 className="font-editorial text-xl text-primary mb-4">
        Editar contacto
      </h2>
      <div className="space-y-3">
        <Field
          label="Nombre"
          required
          value={fullName}
          onChange={setFullName}
        />
        <Field
          label="Teléfono"
          required
          value={phone}
          onChange={setPhone}
        />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="País" value={country} onChange={setCountry} />
      </div>
      {error && (
        <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={cancel}
          className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">save</span>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
      />
    </div>
  );
}
