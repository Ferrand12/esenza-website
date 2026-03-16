"use client";

import { useRef, useState, useEffect } from "react";

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contacto"
      ref={sectionRef}
      className="bg-esenza-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-esenza-text-light"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Contacto
          </p>
          <h2
            className="mt-4 text-5xl md:text-6xl font-light leading-[1.1] text-esenza-text"
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            Comienza tu
            <em className="font-normal not-italic" style={{ color: "var(--color-esenza-green)" }}>
              {" "}experiencia
            </em>
          </h2>
        </div>

        <div
          className={`mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Formulario de contacto */}
          <div>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Nombre + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="group">
                  <label
                    htmlFor="name"
                    className="block text-[10px] tracking-[0.25em] uppercase text-esenza-text-light mb-3"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    className="w-full bg-transparent border-b border-esenza-cream-deeper pb-3 text-base text-esenza-text placeholder:text-esenza-text-light/40 outline-none focus:border-esenza-text transition-colors"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[10px] tracking-[0.25em] uppercase text-esenza-text-light mb-3"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    className="w-full bg-transparent border-b border-esenza-cream-deeper pb-3 text-base text-esenza-text placeholder:text-esenza-text-light/40 outline-none focus:border-esenza-text transition-colors"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-[10px] tracking-[0.25em] uppercase text-esenza-text-light mb-3"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+57 300 123 4567"
                  className="w-full bg-transparent border-b border-esenza-cream-deeper pb-3 text-base text-esenza-text placeholder:text-esenza-text-light/40 outline-none focus:border-esenza-text transition-colors"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                />
              </div>

              {/* Tipo de experiencia */}
              <div>
                <label
                  htmlFor="tipo"
                  className="block text-[10px] tracking-[0.25em] uppercase text-esenza-text-light mb-3"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Tipo de experiencia
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  className="w-full bg-transparent border-b border-esenza-cream-deeper pb-3 text-base text-esenza-text outline-none focus:border-esenza-text transition-colors appearance-none cursor-pointer"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  <option value="">Seleccionar</option>
                  <option value="retiro-yoga">Retiro de Yoga & Meditación</option>
                  <option value="retiro-digital">Desintoxicación Digital</option>
                  <option value="corporativo">Retiro Corporativo</option>
                  <option value="familiar">Escapada Familiar</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-[10px] tracking-[0.25em] uppercase text-esenza-text-light mb-3"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Cuéntanos sobre tu experiencia ideal..."
                  className="w-full bg-transparent border-b border-esenza-cream-deeper pb-3 text-base text-esenza-text placeholder:text-esenza-text-light/40 outline-none focus:border-esenza-text transition-colors resize-none"
                  style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="border border-esenza-text text-esenza-text text-[11px] tracking-[0.25em] uppercase px-8 py-3.5 hover:bg-esenza-text hover:text-esenza-cream transition-all duration-300"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Info de contacto */}
          <div className="space-y-12">
            {/* WhatsApp — destacado */}
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mb-4"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Respuesta rápida
              </p>
              <a
                href="https://wa.me/573001234567?text=Hola!%20Quiero%20información%20sobre%20Esenza"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p
                    className="text-xl font-light text-esenza-text group-hover:text-esenza-green transition-colors"
                    style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
                  >
                    +57 300 123 4567
                  </p>
                  <p
                    className="text-[11px] text-esenza-text-light mt-0.5"
                    style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
                  >
                    Respuesta en menos de 2 horas
                  </p>
                </div>
              </a>
            </div>

            {/* Email */}
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mb-4"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Email
              </p>
              <a
                href="mailto:info@esenza.co"
                className="text-xl font-light text-esenza-text hover:text-esenza-green transition-colors"
                style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
              >
                info@esenza.co
              </a>
            </div>

            {/* Ubicación */}
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mb-4"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Ubicación
              </p>
              <p
                className="text-xl font-light text-esenza-text"
                style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
              >
                La Mesa, Cundinamarca
              </p>
              <p
                className="mt-1 text-sm text-esenza-text-light"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Cerca de Anapoima · ~2h de Bogotá
              </p>
            </div>

            {/* Horario */}
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase text-esenza-text-light mb-4"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                Atención
              </p>
              <p
                className="text-xl font-light text-esenza-text"
                style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
              >
                Lunes a Domingo
              </p>
              <p
                className="mt-1 text-sm text-esenza-text-light"
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                8:00 AM – 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
