"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  calculateTotalPrice,
  packagePrices,
  type Package,
} from "@/lib/validators/booking";

const guestSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().trim().min(7, "Teléfono requerido"),
  country: z.string().trim().optional(),
  special_requests: z.string().trim().max(2000).optional(),
});

type GuestInput = z.infer<typeof guestSchema>;

interface Props {
  checkIn: string;
  checkOut: string;
  numGuests: number;
  selectedPackage: Package;
  onSuccess: (bookingId: string) => void;
  onBack: () => void;
}

const packageNames: Record<Package, string> = {
  escapada_basica: "Escapada Básica",
  esencia: "Esencia",
  armonia: "Armonía",
};

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-CO")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GuestForm({
  checkIn,
  checkOut,
  numGuests,
  selectedPackage,
  onSuccess,
  onBack,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = calculateTotalPrice(
    selectedPackage,
    checkIn,
    checkOut,
    numGuests,
  );
  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
  });

  async function onSubmit(data: GuestInput) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          check_in: checkIn,
          check_out: checkOut,
          num_guests: numGuests,
          package: selectedPackage,
          guest: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            country: data.country || undefined,
          },
          special_requests: data.special_requests || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Error al crear la reserva");
        return;
      }

      onSuccess(result.id);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-editorial text-2xl text-primary mb-2">
        Tus datos
      </h2>
      <p className="text-sm text-stone-500 mb-8">
        Completa tu información para confirmar la reserva.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:col-span-2 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Nombre completo *
              </label>
              <input
                {...register("full_name")}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Teléfono (WhatsApp) *
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="+57 300 123 4567"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                País
              </label>
              <input
                {...register("country")}
                placeholder="Colombia"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Comentarios o peticiones especiales
            </label>
            <textarea
              {...register("special_requests")}
              rows={3}
              placeholder="Dietas especiales, alergias, hora estimada de llegada..."
              className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 border border-stone-300 rounded-full text-sm font-label uppercase tracking-widest hover:bg-stone-50 transition-colors"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-12 py-3 bg-primary text-white rounded-full font-label text-sm uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Confirmar reserva"}
            </button>
          </div>
        </form>

        {/* Summary */}
        <div className="bg-surface-container-low rounded-xl p-6 h-fit">
          <h3 className="font-editorial text-lg text-primary mb-4">
            Resumen
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Check-in</span>
              <span className="font-medium">{formatDate(checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Check-out</span>
              <span className="font-medium">{formatDate(checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Noches</span>
              <span className="font-medium">{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Huéspedes</span>
              <span className="font-medium">{numGuests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Paquete</span>
              <span className="font-medium">
                {packageNames[selectedPackage]}
              </span>
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>
                {formatPrice(packagePrices[selectedPackage])} /pax × {numGuests}{" "}
                {numGuests === 1 ? "persona" : "personas"}
                {nights > 1 ? ` · ${nights - 1} noche(s) extra` : ""}
              </span>
            </div>
            <div className="pt-3 border-t border-stone-300">
              <div className="flex justify-between">
                <span className="font-medium text-primary">Total</span>
                <span className="font-headline text-xl text-primary font-semibold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
