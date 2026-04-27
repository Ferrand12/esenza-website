import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type KnownSlot = {
  section: string;
  slot: string;
  label: string;
  description: string;
  defaultPath: string; // relative to /public
  aspect: "landscape" | "portrait" | "square";
};

export const KNOWN_SLOTS: readonly KnownSlot[] = [
  {
    section: "hero",
    slot: "main",
    label: "Hero principal",
    description: "Imagen grande de fondo en la sección de bienvenida.",
    defaultPath: "/images/hero-paisaje.webp",
    aspect: "landscape",
  },
  {
    section: "about",
    slot: "hero-image",
    label: "Nosotros · Balcón",
    description: "Imagen de la sección 'Sobre Esenza'.",
    defaultPath: "/images/about-balcon.webp",
    aspect: "portrait",
  },
  {
    section: "hospedaje",
    slot: "main",
    label: "Hospedaje · Habitación",
    description: "Imagen principal de la sección de hospedaje.",
    defaultPath: "/images/hospedaje-habitacion.webp",
    aspect: "landscape",
  },
  {
    section: "gallery",
    slot: "1",
    label: "Galería 1 · Piscina de noche",
    description: "Primera imagen de la galería.",
    defaultPath: "/images/gallery-piscina-noche.webp",
    aspect: "portrait",
  },
  {
    section: "gallery",
    slot: "2",
    label: "Galería 2 · Yoga",
    description: "Segunda imagen de la galería.",
    defaultPath: "/images/gallery-yoga.webp",
    aspect: "portrait",
  },
  {
    section: "gallery",
    slot: "3",
    label: "Galería 3 · Piscina de día",
    description: "Tercera imagen de la galería.",
    defaultPath: "/images/gallery-piscina-dia.webp",
    aspect: "portrait",
  },
  {
    section: "gallery",
    slot: "4",
    label: "Galería 4 · Deck de noche",
    description: "Cuarta imagen de la galería.",
    defaultPath: "/images/gallery-deck-noche.webp",
    aspect: "portrait",
  },
  {
    section: "eventos",
    slot: "1",
    label: "Eventos · Sillas de noche",
    description: "Primera imagen de la sección de eventos.",
    defaultPath: "/images/sillas-noche.webp",
    aspect: "landscape",
  },
  {
    section: "eventos",
    slot: "2",
    label: "Eventos · Comedor",
    description: "Segunda imagen de eventos.",
    defaultPath: "/images/comedor.webp",
    aspect: "landscape",
  },
  {
    section: "eventos",
    slot: "3",
    label: "Eventos · Noche de vino",
    description: "Tercera imagen de eventos.",
    defaultPath: "/images/noche-vino.webp",
    aspect: "landscape",
  },
  {
    section: "contact",
    slot: "location",
    label: "Contacto · Ubicación",
    description: "Imagen que acompaña los datos de contacto.",
    defaultPath: "/images/entrada-general.webp",
    aspect: "landscape",
  },
] as const;

export type SiteImageRow = {
  section: string;
  slot: string;
  storage_path: string;
  alt_text: string | null;
  updated_at: string;
};

export type ResolvedImage = {
  url: string;
  alt: string;
  isCustom: boolean;
};

const BUCKET = "site-images";

export function publicStorageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Fetch all custom site images, cached for the request.
 * Returns a Map keyed by "section/slot".
 */
export const getSiteImagesMap = cache(
  async (): Promise<Map<string, SiteImageRow>> => {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("site_images")
        .select("section, slot, storage_path, alt_text, updated_at")
        .returns<SiteImageRow[]>();
      const map = new Map<string, SiteImageRow>();
      for (const row of data ?? []) {
        map.set(`${row.section}/${row.slot}`, row);
      }
      return map;
    } catch {
      return new Map();
    }
  },
);

export function resolveImage(
  map: Map<string, SiteImageRow>,
  section: string,
  slot: string,
  fallbackAlt: string,
): ResolvedImage {
  const known = KNOWN_SLOTS.find(
    (k) => k.section === section && k.slot === slot,
  );
  const row = map.get(`${section}/${slot}`);
  if (row) {
    return {
      url: publicStorageUrl(row.storage_path),
      alt: row.alt_text || fallbackAlt,
      isCustom: true,
    };
  }
  return {
    url: known?.defaultPath ?? `/images/${slot}.webp`,
    alt: fallbackAlt,
    isCustom: false,
  };
}

/** Serializable shape for passing from server → client components. */
export type PublicImages = Record<
  string,
  { url: string; alt: string } | undefined
>;

export async function getPublicImages(): Promise<PublicImages> {
  const map = await getSiteImagesMap();
  const out: PublicImages = {};
  for (const known of KNOWN_SLOTS) {
    const resolved = resolveImage(map, known.section, known.slot, known.label);
    out[`${known.section}/${known.slot}`] = {
      url: resolved.url,
      alt: resolved.alt,
    };
  }
  return out;
}
