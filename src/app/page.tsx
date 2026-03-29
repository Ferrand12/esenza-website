import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Retiros from "@/components/Retiros";
import Eventos from "@/components/Eventos";
import Hospedaje from "@/components/Hospedaje";
import Packages from "@/components/Packages";
import Ubicacion from "@/components/Ubicacion";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
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
      <Eventos />
      <Hospedaje />
      <Packages />
      <Ubicacion />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
