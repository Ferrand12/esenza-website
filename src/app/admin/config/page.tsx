import { createClient } from "@/lib/supabase/server";
import ConfigForm from "@/components/admin/ConfigForm";
import PqrsfTemplatesEditor from "@/components/admin/PqrsfTemplatesEditor";
import type { ConfigValues, ResponseTemplate } from "./actions";

type Row = { key: string; value: unknown };

const DEFAULTS: ConfigValues = {
  packages: { esencia: 350000, armonia: 650000, plenitud: 900000 },
  contact: {
    whatsapp: "+573001234567",
    email: "hola@esenza.co",
    location: "Km 42 Vía Norte, Cundinamarca",
  },
  airbnb_ical_url: "",
  max_guests: 8,
};

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value")
    .returns<Row[]>();

  const byKey = new Map<string, unknown>(
    (data ?? []).map((r) => [r.key, r.value]),
  );

  const packagesRaw = byKey.get("packages") as
    | { esencia?: unknown; armonia?: unknown; plenitud?: unknown }
    | null
    | undefined;
  const contactRaw = byKey.get("contact") as
    | { whatsapp?: unknown; email?: unknown; location?: unknown }
    | null
    | undefined;

  const values: ConfigValues = {
    packages: {
      esencia: toNumber(packagesRaw?.esencia, DEFAULTS.packages.esencia),
      armonia: toNumber(packagesRaw?.armonia, DEFAULTS.packages.armonia),
      plenitud: toNumber(packagesRaw?.plenitud, DEFAULTS.packages.plenitud),
    },
    contact: {
      whatsapp: toString(contactRaw?.whatsapp, DEFAULTS.contact.whatsapp),
      email: toString(contactRaw?.email, DEFAULTS.contact.email),
      location: toString(contactRaw?.location, DEFAULTS.contact.location),
    },
    airbnb_ical_url: toString(
      byKey.get("airbnb_ical_url"),
      DEFAULTS.airbnb_ical_url,
    ),
    max_guests: toNumber(byKey.get("max_guests"), DEFAULTS.max_guests),
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-editorial text-4xl text-primary">Configuración</h1>
      <p className="mt-1 text-stone-600 text-sm">
        Precios, contacto, sync de Airbnb y capacidad. Los cambios se reflejan
        de inmediato en el sitio público.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          Error cargando configuración: {error.message}
        </div>
      )}

      <div className="mt-8 space-y-8">
        <ConfigForm values={values} />
        <PqrsfTemplatesEditor
          initial={
            (Array.isArray(byKey.get("pqrsf_response_templates"))
              ? (byKey.get("pqrsf_response_templates") as ResponseTemplate[])
              : []) ?? []
          }
        />
      </div>
    </div>
  );
}
