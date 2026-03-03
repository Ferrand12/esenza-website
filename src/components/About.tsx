"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      className="bg-esenza-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1780&auto=format&fit=crop"
                alt="Esenza - Vista de la naturaleza"
                className="h-[500px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-esenza-green-dark/30 to-transparent" />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 h-48 w-48 rounded-2xl border-2 border-esenza-gold/30 -z-10" />
          </div>

          {/* Text Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <span className="font-script text-3xl text-esenza-gold">
              Sobre nosotros
            </span>
            <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark leading-tight">
              Un refugio donde la naturaleza
              <br />
              <span className="font-semibold">sana el alma</span>
            </h2>

            <div className="mt-6 h-px w-16 bg-esenza-gold" />

            <p className="mt-8 text-lg leading-relaxed text-esenza-text-light">
              <strong className="text-esenza-green-dark">Esenza</strong> es un
              espacio de bienestar inmerso en la naturaleza, diseñado para
              reconectarte con lo esencial. Ubicada en las montañas cercanas a
              Bogotá, nuestra finca ofrece una experiencia única de descanso,
              salud y vitalidad.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-esenza-text-light">
              Rodeada de paisajes verdes, aire puro y la tranquilidad del campo
              colombiano, Esenza es el lugar perfecto para escapar del ritmo
              urbano y encontrar tu equilibrio interior.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { number: "100%", label: "Natural" },
                { number: "360°", label: "Montañas" },
                { number: "∞", label: "Paz" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-heading text-3xl font-bold text-esenza-green">
                    {stat.number}
                  </div>
                  <div className="mt-1 text-sm tracking-wider uppercase text-esenza-text-light">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
