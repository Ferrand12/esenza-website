"use client";

import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/573001234567?text=Hola!%20Quiero%20información%20sobre%20Esenza"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
      aria-label="Contactar por WhatsApp"
    >
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.522.902 3.222 1.387 4.953 1.388 5.41.002 9.814-4.403 9.816-9.816.001-2.623-1.022-5.09-2.882-6.951-1.859-1.859-4.325-2.881-6.947-2.882-5.411 0-9.816 4.404-9.819 9.817-.001 1.737.458 3.435 1.328 4.957l-1.007 3.68 3.771-.989zm11.332-6.577c-.31-.155-1.832-.903-2.113-1.004-.282-.102-.488-.155-.694.155-.205.31-.794.996-.973 1.201-.179.206-.359.231-.669.077-.31-.155-1.31-.482-2.494-1.538-.92-.821-1.542-1.834-1.722-2.144-.18-.31-.019-.477.135-.631.139-.139.31-.359.464-.539.155-.18.206-.31.31-.514.103-.206.051-.386-.026-.54-.077-.154-.694-1.674-.951-2.292-.25-.609-.504-.526-.694-.536-.18-.01-.386-.011-.592-.011-.206 0-.54.077-.822.386-.282.31-1.079 1.055-1.079 2.574s1.105 2.986 1.258 3.193c.154.205 2.176 3.321 5.271 4.659.736.317 1.311.507 1.758.649.74.234 1.413.202 1.945.123.593-.088 1.832-.747 2.089-1.467.257-.721.257-1.338.18-1.467-.077-.128-.282-.205-.592-.36z" />
      </svg>
    </a>
  );
}
