import Anthropic from "@anthropic-ai/sdk";

const MODEL_CLASSIFY = "claude-haiku-4-5-20251001";
const MODEL_DRAFT = "claude-sonnet-4-6";
const MODEL_SENTIMENT = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;
export function aiAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic | null {
  if (!aiAvailable()) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// ----------------------------------------------------------------------------
// Classify PQRSF — guess type + thematic area + sentiment
// ----------------------------------------------------------------------------

export type ComplaintClassification = {
  suggested_type: string;
  area: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative" | "urgent";
};

export async function classifyComplaintIfAvailable(input: {
  subject: string;
  description: string;
}): Promise<ComplaintClassification | null> {
  const c = getClient();
  if (!c) return null;

  try {
    const res = await c.messages.create({
      model: MODEL_CLASSIFY,
      max_tokens: 400,
      system:
        "Clasificás solicitudes PQRSF de un eco-lodge de bienestar. Respondés únicamente con JSON válido, sin texto extra.",
      messages: [
        {
          role: "user",
          content: `Clasificá esta solicitud.

Tipos válidos: peticion, queja, reclamo, sugerencia, felicitacion.
Áreas temáticas posibles: servicio, habitacion, comida, staff, limpieza, ruido, precio, reserva, facturacion, otra.
Sentiment: positive, neutral, negative, urgent.

Asunto: ${input.subject}
Descripción: ${input.description}

Responde en JSON con este schema:
{
  "suggested_type": "<uno de los tipos>",
  "area": "<una área>",
  "summary": "<resumen en 1 oración corta, máx 120 chars>",
  "sentiment": "<positive|neutral|negative|urgent>"
}`,
        },
      ],
    });

    const text =
      res.content[0]?.type === "text" ? res.content[0].text : "";
    const parsed = extractJson(text);
    if (
      parsed &&
      typeof parsed.suggested_type === "string" &&
      typeof parsed.area === "string" &&
      typeof parsed.summary === "string" &&
      typeof parsed.sentiment === "string" &&
      ["positive", "neutral", "negative", "urgent"].includes(parsed.sentiment)
    ) {
      return {
        suggested_type: parsed.suggested_type,
        area: parsed.area,
        summary: parsed.summary,
        sentiment: parsed.sentiment as ComplaintClassification["sentiment"],
      };
    }
    return null;
  } catch (e) {
    console.error("[ai] classifyComplaint:", e);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Draft PQRSF response
// ----------------------------------------------------------------------------

export async function draftComplaintResponseIfAvailable(input: {
  type: string;
  subject: string;
  description: string;
  guestName: string;
  trackingCode: string;
  examples?: { subject: string; description: string; resolution: string }[];
}): Promise<string | null> {
  const c = getClient();
  if (!c) return null;

  const examplesBlock = (input.examples ?? [])
    .slice(0, 3)
    .map(
      (ex, i) =>
        `Caso ${i + 1}\nAsunto: ${ex.subject}\nDescripción: ${ex.description}\nRespuesta dada: ${ex.resolution}`,
    )
    .join("\n\n---\n\n");

  try {
    const res = await c.messages.create({
      model: MODEL_DRAFT,
      max_tokens: 600,
      system: `Sos el owner de Esenza, un eco-lodge de bienestar en Cundinamarca, Colombia. Redactás respuestas formales pero cálidas a PQRSF, en español de Colombia. El tono es profesional, empático y humano.

Reglas:
- Dirigirse al huésped por su nombre.
- Reconocer el problema/pedido con empatía.
- Si aplica, pedir disculpas concretas.
- Proponer una acción concreta o compensación razonable.
- Cerrar invitando a seguir la conversación.
- Máximo 5 párrafos cortos.
- No inventar hechos — si falta info, decilo.
- No mencionar que sos AI.
- No incluir saludos genéricos tipo "estimado usuario".`,
      messages: [
        {
          role: "user",
          content: `Redactá una respuesta para esta ${input.type}.

Código: ${input.trackingCode}
De: ${input.guestName}
Asunto: ${input.subject}
Descripción: ${input.description}

${examplesBlock ? `Ejemplos de respuestas previas para casos similares:\n\n${examplesBlock}\n\n` : ""}Redactá el texto de la respuesta (sin firma — el sistema agrega "El equipo de Esenza").`,
        },
      ],
    });

    const text =
      res.content[0]?.type === "text" ? res.content[0].text.trim() : "";
    return text || null;
  } catch (e) {
    console.error("[ai] draftComplaintResponse:", e);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Review sentiment + tags
// ----------------------------------------------------------------------------

export type ReviewAnalysis = {
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];
};

export async function analyzeReviewIfAvailable(input: {
  rating: number;
  title: string | null;
  content: string;
}): Promise<ReviewAnalysis | null> {
  const c = getClient();
  if (!c) return null;

  try {
    const res = await c.messages.create({
      model: MODEL_SENTIMENT,
      max_tokens: 200,
      system:
        "Analizás reseñas de huéspedes de un eco-lodge. Respondés únicamente con JSON.",
      messages: [
        {
          role: "user",
          content: `Analizá esta reseña.

Rating: ${input.rating}/5
Título: ${input.title ?? "(sin título)"}
Contenido: ${input.content}

Devuelve JSON con:
{
  "sentiment": "positive" | "neutral" | "negative",
  "tags": ["<máx 5 tags cortos de 1-2 palabras que capturen los temas principales>"]
}

Tags ejemplos: "comida", "silencio", "ruido", "staff", "limpieza", "yoga", "piscina", "vista", "precio", "aniversario", "desayuno", "wifi".`,
        },
      ],
    });

    const text =
      res.content[0]?.type === "text" ? res.content[0].text : "";
    const parsed = extractJson(text);
    if (
      parsed &&
      typeof parsed.sentiment === "string" &&
      ["positive", "neutral", "negative"].includes(parsed.sentiment) &&
      Array.isArray(parsed.tags)
    ) {
      return {
        sentiment: parsed.sentiment as ReviewAnalysis["sentiment"],
        tags: (parsed.tags as unknown[])
          .filter((t): t is string => typeof t === "string")
          .slice(0, 5)
          .map((t) => t.toLowerCase().slice(0, 30)),
      };
    }
    return null;
  } catch (e) {
    console.error("[ai] analyzeReview:", e);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
