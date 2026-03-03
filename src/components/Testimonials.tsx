"use client";

import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    name: "María Camila R.",
    location: "Bogotá",
    text: "Esenza fue exactamente lo que necesitaba. Llegué agotada de la ciudad y salí renovada. El yoga al amanecer con vista a las montañas fue una experiencia que nunca olvidaré.",
    rating: 5,
  },
  {
    name: "Andrés Felipe M.",
    location: "Medellín",
    text: "La comida es increíble, todo fresco y orgánico. Las caminatas por los senderos son mágicas. Definitivamente volveré con mi familia. Un lugar para sanar.",
    rating: 5,
  },
  {
    name: "Laura Victoria S.",
    location: "Cali",
    text: "Hicimos nuestro retiro corporativo aquí y fue transformador. El equipo quedó inspirado y reconectado. Los espacios son hermosos y la atención impecable.",
    rating: 5,
  },
  {
    name: "Carlos Eduardo P.",
    location: "Bogotá",
    text: "La fogata bajo las estrellas, el silencio de la montaña, el aroma del café recién hecho... Esenza es poesía hecha lugar. Pura esencia de bienestar.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-esenza-white py-24 md:py-32 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-esenza-green/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-esenza-gold/5 translate-x-1/2 translate-y-1/2" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="font-script text-3xl text-esenza-gold">
            Testimonios
          </span>
          <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark">
            Lo que dicen nuestros{" "}
            <span className="font-semibold">huéspedes</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-esenza-gold" />
        </div>

        {/* Testimonial Carousel */}
        <div className="mt-16 relative">
          {/* Quote icon */}
          <svg
            className="mx-auto h-12 w-12 text-esenza-gold/30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>

          <div className="relative h-[200px] md:h-[160px]">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.name}
                className={`absolute inset-0 flex flex-col items-center text-center transition-all duration-700 ${
                  i === current
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <p className="text-lg md:text-xl italic leading-relaxed text-esenza-text-light">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="mt-6">
                  {/* Stars */}
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <svg
                        key={j}
                        className="h-4 w-4 text-esenza-gold"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-2 font-heading text-lg font-semibold text-esenza-green-dark">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-esenza-text-light">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-8 flex justify-center gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-esenza-green"
                    : "w-2.5 bg-esenza-gold/30 hover:bg-esenza-gold/50"
                }`}
                aria-label={`Testimonio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
