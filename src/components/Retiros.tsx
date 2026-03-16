"use client";

import { useEffect, useRef, useState } from "react";

const retiros = [
  {
    number: "01",
    title: "Retiro de Yoga & Meditación",
    duration: "3 días / 2 noches",
    description:
      "Práctica profunda con instructores certificados. Sesiones al amanecer, meditación guiada, alimentación consciente y silencio restaurador.",
    tags: ["Yoga", "Meditación", "Alimentación consciente"],
  },
  {
    number: "02",
    title: "Desintoxicación Digital",
    duration: "2 días / 1 noche",
    description:
      "Sin pantallas, sin notificaciones. Solo naturaleza, silencio y reconexión contigo mismo. El reset que tu mente necesita.",
    tags: ["Silencio", "Naturaleza", "Reconexión"],
  },
  {
    number: "03",
    title: "Retiro Corporativo",
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
      className="bg-esenza-text py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-16 border-b border-white/10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <p
              className="text-[11px] tracking-[0.3em] uppercase text-white/40"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Retiros
            </p>
            <h2
              className="mt-4 text-5xl md:text-6xl font-light leading-[1.1] text-white"
              style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
            >
              Experiencias que
              <br />
              <em
                className="font-normal not-italic"
                style={{ color: "var(--color-esenza-gold)" }}
              >
                transforman
              </em>
            </h2>
          </div>
          <p
            className="max-w-xs text-sm leading-[1.8] text-white/45 lg:text-right"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Cada retiro es una invitación a recordar quién eres. Diseñado para
            pausar, respirar y volver a tu centro.
          </p>
        </div>

        {/* Lista de retiros */}
        <div className="divide-y divide-white/10">
          {retiros.map((retiro, i) => (
            <div
              key={retiro.title}
              className={`group py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start transition-all duration-700 hover:bg-white/[0.02] -mx-6 lg:-mx-10 px-6 lg:px-10 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Número */}
              <div className="lg:col-span-1">
                <span
                  className="text-sm text-white/20"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  {retiro.number}
                </span>
              </div>

              {/* Título + duración */}
              <div className="lg:col-span-4">
                <h3
                  className="text-2xl lg:text-3xl font-light text-white leading-snug group-hover:text-esenza-gold transition-colors duration-300"
                  style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                >
                  {retiro.title}
                </h3>
                <span
                  className="mt-2 inline-block text-[11px] tracking-[0.2em] uppercase text-esenza-gold/60"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  {retiro.duration}
                </span>
              </div>

              {/* Descripción */}
              <div className="lg:col-span-5">
                <p
                  className="text-sm leading-[1.85] text-white/45"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  {retiro.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {retiro.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/35 px-3 py-1"
                      style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                    >
                      {tag}
                    </span>
                  ))}
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
