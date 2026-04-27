"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createBooking,
  searchGuests,
} from "@/app/admin/reservas/nueva/actions";
import {
  PACKAGE_DEFAULTS,
  calculateTotalPrice,
  type Package,
} from "@/lib/validators/booking";


type GuestHit = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  country: string | null;
  total_bookings: number;
};

type Mode = "existing" | "new";

function nightsBetween(ci: string, co: string): number {
  if (!ci || !co) return 0;
  return Math.max(
    0,
    Math.round(
      (new Date(co).getTime() - new Date(ci).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-CO");
}

export default function NuevaReservaForm({
  maxGuests,
}: {
  maxGuests: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Guest selection
  const [mode, setMode] = useState<Mode>("existing");
  const [selectedGuest, setSelectedGuest] = useState<GuestHit | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GuestHit[]>([]);
  const [searching, setSearching] = useState(false);

  // New guest fields
  const [ngName, setNgName] = useState("");
  const [ngPhone, setNgPhone] = useState("");
  const [ngEmail, setNgEmail] = useState("");
  const [ngCountry, setNgCountry] = useState("Colombia");
  const [ngTags, setNgTags] = useState("");

  // Booking fields
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState(2);
  const [pkg, setPkg] = useState<Package>("armonia");
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceTouched, setPriceTouched] = useState(false);
  const [status, setStatus] = useState<
    "pending" | "confirmed" | "cancelled" | "completed"
  >("pending");
  const [source, setSource] = useState<
    "web" | "airbnb" | "manual" | "whatsapp"
  >("manual");
  const [specialRequests, setSpecialRequests] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut],
  );
  const suggestedPrice = useMemo(
    () =>
      checkIn && checkOut
        ? calculateTotalPrice(pkg, checkIn, checkOut, numGuests)
        : 0,
    [pkg, checkIn, checkOut, numGuests],
  );

  // Auto-update price if user hasn't edited it manually
  useEffect(() => {
    if (!priceTouched) {
      setTotalPrice(suggestedPrice);
    }
  }, [suggestedPrice, priceTouched]);

  // Debounced guest search
  useEffect(() => {
    if (mode !== "existing") return;
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      const hits = await searchGuests(q);
      setResults(hits);
      setSearching(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [search, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "existing" && !selectedGuest) {
      setError("Seleccioná un huésped existente o cambiá a 'nuevo'.");
      return;
    }

    startTransition(async () => {
      const res = await createBooking({
        existing_guest_id: mode === "existing" ? selectedGuest?.id : null,
        new_guest:
          mode === "new"
            ? {
                full_name: ngName,
                phone: ngPhone,
                email: ngEmail || null,
                country: ngCountry || null,
                tags: ngTags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              }
            : undefined,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests,
        package: pkg,
        total_price: totalPrice,
        status,
        source,
        special_requests: specialRequests || null,
        internal_notes: internalNotes || null,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/admin/reservas/${res.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Guest section */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-editorial text-xl text-primary mb-4">Huésped</h2>

        <div className="flex gap-2 mb-4">
          {(
            [
              { v: "existing", label: "Huésped existente" },
              { v: "new", label: "Huésped nuevo" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => {
                setMode(opt.v);
                setSelectedGuest(null);
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                mode === opt.v
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {mode === "existing" ? (
          <div>
            {selectedGuest ? (
              <div className="flex items-center justify-between bg-stone-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-stone-900">
                    {selectedGuest.full_name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {selectedGuest.email || selectedGuest.phone} ·{" "}
                    {selectedGuest.total_bookings} reservas previas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGuest(null)}
                  className="text-xs text-stone-600 hover:text-rose-600"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, email o teléfono…"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                />
                {searching && (
                  <p className="mt-2 text-xs text-stone-500">Buscando…</p>
                )}
                {!searching && results.length > 0 && (
                  <ul className="mt-2 border border-stone-200 rounded-lg divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {results.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGuest(g);
                            setSearch("");
                            setResults([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-stone-50 text-sm"
                        >
                          <p className="font-medium text-stone-900">
                            {g.full_name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {g.email || g.phone} · {g.country || "—"} ·{" "}
                            {g.total_bookings} reservas
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {!searching &&
                  search.trim().length >= 2 &&
                  results.length === 0 && (
                    <p className="mt-2 text-xs text-stone-500">
                      Sin resultados.{" "}
                      <button
                        type="button"
                        onClick={() => setMode("new")}
                        className="text-primary hover:underline"
                      >
                        Crear nuevo huésped →
                      </button>
                    </p>
                  )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nombre completo"
              required
              value={ngName}
              onChange={setNgName}
            />
            <Field
              label="Teléfono"
              required
              placeholder="+573001234567"
              value={ngPhone}
              onChange={setNgPhone}
            />
            <Field
              label="Email"
              type="email"
              value={ngEmail}
              onChange={setNgEmail}
            />
            <Field
              label="País"
              value={ngCountry}
              onChange={setNgCountry}
            />
            <div className="md:col-span-2">
              <Field
                label="Tags (separados por coma)"
                placeholder="yoga, vip, aniversario"
                value={ngTags}
                onChange={setNgTags}
              />
            </div>
          </div>
        )}
      </section>

      {/* Booking details */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-editorial text-xl text-primary mb-4">
          Detalles de la estadía
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Check-in <span className="text-rose-600">*</span>
            </label>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Check-out <span className="text-rose-600">*</span>
            </label>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || undefined}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
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
              value={numGuests}
              onChange={(e) => setNumGuests(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Noches
            </label>
            <input
              type="text"
              readOnly
              value={nights}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-600"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Paquete
            </label>
            <select
              value={pkg}
              onChange={(e) => {
                setPkg(e.target.value as Package);
                setPriceTouched(false);
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
            >
              {(Object.keys(PACKAGE_DEFAULTS) as Package[]).map((k) => (
                <option key={k} value={k}>
                  {PACKAGE_DEFAULTS[k].label} — $
                  {formatMoney(PACKAGE_DEFAULTS[k].base_price_per_person)}/pax
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Total (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={totalPrice || 0}
                onChange={(e) => {
                  setTotalPrice(Number(e.target.value));
                  setPriceTouched(true);
                }}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
              />
            </div>
            {!priceTouched && nights > 0 && (
              <p className="mt-1 text-xs text-stone-500">
                Sugerido: {numGuests} pax × $
                {formatMoney(PACKAGE_DEFAULTS[pkg].base_price_per_person)}
                {nights > 1
                  ? ` + ${numGuests} × ${nights - 1} noche(s) × $${formatMoney(PACKAGE_DEFAULTS[pkg].extra_night_per_person)}`
                  : ""}{" "}
                = ${formatMoney(suggestedPrice)}
              </p>
            )}
            {numGuests < PACKAGE_DEFAULTS[pkg].min_guests && (
              <p className="mt-1 text-xs text-amber-700">
                ⚠️ Este paquete requiere mínimo{" "}
                {PACKAGE_DEFAULTS[pkg].min_guests} personas.
              </p>
            )}
            {priceTouched && (
              <button
                type="button"
                onClick={() => setPriceTouched(false)}
                className="mt-1 text-xs text-primary hover:underline"
              >
                ↻ Volver al precio sugerido
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Status / source */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-editorial text-xl text-primary mb-4">
          Origen y estado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Origen
            </label>
            <select
              value={source}
              onChange={(e) =>
                setSource(
                  e.target.value as
                    | "web"
                    | "airbnb"
                    | "manual"
                    | "whatsapp",
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
            >
              <option value="manual">Manual</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="airbnb">Airbnb</option>
              <option value="web">Web</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Estado inicial
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "pending"
                    | "confirmed"
                    | "cancelled"
                    | "completed",
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Solicitudes especiales
          </label>
          <textarea
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Dieta, alergias, preferencias…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
            Notas internas (solo equipo)
          </label>
          <textarea
            rows={2}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Notas visibles solo para staff…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
          />
        </div>
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/reservas")}
          className="px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-100 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
        >
          <span className="material-symbols-outlined">save</span>
          {pending ? "Creando…" : "Crear reserva"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
      />
    </div>
  );
}
