"use client";

import { useEffect, useRef, useState } from "react";
import { PACKAGE_DEFAULTS } from "@/lib/validators/booking";

const packages = [
  {
    key: "escapada_basica" as const,
    recommended: false,
  },
  {
    key: "esencia" as const,
    recommended: false,
  },
  {
    key: "armonia" as const,
    recommended: true,
  },
];

function formatCOP(n: number): string {
  return `$${n.toLocaleString("es-CO")}`;
}

export default function Packages() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="paquetes"
      ref={sectionRef}
      className="bg-primary-container text-white py-32 px-8"
    >
      {/* Section Header */}
      <div className="text-center mb-20">
        <span className="font-script text-5xl text-secondary-container mb-4 block">
          Nuestros paquetes
        </span>
        <h2 className="font-editorial text-4xl md:text-6xl text-white italic">
          Elige tu camino de renovación
        </h2>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {packages.map((pkg, i) => {
          const def = PACKAGE_DEFAULTS[pkg.key];
          return (
            <div
              key={pkg.key}
              className={`bg-white p-10 rounded-2xl flex flex-col items-center text-primary ${
                pkg.recommended
                  ? "p-12 relative shadow-2xl scale-105 z-10"
                  : "transform transition hover:-translate-y-4 duration-500"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } transition-all duration-700`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {pkg.recommended && (
                <div className="absolute -top-4 bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Recomendado
                </div>
              )}

              <h3 className="font-editorial text-3xl mb-2">{def.label}</h3>
              <p className="font-body text-xs tracking-widest text-secondary uppercase mb-6">
                {def.subtitle}
              </p>

              <div className="mb-2 text-center">
                <span className="font-headline font-bold text-4xl text-primary">
                  {formatCOP(def.base_price_per_person)}
                </span>
                <span className="text-sm text-secondary ml-1">/persona</span>
              </div>
              <p className="text-xs text-stone-500 text-center">
                Grupos mínimo {def.min_guests} personas
              </p>
              <p className="mt-1 text-xs text-stone-500 text-center">
                Noche adicional: {formatCOP(def.extra_night_per_person)}/persona
              </p>

              <ul className="w-full border-t border-outline-variant/20 pt-8 mt-6 space-y-4 mb-10">
                {def.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined text-secondary mt-0.5"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      done
                    </span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto w-full">
                <a
                  href="/reservar"
                  className={
                    pkg.recommended
                      ? "w-full py-4 rounded-full bg-primary text-white font-label text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg gold-glow block text-center"
                      : "w-full py-4 rounded-full border border-primary text-primary font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all block text-center"
                  }
                >
                  Reservar Ahora
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retiros nota */}
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <p className="text-white/70 text-sm leading-relaxed">
          ¿Buscás un retiro con programación completa? Tenemos retiros de Yoga,
          Desintoxicación Digital, Propósito y Corporativos. Escribinos para
          recibir la propuesta personalizada.
        </p>
        <a
          href="#contacto"
          className="inline-block mt-4 border-b border-secondary-container/60 text-secondary-container pb-0.5 text-sm uppercase tracking-widest hover:border-secondary-container transition-colors"
        >
          Consultar retiros →
        </a>
      </div>
    </section>
  );
}
