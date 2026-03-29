"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "María Camila R.",
    text: "Un espacio que trasciende lo físico. El silencio de la montaña y la atención al detalle en Esenza me permitieron reconectar conmigo de una forma que no creía posible.",
    rating: 5,
  },
  {
    name: "Andrés Felipe M.",
    text: "La gastronomía es simplemente excepcional. Cada plato cuenta una historia de la tierra. Es sin duda el mejor retiro wellness cerca de Bogotá.",
    rating: 5,
  },
];

export default function Testimonials() {
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
      ref={sectionRef}
      className="py-32 bg-white relative overflow-hidden px-8"
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Giant watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="font-script text-[20rem] text-secondary select-none">
          Voces
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="font-label text-xs tracking-widest text-secondary uppercase mb-4 block">
            Experiencias Reales
          </span>
          <h2 className="font-editorial text-5xl text-primary leading-tight">
            Lo que dicen nuestros huéspedes
          </h2>
        </div>

        {/* 2-column grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.name}>
              {/* Quote icon */}
              <span className="material-symbols-outlined text-secondary-container text-6xl opacity-50">
                format_quote
              </span>

              {/* Testimonial text */}
              <p className="font-editorial text-2xl italic text-on-surface leading-relaxed mt-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Avatar + name + stars */}
              <div className="flex items-center gap-4 pt-6">
                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-full bg-surface-container flex-shrink-0" />
                <div>
                  <p className="font-label font-bold text-primary">
                    {testimonial.name}
                  </p>
                  <div className="flex gap-0.5 text-secondary-container mt-1">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <span
                        key={j}
                        className="material-symbols-outlined text-sm"
                        style={{
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
