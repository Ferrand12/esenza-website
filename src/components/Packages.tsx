"use client";

import { useEffect, useRef, useState } from "react";

const packages = [
  {
    name: "Esencia",
    duration: "1 Noche / 2 Días",
    price: "350.000",
    description: "Una escapada rápida para reconectarte con la naturaleza.",
    features: [
      "Alojamiento en cabaña",
      "Desayuno campesino",
      "Cena especial",
      "Caminata guiada por senderos",
      "Sesión de yoga al amanecer",
      "Acceso a zonas comunes",
    ],
    popular: false,
    image:
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Armonía",
    duration: "2 Noches / 3 Días",
    price: "650.000",
    description: "La experiencia completa de bienestar y descanso profundo.",
    features: [
      "Todo lo de Esencia",
      "Almuerzo orgánico incluido",
      "Terapia de relajación",
      "Fogata nocturna",
      "Avistamiento de aves",
      "Kit de bienvenida wellness",
    ],
    popular: true,
    image:
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Plenitud",
    duration: "3 Noches / 4 Días",
    price: "900.000",
    description: "Inmersión total para renovar cuerpo, mente y espíritu.",
    features: [
      "Todo lo de Armonía",
      "Tratamiento spa completo",
      "Taller de cocina local",
      "Meditación guiada",
      "Recorrido cultural",
      "Transporte desde Bogotá",
    ],
    popular: false,
    image:
      "https://images.unsplash.com/photo-1618767689160-da3fb810aad7?q=80&w=800&auto=format&fit=crop",
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
      className="bg-esenza-green-dark py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="font-script text-3xl text-esenza-gold">
            Nuestros paquetes
          </span>
          <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-white">
            Elige tu <span className="font-semibold">experiencia</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-esenza-gold" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Cada paquete incluye hospedaje, alimentación y actividades diseñadas
            para tu bienestar. Precios por persona.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <div
              key={pkg.name}
              className={`relative group rounded-2xl overflow-hidden bg-white transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${
                pkg.popular ? "ring-2 ring-esenza-gold md:scale-105" : ""
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-4 right-4 z-10 rounded-full bg-esenza-gold px-4 py-1 text-xs font-bold tracking-wider uppercase text-white">
                  Más Popular
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={`Paquete ${pkg.name}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="font-script text-3xl text-white">
                    {pkg.name}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm tracking-wider uppercase text-esenza-text-light">
                  {pkg.duration}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-sm text-esenza-text-light">$</span>
                  <span className="font-heading text-4xl font-bold text-esenza-green-dark">
                    {pkg.price}
                  </span>
                  <span className="text-sm text-esenza-text-light">COP</span>
                </div>
                <p className="mt-3 text-sm text-esenza-text-light">
                  {pkg.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-esenza-green"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-esenza-text">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/573001234567?text=Hola!%20Me%20interesa%20el%20paquete%20{pkg.name}"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                    pkg.popular
                      ? "bg-esenza-green text-white hover:bg-esenza-green-dark"
                      : "bg-esenza-cream text-esenza-green-dark hover:bg-esenza-green hover:text-white"
                  }`}
                >
                  Reservar Ahora
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="mt-12 text-center text-sm text-white/50">
          * Precios sujetos a disponibilidad. Paquetes personalizados
          disponibles a solicitud.
        </p>
      </div>
    </section>
  );
}
