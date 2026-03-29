"use client";

import { useEffect, useRef, useState } from "react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1505916349660-8d91a4e42890?q=80&w=800&auto=format&fit=crop",
    alt: "Paisaje montañoso",
    caption: "Renovación",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
    alt: "Cabaña en la naturaleza",
    caption: "Paisaje",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
    alt: "Yoga al amanecer",
    caption: "Yoga",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=800&auto=format&fit=crop",
    alt: "Piscina natural",
    caption: "Piscina natural",
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
      className="bg-surface-bright py-32 px-8 overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-editorial text-5xl text-primary">
          Momentos que inspiran
        </h2>
        <div className="w-16 h-1 bg-secondary-container mx-auto mt-6" />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[800px] max-w-7xl mx-auto">
        {images.map((image, i) => (
          <div
            key={image.alt}
            className={`${image.span} overflow-hidden rounded-xl relative group transition-all duration-700 ${
              isVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="font-script text-white text-4xl">
                {image.caption}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
