"use client";

import { useRef, useEffect, useState } from "react";

const faqs = [
  {
    question: "¿Cómo llegar desde Bogotá?",
    answer:
      "Estamos a 74 km de Bogotá (1 h 45 min) por la vía La Mesa–Anapoima, Km 63. Una vez confirmes tu reserva te enviamos la ubicación exacta y recomendaciones de transporte. Si viajas desde el extranjero, asegurate de llegar a Bogotá (Aeropuerto El Dorado) un día antes de la fecha de inicio del retiro para que puedas empezarlo con tranquilidad.",
  },
  {
    question: "¿Qué debo llevar para mi estancia?",
    list: [
      "Ropa cómoda por capas (clima de montaña)",
      "Artículos de aseo personal (champú, jabón, pasta de dientes, cremas)",
      "Abrigo / suéter / chaqueta / ruana para las noches frescas",
      "Botella de agua reutilizable",
      "Traje de baño si vas a usar la piscina",
      "Zapatos cómodos para caminatas cortas y chanclas",
      "Lapicero, marcadores, colores o crayolas si te gusta pintar",
      "Cuaderno para tomar notas",
      "Repelente y protector solar",
      "Sombrero, gorra o visera",
      "Earplugs para dormir si sos sensible al sonido",
      "Mente abierta — las esterillas de yoga las ponemos nosotros",
    ],
  },
  {
    question: "¿Qué NO traer ni hacer?",
    list: [
      "Ni drogas, ni alcohol, ni mascotas durante los retiros",
      "No dejar comida en las habitaciones — puede atraer animales",
      "No botar ningún elemento en los inodoros",
    ],
  },
  {
    question: "¿Los paquetes incluyen alimentación?",
    answer:
      "Sí. Todos los paquetes incluyen las comidas principales. Tendrás fruta fresca, agua, té y café disponibles durante la mayor parte del día. Las comidas tienen alternativas vegetarianas — indicanos tus preferencias o alergias al reservar.",
  },
  {
    question: "¿Puedo llevar mascotas?",
    answer:
      "Actualmente no aceptamos mascotas para preservar la tranquilidad del espacio y la fauna silvestre de la zona. Agradecemos tu comprensión.",
  },
  {
    question: "¿Hay señal de celular y WiFi?",
    answer:
      "La señal de celular es limitada, lo cual es parte de la experiencia de desconexión. Contamos con WiFi en las áreas comunes para lo esencial.",
  },
  {
    question: "¿Puedo personalizar mi paquete?",
    answer:
      "¡Por supuesto! Podemos adaptar cualquier paquete a tus necesidades. Escribinos por WhatsApp y diseñamos una experiencia a tu medida.",
  },
  {
    question:
      "¿Tengo posibilidad de contratar la preparación de alimentos y tareas de la casa?",
    answer:
      "Sí, podemos coordinar servicio completo con costo adicional. Contános tus necesidades al reservar y te pasamos la propuesta.",
  },
];

const faqsRetiros = [
  {
    question: "¿Tengo que compartir mi habitación?",
    answer:
      "Esenza cuenta con 5 habitaciones y 4 baños. Durante los retiros todas las personas comparten habitación con 1 o 2 personas más.",
  },
  {
    question: "¿Puedo cancelar mi inscripción?",
    answer:
      "No ofrecemos reembolsos, pero podés transferir tu cupo a otra persona hasta 30 días antes del evento.",
  },
  {
    question: "¿Debo tener seguro de viaje?",
    answer: "Sí, te recomendamos tener tu propio seguro de viaje.",
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
            <FaqItem key={faq.question} faq={faq} />
          ))}
        </div>

        <div
          className={`mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h3 className="font-editorial text-2xl text-primary mb-6">
            Sobre los retiros
          </h3>
          <div className="space-y-4">
            {faqsRetiros.map((faq) => (
              <FaqItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type FaqEntry =
  | { question: string; answer: string; list?: undefined }
  | { question: string; list: string[]; answer?: undefined };

function FaqItem({ faq }: { faq: FaqEntry }) {
  return (
    <details className="group bg-white rounded-xl overflow-hidden border border-outline-variant/10">
      <summary className="flex items-center justify-between p-8 cursor-pointer list-none font-headline text-lg text-primary">
        {faq.question}
        <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform">
          expand_more
        </span>
      </summary>
      <div className="px-8 pb-8 text-on-surface-variant leading-relaxed">
        {faq.answer ? (
          faq.answer
        ) : (
          <ul className="space-y-2">
            {faq.list?.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-secondary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
