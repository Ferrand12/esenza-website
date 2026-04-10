"use client";

import { useEffect, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import {
  addMonths,
  format,
  eachDayOfInterval,
  parseISO,
  isBefore,
  startOfDay,
} from "date-fns";

interface BlockedRange {
  from: string;
  to: string;
}

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  numGuests: number;
  onSelect: (checkIn: string, checkOut: string, numGuests: number) => void;
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  numGuests: initialGuests,
  onSelect,
}: Props) {
  const [range, setRange] = useState<DateRange | undefined>(
    checkIn && checkOut
      ? { from: parseISO(checkIn), to: parseISO(checkOut) }
      : undefined,
  );
  const [numGuests, setNumGuests] = useState(initialGuests);
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      const from = format(new Date(), "yyyy-MM-dd");
      const to = format(addMonths(new Date(), 12), "yyyy-MM-dd");

      try {
        const res = await fetch(
          `/api/bookings/availability?from=${from}&to=${to}`,
        );
        const data = await res.json();

        const days: Date[] = [];
        for (const range of data.blockedRanges || []) {
          const interval = eachDayOfInterval({
            start: parseISO(range.from),
            end: parseISO(range.to),
          });
          // exclude the checkout day (it's available for new check-in)
          days.push(...interval.slice(0, -1));
        }
        setBlockedDays(days);
      } catch (e) {
        console.error("Error fetching availability:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, []);

  const today = startOfDay(new Date());
  const canContinue = range?.from && range?.to;

  const nights =
    range?.from && range?.to
      ? Math.round(
          (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

  return (
    <div>
      <h2 className="font-editorial text-2xl text-primary mb-2">
        Selecciona tus fechas
      </h2>
      <p className="text-sm text-stone-500 mb-8">
        Elige tu fecha de llegada y salida. Las fechas en gris no están
        disponibles.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            locale={es}
            numberOfMonths={2}
            disabled={[
              { before: today },
              ...blockedDays.map((d) => d),
            ]}
            fromMonth={today}
            toMonth={addMonths(today, 12)}
            classNames={{
              root: "text-sm",
              months: "flex flex-col md:flex-row gap-8",
              month_caption: "font-editorial text-lg text-primary mb-4 text-center",
              nav: "flex gap-1",
              button_previous: "p-1 hover:bg-stone-100 rounded",
              button_next: "p-1 hover:bg-stone-100 rounded",
              weekdays: "flex",
              weekday: "w-10 text-center text-xs font-medium text-stone-500 py-2",
              week: "flex",
              day: "w-10 h-10 text-center",
              day_button:
                "w-full h-full rounded-full hover:bg-primary/10 transition-colors flex items-center justify-center",
              selected:
                "bg-primary text-white rounded-full",
              range_start: "bg-primary text-white rounded-full",
              range_end: "bg-primary text-white rounded-full",
              range_middle: "bg-primary/10",
              disabled: "text-stone-300 line-through",
              today: "font-bold text-secondary",
            }}
          />

          {range?.from && range?.to && (
            <div className="mt-8 text-center">
              <p className="text-sm text-stone-600">
                {format(range.from, "d MMM yyyy", { locale: es })} →{" "}
                {format(range.to, "d MMM yyyy", { locale: es })}
                <span className="ml-2 font-medium text-primary">
                  ({nights} {nights === 1 ? "noche" : "noches"})
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Number of guests */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <label className="text-sm text-stone-700 font-medium">
          Número de huéspedes:
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
            className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
          >
            -
          </button>
          <span className="font-medium text-lg w-8 text-center">
            {numGuests}
          </span>
          <button
            type="button"
            onClick={() => setNumGuests(Math.min(20, numGuests + 1))}
            className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-10 flex justify-center">
        <button
          disabled={!canContinue}
          onClick={() => {
            if (range?.from && range?.to) {
              onSelect(
                format(range.from, "yyyy-MM-dd"),
                format(range.to, "yyyy-MM-dd"),
                numGuests,
              );
            }
          }}
          className="px-12 py-4 bg-primary text-white rounded-full font-label text-sm uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
