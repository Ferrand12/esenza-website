import { z } from "zod";

export const PACKAGE_KEYS = [
  "escapada_basica",
  "esencia",
  "armonia",
  "plenitud", // legacy, no se ofrece en nuevas reservas pero permitido en DB
] as const;

export const packageSchema = z.enum([
  "escapada_basica",
  "esencia",
  "armonia",
]);
export type Package = z.infer<typeof packageSchema>;

// Legacy type que incluye plenitud — usado para lectura de reservas antiguas
export type PackageAny =
  | "escapada_basica"
  | "esencia"
  | "armonia"
  | "plenitud";

export type PackageDef = {
  label: string;
  subtitle: string;
  base_price_per_person: number;
  extra_night_per_person: number;
  min_guests: number;
  base_nights: number;
  features: string[];
};

// Defaults — se sobreescriben por site_config.packages_v2 si existe
export const PACKAGE_DEFAULTS: Record<Package, PackageDef> = {
  escapada_basica: {
    label: "Escapada Básica",
    subtitle: "Descanso total",
    base_price_per_person: 400_000,
    extra_night_per_person: 100_000,
    min_guests: 8,
    base_nights: 1,
    features: [
      "Finca completa",
      "Desayuno, almuerzo y cena campesina",
      "Recuerdos que duran toda la vida",
    ],
  },
  esencia: {
    label: "Esencia",
    subtitle: "Experiencias · 2 días",
    base_price_per_person: 480_000,
    extra_night_per_person: 200_000,
    min_guests: 8,
    base_nights: 1,
    features: [
      "Todo lo de Escapada Básica",
      "Snack de bienvenida el viernes",
      "Caminata guiada por senderos naturales",
      "Noche de fogata, música y estrellas",
    ],
  },
  armonia: {
    label: "Armonía",
    subtitle: "Experiencias · 2 días",
    base_price_per_person: 500_000,
    extra_night_per_person: 200_000,
    min_guests: 8,
    base_nights: 1,
    features: [
      "Todo lo de Esencia",
      "Clase de Yoga privada (mínimo 4 personas)",
    ],
  },
};

export const createBookingSchema = z
  .object({
    check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    num_guests: z.coerce.number().int().min(1).max(30),
    package: packageSchema,
    guest: z.object({
      full_name: z.string().trim().min(2, "Nombre requerido"),
      email: z.string().email("Email inválido"),
      phone: z.string().trim().min(7, "Teléfono requerido").max(20),
      country: z.string().trim().optional(),
    }),
    special_requests: z.string().trim().max(2000).optional(),
  })
  .refine((d) => new Date(d.check_out) > new Date(d.check_in), {
    message: "La fecha de salida debe ser posterior a la de entrada",
    path: ["check_out"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function nightsBetween(ci: string, co: string): number {
  return Math.max(
    0,
    Math.round(
      (new Date(co).getTime() - new Date(ci).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

/**
 * Calcula el precio total bajo el modelo nuevo:
 *   total = num_guests × base_price_per_person
 *         + num_guests × max(0, nights - base_nights) × extra_night_per_person
 *
 * Si no recibe defs custom, usa PACKAGE_DEFAULTS.
 */
export function calculateTotalPrice(
  pkg: Package,
  checkIn: string,
  checkOut: string,
  numGuests: number,
  defs: Record<Package, PackageDef> = PACKAGE_DEFAULTS,
): number {
  const def = defs[pkg];
  const nights = nightsBetween(checkIn, checkOut);
  const extraNights = Math.max(0, nights - def.base_nights);
  return (
    numGuests *
      (def.base_price_per_person + extraNights * def.extra_night_per_person) ||
    0
  );
}

/**
 * Legacy shim para código que solo pasa (pkg, checkIn, checkOut)
 * antes del rework. Asume num_guests mínimo del paquete.
 */
export function calculateTotalPriceLegacy(
  pkg: Package,
  checkIn: string,
  checkOut: string,
): number {
  const def = PACKAGE_DEFAULTS[pkg];
  return calculateTotalPrice(pkg, checkIn, checkOut, def.min_guests);
}

// Backwards-compat: algunos consumers viejos referencian packagePrices (legacy flat map)
export const packagePrices: Record<Package, number> = {
  escapada_basica: PACKAGE_DEFAULTS.escapada_basica.base_price_per_person,
  esencia: PACKAGE_DEFAULTS.esencia.base_price_per_person,
  armonia: PACKAGE_DEFAULTS.armonia.base_price_per_person,
};
