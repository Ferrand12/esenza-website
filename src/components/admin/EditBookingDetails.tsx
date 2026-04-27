"use client";

import { useMemo, useState, useTransition } from "react";
import { updateBookingDetails } from "@/app/admin/reservas/[id]/actions";
import {
  formatDateLong,
  formatPriceCOP,
  nightsBetween,
  PACKAGE_LABEL,
} from "@/lib/format";
import {
  PACKAGE_DEFAULTS,
  calculateTotalPrice,
  type Package,
} from "@/lib/validators/booking";

type Props = {
  id: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  pkg: string;
  totalPrice: number;
  specialRequests: string | null;
  maxGuests: number;
};

function isActivePackage(p: string): p is Package {
  return p === "escapada_basica" || p === "esencia" || p === "armonia";
}

export default function EditBookingDetails({
  id,
  checkIn,
  checkOut,
  numGuests,
  pkg,
  totalPrice,
  specialRequests,
  maxGuests,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [ci, setCi] = useState(checkIn);
  const [co, setCo] = useState(checkOut);
  const [ng, setNg] = useState(numGuests);
  const [pk, setPk] = useState<Package>(
    isActivePackage(pkg) ? pkg : "armonia",
  );
  const [price, setPrice] = useState(totalPrice);
  const [sr, setSr] = useState(specialRequests ?? "");
  const [priceTouched, setPriceTouched] = useState(false);

  const nights = useMemo(() => nightsBetween(ci, co), [ci, co]);
  const suggested = useMemo(
    () => (ci && co ? calculateTotalPrice(pk, ci, co, ng) : 0),
    [pk, ci, co, ng],
  );

  function cancel() {
    setCi(checkIn);
    setCo(checkOut);
    setNg(numGuests);
    setPk(isActivePackage(pkg) ? pkg : "armonia");
    setPrice(totalPrice);
    setSr(specialRequests ?? "");
    setPriceTouched(false);
    setEditing(false);
    setError(null);
    setSuccess(false);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await updateBookingDetails(id, {
        check_in: ci,
        check_out: co,
        num_guests: ng,
        package: pk,
        total_price: price,
        special_requests: sr || null,
      });
      if (res.ok) {
        setEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error);
      }
    });
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-xl text-primary">
            Detalles de la estadía
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Editar
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Check-in
            </dt>
            <dd className="mt-1 font-medium">{formatDateLong(ci)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Check-out
            </dt>
            <dd className="mt-1 font-medium">{formatDateLong(co)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Noches
            </dt>
            <dd className="mt-1 font-medium">{nights}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Huéspedes
            </dt>
            <dd className="mt-1 font-medium">{ng}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Paquete
            </dt>
            <dd className="mt-1 font-medium">
              {PACKAGE_LABEL[pk] || pk}
            </dd>
          </div>
          <div className="col-span-2 pt-4 border-t border-stone-100">
            <dt className="text-xs uppercase tracking-wider text-stone-500">
              Total
            </dt>
            <dd className="mt-1 text-2xl font-editorial text-primary">
              {formatPriceCOP(price)}
            </dd>
          </div>
        </dl>
        {sr && (
          <div className="mt-6 pt-4 border-t border-stone-100">
            <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">
              Solicitudes especiales
            </h3>
            <p className="text-sm text-stone-700 whitespace-pre-wrap">{sr}</p>
          </div>
        )}
        {success && (
          <p className="mt-3 text-xs text-emerald-700">✓ Guardado.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={save}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-editorial text-xl text-primary">
          Editando estadía
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Check-in
          </label>
          <input
            type="date"
            required
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Check-out
          </label>
          <input
            type="date"
            required
            min={ci || undefined}
            value={co}
            onChange={(e) => setCo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Huéspedes
          </label>
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={ng}
            onChange={(e) => setNg(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Paquete
          </label>
          <select
            value={pk}
            onChange={(e) => {
              setPk(e.target.value as Package);
              setPriceTouched(false);
            }}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          >
            {(Object.keys(PACKAGE_DEFAULTS) as Package[]).map((k) => (
              <option key={k} value={k}>
                {PACKAGE_DEFAULTS[k].label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Total (COP)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(Number(e.target.value));
              setPriceTouched(true);
            }}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
          {!priceTouched && nights > 0 && price !== suggested && (
            <button
              type="button"
              onClick={() => setPrice(suggested)}
              className="mt-1 text-xs text-primary hover:underline"
            >
              Sugerido: {formatPriceCOP(suggested)} ({nights} noches)
            </button>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Solicitudes especiales
          </label>
          <textarea
            rows={3}
            value={sr}
            onChange={(e) => setSr(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 justify-end">
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
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
