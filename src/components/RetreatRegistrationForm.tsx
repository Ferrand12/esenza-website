"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "es" | "en";

const RETREAT_TYPES = [
  { key: "yoga", es: "Yoga y Meditación", en: "Yoga & Meditation" },
  {
    key: "digital_detox",
    es: "Desintoxicación Digital",
    en: "Digital Detox",
  },
  { key: "purpose", es: "Propósito / Ikigai", en: "Purpose / Ikigai" },
  { key: "corporate", es: "Corporativo", en: "Corporate" },
];

const L = {
  es: {
    language: "Idioma",
    fullName: "Nombre completo",
    email: "Email",
    phone: "Teléfono",
    country: "País donde vives",
    retreatType: "¿Qué retiro te interesa?",
    motivation: "¿Qué te motivó a inscribirte?",
    traveling: "¿Viajás desde fuera de Bogotá?",
    arrivalDetails:
      "Si sí, indicanos tu fecha de llegada a Bogotá y tu vuelo (no incluimos transporte del aeropuerto, pero queremos estar pendientes).",
    dietary:
      "¿Tenés alguna restricción, alergia o preferencia en tu alimentación?",
    injuries:
      "¿Tuviste alguna lesión reciente o hay algo que debamos saber para las sesiones de movimiento?",
    groundTransport:
      "¿Necesitás transporte terrestre para llegar al retiro? (USD 40/persona por trayecto)",
    yes: "Sí",
    no: "No, uso mi propio medio",
    unknown: "Todavía no sé",
    emergencyName: "Nombre de contacto de emergencia",
    emergencyPhone: "Teléfono de contacto de emergencia",
    additional: "¿Hay algo más que quieras contarnos?",
    waiver: `Al participar en este retiro, reconozco que me hago responsable de mi propia salud, seguridad y bienestar durante todas las actividades, sesiones e interacciones, y acepto seguir todas las pautas e instrucciones proporcionadas por los facilitadores para asegurar una experiencia segura. Entiendo que el retiro puede implicar ejercicios físicos, mentales y emocionales, y asumo plena responsabilidad por cualquier resultado que esto pueda implicar. En consideración a ser autorizado a participar, libero, renuncio y eximo a los facilitadores, organizadores y partes afiliadas de cualquier responsabilidad, reclamación o acción relacionada con cualquier pérdida, daño o lesión sufridos durante el retiro, incluyendo aquellos derivados de negligencia. Confirmo que he leído, entendido y acepto este acuerdo de exención de responsabilidad.`,
    agree: "Estoy de acuerdo",
    signature: "Firma (escribí tu nombre)",
    submit: "Enviar inscripción",
    submitting: "Enviando…",
    required: "*",
    optional: "(opcional)",
  },
  en: {
    language: "Language",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    country: "Country of residence",
    retreatType: "Which retreat?",
    motivation: "What motivated you to sign up?",
    traveling: "Will you be traveling from out of town?",
    arrivalDetails:
      "If so, please indicate your arrival date in Bogotá and flight number (airport pickup not included, but we want to know about your arrival).",
    dietary: "Do you have any dietary restrictions or allergies?",
    injuries:
      "Any recent injuries or anything we should know about for movement sessions?",
    groundTransport:
      "Will you need ground transportation to arrive? (USD 40/person each way)",
    yes: "Yes",
    no: "No, I'll use my own vehicle",
    unknown: "I still don't know",
    emergencyName: "Emergency contact name",
    emergencyPhone: "Emergency contact phone",
    additional: "Anything else you'd like to share?",
    waiver: `By participating in this retreat, I acknowledge that I am solely responsible for my own health, safety, and well-being during all activities, sessions, and interactions, and I agree to follow all guidelines and instructions provided by the facilitators to ensure a safe experience. I understand that the retreat may involve physical, mental, and emotional exercises, and I assume responsibility for any outcomes. In consideration of being permitted to participate, I release, waive, and discharge the facilitators, organizers, and affiliated parties from any liability, claims, or actions related to any loss, damage, or injury sustained during the retreat. I confirm that I have read, understood, and agree to this liability waiver.`,
    agree: "I agree",
    signature: "Signature (type your name)",
    submit: "Submit registration",
    submitting: "Submitting…",
    required: "*",
    optional: "(optional)",
  },
};

