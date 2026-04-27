import {
  KNOWN_SLOTS,
  getSiteImagesMap,
  resolveImage,
} from "@/lib/site-images";
import PhotoSlotCard from "@/components/admin/PhotoSlotCard";

// Group slots by section for rendering.
const SECTION_ORDER = [
  "hero",
  "about",
  "hospedaje",
  "gallery",
  "eventos",
  "contact",
] as const;

const SECTION_LABEL: Record<string, string> = {
  hero: "Hero principal",
  about: "Sobre Esenza",
  hospedaje: "Hospedaje",
  gallery: "Galería",
  eventos: "Eventos",
  contact: "Contacto",
};

export default async function FotosPage() {
  const imagesMap = await getSiteImagesMap();

  const bySection = new Map<string, typeof KNOWN_SLOTS>();
  for (const section of SECTION_ORDER) {
    bySection.set(
      section,
      KNOWN_SLOTS.filter((s) => s.section === section) as typeof KNOWN_SLOTS,
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-editorial text-4xl text-primary">Fotos del sitio</h1>
        <p className="mt-1 text-stone-600 text-sm max-w-2xl">
          Reemplazá las imágenes que aparecen en la web sin tocar código. Si no
          subís nada, se muestra la imagen original. Formatos: JPG, PNG, WebP o
          AVIF (máx 8 MB).
        </p>
      </div>

      <div className="space-y-12">
        {SECTION_ORDER.map((section) => {
          const slots = bySection.get(section) ?? [];
          if (slots.length === 0) return null;
          return (
            <section key={section}>
              <h2 className="font-editorial text-2xl text-primary mb-4">
                {SECTION_LABEL[section]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {slots.map((s) => {
                  const row = imagesMap.get(`${s.section}/${s.slot}`);
                  const resolved = resolveImage(
                    imagesMap,
                    s.section,
                    s.slot,
                    s.label,
                  );
                  return (
                    <PhotoSlotCard
                      key={`${s.section}/${s.slot}`}
                      section={s.section}
                      slot={s.slot}
                      label={s.label}
                      description={s.description}
                      aspect={s.aspect}
                      currentUrl={resolved.url}
                      currentAlt={row?.alt_text ?? ""}
                      isCustom={resolved.isCustom}
                      updatedAt={row?.updated_at ?? null}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
