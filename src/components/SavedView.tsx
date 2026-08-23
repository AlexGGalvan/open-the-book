"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Eye, RotateCcw, Trash2 } from "lucide-react";
import { demoSavedVerses } from "@/data/demo";
import { findPassageById, passages } from "@/data/passages";
import { themeLabels } from "@/data/themes";
import { formatReadableDate } from "@/lib/dates";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";
import type { Passage, ThemeKey } from "@/types/bible";

interface SavedViewProps {
  store: OpenBookStore;
  onOpenPassage: (passage: Passage, theme?: ThemeKey) => void;
}

export function SavedView({ store, onOpenPassage }: SavedViewProps) {
  const saved = store.savedVerses.length > 0 ? store.savedVerses : demoSavedVerses;
  const demoMode = store.savedVerses.length === 0;

  return (
    <motion.section
      key="saved"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Saved</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">Pasajes guardados</h1>
          {demoMode ? (
            <span className="rounded-full border border-[#f4dfb8]/18 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d7c5a1]">
              Demo
            </span>
          ) : null}
        </div>
      </header>

      <section className="space-y-3">
        {saved.map((verse) => {
          const passage = findPassageById(verse.passageId);

          return (
            <article
              key={verse.id}
              className="rounded-[26px] border border-white/10 bg-[#15100c]/76 p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d7c5a1]">
                    {themeLabels[verse.theme]}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-[#fff7e9]">{verse.reference}</h2>
                </div>
                <Bookmark aria-hidden="true" size={18} className="text-[#f4dfb8]" />
              </div>
              <p className="line-clamp-3 font-serif text-xl leading-8 text-[#f7ead4]">
                {verse.preview}...
              </p>
              <p className="mt-4 text-sm text-[#958873]">
                Guardado el {formatReadableDate(verse.date)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm text-[#f7ead4] transition hover:bg-white/[0.08]"
                  onClick={() => onOpenPassage(passage, verse.theme)}
                >
                  <Eye aria-hidden="true" size={16} />
                  Abrir
                </button>
                <button
                  type="button"
                  disabled={verse.isDemo}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm text-[#f7ead4] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => store.removeSavedVerse(verse.id)}
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <MemorizePanel store={store} />
    </motion.section>
  );
}

function MemorizePanel({ store }: { store: OpenBookStore }) {
  const defaultPassage = findPassageById("first-corinthians-13-4-8");
  const [practiceLevel, setPracticeLevel] = useState(0);
  const memorize = store.memorizeVerse ?? {
    passageId: defaultPassage.id,
    reference: defaultPassage.reference,
    text: defaultPassage.text,
  };
  const sourceOptions = useMemo(() => {
    const savedIds = store.savedVerses.map((verse) => verse.passageId);
    const uniqueIds = Array.from(new Set([memorize.passageId, ...savedIds, defaultPassage.id]));
    return uniqueIds.map(findPassageById);
  }, [defaultPassage.id, memorize.passageId, store.savedVerses]);

  const practicedText = useMemo(
    () => buildPracticeText(memorize.text, practiceLevel).text,
    [memorize.text, practiceLevel],
  );
  const practiceStats = useMemo(
    () => buildPracticeText(memorize.text, practiceLevel),
    [memorize.text, practiceLevel],
  );

  return (
    <section className="rounded-[30px] border border-[#f4dfb8]/16 bg-[linear-gradient(145deg,rgba(244,223,184,0.13),rgba(255,255,255,0.035))] p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Memorize</p>
        <h2 className="mt-2 font-serif text-4xl text-[#fff7e9]">Versículo para memorizar</h2>
      </div>

      <label className="mb-4 block space-y-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[#b9aa92]">Pasaje</span>
        <select
          value={memorize.passageId}
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#080604] px-4 text-[#f7ead4] outline-none focus:border-[#f4dfb8]/45"
          onChange={(event) => {
            store.setMemorizePassage(event.target.value);
            setPracticeLevel(0);
          }}
        >
          {sourceOptions.map((passage) => (
            <option key={passage.id} value={passage.id}>
              {passage.reference}
            </option>
          ))}
          {passages
            .filter((passage) => !sourceOptions.some((source) => source.id === passage.id))
            .slice(0, 6)
            .map((passage) => (
              <option key={passage.id} value={passage.id}>
                {passage.reference}
              </option>
            ))}
        </select>
      </label>

      <div className="rounded-[24px] border border-white/10 bg-[#080604]/72 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[#d7c5a1]">
            {memorize.reference}
          </p>
          <span className="rounded-full border border-[#f4dfb8]/18 bg-[#f4dfb8]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f4dfb8]">
            {practiceStats.visiblePercent}% visible · {practiceStats.hiddenPercent}% oculto
          </span>
        </div>
        <div
          aria-hidden="true"
          className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
        >
          <div
            className="h-full rounded-full bg-[#f4dfb8] transition-all duration-300"
            style={{ width: `${practiceStats.visiblePercent}%` }}
          />
        </div>
        <p className="font-serif text-2xl leading-10 text-[#fff7e9]" aria-live="polite">
          {practicedText}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2]"
          onClick={() => setPracticeLevel((level) => Math.min(3, level + 1))}
        >
          Practicar
        </button>
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm text-[#f7ead4] transition hover:bg-white/[0.08]"
          onClick={() => setPracticeLevel(0)}
        >
          <RotateCcw aria-hidden="true" size={16} />
          Revelar
        </button>
      </div>
    </section>
  );
}

function buildPracticeText(text: string, level: number) {
  if (level === 0) {
    return {
      text,
      hiddenPercent: 0,
      visiblePercent: 100,
    };
  }

  const frequency = level === 1 ? 7 : level === 2 ? 4 : 2;
  let wordIndex = 0;
  let hiddenCount = 0;

  const practicedText = text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return token;
      }

      wordIndex += 1;
      if (wordIndex % frequency === 0 && token.length > 2) {
        hiddenCount += 1;
        return "______";
      }

      return token;
    })
    .join("");

  const hiddenPercent = wordIndex > 0 ? Math.round((hiddenCount / wordIndex) * 100) : 0;

  return {
    text: practicedText,
    hiddenPercent,
    visiblePercent: 100 - hiddenPercent,
  };
}
