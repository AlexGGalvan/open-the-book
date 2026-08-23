"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, BookOpen, ChevronRight } from "lucide-react";
import { passages } from "@/data/passages";
import { themeLabels, topicThemes } from "@/data/themes";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";
import type { Passage, ThemeKey } from "@/types/bible";
import { TopicSelector } from "@/components/TopicSelector";

interface ReadViewProps {
  store: OpenBookStore;
  onSelectTheme: (theme: ThemeKey) => void;
  onOpenPassage: (passage: Passage, theme?: ThemeKey) => void;
}

export function ReadView({ store, onSelectTheme, onOpenPassage }: ReadViewProps) {
  const { hydrated, saveManualReading } = store;
  const initialPassage = store.lastReading?.passageId
    ? passages.find((passage) => passage.id === store.lastReading?.passageId) ?? passages[0]
    : passages[0];
  const [passageId, setPassageId] = useState(initialPassage.id);
  const [verses, setVerses] = useState(store.lastReading?.verses ?? initialPassage.verses);
  const selectedPassage = passages.find((passage) => passage.id === passageId) ?? passages[0];
  const book = selectedPassage.book;
  const chapter = selectedPassage.chapter;

  const books = useMemo(
    () => Array.from(new Set(passages.map((passage) => passage.book))),
    [],
  );
  const chapters = useMemo(
    () =>
      Array.from(
        new Set(
          passages
            .filter((passage) => passage.book === book)
            .map((passage) => passage.chapter),
        ),
      ),
    [book],
  );
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveManualReading({
      book,
      chapter,
      verses,
      reference: `${book} ${chapter}:${verses}`,
      passageId: selectedPassage.id,
    });
  }, [book, chapter, hydrated, saveManualReading, selectedPassage.id, verses]);

  return (
    <motion.section
      key="read"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Read</p>
        <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">Lectura actual</h1>
      </header>

      <section className="rounded-[30px] border border-white/10 bg-[#15100c]/76 p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4dfb8]/12 text-[#f4dfb8]">
            <BookMarked aria-hidden="true" size={19} />
          </span>
          <div>
            <h2 className="font-serif text-3xl text-[#fff7e9]">Elegir pasaje</h2>
            <p className="text-sm text-[#958873]">Se guarda automáticamente en este dispositivo.</p>
          </div>
        </div>

        <div className="grid gap-3">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[#b9aa92]">Libro</span>
            <select
              value={book}
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#080604] px-4 text-[#f7ead4] outline-none focus:border-[#f4dfb8]/45"
              onChange={(event) => {
                const nextBook = event.target.value;
                const firstPassage = passages.find((passage) => passage.book === nextBook);
                if (firstPassage) {
                  setPassageId(firstPassage.id);
                  setVerses(firstPassage.verses);
                }
              }}
            >
              {books.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-[1fr_1.2fr] gap-3">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[#b9aa92]">Capítulo</span>
              <select
                value={chapter}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#080604] px-4 text-[#f7ead4] outline-none focus:border-[#f4dfb8]/45"
                onChange={(event) => {
                  const nextChapter = Number(event.target.value);
                  const nextPassage = passages.find(
                    (passage) => passage.book === book && passage.chapter === nextChapter,
                  );

                  if (nextPassage) {
                    setPassageId(nextPassage.id);
                    setVerses(nextPassage.verses);
                  }
                }}
              >
                {chapters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[#b9aa92]">Versículos</span>
              <input
                value={verses}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#080604] px-4 text-[#f7ead4] outline-none focus:border-[#f4dfb8]/45"
                onChange={(event) => setVerses(event.target.value)}
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2]"
          onClick={() => onOpenPassage(selectedPassage, selectedPassage.themes[0])}
        >
          <BookOpen aria-hidden="true" size={18} />
          Abrir pasaje
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-[#fff7e9]">¿Qué estás buscando hoy?</h2>
        <TopicSelector themes={topicThemes} onSelect={onSelectTheme} />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-3xl text-[#fff7e9]">Pasajes disponibles</h2>
        {passages.map((passage) => (
          <button
            key={passage.id}
            type="button"
            className="group w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-[#f4dfb8]/25 hover:bg-white/[0.07]"
            onClick={() => onOpenPassage(passage, passage.themes[0])}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-[#fff7e9]">{passage.reference}</p>
                <p className="mt-1 text-sm text-[#b9aa92]">
                  {passage.themes.slice(0, 2).map((theme) => themeLabels[theme]).join(" · ")}
                </p>
              </div>
              <ChevronRight
                aria-hidden="true"
                size={18}
                className="shrink-0 text-[#d7c5a1] transition group-hover:translate-x-1"
              />
            </div>
          </button>
        ))}
      </section>
    </motion.section>
  );
}
