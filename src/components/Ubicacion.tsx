"use client";

import { useEffect, useRef, useState } from "react";

const distancias = [
  { lugar: "Bogotá", tiempo: "~2 horas", km: "85 km", icon: "location_city" },
  { lugar: "Anapoima", tiempo: "~15 min", km: "12 km", icon: "pin_drop" },
  { lugar: "Girardot", tiempo: "~45 min", km: "40 km", icon: "home" },
  { lugar: "La Mesa (pueblo)", tiempo: "~10 min", km: "8 km", icon: "public" },
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
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ubicacion"
      ref={sectionRef}
      className="bg-surface-container-low py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="font-label text-[11px] tracking-[0.3em] uppercase text-on-surface-variant">
            Cómo llegar
          </p>
          <h2 className="mt-4 font-editorial text-5xl md:text-6xl font-light leading-[1.1] text-on-surface">
            La Mesa,{" "}
            <em className="font-normal not-italic text-primary">
              Cundinamarca
            </em>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-[1.8] text-on-surface-variant">
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
            <p className="font-label text-[10px] tracking-[0.3em] uppercase text-on-surface-variant mb-6">
              Distancias
            </p>
            <div className="space-y-0 divide-y divide-outline-variant">
              {distancias.map((d) => (
                <div
                  key={d.lugar}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">
                      {d.icon}
                    </span>
                    <div>
                      <p className="font-editorial text-base font-light text-on-surface">
                        {d.lugar}
                      </p>
                      <p className="font-label text-[11px] text-on-surface-variant mt-0.5">
                        {d.km}
                      </p>
                    </div>
                  </div>
                  <span className="font-editorial text-sm font-light text-on-surface-variant">
                    {d.tiempo}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 h-px bg-outline-variant" />

            <p className="font-label text-[10px] tracking-[0.3em] uppercase text-on-surface-variant mt-10 mb-6">
              Qué hay cerca
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actividades.map((act) => (
                <div key={act.label} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary opacity-70" />
                  <div>
                    <p className="font-editorial text-sm font-light text-on-surface">
                      {act.label}
                    </p>
                    <p className="text-[11px] leading-relaxed text-on-surface-variant">
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
            <div className="overflow-hidden rounded-2xl h-[420px] lg:h-full min-h-[420px]">
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
            <p className="mt-4 text-[11px] leading-relaxed text-on-surface-variant">
              La ubicación exacta se comparte al confirmar la reserva por privacidad.
              Coordinaremos el acceso directamente por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
