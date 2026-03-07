"use client";

import { SimpleTree } from "@/components/ui/simple-growth-tree";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Tree animation background */}
      <SimpleTree
        className="absolute inset-0 w-full h-full"
        bgColor="#014023"
        treeHueMin={75}
        treeHueMax={110}
        opacity={0.85}
        scale={1.6}
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Content — 4 elements only: name, tagline, slogan, CTA */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="font-script text-7xl md:text-8xl lg:text-9xl opacity-0 animate-fade-in-up">
          Esenza
        </h1>

        <p className="mt-3 text-sm md:text-base tracking-[0.35em] uppercase font-light opacity-0 animate-fade-in-up animation-delay-200">
          Natural Wellness Stay
        </p>

        <p className="mt-8 max-w-md font-heading text-xl md:text-2xl font-light leading-relaxed text-white/90 opacity-0 animate-fade-in-up animation-delay-400">
          Naturaleza, reconexión y descanso
        </p>

        <a
          href="#paquetes"
          className="mt-10 rounded-full border border-white/40 px-10 py-3.5 text-[13px] font-medium tracking-widest uppercase text-white transition-all duration-500 hover:bg-white/10 hover:border-white opacity-0 animate-fade-in-up animation-delay-600"
        >
          Descubre tu experiencia
        </a>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in animation-delay-600">
          <div className="h-10 w-[1px] bg-gradient-to-b from-transparent to-white/40" />
        </div>
      </div>
    </section>
  );
}
