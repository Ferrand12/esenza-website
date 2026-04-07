"use client";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-primary-container"
    >
      <div className="absolute inset-0 z-0">
        <img
          alt="Bosque nuboso en los Andes colombianos"
          className="w-full h-full object-cover opacity-60 scale-105"
          src="/images/hero-paisaje.webp"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary/60" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 className="font-script text-7xl md:text-9xl text-white mb-4 drop-shadow-2xl opacity-0 animate-fade-in-up">
          Esenza
        </h1>
        <p className="font-body text-xs md:text-sm tracking-[0.5em] text-white/90 uppercase mb-8 font-light opacity-0 animate-fade-in-up animation-delay-200">
          Natural Wellness Stay
        </p>
        <h2 className="font-editorial text-3xl md:text-5xl text-white italic font-light mb-12 opacity-0 animate-fade-in-up animation-delay-400">
          Naturaleza, reconexión y descanso
        </h2>
        <a
          href="#paquetes"
          className="inline-block border border-white/30 backdrop-blur-md text-white px-10 py-4 rounded-full font-label text-sm tracking-widest hover:bg-white hover:text-primary transition-all duration-500 uppercase opacity-0 animate-fade-in-up animation-delay-600"
        >
          Descubre tu experiencia
        </a>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-0 animate-fade-in animation-delay-600">
        <span className="material-symbols-outlined text-white text-3xl font-extralight">expand_more</span>
      </div>
    </section>
  );
}
