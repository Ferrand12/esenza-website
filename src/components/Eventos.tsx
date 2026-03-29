"use client";

import { useEffect, useRef, useState } from "react";

const eventos = [
  {
    title: "Celebraciones intimas",
    description:
      "Cumpleanos, aniversarios y encuentros especiales en un entorno natural que hace cada momento memorable.",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Reuniones corporativas",
    description:
      "Espacios inspiradores para workshops, team building y sesiones de planeacion estrategica fuera de la oficina.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Experiencias a medida",
    description:
      "Disenamos el evento que imaginas. Cuentanos tu vision y la hacemos realidad rodeada de naturaleza.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Eventos() {
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
      id="eventos"
      ref={sectionRef}
      className="bg-surface-bright py-24 md:py-32 px-8"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header — centered, minimal */}
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="font-editorial text-4xl md:text-5xl font-light text-primary">
            Eventos
          </h2>
          <p className="mt-4 text-base text-on-surface-variant">
            Tu momento especial, en un lugar extraordinario.
          </p>
        </div>

        {/* Horizontal cards */}
        <div className="mt-16 space-y-8">
          {eventos.map((evento, i) => (
            <div
              key={evento.title}
              className={`group grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-700 hover:shadow-xl ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <div
                className={`relative h-56 md:h-auto overflow-hidden ${
                  i % 2 === 1 ? "md:order-last" : ""
                }`}
              >
                <img
                  src={evento.image}
                  alt={evento.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div
                className={`md:col-span-2 flex flex-col justify-center p-8 md:p-12 ${
                  i % 2 === 1 ? "md:order-first" : ""
                }`}
              >
                <h3 className="font-editorial text-2xl md:text-3xl font-semibold text-primary">
                  {evento.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-on-surface-variant max-w-lg">
                  {evento.description}
                </p>
                <a
                  href="#contacto"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-secondary hover:text-primary transition-colors"
                >
                  Consultar
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
