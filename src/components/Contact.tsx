"use client";

import { useRef, useState, useEffect } from "react";

export default function Contact() {
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
      className="bg-esenza-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="font-script text-3xl text-esenza-gold">
            Contáctanos
          </span>
          <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark">
            Comienza tu <span className="font-semibold">experiencia</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-esenza-gold" />
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium tracking-wider uppercase text-esenza-text-light"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-2 w-full border-b-2 border-esenza-gold/30 bg-transparent py-3 font-heading text-lg text-esenza-green-dark outline-none transition-colors focus:border-esenza-green placeholder:text-esenza-text-light/50"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium tracking-wider uppercase text-esenza-text-light"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-2 w-full border-b-2 border-esenza-gold/30 bg-transparent py-3 font-heading text-lg text-esenza-green-dark outline-none transition-colors focus:border-esenza-green placeholder:text-esenza-text-light/50"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium tracking-wider uppercase text-esenza-text-light"
                >
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="mt-2 w-full border-b-2 border-esenza-gold/30 bg-transparent py-3 font-heading text-lg text-esenza-green-dark outline-none transition-colors focus:border-esenza-green placeholder:text-esenza-text-light/50"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label
                  htmlFor="package"
                  className="block text-sm font-medium tracking-wider uppercase text-esenza-text-light"
                >
                  Paquete de interés
                </label>
                <select
                  id="package"
                  name="package"
                  className="mt-2 w-full border-b-2 border-esenza-gold/30 bg-transparent py-3 font-heading text-lg text-esenza-green-dark outline-none transition-colors focus:border-esenza-green"
                >
                  <option value="">Selecciona un paquete</option>
                  <option value="esencia">Esencia - 1 Noche / 2 Días</option>
                  <option value="armonia">Armonía - 2 Noches / 3 Días</option>
                  <option value="plenitud">
                    Plenitud - 3 Noches / 4 Días
                  </option>
                  <option value="personalizado">Paquete Personalizado</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium tracking-wider uppercase text-esenza-text-light"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-2 w-full border-b-2 border-esenza-gold/30 bg-transparent py-3 font-heading text-lg text-esenza-green-dark outline-none transition-colors focus:border-esenza-green resize-none placeholder:text-esenza-text-light/50"
                  placeholder="Cuéntanos sobre tu experiencia ideal..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-esenza-green px-8 py-4 text-sm font-semibold tracking-widest uppercase text-white transition-all duration-300 hover:bg-esenza-green-dark hover:shadow-xl"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>

          {/* Map & Info */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            {/* Map */}
            <div className="overflow-hidden rounded-2xl shadow-lg h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3976.5!2d-74.46950349219925!3d4.59305437757003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNMKwMzUnMzUuNiJOIDc0wrAyOCcxMC4yIlc!5e0!3m2!1ses!2sco!4v1709500000000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Esenza"
              />
            </div>

            {/* Contact Info */}
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-esenza-cream text-esenza-green">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-esenza-green-dark">
                    Ubicación
                  </h4>
                  <p className="text-esenza-text-light">
                    Cundinamarca, Colombia
                    <br />
                    A 1.5 horas de Bogotá
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-esenza-cream text-esenza-green">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-esenza-green-dark">
                    WhatsApp
                  </h4>
                  <a
                    href="https://wa.me/573001234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-esenza-green hover:text-esenza-gold transition-colors"
                  >
                    +57 300 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-esenza-cream text-esenza-green">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-esenza-green-dark">
                    Email
                  </h4>
                  <a
                    href="mailto:info@esenza.co"
                    className="text-esenza-green hover:text-esenza-gold transition-colors"
                  >
                    info@esenza.co
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
