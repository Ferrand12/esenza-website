"use client";

import { useEffect, useRef, useState } from "react";

export type FeaturedReview = {
  id: string;
  name: string;
  text: string;
  title: string | null;
  rating: number;
};

// Fallback si aún no hay reviews destacadas en DB.
const FALLBACK: FeaturedReview[] = [
  {
    id: "fb1",
    name: "María Camila R.",
    title: null,
    text: "Un espacio que trasciende lo físico. El silencio de la montaña y la atención al detalle en Esenza me permitieron reconectar conmigo de una forma que no creía posible.",
    rating: 5,
  },
  {
    id: "fb2",
    name: "Andrés Felipe M.",
    title: null,
    text: "La gastronomía es simplemente excepcional. Cada plato cuenta una historia de la tierra. Es sin duda el mejor retiro wellness cerca de Bogotá.",
    rating: 5,
  },
];

export default function Testimonials({
  reviews,
}: {
  reviews?: FeaturedReview[];
}) {
  const data = reviews && reviews.length > 0 ? reviews : FALLBACK;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-white relative overflow-hidden px-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="font-script text-[20rem] text-secondary select-none">
          Voces
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <span className="font-label text-xs tracking-widest text-secondary uppercase mb-4 block">
            Experiencias Reales
          </span>
          <h2 className="font-editorial text-5xl text-primary leading-tight">
            Lo que dicen nuestros huéspedes
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-1000 delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {data.slice(0, 4).map((testimonial) => (
            <div key={testimonial.id}>
              <span className="material-symbols-outlined text-secondary-container text-6xl opacity-50">
                format_quote
              </span>

              {testimonial.title && (
                <p className="font-editorial text-xl text-primary mt-2 mb-1 font-medium">
                  {testimonial.title}
                </p>
              )}
              <p className="font-editorial text-2xl italic text-on-surface leading-relaxed mt-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-6">
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
                        style={{ fontVariationSettings: "'FILL' 1" }}
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

        <div className="text-center mt-16">
          <a
            href="/resenas"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-secondary transition-colors font-label uppercase tracking-widest"
          >
            Ver todas las reseñas →
          </a>
        </div>
      </div>
    </section>
  );
}
