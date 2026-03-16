"use client";

import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#experiencias", label: "Experiencias" },
  { href: "#retiros", label: "Retiros" },
  { href: "#hospedaje", label: "Hospedaje" },
  { href: "#ubicacion", label: "Cómo llegar" },
  { href: "#galeria", label: "Galería" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-esenza-cream/96 backdrop-blur-md border-b border-esenza-cream-dark"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo — Cormorant Garamond, elegante */}
          <a
            href="#inicio"
            className={`font-heading text-2xl tracking-[0.12em] transition-colors duration-400 ${
              scrolled ? "text-esenza-text" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            Esenza
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-300 ${
                  scrolled
                    ? "text-esenza-text-mid hover:text-esenza-text"
                    : "text-white/80 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
              >
                {link.label}
              </a>
            ))}

            {/* CTA — reservar */}
            <a
              href="https://wa.me/573001234567?text=Hola!%20Quiero%20reservar%20en%20Esenza"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-2 text-[11px] font-medium tracking-[0.18em] uppercase px-5 py-2.5 border transition-all duration-300 ${
                scrolled
                  ? "border-esenza-text text-esenza-text hover:bg-esenza-text hover:text-esenza-cream"
                  : "border-white/60 text-white hover:bg-white/10 hover:border-white"
              }`}
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              Reservar
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden z-50 w-8 h-8 flex flex-col justify-center items-center gap-[5px]"
            aria-label="Menú"
          >
            <span
              className={`block h-px w-6 transition-all duration-300 ${
                menuOpen
                  ? "rotate-45 translate-y-[7px] bg-esenza-text"
                  : scrolled
                  ? "bg-esenza-text"
                  : "bg-white"
              }`}
            />
            <span
              className={`block h-px w-6 transition-all duration-300 ${
                menuOpen
                  ? "opacity-0"
                  : scrolled
                  ? "bg-esenza-text"
                  : "bg-white"
              }`}
            />
            <span
              className={`block h-px w-6 transition-all duration-300 ${
                menuOpen
                  ? "-rotate-45 -translate-y-[7px] bg-esenza-text"
                  : scrolled
                  ? "bg-esenza-text"
                  : "bg-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu — full screen overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-esenza-cream transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {/* Logo in menu */}
          <span
            className="font-heading text-3xl text-esenza-text mb-4"
            style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
          >
            Esenza
          </span>

          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] tracking-[0.2em] uppercase text-esenza-text-mid hover:text-esenza-text transition-colors"
              style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
            >
              {link.label}
            </a>
          ))}

          <a
            href="https://wa.me/573001234567?text=Hola!%20Quiero%20reservar%20en%20Esenza"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-6 border border-esenza-text text-esenza-text text-[12px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-esenza-text hover:text-esenza-cream transition-all duration-300"
            style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
          >
            Reservar
          </a>
        </div>
      </div>
    </nav>
  );
}
