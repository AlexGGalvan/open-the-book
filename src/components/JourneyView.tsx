"use client";

import { motion } from "framer-motion";
import { BookOpen, PenLine } from "lucide-react";
import { demoReadingHistory, demoReflections } from "@/data/demo";
import { findPassageById } from "@/data/passages";
import { themeLabels } from "@/data/themes";
import { formatShortDate, formatTimelineDate } from "@/lib/dates";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";
import type { Passage, ThemeKey } from "@/types/bible";

interface JourneyViewProps {
  store: OpenBookStore;
  onOpenPassage: (passage: Passage, theme?: ThemeKey) => void;
}

export function JourneyView({ store, onOpenPassage }: JourneyViewProps) {
  const reflections = store.reflections.length > 0 ? store.reflections : demoReflections;
  const history = store.readingHistory.length > 0 ? store.readingHistory : demoReadingHistory;
  const demoMode = store.reflections.length === 0 && store.readingHistory.length === 0;

  return (
    <motion.section
      key="journey"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Journey</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">Reflections</h1>
          {demoMode ? (
            <span className="rounded-full border border-[#f4dfb8]/18 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d7c5a1]">
              Demo
            </span>
          ) : null}
        </div>
      </header>

      <section className="rounded-[30px] border border-white/10 bg-[#15100c]/76 p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4dfb8]/12 text-[#f4dfb8]">
            <BookOpen aria-hidden="true" size={19} />
          </span>
          <div>
            <h2 className="font-serif text-3xl text-[#fff7e9]">Timeline</h2>
            <p className="text-sm text-[#958873]">Lecturas y momentos recientes.</p>
          </div>
        </div>

        <div className="space-y-1">
          {history.map((entry, index) => {
            const date = formatTimelineDate(entry.date);
            const passage = entry.passageId ? findPassageById(entry.passageId) : null;

            return (
              <button
                key={entry.id}
                type="button"
                className="grid w-full grid-cols-[58px_1fr] gap-4 rounded-2xl p-3 text-left transition hover:bg-white/[0.06]"
                onClick={() => passage && onOpenPassage(passage, entry.theme)}
              >
                <div className="relative text-center">
                  {index < history.length - 1 ? (
                    <span className="absolute left-1/2 top-12 h-[calc(100%+0.75rem)] w-px -translate-x-1/2 bg-white/10" />
                  ) : null}
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-[#958873]">
                    {date.month}
                  </span>
                  <span className="font-serif text-3xl leading-none text-[#f4dfb8]">{date.day}</span>
                </div>
                <div className="pb-4">
                  <p className="font-serif text-2xl text-[#fff7e9]">{entry.reference}</p>
                  <p className="mt-1 text-sm text-[#b9aa92]">
                    {entry.theme ? themeLabels[entry.theme] : "Lectura"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] text-[#d7c5a1]">
            <PenLine aria-hidden="true" size={18} />
          </span>
          <h2 className="font-serif text-3xl text-[#fff7e9]">Diario de reflexión</h2>
        </div>

        {reflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-[26px] border border-white/10 bg-[#15100c]/72 p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#958873]">
                  {formatShortDate(reflection.date)}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[#fff7e9]">{reflection.reference}</h3>
              </div>
              <span className="rounded-full bg-[#f4dfb8]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#d7c5a1]">
                {themeLabels[reflection.theme]}
              </span>
            </div>
            <p className="font-serif text-xl leading-8 text-[#f7ead4]">“{reflection.text}”</p>
          </article>
        ))}
      </section>
    </motion.section>
  );
}
