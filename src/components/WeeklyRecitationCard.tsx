"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BibleVerse } from "@/components/BibleVerse";
import type { BiblePassage } from "@/types/bible";

type RecitationTab = "current" | "next";

type RecitationItem = {
  id: RecitationTab;
  label: string;
  passage: BiblePassage;
};

const recitations: RecitationItem[] = [
  {
    id: "current",
    label: "Esta semana",
    passage: {
      reference: "Eclesiastés 3:20-21",
      text: "Todo va a un mismo lugar; todo es hecho del polvo, y todo volverá al mismo polvo. ¿Quién sabe que el espíritu de los hijos de los hombres sube arriba, y que el espíritu del animal desciende abajo a la tierra?",
      translation: "Reina-Valera 1960",
    },
  },
  {
    id: "next",
    label: "Próxima semana",
    passage: {
      reference: "Romanos 14:11-12",
      text: "Porque escrito está: Vivo yo, dice el Señor, que ante mí se doblará toda rodilla, y toda lengua confesará a Dios. De manera que cada uno de nosotros dará a Dios cuenta de sí.",
      translation: "Reina-Valera 1960",
    },
  },
];

const tabClass =
  "flex min-h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#36d9e6]";

export function WeeklyRecitationCard() {
  const [activeTab, setActiveTab] = useState<RecitationTab>("current");
  const [hideCurrentVerse, setHideCurrentVerse] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const activeRecitation = recitations.find((item) => item.id === activeTab) ?? recitations[0];
  const activePanelId = `recitation-panel-${activeRecitation.id}`;
  const shouldMaskVerse = activeRecitation.id === "current" && hideCurrentVerse;
  const passage = shouldMaskVerse
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
            {activeRecitation.passage.reference}
          </p>
        </div>

        {activeRecitation.id === "current" ? (
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
        <BibleVerse passage={passage} className="mt-4" />
      </div>
    </section>
  );
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
