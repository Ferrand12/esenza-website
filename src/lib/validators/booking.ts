import { z } from "zod";

export const packageSchema = z.enum(["esencia", "armonia", "plenitud"]);
export type Package = z.infer<typeof packageSchema>;

export const packagePrices: Record<Package, number> = {
  esencia: 350_000,
  armonia: 650_000,
  plenitud: 900_000,
};

export const createBookingSchema = z
  .object({
    check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    num_guests: z.coerce.number().int().min(1).max(20),
    package: packageSchema,
    guest: z.object({
      full_name: z.string().trim().min(2, "Nombre requerido"),
      email: z.string().email("Email inválido"),
      phone: z
        .string()
        .trim()
        .min(7, "Teléfono requerido")
        .max(20),
      country: z.string().trim().optional(),
    }),
    special_requests: z.string().trim().max(2000).optional(),
  })
  .refine(
    (d) => new Date(d.check_out) > new Date(d.check_in),
    {
      message: "La fecha de salida debe ser posterior a la de entrada",
      path: ["check_out"],
    },
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function calculateTotalPrice(
  pkg: Package,
  checkIn: string,
  checkOut: string,
): number {
  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return packagePrices[pkg] * nights;
}
