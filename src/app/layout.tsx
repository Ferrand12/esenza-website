import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Esenza | Natural Wellness Stay",
  description:
    "Naturaleza, reconexión y descanso. Bienestar y salud, con más energía, equilibrio y vitalidad. Tu refugio natural cerca de Bogotá.",
  keywords: [
    "esenza",
    "wellness",
    "naturaleza",
    "retiros",
    "finca",
    "La Mesa",
    "Cundinamarca",
    "Anapoima",
    "Colombia",
    "hospedaje rural",
    "bienestar",
  ],
  openGraph: {
    title: "Esenza | Natural Wellness Stay",
    description:
      "Naturaleza, reconexión y descanso. Tu refugio natural cerca de Bogotá.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${cormorant.variable} ${greatVibes.variable} ${plusJakarta.variable} ${notoSerif.variable} font-body antialiased`}
      >
        <a href="#nosotros" className="skip-link">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
