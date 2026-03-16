"use client";

import { useEffect, useRef, useState } from "react";

const distancias = [
  {
    lugar: "Bogotá",
    tiempo: "~2 horas",
    km: "85 km",
    icono: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    lugar: "Anapoima",
    tiempo: "~15 min",
    km: "12 km",
    icono: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    lugar: "Girardot",
    tiempo: "~45 min",
    km: "40 km",
    icono: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    lugar: "La Mesa (pueblo)",
    tiempo: "~10 min",
    km: "8 km",
    icono: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const actividades = [
  { label: "Caminatas", detalle: "Senderos por montaña y cafetales" },
  { label: "Ríos & piscinas", detalle: "Aguas naturales cerca de Anapoima" },
  { label: "Pueblo colonial", detalle: "La Mesa y sus calles históricas" },
  { label: "Clima cálido", detalle: "26–32°C todo el año" },
  { label: "Avistamiento de aves", detalle: "Más de 150 especies en la región" },
  { label: "Mercados locales", detalle: "Productos frescos de la región" },
];

export default function Ubicacion() {
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
      id="ubicacion"
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
            Cómo llegar
          </p>
          <h2
            className="mt-4 text-5xl md:text-6xl font-light leading-[1.1] text-esenza-text"
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            La Mesa,{" "}
            <em className="font-normal not-italic" style={{ color: "var(--color-esenza-green)" }}>
              Cundinamarca
            </em>
          </h2>
          <p
            className="mt-5 max-w-lg text-base leading-[1.8] text-esenza-text-light"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Cerca de Anapoima, en la región cálida de Cundinamarca. Un paisaje
            diferente a solo dos horas de Bogotá.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Columna izquierda — distancias + actividades */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Distancias */}
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mb-6"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Distancias
            </p>
            <div className="space-y-0 divide-y divide-esenza-cream-deeper">
              {distancias.map((d) => (
                <div
                  key={d.lugar}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-esenza-text-light">{d.icono}</div>
                    <div>
                      <p
                        className="text-base font-light text-esenza-text"
                        style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                      >
                        {d.lugar}
                      </p>
                      <p
                        className="text-[11px] text-esenza-text-light mt-0.5"
                        style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                      >
                        {d.km}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-light text-esenza-text-mid"
                    style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                  >
                    {d.tiempo}
                  </span>
                </div>
              ))}
            </div>

            {/* Separador */}
            <div className="mt-10 h-px bg-esenza-cream-deeper" />

            {/* Actividades cercanas */}
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mt-10 mb-6"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Qué hay cerca
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actividades.map((act) => (
                <div key={act.label} className="flex items-start gap-3">
                  {/* Punto decorativo */}
                  <div
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-esenza-gold opacity-70"
                  />
                  <div>
                    <p
                      className="text-sm font-light text-esenza-text"
                      style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                    >
                      {act.label}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed text-esenza-text-light"
                      style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                    >
                      {act.detalle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — Mapa */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="overflow-hidden h-[420px] lg:h-full min-h-[420px]" style={{ borderRadius: "1px" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31804.55!2d-74.4694!3d4.5930!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f14dc23c96f2f%3A0x8f3e5a1b7e5b0e0!2sLa%20Mesa%2C%20Cundinamarca%2C%20Colombia!5e0!3m2!1ses!2sco!4v1710000000000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "saturate(0.8) contrast(0.95)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Esenza — La Mesa, Cundinamarca"
              />
            </div>

            {/* Nota bajo el mapa */}
            <p
              className="mt-4 text-[11px] leading-relaxed text-esenza-text-light"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              La ubicación exacta se comparte al confirmar la reserva por privacidad.
              Coordinaremos el acceso directamente por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
