"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BibleVerse } from "@/components/BibleVerse";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import type { BiblePassage } from "@/types/bible";

type RecitationTab = "current" | "next";

type RecitationItem = {
  id: RecitationTab;
  label: string;
  passage?: BiblePassage;
};

const tabClass =
  "flex min-h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#36d9e6]";

export function WeeklyRecitationCard() {
  const { error, isLoading, weeklyRecitations } = useChurchData();
  const [activeTab, setActiveTab] = useState<RecitationTab>("current");
  const [hideCurrentVerse, setHideCurrentVerse] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const recitations = useMemo<RecitationItem[]>(() => {
    const currentWeekStart = getCurrentWeekStart();
    const current = weeklyRecitations
      .filter((item) => item.weekStart <= currentWeekStart)
      .at(-1);
    const next = weeklyRecitations.find((item) => item.weekStart > currentWeekStart);

    return [
      {
        id: "current",
        label: "Esta semana",
        passage: current
          ? { reference: current.reference, text: current.text, translation: current.translation }
          : undefined,
      },
      {
        id: "next",
        label: "Próxima semana",
        passage: next
          ? { reference: next.reference, text: next.text, translation: next.translation }
          : undefined,
      },
    ];
  }, [weeklyRecitations]);
  const activeRecitation = recitations.find((item) => item.id === activeTab) ?? recitations[0];
  const activePanelId = `recitation-panel-${activeRecitation.id}`;
  const shouldMaskVerse = activeRecitation.id === "current" && hideCurrentVerse && activeRecitation.passage;
  const passage = shouldMaskVerse && activeRecitation.passage
    ? {
        ...activeRecitation.passage,
        text: maskEightyPercent(activeRecitation.passage.text ?? ""),
      }
    : activeRecitation.passage;

  return (
    <section
      aria-labelledby="weekly-recitation-title"
      className="overflow-hidden rounded-lg border border-[#9cebf0] bg-white/95 p-5 shadow-[0_26px_80px_rgba(0,82,150,0.16)] sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <Image
          alt="Logo con paloma y globo"
          className="h-28 w-28 rounded-full drop-shadow-[0_16px_22px_rgba(0,80,145,0.22)] sm:h-32 sm:w-32"
          height={128}
          priority
          src={`${basePath}/logos/recitation-logo.png`}
          width={128}
        />
        <p className="mt-5 text-xs font-bold uppercase text-[#007cb3]">Recitación</p>
        <h2
          id="weekly-recitation-title"
          className="mt-2 font-serif text-4xl font-semibold leading-none text-[#00589d] sm:text-5xl"
        >
          Recitación de la semana
        </h2>
      </div>

      <div
        aria-label="Recitación semanal"
        className="mt-7 grid grid-cols-2 gap-2 rounded-lg border border-[#bdeff2] bg-[#effdfb] p-1"
        role="tablist"
      >
        {recitations.map((item) => {
          const selected = item.id === activeTab;

          return (
            <button
              key={item.id}
              aria-controls={`recitation-panel-${item.id}`}
              aria-selected={selected}
              className={`${tabClass} ${
                selected
                  ? "bg-[#00589d] text-white shadow-[0_10px_22px_rgba(0,88,157,0.22)]"
                  : "text-[#00689d] hover:bg-white"
              }`}
              id={`recitation-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`recitation-tab-${activeRecitation.id}`}
        className="mt-7"
        id={activePanelId}
        role="tabpanel"
      >
        <div className="border-b border-[#bdeff2] pb-5">
          <p className="text-sm font-semibold text-[#007cb3]">Referencia</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#073a5a]">
            {passage?.reference ?? (isLoading ? "Cargando…" : "Pendiente de publicación")}
          </p>
        </div>

        {activeRecitation.id === "current" && passage ? (
          <button
            aria-label={hideCurrentVerse ? "Mostrar versículo completo" : "Practicar memoria"}
            aria-pressed={hideCurrentVerse}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#88e7ef] bg-[#e8fbfb] px-4 text-sm font-bold text-[#00589d] shadow-[0_12px_28px_rgba(0,82,150,0.12)] transition hover:border-[#1dbbdd] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#36d9e6]"
            onClick={() => setHideCurrentVerse((current) => !current)}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={18} />
            <span>{hideCurrentVerse ? "Mostrar versículo" : "Practicar memoria"}</span>
          </button>
        ) : null}

        <p className="mt-6 text-sm font-semibold uppercase text-[#008bb8]">
          Texto para recitar
        </p>
        {passage ? (
          <BibleVerse passage={passage} className="mt-4" />
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-[#bde0eb] bg-[#f7fcff] px-5 py-8 text-center text-[#62809d]">
            {error
              ? "No fue posible cargar la recitación desde Supabase."
              : isLoading
                ? "Cargando recitación…"
                : "Esta recitación aún no ha sido publicada."}
          </p>
        )}
      </div>
    </section>
  );
}

function getCurrentWeekStart() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Monterrey",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const currentDate = `${values.year}-${values.month}-${values.day}`;
  const date = new Date(`${currentDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function maskEightyPercent(text: string) {
  let wordIndex = 0;

  return text
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim()) {
        return token;
      }

      const shouldShow = wordIndex % 5 === 0;
      wordIndex += 1;

      return shouldShow ? token : "____";
    })
    .join("");
}
