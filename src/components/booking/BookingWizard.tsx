"use client";

import { useState } from "react";
import DateRangePicker from "./DateRangePicker";
import PackageSelector from "./PackageSelector";
import GuestForm from "./GuestForm";
import type { Package } from "@/lib/validators/booking";

type Step = "dates" | "package" | "guest" | "confirm";

interface BookingState {
  checkIn: string | null;
  checkOut: string | null;
  selectedPackage: Package | null;
  numGuests: number;
}

export default function BookingWizard() {
  const [step, setStep] = useState<Step>("dates");
  const [booking, setBooking] = useState<BookingState>({
    checkIn: null,
    checkOut: null,
    selectedPackage: null,
    numGuests: 2,
  });
  const [bookingId, setBookingId] = useState<string | null>(null);

  const steps: { key: Step; label: string }[] = [
    { key: "dates", label: "Fechas" },
    { key: "package", label: "Paquete" },
    { key: "guest", label: "Datos" },
    { key: "confirm", label: "Confirmación" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i <= currentIdx
                  ? "bg-primary text-white"
                  : "bg-stone-200 text-stone-500"
              }`}
            >
              {i < currentIdx ? (
                <span className="material-symbols-outlined text-base">
                  check
                </span>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm hidden md:inline ${
                i === currentIdx
                  ? "font-medium text-primary"
                  : "text-stone-500"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 md:w-16 h-px ${
                  i < currentIdx ? "bg-primary" : "bg-stone-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12">
        {step === "dates" && (
          <DateRangePicker
            checkIn={booking.checkIn}
            checkOut={booking.checkOut}
            numGuests={booking.numGuests}
            onSelect={(checkIn, checkOut, numGuests) => {
              setBooking((b) => ({ ...b, checkIn, checkOut, numGuests }));
              setStep("package");
            }}
          />
        )}

        {step === "package" && booking.checkIn && booking.checkOut && (
          <PackageSelector
            checkIn={booking.checkIn}
            checkOut={booking.checkOut}
            numGuests={booking.numGuests}
            selected={booking.selectedPackage}
            onSelect={(pkg) => {
              setBooking((b) => ({ ...b, selectedPackage: pkg }));
              setStep("guest");
            }}
            onBack={() => setStep("dates")}
          />
        )}

        {step === "guest" &&
          booking.checkIn &&
          booking.checkOut &&
          booking.selectedPackage && (
            <GuestForm
              checkIn={booking.checkIn}
              checkOut={booking.checkOut}
              numGuests={booking.numGuests}
              selectedPackage={booking.selectedPackage}
              onSuccess={(id) => {
                setBookingId(id);
                setStep("confirm");
              }}
              onBack={() => setStep("package")}
            />
          )}

        {step === "confirm" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl">
                check_circle
              </span>
            </div>
            <h2 className="font-editorial text-3xl text-primary mb-4">
              ¡Reserva recibida!
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-2">
              Hemos recibido tu solicitud. En las próximas horas te
              contactaremos por WhatsApp para confirmar los detalles y coordinar
              tu llegada.
            </p>
            <p className="text-sm text-stone-500 mb-8">
              Código de reserva:{" "}
              <span className="font-mono font-medium">
                {bookingId?.slice(0, 8).toUpperCase()}
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/"
                className="px-8 py-3 border border-stone-300 rounded-full text-sm font-label uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Volver al inicio
              </a>
              <a
                href={`https://wa.me/573001234567?text=Hola! Acabo de hacer una reserva (${bookingId?.slice(0, 8).toUpperCase()}). Quedo atenta a la confirmación.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-green-600 text-white rounded-full text-sm font-label uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
