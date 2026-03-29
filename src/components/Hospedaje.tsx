"use client";

import { useEffect, useRef, useState } from "react";

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
              src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop"
              alt="Cabaña rodeada de montañas"
              className="rounded-xl shadow-2xl w-full object-cover h-[500px]"
            />
          </div>

          {/* Right — text */}
          <div className="w-full md:w-2/5 space-y-8">
            <h2 className="font-editorial text-4xl text-primary">
              Tu refugio privado
            </h2>

            <p className="text-on-surface-variant leading-relaxed">
              Nuestras estancias están diseñadas para minimizar el impacto
              ambiental mientras maximizan tu confort. Cada rincón invita a la
              contemplación.
            </p>

            <ul className="space-y-4 font-body text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">
                  check_circle
                </span>
                Vistas panorámicas a la montaña
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">
                  check_circle
                </span>
                Chimenea de biomasa
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">
                  check_circle
                </span>
                Lencería de algodón orgánico
              </li>
            </ul>

            <a
              href="#hospedaje"
              className="inline-block border-b-2 border-secondary-container pb-1 text-secondary font-label text-sm uppercase tracking-widest hover:border-secondary transition-all"
            >
              Ver Cabañas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
