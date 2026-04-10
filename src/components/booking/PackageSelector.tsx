"use client";

import {
  packagePrices,
  calculateTotalPrice,
  type Package,
} from "@/lib/validators/booking";

const packages: {
  key: Package;
  name: string;
  subtitle: string;
  features: string[];
  recommended?: boolean;
}[] = [
  {
    key: "esencia",
    name: "Esencia",
    subtitle: "Escapada básica",
    features: [
      "Desayuno campesino",
      "Caminata por senderos",
      "Acceso a miradores",
    ],
  },
  {
    key: "armonia",
    name: "Armonía",
    subtitle: "Experiencia Wellness",
    recommended: true,
    features: [
      "Todo lo de Esencia",
      "Masaje relajante (60m)",
      "Cena de 3 tiempos",
      "Clase de Yoga privada",
    ],
  },
  {
    key: "plenitud",
    name: "Plenitud",
    subtitle: "Retiro Total",
    features: [
      "Todo lo de Armonía",
      "Ritual de sanación sonora",
      "Taller de huerta orgánica",
      "Traslado VIP ida y vuelta",
    ],
  },
];

interface Props {
  checkIn: string;
  checkOut: string;
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
  selected,
  onSelect,
  onBack,
}: Props) {
  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div>
      <h2 className="font-editorial text-2xl text-primary mb-2">
        Elige tu paquete
      </h2>
      <p className="text-sm text-stone-500 mb-8">
        {nights} {nights === 1 ? "noche" : "noches"} · Precios por noche
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const total = calculateTotalPrice(pkg.key, checkIn, checkOut);
          const isSelected = selected === pkg.key;

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
                {pkg.name}
              </h3>
              <p className="text-xs uppercase tracking-widest text-stone-500 text-center mt-1">
                {pkg.subtitle}
              </p>

              <div className="text-center mt-4 mb-6">
                <span className="text-3xl font-headline text-primary">
                  {formatPrice(packagePrices[pkg.key])}
                </span>
                <span className="text-sm text-stone-500">/noche</span>
              </div>

              <ul className="space-y-3">
                {pkg.features.map((f) => (
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
