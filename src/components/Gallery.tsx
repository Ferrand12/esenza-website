"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicImages } from "@/lib/site-images";

const GALLERY_DEFAULTS = [
  {
    slot: "1",
    defaultSrc: "/images/gallery-piscina-noche.webp",
    defaultAlt: "Piscina iluminada de noche con vista a la ciudad",
    caption: "Renovación",
    span: "col-span-2 row-span-2",
  },
  {
    slot: "2",
    defaultSrc: "/images/gallery-yoga.webp",
    defaultAlt: "Zona de yoga al aire libre con vista a las montañas",
    caption: "Yoga",
    span: "col-span-1 row-span-1",
  },
  {
    slot: "3",
    defaultSrc: "/images/gallery-piscina-dia.webp",
    defaultAlt: "Piscina de día con sillas y vista panorámica",
    caption: "Piscina",
    span: "col-span-1 row-span-1",
  },
  {
    slot: "4",
    defaultSrc: "/images/gallery-deck-noche.webp",
    defaultAlt: "Deck nocturno con velas y luces en los árboles",
    caption: "Atardecer",
    span: "col-span-2 row-span-1",
  },
];

export default function Gallery({ images }: { images?: PublicImages }) {
  const galleryImages = GALLERY_DEFAULTS.map((g) => {
    const custom = images?.[`gallery/${g.slot}`];
    return {
      src: custom?.url || g.defaultSrc,
      alt: custom?.alt || g.defaultAlt,
      caption: g.caption,
      span: g.span,
    };
  });

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
        {galleryImages.map((image, i) => (
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
