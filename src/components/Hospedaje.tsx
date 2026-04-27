"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicImages } from "@/lib/site-images";

export default function Hospedaje({ images }: { images?: PublicImages }) {
  const img = images?.["hospedaje/main"];
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
      id="hospedaje"
      ref={sectionRef}
      className="py-24 bg-surface-container-low px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex flex-col md:flex-row gap-12 items-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Left — image */}
          <div className="w-full md:w-3/5">
            <img
              src={img?.url || "/images/hospedaje-habitacion.webp"}
              alt={
                img?.alt || "Habitación principal con vista a la naturaleza"
              }
              className="rounded-xl shadow-2xl w-full object-cover h-[500px]"
            />
          </div>

          {/* Right — text */}
          <div className="w-full md:w-2/5 space-y-8">
            <div>
              <span className="font-script text-3xl text-secondary">
                Simple Luxury
              </span>
              <h2 className="mt-1 font-editorial text-4xl text-primary">
                Tu refugio privado
              </h2>
            </div>

            <p className="text-on-surface-variant leading-relaxed">
              Nuestras estancias están diseñadas bajo el principio de
              Simple Luxury — comodidad, belleza natural y sostenibilidad.
              Cada rincón invita al descanso y relajación.
            </p>

            <ul className="grid grid-cols-1 gap-3 font-body text-sm">
              {[
                "Vistas panorámicas a la montaña y árboles de frutas tropicales",
                "Piscina privada con luz nocturna",
                "Terraza Panorámica",
                "Zona BBQ",
                "Zona Fogata",
                "Salón de juegos y eventos",
                "Conexión WiFi",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl shrink-0">
                    check_circle
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#paquetes"
              className="inline-block border-b-2 border-secondary-container pb-1 text-secondary font-label text-sm uppercase tracking-widest hover:border-secondary transition-all"
            >
              Ver paquetes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
