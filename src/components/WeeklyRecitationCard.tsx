"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
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
      reference: "Santiago 2:26",
      text: "Porque como el cuerpo sin espíritu está muerto, así también la fe sin obras está muerta.",
      translation: "Reina-Valera 1960",
    },
  },
  {
    id: "next",
    label: "Próxima semana",
    passage: {
      reference: "Eclesiastés 3:20-21",
      text: "Todo va a un mismo lugar; todo es hecho del polvo, y todo volverá al mismo polvo. ¿Quién sabe que el espíritu de los hijos de los hombres sube arriba, y que el espíritu del animal desciende abajo a la tierra?",
      translation: "Reina-Valera 1960",
    },
  },
];

const tabClass =
  "flex min-h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#9eb7d1]";

export function WeeklyRecitationCard() {
  const [activeTab, setActiveTab] = useState<RecitationTab>("current");
  const [hideCurrentVerse, setHideCurrentVerse] = useState(false);
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
      className="rounded-lg border border-[#d7decd] bg-[#fbfdf8] p-5 shadow-[0_20px_60px_rgba(50,62,43,0.08)] sm:p-7"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[#cddbc2] bg-white text-[#57713e]">
          <BookOpen aria-hidden="true" size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-[#57713e]">Recitación</p>
          <h2 id="weekly-recitation-title" className="mt-2 text-2xl font-semibold text-[#171511]">
            Recitación de la semana
          </h2>
        </div>
      </div>

      <div
        aria-label="Recitación semanal"
        className="mt-7 grid grid-cols-2 gap-2 rounded-lg border border-[#e0d9bf] bg-white/72 p-1"
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
                  ? "bg-[#163a62] text-white shadow-[0_8px_18px_rgba(22,58,98,0.18)]"
                  : "text-[#5f6756] hover:bg-[#f3f6ef]"
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
        <div className="rounded-lg border border-[#e0d9bf] bg-white/72 p-4 sm:p-5">
          <p className="text-sm font-semibold text-[#6f685d]">Referencia</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#171511]">
            {activeRecitation.passage.reference}
          </p>
        </div>

        {activeRecitation.id === "current" ? (
          <button
            aria-label={hideCurrentVerse ? "Mostrar versículo completo" : "Practicar memoria"}
            aria-pressed={hideCurrentVerse}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#c7d8bf] bg-[#f0f8ea] px-4 text-sm font-bold text-[#486831] shadow-[0_10px_24px_rgba(50,62,43,0.08)] transition hover:bg-[#e9f4e1] focus:outline-none focus:ring-2 focus:ring-[#9eb7d1]"
            onClick={() => setHideCurrentVerse((current) => !current)}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={18} />
            <span>{hideCurrentVerse ? "Mostrar versículo" : "Practicar memoria"}</span>
          </button>
        ) : null}

        <p className="mt-6 text-sm font-semibold uppercase text-[#8a641a]">
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
