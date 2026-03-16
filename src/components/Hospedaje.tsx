"use client";

import { useEffect, useRef, useState } from "react";

const espacios = [
  {
    name: "Cabaña del Bosque",
    capacity: "2 personas",
    description:
      "Rodeada de árboles nativos, con terraza privada y vista a las montañas. El silencio perfecto para dos.",
    amenidades: ["Cama doble", "Terraza privada", "Vista montaña", "Aire natural"],
    gradient: "linear-gradient(140deg, #3D5216 0%, #6B8C23 60%, #8A9E6B 100%)",
  },
  {
    name: "Suite Esenza",
    capacity: "2–3 personas",
    description:
      "Amplitud, luz natural y acabados en madera. Acceso directo al jardín y espacios de meditación.",
    amenidades: ["Suite completa", "Jardín privado", "Madera nativa", "Meditación"],
    gradient: "linear-gradient(140deg, #5C7A28 0%, #A99348 70%, #C4AD6A 100%)",
  },
  {
    name: "Casa Familiar",
    capacity: "4–8 personas",
    description:
      "La finca completa para familias o grupos. Cocina equipada, sala amplia, múltiples habitaciones y piscina.",
    amenidades: ["Finca completa", "Piscina", "Cocina equipada", "Múltiples hab."],
    gradient: "linear-gradient(140deg, #2C3D1A 0%, #4A6020 50%, #6B8C23 100%)",
  },
];

export default function Hospedaje() {
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
      id="hospedaje"
      ref={sectionRef}
      className="bg-esenza-cream py-28 md:py-40"
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
            Alojamiento
          </p>
          <h2
            className="mt-4 text-5xl md:text-6xl font-light leading-[1.1] text-esenza-text"
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            Donde el descanso
            <br />
            <em className="font-normal not-italic" style={{ color: "var(--color-esenza-green)" }}>
              se vuelve sagrado
            </em>
          </h2>
        </div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {espacios.map((espacio, i) => (
            <div
              key={espacio.name}
              className={`group transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Imagen placeholder */}
              <div
                className="relative w-full aspect-[4/5] overflow-hidden"
                style={{ borderRadius: "1px" }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: espacio.gradient }}
                />
                {/* Capacidad badge */}
                <div className="absolute top-5 left-5">
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase text-white/60 border border-white/25 px-3 py-1.5 backdrop-blur-sm"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    {espacio.capacity}
                  </span>
                </div>
                {/* Placeholder label */}
                <div className="absolute bottom-5 right-5">
                  <p
                    className="text-[9px] tracking-[0.2em] uppercase text-white/30"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    Foto real próximamente
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 px-1">
                <h3
                  className="text-2xl font-light text-esenza-text"
                  style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                >
                  {espacio.name}
                </h3>
                <p
                  className="mt-3 text-sm leading-[1.8] text-esenza-text-light"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  {espacio.description}
                </p>

                {/* Amenidades */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {espacio.amenidades.map((item) => (
                    <span
                      key={item}
                      className="text-[10px] tracking-[0.12em] uppercase text-esenza-text-light border border-esenza-cream-deeper px-3 py-1"
                      style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Link reservar */}
                <a
                  href="https://wa.me/573001234567?text=Hola!%20Quiero%20información%20sobre%20hospedaje%20en%20Esenza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-esenza-text-mid hover:text-esenza-text transition-colors"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Consultar disponibilidad
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
