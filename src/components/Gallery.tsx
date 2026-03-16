"use client";

import { useEffect, useRef, useState } from "react";

// Placeholders con gradientes de la paleta — reemplazar con fotos reales
const images = [
  {
    gradient: "linear-gradient(135deg, #2C3D1A 0%, #4A6020 45%, #6B8C23 100%)",
    alt: "Vista de la finca",
    span: "col-span-2 row-span-2",
  },
  {
    gradient: "linear-gradient(135deg, #4A6020 0%, #8A9E6B 100%)",
    alt: "Naturaleza y senderos",
    span: "col-span-1 row-span-1",
  },
  {
    gradient: "linear-gradient(135deg, #A99348 0%, #C4AD6A 60%, #DDD5C5 100%)",
    alt: "Amanecer",
    span: "col-span-1 row-span-1",
  },
  {
    gradient: "linear-gradient(135deg, #5C7A28 0%, #A99348 100%)",
    alt: "Retiro de yoga",
    span: "col-span-1 row-span-1",
  },
  {
    gradient: "linear-gradient(135deg, #3D5216 0%, #6B8C23 50%, #A99348 100%)",
    alt: "Montañas de Cundinamarca",
    span: "col-span-1 row-span-1",
  },
  {
    gradient: "linear-gradient(135deg, #1C280C 0%, #3D5216 50%, #6B8C23 100%)",
    alt: "Noche en la finca",
    span: "col-span-2 row-span-1",
  },
];

export default function Gallery() {
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
      id="galeria"
      ref={sectionRef}
      className="bg-esenza-text py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <p
              className="text-[11px] tracking-[0.3em] uppercase text-white/35"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Galería
            </p>
            <h2
              className="mt-3 text-5xl md:text-6xl font-light leading-[1.1] text-white"
              style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
            >
              Momentos que
              <em className="font-normal not-italic text-esenza-gold"> inspiran</em>
            </h2>
          </div>
          <p
            className="text-[11px] tracking-[0.15em] uppercase text-white/30 sm:text-right"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Fotos reales próximamente
          </p>
        </div>

        {/* Grid asimétrico */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-2 auto-rows-[180px] md:auto-rows-[220px] transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {images.map((image, i) => (
            <div
              key={image.alt}
              className={`${image.span} relative overflow-hidden group cursor-pointer`}
              style={{ borderRadius: "1px" }}
            >
              {/* Gradiente placeholder */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{ background: image.gradient }}
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

              {/* Label */}
              <div className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <span
                  className="text-[10px] tracking-[0.2em] uppercase text-white/70"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  {image.alt}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Instagram */}
        <div
          className={`mt-12 text-center transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
            </svg>
            Seguir en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
