"use client";

import { useState, useRef, useEffect } from "react";

const faqs = [
  {
    question: "¿Cómo llego a Esenza?",
    answer:
      "Esenza está ubicada a aproximadamente 1.5 horas de Bogotá por carretera. Ofrecemos servicio de transporte desde la ciudad en nuestro paquete Plenitud, o puedes llegar en vehículo propio siguiendo las indicaciones que te enviaremos al confirmar tu reserva.",
  },
  {
    question: "¿Qué debo llevar?",
    answer:
      "Ropa cómoda para actividades al aire libre, protector solar, repelente, zapatos de caminata y una chaqueta abrigada para las noches. Nosotros proporcionamos toallas, ropa de cama y todo lo necesario para tu estadía.",
  },
  {
    question: "¿Los paquetes incluyen alimentación?",
    answer:
      "Sí, todos nuestros paquetes incluyen alimentación. El paquete Esencia incluye desayuno y cena. Los paquetes Armonía y Plenitud incluyen las tres comidas principales, preparadas con ingredientes orgánicos y locales.",
  },
  {
    question: "¿Puedo llevar mascotas?",
    answer:
      "Actualmente no aceptamos mascotas para preservar la tranquilidad del espacio y la fauna silvestre de la zona. Agradecemos tu comprensión.",
  },
  {
    question: "¿Hay señal de celular y WiFi?",
    answer:
      "La señal de celular es limitada, lo cual es parte de la experiencia de desconexión. Contamos con WiFi en las áreas comunes para necesidades básicas de comunicación.",
  },
  {
    question: "¿Puedo personalizar mi paquete?",
    answer:
      "¡Por supuesto! Podemos adaptar cualquier paquete a tus necesidades. Contáctanos por WhatsApp y diseñaremos una experiencia a tu medida.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-esenza-gold/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-esenza-green"
      >
        <span className="font-heading text-xl font-medium text-esenza-green-dark pr-4">
          {question}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-esenza-gold transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-base leading-relaxed text-esenza-text-light">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
      ref={sectionRef}
      className="bg-esenza-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="font-script text-3xl text-esenza-gold">
            Preguntas frecuentes
          </span>
          <h2 className="mt-4 font-heading text-4xl md:text-5xl font-light text-esenza-green-dark">
            ¿Tienes <span className="font-semibold">dudas</span>?
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-esenza-gold" />
        </div>

        {/* FAQ Items */}
        <div
          className={`mt-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
