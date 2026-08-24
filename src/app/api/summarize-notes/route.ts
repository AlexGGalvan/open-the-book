import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type SummaryResponse = {
  title: string;
  mainTheme: string;
  summary: string;
  scriptures: Array<{
    reference: string;
    connection: string;
    confidence: "alta" | "media" | "baja";
  }>;
  keyIdeas: string[];
  connections: string[];
  reflectionPrompt: string;
  detectedText?: string;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "mainTheme",
    "summary",
    "scriptures",
    "keyIdeas",
    "connections",
    "reflectionPrompt",
    "detectedText",
  ],
  properties: {
    title: { type: "string" },
    mainTheme: { type: "string" },
    summary: { type: "string" },
    scriptures: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["reference", "connection", "confidence"],
        properties: {
          reference: { type: "string" },
          connection: { type: "string" },
          confidence: { type: "string", enum: ["alta", "media", "baja"] },
        },
      },
    },
    keyIdeas: {
      type: "array",
      items: { type: "string" },
    },
    connections: {
      type: "array",
      items: { type: "string" },
    },
    reflectionPrompt: { type: "string" },
    detectedText: { type: "string" },
  },
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY no está configurada. Agrega la variable en Vercel para activar el resumen con ChatGPT.",
      },
      { status: 503 },
    );
  }

  let body: { imageDataUrl?: string; note?: string };

  try {
    body = (await request.json()) as { imageDataUrl?: string; note?: string };
  } catch {
    return NextResponse.json({ error: "La solicitud no tiene JSON válido." }, { status: 400 });
  }

  const imageDataUrl = body.imageDataUrl;

  if (!imageDataUrl || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(imageDataUrl)) {
    return NextResponse.json(
      { error: "Sube una imagen PNG, JPEG o WEBP de tus apuntes." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.6",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  "Analiza esta foto de apuntes de una reunión o sermón cristiano.",
                  "La foto puede contener referencias bíblicas, frases cortas y notas manuscritas.",
                  "Responde en español con JSON estricto.",
                  "No inventes textos bíblicos exactos. Si detectas una referencia, escribe solo la referencia y cómo parece conectarse al tema.",
                  "Si una referencia o palabra no se lee con seguridad, baja la confianza y dilo en la conexión.",
                  "No asumas datos personales. No necesitas conservar ni describir la imagen.",
                  body.note ? `Nota adicional del usuario: ${body.note}` : "",
                ]
                  .filter(Boolean)
                  .join("\n"),
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meeting_notes_summary",
            schema,
            strict: true,
          },
        },
      }),
    });

    const json = (await response.json()) as OpenAIResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: json.error?.message ?? "No se pudo generar el resumen." },
        { status: response.status },
      );
    }

    const outputText = extractOutputText(json);

    if (!outputText) {
      return NextResponse.json(
        { error: "La respuesta no incluyó texto para resumir." },
        { status: 502 },
      );
    }

    const summary = JSON.parse(outputText) as SummaryResponse;

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type OpenAIResponse = {
  error?: { message?: string };
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractOutputText(response: OpenAIResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n");
}
