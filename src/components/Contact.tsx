"use client";

import { useRef, useState, useEffect } from "react";
import type { PublicImages } from "@/lib/site-images";

export default function Contact({ images }: { images?: PublicImages }) {
  const img = images?.["contact/location"];
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
      id="contacto"
      ref={sectionRef}
      className="py-32 bg-white px-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
        {/* Left Column — Form */}
        <div
          className={`w-full md:w-1/2 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10"
          }`}
        >
          <h2 className="font-editorial text-5xl text-primary mb-12">
            Hablemos
          </h2>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-secondary focus:ring-0 py-4 font-body placeholder:text-outline-variant transition-all"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-secondary focus:ring-0 py-4 font-body placeholder:text-outline-variant transition-all"
            />

            <textarea
              name="message"
              rows={4}
              placeholder="Cuéntanos tus planes..."
              className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-secondary focus:ring-0 py-4 font-body placeholder:text-outline-variant transition-all resize-none"
            />

            <button
              type="submit"
              className="bg-primary text-white px-12 py-4 rounded-full font-label text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>

        {/* Right Column — Map & Info */}
        <div
          className={`w-full md:w-1/2 space-y-12 transition-all duration-1000 delay-300 ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-10"
          }`}
        >
          {/* Placeholder Image */}
          <div className="rounded-2xl overflow-hidden shadow-2xl h-80">
            <img
              alt={img?.alt || "Vista aérea de Cundinamarca"}
              className="w-full h-full object-cover"
              src={img?.url || "/images/entrada-general.webp"}
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div>
                <p className="text-xs uppercase text-outline tracking-wider font-bold">
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-body"
                >
                  +57 300 123 4567
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <p className="text-xs uppercase text-outline tracking-wider font-bold">
                  Email
                </p>
                <a
                  href="mailto:info@esenza.co"
                  className="text-primary font-body"
                >
                  info@esenza.co
                </a>
              </div>
            </div>

            {/* Location — full width */}
            <div className="flex items-start gap-4 sm:col-span-2">
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <p className="text-xs uppercase text-outline tracking-wider font-bold">
                  Ubicación
                </p>
                <p className="text-primary font-body">
                  Cundinamarca, Colombia
                  <br />
                  A 1.5 horas de Bogotá
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
