"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: "cabin",
    title: "Hospedaje Rural",
    description: "Simple Luxury — comodidad, belleza natural y sostenibilidad.",
    items: [] as string[],
  },
  {
    icon: "spa",
    title: "Bienestar & Wellness",
    description: "",
    items: [
      "Terapias holísticas",
      "Yoga al amanecer",
      "Ceremonia del Cacao",
      "Ceremonia del fuego",
    ],
  },
  {
    icon: "forest",
    title: "Senderos & Naturaleza",
    description: "",
    items: [
      "Caminatas conscientes por senderos naturales",
      "Avistamiento de aves endémicas",
    ],
  },
  {
    icon: "restaurant",
    title: "Gastronomía Local",
    description: "",
    items: ["Cocina 0 km con ingredientes y productos de la región"],
  },
  {
    icon: "local_fire_department",
    title: "Fogatas & Noches Estrelladas",
    description: "",
    items: [
      "Noches de conexión bajo el firmamento con el calor del fuego sagrado",
    ],
  },
  {
    icon: "event",
    title: "Eventos & Retiros",
    description: "",
    items: [
      "Espacios versátiles para encuentros corporativos o celebraciones íntimas",
      "Experiencias inmersivas para volver a tu centro",
    ],
  },
];

export default function Services() {
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
      id="experiencias"
      ref={sectionRef}
      className="bg-surface-bright py-24 md:py-32 px-8 md:px-24 overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <span className="font-label text-xs tracking-[0.4em] text-secondary uppercase block mb-4">
          El camino al bienestar
        </span>
        <h2 className="font-editorial text-5xl text-primary">
          Experiencias Inmersivas
        </h2>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {services.map((service, i) => (
          <div
            key={service.title}
            className={`bg-surface-container-low p-10 rounded-2xl group hover:bg-primary-container transition-all duration-500 cursor-pointer ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <span className="material-symbols-outlined text-4xl text-secondary mb-6 group-hover:text-primary-fixed transition-colors">
              {service.icon}
            </span>
            <h4 className="font-editorial text-2xl text-primary group-hover:text-white mb-4">
              {service.title}
            </h4>
            {service.description && (
              <p className="text-on-surface-variant group-hover:text-white/70 font-body text-sm leading-relaxed">
                {service.description}
              </p>
            )}
            {service.items.length > 0 && (
              <ul className="space-y-2 mt-2">
                {service.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-on-surface-variant group-hover:text-white/70 leading-relaxed"
                  >
                    <span className="text-secondary group-hover:text-secondary-container mt-0.5">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
