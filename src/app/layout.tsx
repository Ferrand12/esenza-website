import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
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
    "descanso",
    "finca",
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
      <body
        className={`${cormorant.variable} ${greatVibes.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
