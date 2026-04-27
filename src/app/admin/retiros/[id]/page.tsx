import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  retreat_type: string | null;
  motivation: string | null;
  traveling_from_out_of_town: boolean;
  arrival_details: string | null;
  dietary_restrictions: string | null;
  injuries_notes: string | null;
  ground_transport: "yes" | "no" | "unknown";
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  additional_notes: string | null;
  waiver_accepted: boolean;
  signature: string | null;
  language: "es" | "en";
  status: "nuevo" | "confirmada" | "cancelada";
  guest_id: string | null;
  booking_id: string | null;
  created_at: string;
};

export default async function RetreatDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: reg } = await supabase
    .from("retreat_registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle<Registration>();

  if (!reg) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/retiros"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Volver
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="font-editorial text-4xl text-primary">
          {reg.full_name}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Inscripción recibida el{" "}
          {new Date(reg.created_at).toLocaleString("es-CO")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Contacto">
          <Row label="Email">
            <a
              href={`mailto:${reg.email}`}
              className="text-primary hover:underline break-all"
            >
              {reg.email}
            </a>
          </Row>
          <Row label="Teléfono">
            <a
              href={`https://wa.me/${reg.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {reg.phone}
            </a>
          </Row>
          <Row label="País">{reg.country}</Row>
          <Row label="Idioma">{reg.language.toUpperCase()}</Row>
        </Section>

        <Section title="Retiro">
          <Row label="Tipo de retiro">{reg.retreat_type ?? "—"}</Row>
          <Row label="Viene de fuera de Bogotá">
            {reg.traveling_from_out_of_town ? "Sí" : "No"}
          </Row>
          <Row label="Transporte terrestre">
            {reg.ground_transport === "yes"
              ? "Sí, necesita transporte"
              : reg.ground_transport === "no"
                ? "No, usa transporte propio"
                : "No está seguro"}
          </Row>
          {reg.arrival_details && (
            <Row label="Detalles de llegada">
              <span className="whitespace-pre-wrap">
                {reg.arrival_details}
              </span>
            </Row>
          )}
        </Section>

        {reg.motivation && (
          <FullSection title="Motivación">
            <p className="whitespace-pre-wrap text-sm text-stone-800">
              {reg.motivation}
            </p>
          </FullSection>
        )}

        {reg.dietary_restrictions && (
          <FullSection title="Restricciones alimentarias">
            <p className="whitespace-pre-wrap text-sm text-stone-800">
              {reg.dietary_restrictions}
            </p>
          </FullSection>
        )}

        {reg.injuries_notes && (
          <FullSection title="Lesiones / notas de movimiento">
            <p className="whitespace-pre-wrap text-sm text-stone-800">
              {reg.injuries_notes}
            </p>
          </FullSection>
        )}

        <Section title="Contacto de emergencia">
          <Row label="Nombre">{reg.emergency_contact_name ?? "—"}</Row>
          <Row label="Teléfono">{reg.emergency_contact_phone ?? "—"}</Row>
        </Section>

        <Section title="Acuerdo de responsabilidad">
          <Row label="Aceptado">{reg.waiver_accepted ? "Sí" : "No"}</Row>
          <Row label="Firma">{reg.signature ?? "—"}</Row>
        </Section>

        {reg.additional_notes && (
          <FullSection title="Notas adicionales">
            <p className="whitespace-pre-wrap text-sm text-stone-800">
              {reg.additional_notes}
            </p>
          </FullSection>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-editorial text-lg text-primary mb-3">{title}</h2>
      <dl className="space-y-3 text-sm">{children}</dl>
    </section>
  );
}

function FullSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-editorial text-lg text-primary mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-stone-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-stone-900">{children}</dd>
    </div>
  );
}
