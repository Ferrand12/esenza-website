import { createClient } from "@/lib/supabase/server";
import NuevaReservaForm from "@/components/admin/NuevaReservaForm";

const DEFAULT_MAX_GUESTS = 20;

export default async function NuevaReservaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "max_guests")
    .maybeSingle();

  const maxGuests = Number(data?.value) || DEFAULT_MAX_GUESTS;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-editorial text-4xl text-primary">Nueva reserva</h1>
        <p className="mt-1 text-stone-600 text-sm">
          Registrá una reserva que llegó por teléfono, walk-in o cualquier
          canal fuera de la web.
        </p>
      </div>

      <NuevaReservaForm maxGuests={maxGuests} />
    </div>
  );
}
