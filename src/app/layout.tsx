import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
      <body
        className={`${cormorant.variable} ${dmSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-dm-sans, DM Sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
