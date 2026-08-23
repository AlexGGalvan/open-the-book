"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, BookOpen, Check, Lightbulb, PenLine } from "lucide-react";
import { themeLabels } from "@/data/themes";
import type { Passage, ThemeKey } from "@/types/bible";

interface PassageViewProps {
  passage: Passage;
  selectedTheme: ThemeKey;
  isSaved: boolean;
  onBack: () => void;
  onSave: () => void;
  onReadFull: () => void;
  onSaveReflection: (text: string) => void;
  onMemorize: () => void;
}

export function PassageView({
  passage,
  selectedTheme,
  isSaved,
  onBack,
  onSave,
  onReadFull,
  onSaveReflection,
  onMemorize,
}: PassageViewProps) {
  const [reflection, setReflection] = useState("");
  const [savedReflection, setSavedReflection] = useState(false);

  function handleReflectionSubmit() {
    const clean = reflection.trim();

    if (!clean) {
      return;
    }

    onSaveReflection(clean);
    setReflection("");
    setSavedReflection(true);
    window.setTimeout(() => setSavedReflection(false), 1800);
  }

  return (
    <motion.section
      key={passage.id}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
      transition={{ duration: 0.45 }}
      className="space-y-5 pb-28"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Volver"
          className="grid min-h-11 min-w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#f7ead4] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/50"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
        <span className="rounded-full border border-[#f4dfb8]/15 bg-[#f4dfb8]/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#d7c5a1]">
          {themeLabels[selectedTheme]}
        </span>
      </div>

      <article className="rounded-[28px] border border-white/10 bg-[#19130e]/78 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-[#b9aa92]">{passage.book}</p>
          <h1 className="font-serif text-4xl leading-tight text-[#fff7e9]">{passage.reference}</h1>
        </div>
        <p className="font-serif text-[1.38rem] leading-[1.85] text-[#f7ead4]">{passage.text}</p>
        <div className="mt-6 rounded-2xl border border-white/8 bg-black/16 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#b9aa92]">
            <Lightbulb aria-hidden="true" size={14} />
            Contexto
          </p>
          <p className="text-sm leading-6 text-[#deceb3]">{passage.context}</p>
        </div>
        <p className="mt-5 text-xs text-[#958873]">{passage.source}</p>
      </article>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f4dfb8] px-4 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2] focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/55"
          onClick={onReadFull}
        >
          <BookOpen aria-hidden="true" size={17} />
          Leer capítulo
        </button>
        <button
          type="button"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-medium text-[#f7ead4] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/45"
          onClick={onSave}
        >
          {isSaved ? <Check aria-hidden="true" size={17} /> : <Bookmark aria-hidden="true" size={17} />}
          {isSaved ? "Guardado" : "Guardar"}
        </button>
      </div>

      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f4dfb8]/20 bg-[#f4dfb8]/8 px-4 text-sm font-medium text-[#f7ead4] transition hover:bg-[#f4dfb8]/14 focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/45"
        onClick={onMemorize}
      >
        <PenLine aria-hidden="true" size={17} />
        Usar para Memorize
      </button>

      <section className="rounded-[28px] border border-white/10 bg-[#120e0a]/80 p-5">
        <label htmlFor="reflection" className="mb-3 block font-serif text-2xl text-[#fff7e9]">
          ¿Qué te habló de este pasaje?
        </label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder="Escribe una reflexión breve..."
          className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-[#080604] p-4 text-base leading-7 text-[#f7ead4] outline-none transition placeholder:text-[#7d725f] focus:border-[#f4dfb8]/45 focus:ring-2 focus:ring-[#f4dfb8]/20"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <AnimatePresence>
            {savedReflection ? (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[#b9d1a3]"
              >
                Reflexión guardada.
              </motion.p>
            ) : (
              <span className="text-xs text-[#958873]">Se guardará en Reflections.</span>
            )}
          </AnimatePresence>
          <button
            type="button"
            className="min-h-11 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!reflection.trim()}
            onClick={handleReflectionSubmit}
          >
            Reflexionar sobre esto
          </button>
        </div>
      </section>
    </motion.section>
  );
}
