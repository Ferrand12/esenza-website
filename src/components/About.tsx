"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicImages } from "@/lib/site-images";

export default function About({ images }: { images?: PublicImages }) {
  const img = images?.["about/hero-image"];
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
      className="bg-surface-container-low py-24 md:py-32 px-8 md:px-24"
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
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-secondary/10 rounded-xl blur-2xl group-hover:bg-secondary/20 transition-all" />
              <img
                src={img?.url || "/images/about-balcon.webp"}
                alt={
                  img?.alt ||
                  "Balcón con hamaca y vista panorámica a las montañas"
                }
                className="relative aspect-[4/5] object-cover rounded-xl shadow-2xl"
              />
            </div>
            {/* Floating tag */}
            <div className="absolute -bottom-8 -right-8 bg-secondary-container p-8 rounded-lg shadow-xl hidden md:block">
              <p className="font-editorial text-2xl text-secondary italic">Paz Interior</p>
            </div>
          </div>

          {/* Text Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <span className="font-script text-4xl text-secondary">
              Sobre nosotros
            </span>
            <h2 className="mt-4 font-editorial text-4xl md:text-5xl text-primary leading-tight">
              Un refugio donde la naturaleza
              <br />
              <span className="font-semibold">sana el alma</span>
            </h2>

            <div className="mt-6 w-24 h-px bg-secondary-container" />

            <p className="mt-8 text-lg leading-relaxed text-on-surface-variant">
              En el corazón de los Andes colombianos, entre árboles frutales,
              cielos amplios y sonidos de la vida,{" "}
              <strong className="text-primary">Esenza</strong> nace como un
              santuario dedicado a la pausa consciente. No somos solo un destino,
              somos un proceso de retorno a lo esencial.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Nuestra filosofía se basa en el respeto profundo por los ciclos
              naturales, ofreciendo un refugio de bienestar natural donde vives
              experiencias auténticas de bienestar, alegría y aprendizaje.
              Inspiramos estilos de vida conscientes y renovados conectando el
              aire puro y la energía de la naturaleza con tu esencia personal.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-outline-variant/30">
              {[
                { number: "74 km", label: "Desde Bogotá · 1 h 45 min" },
                { number: "700", label: "m.s.n.m." },
                { number: "24°C", label: "Temperatura promedio" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-headline text-secondary-container font-bold">
                    {stat.number}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-outline font-medium">
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
