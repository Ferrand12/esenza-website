"use client";

import { useEffect, useRef, useState } from "react";

const retiros = [
  {
    title: "Retiro de Yoga & Meditacion",
    description:
      "3 dias de practica profunda con instructores certificados. Sesiones al amanecer, meditacion guiada y alimentacion consciente.",
    duration: "3 dias",
  },
  {
    title: "Retiro de Desintoxicacion Digital",
    description:
      "Desconectate del ruido. Sin pantallas, sin notificaciones. Solo naturaleza, silencio y reconexion con tu esencia.",
    duration: "2 dias",
  },
  {
    number: "03",
    title: "Retiro Corporativo",
    description:
      "Fortalece a tu equipo en un entorno inspirador. Dinamicas de grupo, estrategia al aire libre y espacios para la creatividad.",
    duration: "Personalizado",
    description:
      "Fortalece tu equipo en un entorno que inspira. Dinámicas al aire libre, estrategia y espacios para la creatividad colectiva.",
    tags: ["Equipos", "Liderazgo", "Creatividad"],
  },
  {
    number: "04",
    title: "Escapada Familiar",
    duration: "Fines de semana",
    description:
      "La finca completa para tu familia. Descanso, naturaleza, cocina campesina y recuerdos que duran toda la vida.",
    tags: ["Familias", "Descanso", "Experiencias"],
  },
];

export default function Retiros() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="retiros"
      ref={sectionRef}
      className="relative bg-primary-container py-24 md:py-32 overflow-hidden"
    >
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:40px_40px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          {/* Header — left aligned, takes 2 cols */}
          <div
            className={`lg:col-span-2 lg:sticky lg:top-32 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="h-12 w-[1px] bg-secondary-container/50" />
            <h2 className="mt-6 font-editorial text-4xl md:text-5xl font-light text-white leading-tight">
              Retiros que
              <br />
              <span className="font-semibold text-secondary-container">transforman</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/60">
              Experiencias inmersivas disenadas para pausar, respirar y volver a
              tu centro. Cada retiro es una invitacion a recordar quien eres.
            </p>
          </div>

          {/* Cards — right side, takes 3 cols */}
          <div className="lg:col-span-3 space-y-6">
            {retiros.map((retiro, i) => (
              <div
                key={retiro.title}
                className={`group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 transition-all duration-700 hover:bg-white/10 hover:border-secondary-container/30 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-editorial text-xl md:text-2xl font-semibold text-white">
                      {retiro.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-white/60">
                      {retiro.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-secondary-container/40 px-4 py-1.5 text-xs tracking-wider uppercase text-secondary-container">
                    {retiro.duration}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="lg:col-span-2 flex lg:justify-end items-start">
                <a
                  href="https://wa.me/573001234567?text=Hola!%20Quiero%20información%20sobre%20retiros%20en%20Esenza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] tracking-[0.2em] uppercase text-white/30 border border-white/15 px-4 py-2 hover:text-white hover:border-white/40 transition-all duration-300"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Consultar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
