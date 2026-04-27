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
import { getPublicImages } from "@/lib/site-images";
import { createClient } from "@/lib/supabase/server";
import type { FeaturedReview } from "@/components/Testimonials";

export default async function Home() {
  const images = await getPublicImages();
  const supabase = await createClient();
  const [{ data: featured }, { data: allApproved }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, display_name, title, content, rating")
      .eq("status", "featured")
      .order("submitted_at", { ascending: false })
      .limit(4)
      .returns<
        {
          id: string;
          display_name: string;
          title: string | null;
          content: string;
          rating: number;
        }[]
      >(),
    supabase
      .from("reviews")
      .select("rating")
      .in("status", ["approved", "featured"])
      .returns<{ rating: number }[]>(),
  ]);
  const reviews: FeaturedReview[] = (featured ?? []).map((r) => ({
    id: r.id,
    name: r.display_name,
    title: r.title,
    text: r.content,
    rating: r.rating,
  }));
  const ratings = allApproved ?? [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : 0;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://esenza.co";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Esenza",
    description:
      "Eco-lodge de wellness en Cundinamarca, Colombia. Naturaleza, reconexión y descanso.",
    url: siteUrl,
    image: `${siteUrl}/images/hero-paisaje.webp`,
    telephone: "+57 300 123 4567",
    priceRange: "$$-$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cundinamarca",
      addressCountry: "CO",
    },
    ...(ratings.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        reviewCount: ratings.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero images={images} />
      <About images={images} />
      <Services />
      <Hospedaje images={images} />
      <Retiros />
      <Eventos images={images} />
      <Packages />
      <Ubicacion />
      <Gallery images={images} />
      <Testimonials reviews={reviews} />
      <FAQ />
      <Contact images={images} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
