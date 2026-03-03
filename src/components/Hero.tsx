export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background image placeholder - replace with actual image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {/* Mountain icon SVG */}
        <svg
          className="mb-4 h-16 w-24 opacity-80 animate-fade-in"
          viewBox="0 0 120 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 55 L50 15 L80 55" />
          <path d="M50 55 L75 20 L100 55" />
        </svg>

        <h1 className="font-script text-6xl md:text-8xl lg:text-9xl opacity-0 animate-fade-in-up">
          Esenza
        </h1>

        <p className="mt-2 text-lg md:text-xl tracking-[0.3em] uppercase font-light opacity-0 animate-fade-in-up animation-delay-200">
          Natural Wellness Stay
        </p>

        <div className="mt-6 h-px w-24 bg-esenza-gold opacity-0 animate-fade-in animation-delay-400" />

        <p className="mt-6 font-script text-2xl md:text-3xl text-esenza-gold opacity-0 animate-fade-in-up animation-delay-400">
          Naturaleza, reconexión y descanso
        </p>

        <p className="mt-4 max-w-lg text-base md:text-lg font-light leading-relaxed opacity-0 animate-fade-in-up animation-delay-600">
          Bienestar y salud, con más energía, equilibrio y vitalidad.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up animation-delay-600">
          <a
            href="#paquetes"
            className="rounded-full bg-esenza-green px-8 py-3 text-sm font-semibold tracking-widest uppercase text-white transition-all duration-300 hover:bg-esenza-green-dark hover:shadow-xl hover:scale-105"
          >
            Explorar Paquetes
          </a>
          <a
            href="#nosotros"
            className="rounded-full border-2 border-white/60 px-8 py-3 text-sm font-semibold tracking-widest uppercase text-white transition-all duration-300 hover:bg-white/10 hover:border-white"
          >
            Conocer Más
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-8 w-8 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
