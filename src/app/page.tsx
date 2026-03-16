import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Retiros from "@/components/Retiros";
import Hospedaje from "@/components/Hospedaje";
import Ubicacion from "@/components/Ubicacion";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Retiros />
      <Hospedaje />
      <Ubicacion />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
