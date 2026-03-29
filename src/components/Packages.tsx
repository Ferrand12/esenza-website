"use client";

import { useEffect, useRef, useState } from "react";

const packages = [
  {
    name: "Esencia",
    subtitle: "Escapada Básica",
    price: "$350k",
    features: [
      "Desayuno campesino",
      "Caminata por senderos",
      "Acceso a miradores",
    ],
    popular: false,
  },
  {
    name: "Armonía",
    subtitle: "Experiencia Wellness",
    price: "$650k",
    features: [
      "Todo lo de Esencia",
      "Masaje relajante (60m)",
      "Cena de 3 tiempos",
      "Clase de Yoga privada",
    ],
    popular: true,
  },
  {
    name: "Plenitud",
    subtitle: "Retiro Total",
    price: "$900k",
    features: [
      "Todo lo de Armonía",
      "Ritual de sanación sonora",
      "Taller de huerta orgánica",
      "Traslado VIP ida y vuelta",
    ],
    popular: false,
  },
];

export default function Packages() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
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
        {packages.map((pkg, i) => (
          <div
            key={pkg.name}
            className={`bg-white p-10 rounded-2xl flex flex-col items-center text-primary ${
              pkg.popular
                ? "p-12 relative shadow-2xl scale-105 z-10"
                : "transform transition hover:-translate-y-4 duration-500"
            } ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } transition-all duration-700`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute -top-4 bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                Recomendado
              </div>
            )}

            {/* Package Name */}
            <h3 className="font-editorial text-3xl mb-2">{pkg.name}</h3>

            {/* Subtitle */}
            <p className="font-body text-xs tracking-widest text-secondary uppercase mb-8">
              {pkg.subtitle}
            </p>

            {/* Price */}
            <div className="mb-8 text-center">
              <span
                className={`font-headline font-bold ${
                  pkg.popular ? "text-5xl text-primary" : "text-4xl"
                }`}
              >
                {pkg.price}
              </span>
              <span className="text-sm text-secondary ml-1">/noche</span>
            </div>

            {/* Features */}
            <ul className="w-full border-t border-outline-variant/20 pt-8 space-y-4 mb-10">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-secondary"
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

            {/* CTA Button */}
            <div className="mt-auto w-full">
              <a
                href={`https://wa.me/573001234567?text=${encodeURIComponent(
                  `Hola! Me interesa el paquete ${pkg.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  pkg.popular
                    ? "w-full py-4 rounded-full bg-primary text-white font-label text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg gold-glow block text-center"
                    : "w-full py-4 rounded-full border border-primary text-primary font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all block text-center"
                }
              >
                Reservar Ahora
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
