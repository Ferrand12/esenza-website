export default function Footer() {
  return (
    <footer className="bg-esenza-green-dark text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
          <span className="font-script text-4xl text-esenza-gold">
            Naturaleza, reconexión y descanso
          </span>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Reserva tu experiencia en Esenza y descubre el poder transformador
            de la naturaleza.
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola!%20Quiero%20reservar%20en%20Esenza"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-esenza-green px-8 py-4 text-sm font-semibold tracking-widest uppercase text-white transition-all duration-300 hover:bg-esenza-gold hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Reservar por WhatsApp
          </a>
        </div>
      </div>

      {/* Footer Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-script text-4xl text-white">Esenza</span>
            <p className="mt-2 text-sm tracking-wider uppercase text-white/60">
              Natural Wellness Stay
            </p>
            <p className="mt-4 text-sm text-white/50 leading-relaxed">
              Bienestar y salud, con más energía, equilibrio y vitalidad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-esenza-gold">
              Navegación
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { href: "#inicio", label: "Inicio" },
                { href: "#nosotros", label: "Nosotros" },
                { href: "#experiencias", label: "Experiencias" },
                { href: "#paquetes", label: "Paquetes" },
                { href: "#galeria", label: "Galería" },
                { href: "#contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-esenza-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-esenza-gold">
              Paquetes
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#paquetes"
                  className="text-sm text-white/60 hover:text-esenza-gold transition-colors"
                >
                  Esencia - 1 Noche
                </a>
              </li>
              <li>
                <a
                  href="#paquetes"
                  className="text-sm text-white/60 hover:text-esenza-gold transition-colors"
                >
                  Armonía - 2 Noches
                </a>
              </li>
              <li>
                <a
                  href="#paquetes"
                  className="text-sm text-white/60 hover:text-esenza-gold transition-colors"
                >
                  Plenitud - 3 Noches
                </a>
              </li>
              <li>
                <a
                  href="#paquetes"
                  className="text-sm text-white/60 hover:text-esenza-gold transition-colors"
                >
                  Personalizado
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-esenza-gold">
              Síguenos
            </h4>
            <div className="mt-4 flex gap-4">
              {/* Instagram */}
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 hover:bg-esenza-gold hover:border-esenza-gold hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 hover:bg-esenza-gold hover:border-esenza-gold hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 hover:bg-esenza-gold hover:border-esenza-gold hover:text-white transition-all duration-300"
                aria-label="TikTok"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-semibold tracking-widest uppercase text-esenza-gold">
                Horario
              </h4>
              <p className="mt-2 text-sm text-white/60">
                Lunes a Domingo
                <br />
                8:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Esenza Natural Wellness Stay.
            Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/40">
            Cundinamarca, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}