export default function RetreatRegistrationForm() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("es");
  const t = L[lang];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [retreatType, setRetreatType] = useState("");
  const [motivation, setMotivation] = useState("");
  const [traveling, setTraveling] = useState(false);
  const [arrivalDetails, setArrivalDetails] = useState("");
  const [dietary, setDietary] = useState("");
  const [injuries, setInjuries] = useState("");
  const [groundTransport, setGroundTransport] = useState<
    "yes" | "no" | "unknown"
  >("unknown");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [additional, setAdditional] = useState("");
  const [waiver, setWaiver] = useState(false);
  const [signature, setSignature] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/retiros/inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          full_name: fullName,
          email,
          phone,
          country,
          retreat_type: retreatType || null,
          motivation: motivation || null,
          traveling_from_out_of_town: traveling,
          arrival_details: arrivalDetails || null,
          dietary_restrictions: dietary || null,
          injuries_notes: injuries || null,
          ground_transport: groundTransport,
          emergency_contact_name: emergencyName || null,
          emergency_contact_phone: emergencyPhone || null,
          additional_notes: additional || null,
          waiver_accepted: waiver,
          signature,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Error al enviar.");
        setLoading(false);
        return;
      }
      router.push("/retiros/inscripcion/gracias");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6"
    >
      <div className="flex items-center justify-end gap-2 border-b border-stone-100 pb-4">
        <span className="text-xs text-stone-500 uppercase tracking-widest mr-2">
          {t.language}
        </span>
        {(["es", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full border text-xs ${
              lang === l
                ? "border-primary bg-primary-container text-white"
                : "border-stone-300 text-stone-700 hover:bg-stone-50"
            }`}
          >
            {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label={t.fullName}
          required
          value={fullName}
          onChange={setFullName}
        />
        <Field
          label={t.email}
          type="email"
          required
          value={email}
          onChange={setEmail}
        />
        <Field label={t.phone} required value={phone} onChange={setPhone} />
        <Field
          label={t.country}
          required
          value={country}
          onChange={setCountry}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          {t.retreatType}
        </label>
        <select
          value={retreatType}
          onChange={(e) => setRetreatType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
        >
          <option value="">—</option>
          {RETREAT_TYPES.map((r) => (
            <option key={r.key} value={r.key}>
              {lang === "es" ? r.es : r.en}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        label={t.motivation}
        value={motivation}
        onChange={setMotivation}
      />

      <div>
        <label className="flex items-center gap-2 text-sm text-stone-900">
          <input
            type="checkbox"
            checked={traveling}
            onChange={(e) => setTraveling(e.target.checked)}
          />
          {t.traveling}
        </label>
        {traveling && (
          <div className="mt-3">
            <Textarea
              label={t.arrivalDetails}
              value={arrivalDetails}
              onChange={setArrivalDetails}
              rows={2}
            />
          </div>
        )}
      </div>

      <Textarea
        label={t.dietary}
        value={dietary}
        onChange={setDietary}
        rows={2}
      />
      <Textarea
        label={t.injuries}
        value={injuries}
        onChange={setInjuries}
        rows={2}
      />

      <div>
        <label className="block text-sm font-medium text-stone-900 mb-2">
          {t.groundTransport}
        </label>
        <div className="flex flex-wrap gap-2">
          {(["yes", "no", "unknown"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setGroundTransport(opt)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                groundTransport === opt
                  ? "border-primary bg-primary-container text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {t[opt]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label={`${t.emergencyName} ${t.optional}`}
          value={emergencyName}
          onChange={setEmergencyName}
        />
        <Field
          label={`${t.emergencyPhone} ${t.optional}`}
          value={emergencyPhone}
          onChange={setEmergencyPhone}
        />
      </div>

      <Textarea
        label={t.additional}
        value={additional}
        onChange={setAdditional}
        rows={3}
      />

      <div className="border-t border-stone-100 pt-6">
        <p className="text-xs text-stone-600 whitespace-pre-wrap leading-relaxed">
          {t.waiver}
        </p>
        <label className="flex items-start gap-3 mt-4 text-sm text-stone-900">
          <input
            type="checkbox"
            checked={waiver}
            onChange={(e) => setWaiver(e.target.checked)}
            required
            className="mt-1"
          />
          <span>{t.agree}</span>
        </label>
      </div>

      <Field
        label={`${t.signature} ${t.required}`}
        required
        value={signature}
        onChange={setSignature}
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !waiver}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined">send</span>
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-900 mb-2">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-900 mb-2">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:border-primary outline-none"
      />
    </div>
  );
}
