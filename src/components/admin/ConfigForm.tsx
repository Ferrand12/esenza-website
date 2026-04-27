"use client";

import { useState, useTransition } from "react";
import { updateSiteConfig, type ConfigValues } from "@/app/admin/config/actions";

export default function ConfigForm({ values }: { values: ConfigValues }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "ok"; text: string } | { kind: "error"; text: string } | null
  >(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSiteConfig(formData);
      if (res.ok) {
        setMessage({ kind: "ok", text: "Cambios guardados." });
      } else {
        setMessage({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section
        title="Paquetes y precios"
        description="Precio por noche en pesos colombianos (COP). Se muestran en el sitio público y se usan como sugerencia al crear reservas."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MoneyField
            name="esencia"
            label="Esencia"
            defaultValue={values.packages.esencia}
          />
          <MoneyField
            name="armonia"
            label="Armonía"
            defaultValue={values.packages.armonia}
          />
          <MoneyField
            name="plenitud"
            label="Plenitud"
            defaultValue={values.packages.plenitud}
          />
        </div>
      </Section>

      <Section
        title="Contacto"
        description="Datos visibles en el sitio público y usados en emails transaccionales."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            name="whatsapp"
            label="WhatsApp"
            placeholder="+573001234567"
            defaultValue={values.contact.whatsapp}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="hola@esenza.co"
            defaultValue={values.contact.email}
          />
        </div>
        <TextField
          name="location"
          label="Ubicación"
          placeholder="Km 42 Vía Norte, Cundinamarca"
          defaultValue={values.contact.location}
          full
        />
      </Section>

      <Section
        title="Sincronización Airbnb"
        description="URL del calendario iCal exportado desde Airbnb. Importamos las fechas bloqueadas para evitar sobreventa."
      >
        <TextField
          name="airbnb_ical_url"
          label="URL iCal de Airbnb"
          placeholder="https://www.airbnb.com/calendar/ical/..."
          defaultValue={values.airbnb_ical_url}
          full
        />
        <p className="text-xs text-stone-500">
          Se obtiene en Airbnb → Calendario → Disponibilidad → Exportar calendario.
          Dejalo vacío para desactivar el sync.
        </p>
      </Section>

      <Section
        title="Capacidad"
        description="Número máximo de huéspedes por reserva."
      >
        <div className="max-w-[180px]">
          <TextField
            name="max_guests"
            label="Máx. huéspedes"
            type="number"
            defaultValue={String(values.max_guests)}
          />
        </div>
      </Section>

      <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">save</span>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.kind === "ok" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-editorial text-xl text-primary">{title}</h2>
      <p className="mt-1 text-sm text-stone-600 mb-5">{description}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TextField({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  full,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "w-full" : ""}>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
      />
    </div>
  );
}

function MoneyField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
          $
        </span>
        <input
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          defaultValue={defaultValue.toLocaleString("es-CO")}
          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
        />
      </div>
    </div>
  );
}
