"use client";

import { useEffect, useRef, useState } from "react";

const espacios = [
  {
    name: "Cabaña del Bosque",
    capacity: "2 personas",
    description:
      "Rodeada de árboles nativos, con terraza privada y vista a las montañas. El silencio perfecto.",
    image:
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Suite Esenza",
    capacity: "2-3 personas",
    description:
      "Amplitud, luz natural y acabados en madera. Incluye chimenea y acceso directo al jardín interior.",
    image:
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Casa Familiar",
    capacity: "4-6 personas",
    description:
      "Espacio completo para familias o grupos pequeños, con cocina equipada, sala y dos habitaciones.",
    image:
      "https://images.unsplash.com/photo-1618767689160-da3fb810aad7?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Hospedaje() {
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
      className="bg-esenza-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header — left aligned */}
        <div
          className={`max-w-xl transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="text-sm tracking-widest uppercase text-esenza-gold">
            Alojamiento
          </span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark leading-tight">
            Donde el descanso se vuelve{" "}
            <span className="font-semibold">sagrado</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {espacios.map((espacio, i) => (
            <div
              key={espacio.name}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden rounded-2xl">
                <img
                  src={espacio.image}
                  alt={espacio.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Content over image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs tracking-wider uppercase text-white/80">
                    {espacio.capacity}
                  </span>
                  <h3 className="mt-3 font-heading text-2xl font-semibold text-white">
                    {espacio.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {espacio.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
