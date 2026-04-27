"use client";

import {
  PACKAGE_DEFAULTS,
  calculateTotalPrice,
  nightsBetween,
  type Package,
} from "@/lib/validators/booking";

const packages: { key: Package; recommended?: boolean }[] = [
  { key: "escapada_basica" },
  { key: "esencia" },
  { key: "armonia", recommended: true },
];

interface Props {
  checkIn: string;
  checkOut: string;
  numGuests: number;
  selected: Package | null;
  onSelect: (pkg: Package) => void;
  onBack: () => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-CO")}`;
}

export default function PackageSelector({
  checkIn,
  checkOut,
  numGuests,
  selected,
  onSelect,
  onBack,
}: Props) {
  const nights = nightsBetween(checkIn, checkOut);

  return (
    <div>
      <h2 className="font-editorial text-2xl text-primary mb-2">
        Elige tu paquete
      </h2>
      <p className="text-sm text-stone-500 mb-8">
        {nights} {nights === 1 ? "noche" : "noches"} · {numGuests}{" "}
        {numGuests === 1 ? "persona" : "personas"} · Precios por persona
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const def = PACKAGE_DEFAULTS[pkg.key];
          const total = calculateTotalPrice(
            pkg.key,
            checkIn,
            checkOut,
            numGuests,
          );
          const isSelected = selected === pkg.key;
          const meetsMin = numGuests >= def.min_guests;

          return (
            <button
              key={pkg.key}
              type="button"
              onClick={() => onSelect(pkg.key)}
              className={`relative text-left rounded-2xl border-2 p-6 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-stone-200 hover:border-stone-400 bg-white"
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary-container text-secondary text-[10px] uppercase tracking-widest font-bold px-4 py-1 rounded-full">
                    Recomendado
                  </span>
                </div>
              )}

              <h3 className="font-editorial text-2xl text-primary text-center">
                {def.label}
              </h3>
              <p className="text-xs uppercase tracking-widest text-stone-500 text-center mt-1">
                {def.subtitle}
              </p>

              <div className="text-center mt-4 mb-1">
                <span className="text-3xl font-headline text-primary">
                  {formatPrice(def.base_price_per_person)}
                </span>
                <span className="text-sm text-stone-500 ml-1">/persona</span>
              </div>
              <p className="text-[11px] text-center text-stone-500">
                Grupos mínimo {def.min_guests} personas ·{" "}
                {formatPrice(def.extra_night_per_person)} noche adicional/pax
              </p>

              <ul className="mt-5 space-y-3">
                {def.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-stone-700"
                  >
                    <span className="material-symbols-outlined text-secondary text-base mt-0.5">
                      check
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-stone-200 text-center">
                <span className="text-sm text-stone-500">Total: </span>
                <span className="font-headline text-lg text-primary font-semibold">
                  {formatPrice(total)}
                </span>
                {!meetsMin && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    Requiere mínimo {def.min_guests} personas
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 border border-stone-300 rounded-full text-sm font-label uppercase tracking-widest hover:bg-stone-50 transition-colors"
        >
          Atrás
        </button>
      </div>
    </div>
  );
}
