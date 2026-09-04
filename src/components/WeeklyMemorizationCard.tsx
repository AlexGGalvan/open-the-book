"use client";

import { useEffect, useState } from "react";
import { Brain, Check, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";
import { BibleVerse } from "@/components/BibleVerse";
import { PracticeMode } from "@/components/PracticeMode";
import { ShareButton } from "@/components/ShareButton";
import { copyTextToClipboard, formatPassageForSharing } from "@/lib/clipboard";
import { formatLocalDate } from "@/lib/dates";
import { isVerseMemorized, setVerseMemorized } from "@/lib/storage";
import type { MemorizationSelection } from "@/services/memorizationProvider";

type WeeklyMemorizationCardProps = {
  selection: MemorizationSelection;
};

const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9cfad] bg-white px-4 text-sm font-semibold text-[#1b3658] shadow-[0_10px_24px_rgba(54,45,27,0.06)] transition hover:-translate-y-0.5 hover:border-[#b9c8d9] hover:bg-[#fbfdff] focus:outline-none focus:ring-2 focus:ring-[#9eb7d1]";

export function WeeklyMemorizationCard({ selection }: WeeklyMemorizationCardProps) {
  const [memorized, setMemorized] = useState(false);
  const [hideText, setHideText] = useState(false);
  const [practiceEnabled, setPracticeEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const { verse } = selection;
  const shareText = formatPassageForSharing(verse.text, verse.reference, verse.translation);
  const dateRange = `${formatLocalDate(selection.weekStartDate)} al ${formatLocalDate(
    selection.weekEndDate,
  )}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMemorized(isVerseMemorized(verse.id));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [verse.id]);

  async function handleCopy() {
    await copyTextToClipboard(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleMemorized() {
    const nextValue = !memorized;
    setVerseMemorized(verse.id, nextValue);
    setMemorized(nextValue);
  }

  function handleHideText() {
    const nextValue = !hideText;
    setHideText(nextValue);

    if (nextValue) {
      setPracticeEnabled(false);
    }
  }

  function handlePractice() {
    const nextValue = !practiceEnabled;
    setPracticeEnabled(nextValue);

    if (nextValue) {
      setHideText(false);
    }
  }

  return (
    <section
      aria-labelledby="weekly-memorization-title"
      className="rounded-lg border border-[#d7decd] bg-[#fbfdf8] p-5 shadow-[0_20px_60px_rgba(50,62,43,0.08)] sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[#57713e]">
            Esta semana
          </p>
          <h2
            id="weekly-memorization-title"
            className="mt-2 text-2xl font-semibold text-[#171511]"
          >
            Memorización semanal
          </h2>
          <p className="mt-2 text-sm text-[#6f685d]">{dateRange}</p>
        </div>
        {memorized ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-[#c7d8bf] bg-[#f0f8ea] px-3 py-1 text-xs font-semibold text-[#486831]">
            <CheckCircle2 aria-hidden="true" size={15} />
            Memorizado
          </span>
        ) : null}
      </div>

      <div className="mt-7 rounded-lg border border-[#e0d9bf] bg-white/72 p-4 sm:p-5">
        <p className="text-sm font-semibold text-[#6f685d]">Tema</p>
        <p className="mt-1 text-lg font-semibold text-[#163a62]">{verse.topic}</p>
        <p className="mt-4 text-sm font-semibold text-[#6f685d]">Referencia</p>
        <p className="mt-1 font-serif text-3xl font-semibold text-[#171511]">{verse.reference}</p>
        {selection.showWeekCounter ? (
          <p className="mt-3 text-xs text-[#7a7165]">
            Semana {selection.index + 1} de {selection.expectedReferences}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-sm font-semibold uppercase text-[#8a641a]">
        Memorízalo esta semana
      </p>

      {hideText ? (
        <div className="mt-4 rounded-lg border border-dashed border-[#cfd8df] bg-[#f8fbfd] p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-[#163a62]">{verse.reference}</p>
        </div>
      ) : practiceEnabled && verse.text ? (
        <PracticeMode text={verse.text} reference={verse.reference} />
      ) : (
        <BibleVerse passage={verse} className="mt-4" />
      )}

      {verse.isCalibrationAnchor ? (
        <p className="mt-5 rounded-lg bg-[#f8f1df] px-4 py-3 text-sm leading-6 text-[#746033]">
          Sincronizado con Bible Habit para esta semana. El orden completo se podrá ajustar cuando
          estén cargadas las 244 referencias.
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" className={actionClass} onClick={handleCopy}>
          {copied ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
          <span>{copied ? "Copiado" : "Copiar versículo"}</span>
        </button>
        <ShareButton title="Memorización semanal" text={shareText} className={actionClass} />
        <button
          type="button"
          className={actionClass}
          onClick={handleMemorized}
          aria-pressed={memorized}
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          <span>{memorized ? "Memorizado" : "Marcar como memorizado"}</span>
        </button>
        <button type="button" className={actionClass} onClick={handleHideText} aria-pressed={hideText}>
          {hideText ? <Eye aria-hidden="true" size={18} /> : <EyeOff aria-hidden="true" size={18} />}
          <span>{hideText ? "Mostrar texto" : "Ocultar texto"}</span>
        </button>
        {verse.text ? (
          <button
            type="button"
            className={actionClass}
            onClick={handlePractice}
            aria-pressed={practiceEnabled}
          >
            {practiceEnabled ? (
              <Check aria-hidden="true" size={18} />
            ) : (
              <Brain aria-hidden="true" size={18} />
            )}
            <span>{practiceEnabled ? "Practicando" : "Practicar"}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
