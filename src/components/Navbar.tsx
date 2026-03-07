"use client";

import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "#nosotros", label: "Nosotros" },
  {
    href: "#experiencias",
    label: "Experiencias",
    children: [
      { href: "#retiros", label: "Retiros" },
      { href: "#eventos", label: "Eventos" },
      { href: "#hospedaje", label: "Hospedaje" },
    ],
  },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#galeria", label: "Galería" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = (isScrolled: boolean) =>
    `text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 hover:text-esenza-gold ${
      isScrolled ? "text-esenza-green-dark" : "text-white"
    }`;

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
          <a href="#inicio" className="flex items-center">
            <span
              className={`font-script text-3xl transition-colors duration-500 ${
                scrolled ? "text-esenza-green" : "text-white"
              }`}
            >
              Esenza
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`${linkClass(scrolled)} flex items-center gap-1`}
                  >
                    {link.label}
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
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
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-44 rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${
                      dropdownOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-white/95 backdrop-blur-md py-2">
                      {link.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-5 py-2.5 text-[13px] font-medium tracking-wide uppercase text-esenza-green-dark transition-colors hover:bg-esenza-cream hover:text-esenza-gold"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a key={link.href} href={link.href} className={linkClass(scrolled)}>
                  {link.label}
                </a>
              )
            )}
            <a
              href="https://wa.me/573001234567?text=Hola!%20Quiero%20reservar%20en%20Esenza"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rounded-full bg-esenza-green px-6 py-2 text-[13px] font-semibold tracking-wide uppercase text-white transition-all duration-300 hover:bg-esenza-green-dark hover:shadow-lg"
            >
              Reservar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
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
        className={`lg:hidden fixed inset-0 bg-esenza-cream/98 backdrop-blur-lg transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {navLinks.map((link) => (
            <div key={link.href} className="flex flex-col items-center">
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-heading font-light tracking-widest uppercase text-esenza-green-dark hover:text-esenza-gold transition-colors"
              >
                {link.label}
              </a>
              {link.children && (
                <div className="mt-2 flex gap-4">
                  {link.children.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm tracking-wide uppercase text-esenza-text-light hover:text-esenza-gold transition-colors"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a
            href="https://wa.me/573001234567?text=Hola!%20Quiero%20reservar%20en%20Esenza"
            target="_blank"
            rel="noopener noreferrer"
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
