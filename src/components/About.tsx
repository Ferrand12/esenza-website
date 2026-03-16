"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      className="bg-esenza-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Layout: texto izquierda, imagen derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Texto */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {/* Eyebrow */}
            <p
              className="text-[11px] tracking-[0.3em] uppercase text-esenza-text-light"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Nosotros
            </p>

            {/* Frase poderosa — Cormorant grande */}
            <h2
              className="mt-5 text-5xl md:text-6xl lg:text-[4rem] font-light leading-[1.1] tracking-tight text-esenza-text"
              style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
            >
              Un refugio donde
              <br />
              la naturaleza
              <br />
              <em className="font-normal not-italic" style={{ color: "var(--color-esenza-green)" }}>sana el alma</em>
            </h2>

            {/* Línea dorada */}
            <div className="mt-8 h-px w-12 bg-esenza-gold opacity-60" />

            {/* Párrafos — DM Sans */}
            <p
              className="mt-8 text-base leading-[1.85] text-esenza-text-light max-w-md"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Esenza es un espacio de bienestar inmerso en la naturaleza cálida de
              Cundinamarca. Rodeada de montañas y aire puro, nuestra finca cerca de
              Anapoima invita a pausar, respirar y reconectarte con lo que importa.
            </p>

            <p
              className="mt-4 text-base leading-[1.85] text-esenza-text-light max-w-md"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Para familias que buscan descansar juntas, para personas que necesitan
              un retiro de bienestar — Esenza es el lugar donde la calma llega sola.
            </p>

            {/* Stats minimalistas */}
            <div className="mt-12 flex gap-10">
              {[
                { value: "~2h", label: "desde Bogotá" },
                { value: "365", label: "días de naturaleza" },
                { value: "∞", label: "silencio" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-3xl font-light text-esenza-text"
                    style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1 text-[11px] tracking-[0.2em] uppercase text-esenza-text-light"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {/* Imagen placeholder — gradiente orgánico cálido */}
            <div
              className="relative w-full aspect-[3/4] overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #4A6020 0%, #6B8C23 35%, #8A9E6B 60%, #A99348 100%)",
                }}
              />
              {/* Textura sutil */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse at 30% 70%, #F5F1EB 0%, transparent 60%)",
                }}
              />
              {/* Texto placeholder elegante */}
              <div className="absolute inset-0 flex items-end p-8">
                <p
                  className="text-sm tracking-[0.2em] uppercase text-white/50"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Foto de la finca
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
