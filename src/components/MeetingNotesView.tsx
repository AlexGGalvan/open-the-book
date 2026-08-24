"use client";

import { type ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { formatReadableDate } from "@/lib/dates";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";
import type { MeetingSummary } from "@/types/bible";

type ApiSummary = Omit<MeetingSummary, "id" | "date">;

interface MeetingNotesViewProps {
  store: OpenBookStore;
  onBackHome: () => void;
}

export function MeetingNotesView({ store, onBackHome }: MeetingNotesViewProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [note, setNote] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [latestSummary, setLatestSummary] = useState<MeetingSummary | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const resized = await resizeImage(file);
      setImageDataUrl(resized);
      setImageName(file.name);
    } catch {
      setError("No pude preparar esa imagen. Intenta con otra foto más clara.");
    }
  }

  async function handleAnalyze() {
    if (!imageDataUrl) {
      setError("Primero sube o toma una foto de tus apuntes.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/api/summarize-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, note: note.trim() }),
      });
      const payload = (await response.json()) as { summary?: ApiSummary; error?: string };

      if (!response.ok || !payload.summary) {
        throw new Error(
          payload.error ??
            "No se pudo generar el resumen. Revisa que la app esté abierta desde Vercel.",
        );
      }

      const saved = store.saveMeetingSummary(payload.summary);
      setLatestSummary(saved);
      setImageDataUrl(null);
      setImageName("");
      setNote("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo conectar con el resumen.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <motion.section
      key="meeting"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="flex items-start justify-between gap-4 pt-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Meeting Notes</p>
          <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">Apuntes de reunión</h1>
          <p className="max-w-sm text-sm leading-6 text-[#b9aa92]">
            Toma una foto de tu cuaderno y genera un resumen con el tema central, versículos y
            conexiones.
          </p>
        </div>
        <button
          type="button"
          aria-label="Volver a My Bible"
          className="grid min-h-11 min-w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#f7ead4] transition hover:bg-white/10"
          onClick={onBackHome}
        >
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
      </header>

      <section className="rounded-[30px] border border-[#f4dfb8]/16 bg-[linear-gradient(145deg,rgba(244,223,184,0.13),rgba(255,255,255,0.035))] p-5">
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f4dfb8]/12 bg-[#080604]/40 p-3">
          <ShieldCheck aria-hidden="true" size={19} className="shrink-0 text-[#f4dfb8]" />
          <p className="text-sm leading-5 text-[#deceb3]">
            La foto no se guarda. Solo se usa para generar el resumen; lo que queda en este
            dispositivo es el texto final.
          </p>
        </div>

        <label className="block">
          <span className="mb-3 block text-xs uppercase tracking-[0.24em] text-[#b9aa92]">
            Foto del cuaderno
          </span>
          <div className="grid min-h-56 place-items-center rounded-[26px] border border-dashed border-[#f4dfb8]/24 bg-[#080604]/62 p-5 text-center">
            {imageDataUrl ? (
              <div className="w-full space-y-4">
                <Image
                  src={imageDataUrl}
                  alt="Vista previa de los apuntes seleccionados"
                  width={640}
                  height={480}
                  unoptimized
                  className="mx-auto max-h-72 rounded-2xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                />
                <p className="text-sm text-[#b9aa92]">{imageName || "Imagen lista"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f4dfb8]/12 text-[#f4dfb8]">
                  <Camera aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="font-serif text-3xl text-[#fff7e9]">Sube una foto clara</p>
                  <p className="mt-2 text-sm leading-6 text-[#958873]">
                    Idealmente con buena luz y la hoja completa dentro del marco.
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2]">
            <UploadCloud aria-hidden="true" size={17} />
            Foto
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <button
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm text-[#f7ead4] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!imageDataUrl || isAnalyzing}
            onClick={() => {
              setImageDataUrl(null);
              setImageName("");
            }}
          >
            <Trash2 aria-hidden="true" size={16} />
            Quitar
          </button>
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-[#b9aa92]">
            Nota opcional
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej. El pastor habló sobre perdón y restauración..."
            className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-[#080604] p-4 text-sm leading-6 text-[#f7ead4] outline-none transition placeholder:text-[#7d725f] focus:border-[#f4dfb8]/45 focus:ring-2 focus:ring-[#f4dfb8]/20"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-2xl border border-[#f4a7a7]/20 bg-[#f4a7a7]/10 p-3 text-sm leading-6 text-[#ffd4d4]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!imageDataUrl || isAnalyzing}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? (
            <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />
          ) : (
            <FileText aria-hidden="true" size={17} />
          )}
          {isAnalyzing ? "Leyendo tus apuntes..." : "Generar resumen"}
        </button>
      </section>

      {latestSummary ? <SummaryCard summary={latestSummary} featured /> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-3xl text-[#fff7e9]">Resúmenes guardados</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-[#958873]">
            {store.meetingSummaries.length}
          </span>
        </div>

        {store.meetingSummaries.length === 0 ? (
          <article className="rounded-[26px] border border-white/10 bg-[#15100c]/72 p-5">
            <p className="text-sm leading-6 text-[#b9aa92]">
              Todavía no hay resúmenes. Cuando generes uno, aparecerá aquí sin guardar la foto.
            </p>
          </article>
        ) : (
          store.meetingSummaries
            .filter((summary) => summary.id !== latestSummary?.id)
            .map((summary) => (
            <SummaryCard
              key={summary.id}
              summary={summary}
              onDelete={() => store.deleteMeetingSummary(summary.id)}
            />
            ))
        )}
      </section>
    </motion.section>
  );
}

function SummaryCard({
  summary,
  featured = false,
  onDelete,
}: {
  summary: MeetingSummary;
  featured?: boolean;
  onDelete?: () => void;
}) {
  return (
    <article
      className={`rounded-[28px] border p-5 ${
        featured
          ? "border-[#f4dfb8]/24 bg-[#f4dfb8]/10"
          : "border-white/10 bg-[#15100c]/76"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#b9aa92]">
            {formatReadableDate(summary.date)}
          </p>
          <h3 className="mt-2 font-serif text-3xl leading-tight text-[#fff7e9]">
            {summary.title}
          </h3>
          <p className="mt-1 text-sm text-[#d7c5a1]">{summary.mainTheme}</p>
        </div>
        {onDelete ? (
          <button
            type="button"
            aria-label="Eliminar resumen"
            className="grid min-h-10 min-w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#f7ead4] transition hover:bg-white/[0.08]"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        ) : null}
      </div>

      <p className="font-serif text-xl leading-8 text-[#f7ead4]">{summary.summary}</p>

      <div className="mt-5 space-y-3">
        <h4 className="text-xs uppercase tracking-[0.24em] text-[#958873]">Versículos citados</h4>
        {summary.scriptures.length > 0 ? (
          summary.scriptures.map((scripture) => (
            <div
              key={`${summary.id}-${scripture.reference}`}
              className="rounded-2xl border border-white/10 bg-[#080604]/45 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-serif text-2xl text-[#fff7e9]">{scripture.reference}</p>
                <span className="rounded-full bg-[#f4dfb8]/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#d7c5a1]">
                  {scripture.confidence}
                </span>
              </div>
              <p className="text-sm leading-6 text-[#b9aa92]">{scripture.connection}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#958873]">No se detectaron referencias con claridad.</p>
        )}
      </div>

      <ListBlock title="Ideas clave" items={summary.keyIdeas} />
      <ListBlock title="Cómo se conectan" items={summary.connections} />

      <div className="mt-5 rounded-2xl border border-[#f4dfb8]/14 bg-[#f4dfb8]/8 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#b9aa92]">Para reflexionar</p>
        <p className="mt-2 font-serif text-xl leading-8 text-[#fff7e9]">
          {summary.reflectionPrompt}
        </p>
      </div>

      {summary.detectedText ? (
        <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm text-[#d7c5a1]">Texto detectado</summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#b9aa92]">
            {summary.detectedText}
          </p>
        </details>
      ) : null}
    </article>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3">
      <h4 className="text-xs uppercase tracking-[0.24em] text-[#958873]">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-2xl bg-white/[0.04] p-3 text-sm leading-6 text-[#deceb3]">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

async function resizeImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}
