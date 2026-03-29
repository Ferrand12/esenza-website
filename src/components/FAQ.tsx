"use client";

import { useRef, useEffect, useState } from "react";

const faqs = [
  {
    question: "¿Cómo llegar desde Bogotá?",
    answer:
      "Estamos ubicados a solo 1.5 horas de Bogotá por la vía norte. Una vez confirmes tu reserva, te enviaremos la ubicación exacta y recomendaciones de transporte privado si lo requieres.",
  },
  {
    question: "¿Qué debo llevar para mi estancia?",
    answer:
      "Recomendamos ropa cómoda por capas (clima de montaña), calzado para senderismo, protector solar y una mente abierta. Nosotros proveemos esterillas de yoga y elementos de aseo orgánicos.",
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

export default function FAQ() {
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
      className="py-32 bg-surface-container-low px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div
          className={`flex items-center gap-6 mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="w-1.5 h-16 bg-secondary-container" />
          <h2 className="font-editorial text-5xl text-primary">
            Preguntas frecuentes
          </h2>
        </div>

        {/* FAQ Items */}
        <div
          className={`space-y-4 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white rounded-xl overflow-hidden border border-outline-variant/10"
            >
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none font-headline text-lg text-primary">
                {faq.question}
                <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-8 text-on-surface-variant leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
