"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
    title: "Hospedaje Rural",
    description:
      "Espacios acogedores rodeados de naturaleza. Diseñados para el descanso profundo.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5M5.5 18.5l1.5-1.5m0-12L5.5 5.5M18.5 18.5l-1.5-1.5" />
      </svg>
    ),
    title: "Yoga & Meditación",
    description:
      "Sesiones guiadas al amanecer, meditación y prácticas de bienestar integral.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Senderos & Naturaleza",
    description:
      "Caminatas por senderos ecológicos, ríos y paisajes de Cundinamarca.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.95 5.05l.707-.707" />
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
    title: "Gastronomía Local",
    description:
      "Cocina artesanal con ingredientes orgánicos de la región. Sabor campesino.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Retiros Grupales",
    description:
      "Espacios para grupos, equipos corporativos y celebraciones íntimas.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Noches Estrelladas",
    description:
      "Fogatas, cielos despejados y momentos de reconexión bajo las estrellas.",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experiencias"
      ref={sectionRef}
      className="bg-esenza-cream-dark py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-esenza-text-light"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Experiencias
          </p>
          <h2
            className="mt-4 text-5xl md:text-6xl font-light leading-[1.1] text-esenza-text"
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            Vive algo
            <em className="font-normal not-italic"> extraordinario</em>
          </h2>
        </div>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-esenza-cream-deeper">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`bg-esenza-cream-dark p-10 transition-all duration-700 hover:bg-esenza-cream group ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Icono — color sobrio */}
              <div className="text-esenza-text-light group-hover:text-esenza-green transition-colors duration-300">
                {service.icon}
              </div>

              {/* Título */}
              <h3
                className="mt-6 text-xl font-light text-esenza-text leading-snug"
                style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
              >
                {service.title}
              </h3>

              {/* Descripción */}
              <p
                className="mt-3 text-sm leading-[1.8] text-esenza-text-light"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
