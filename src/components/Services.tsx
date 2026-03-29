"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: "cabin",
    title: "Hospedaje Rural",
    description:
      "Cabañas de diseño orgánico que se funden con el paisaje andino.",
  },
  {
    icon: "spa",
    title: "Bienestar & Wellness",
    description:
      "Terapias holísticas, yoga al amanecer y masajes con aceites esenciales orgánicos.",
  },
  {
    icon: "forest",
    title: "Senderos & Naturaleza",
    description:
      "Caminatas conscientes por bosques nativos y avistamiento de aves endémicas.",
  },
  {
    icon: "restaurant",
    title: "Gastronomía Local",
    description:
      "Cocina km 0 con ingredientes de nuestra huerta y productores de la región.",
  },
  {
    icon: "local_fire_department",
    title: "Fogatas & Noches Estrelladas",
    description:
      "Noches de conexión bajo el firmamento con el calor del fuego sagrado.",
  },
  {
    icon: "event",
    title: "Eventos & Retiros",
    description:
      "Espacios versátiles para encuentros corporativos o celebraciones íntimas.",
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
            <p className="text-on-surface-variant group-hover:text-white/70 font-body text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
