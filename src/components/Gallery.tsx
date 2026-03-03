"use client";

import { useEffect, useRef, useState } from "react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1505916349660-8d91a4e42890?q=80&w=800&auto=format&fit=crop",
    alt: "Paisaje montañoso",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
    alt: "Cabaña en la naturaleza",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
    alt: "Yoga al amanecer",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=600&auto=format&fit=crop",
    alt: "Amanecer en las montañas",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop",
    alt: "Spa y bienestar",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=800&auto=format&fit=crop",
    alt: "Fogata nocturna",
    span: "col-span-2 row-span-1",
  },
];

export default function Gallery() {
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
      id="galeria"
      ref={sectionRef}
      className="bg-esenza-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="font-script text-3xl text-esenza-gold">
            Galería
          </span>
          <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark">
            Momentos que <span className="font-semibold">inspiran</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-esenza-gold" />
        </div>

        {/* Gallery Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {images.map((image, i) => (
            <div
              key={image.alt}
              className={`${image.span} group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-700 ${
                isVisible
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-esenza-green-dark/0 transition-all duration-500 group-hover:bg-esenza-green-dark/40" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="font-script text-2xl text-white">
                  {image.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
