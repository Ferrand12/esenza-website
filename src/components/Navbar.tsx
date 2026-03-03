"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#experiencias", label: "Experiencias" },
  { href: "#retiros", label: "Retiros" },
  { href: "#eventos", label: "Eventos" },
  { href: "#hospedaje", label: "Hospedaje" },
  { href: "#galeria", label: "Galería" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-esenza-cream/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2">
            <span
              className={`font-script text-3xl transition-colors duration-500 ${
                scrolled ? "text-esenza-green" : "text-white"
              }`}
            >
              Esenza
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 hover:text-esenza-gold ${
                  scrolled ? "text-esenza-green-dark" : "text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#paquetes"
              className="rounded-full bg-esenza-green px-6 py-2 text-sm font-semibold tracking-wider uppercase text-white transition-all duration-300 hover:bg-esenza-green-dark hover:shadow-lg"
            >
              Reservar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            aria-label="Menú"
          >
            <span
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen
                  ? "rotate-45 translate-y-2 bg-esenza-green-dark"
                  : scrolled
                  ? "bg-esenza-green-dark"
                  : "bg-white"
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen
                  ? "opacity-0"
                  : scrolled
                  ? "bg-esenza-green-dark"
                  : "bg-white"
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen
                  ? "-rotate-45 -translate-y-2 bg-esenza-green-dark"
                  : scrolled
                  ? "bg-esenza-green-dark"
                  : "bg-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-esenza-cream/98 backdrop-blur-lg transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-heading font-light tracking-widest uppercase text-esenza-green-dark hover:text-esenza-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#paquetes"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-full bg-esenza-green px-8 py-3 text-lg font-semibold tracking-wider uppercase text-white hover:bg-esenza-green-dark transition-colors"
          >
            Reservar
          </a>
        </div>
      </div>
    </nav>
  );
}
