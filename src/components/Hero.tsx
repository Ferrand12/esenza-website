"use client";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background — gradient orgánico que simula paisaje colombiano cálido */}
      <div
        className="absolute inset-0 animate-slow-pan"
        style={{
          background:
            "linear-gradient(160deg, #2C3D1A 0%, #3D5216 18%, #5C7A28 38%, #4A6020 55%, #2E4012 72%, #1C280C 100%)",
        }}
      />

      {/* Capa de textura orgánica — puntos sutiles */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F5F1EB 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Overlay gradiente hacia abajo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />

      {/* Contenido centrado */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">

        {/* Eyebrow — DM Sans, muy pequeño, mucho tracking */}
        <p
          className="text-[11px] tracking-[0.4em] uppercase text-white/55 opacity-0 animate-fade-in animation-delay-200"
          style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
        >
          Natural Wellness Stay · La Mesa, Colombia
        </p>

        {/* Nombre — Cormorant, enorme, liviano */}
        <h1
          className="mt-5 text-[14vw] md:text-[11vw] lg:text-[9vw] font-light leading-none tracking-wide text-white opacity-0 animate-fade-in-up animation-delay-200"
          style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
        >
          Esenza
        </h1>

        {/* Línea dorada decorativa */}
        <div className="mt-7 h-px w-16 bg-esenza-gold opacity-0 animate-fade-in animation-delay-400" />

        {/* Slogan — Cormorant italic, elegante */}
        <p
          className="mt-6 max-w-sm text-lg md:text-xl font-light leading-relaxed text-white/75 italic opacity-0 animate-fade-in-up animation-delay-400"
          style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond'), Georgia, serif" }}
        >
          Naturaleza, reconexión y descanso
        </p>

        {/* CTA mínimo */}
        <a
          href="#nosotros"
          className="mt-10 text-[11px] tracking-[0.25em] uppercase text-white/70 border border-white/25 px-8 py-3 transition-all duration-400 hover:bg-white/8 hover:border-white/50 hover:text-white opacity-0 animate-fade-in-up animation-delay-600"
          style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
        >
          Descubrir
        </a>
      </div>

      {/* Scroll indicator — línea vertical */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in animation-delay-800">
        <span
          className="text-[9px] tracking-[0.3em] uppercase text-white/35"
          style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
        >
          scroll
        </span>
        <div className="h-12 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
