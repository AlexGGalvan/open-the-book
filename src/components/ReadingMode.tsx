"use client";

import { Minus, Moon, Plus, Sun, X } from "lucide-react";
import type { Passage, UserPreferences } from "@/types/bible";

interface ReadingModeProps {
  passage: Passage;
  preferences: UserPreferences;
  onClose: () => void;
  onUpdatePreferences: (partial: Partial<UserPreferences>) => void;
}

export function ReadingMode({
  passage,
  preferences,
  onClose,
  onUpdatePreferences,
}: ReadingModeProps) {
  const isLight = preferences.readingTheme === "light";
  const fontSize = `${1.28 * preferences.fontScale}rem`;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isLight ? "bg-[#f8f0df] text-[#1c1711]" : "bg-[#050403] text-[#f8ebd2]"
      }`}
    >
      <div className="mx-auto min-h-dvh w-full max-w-3xl px-5 py-5">
        <header className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-2 px-5 py-3 backdrop-blur-xl">
          <button
            type="button"
            aria-label="Cerrar modo lectura"
            className={`grid min-h-11 min-w-11 place-items-center rounded-full border ${
              isLight ? "border-black/10 bg-white/45" : "border-white/10 bg-white/5"
            }`}
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Reducir tamaño de texto"
              className={`grid min-h-11 min-w-11 place-items-center rounded-full border ${
                isLight ? "border-black/10 bg-white/45" : "border-white/10 bg-white/5"
              }`}
              onClick={() =>
                onUpdatePreferences({ fontScale: Math.max(0.86, preferences.fontScale - 0.08) })
              }
            >
              <Minus aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              aria-label="Aumentar tamaño de texto"
              className={`grid min-h-11 min-w-11 place-items-center rounded-full border ${
                isLight ? "border-black/10 bg-white/45" : "border-white/10 bg-white/5"
              }`}
              onClick={() =>
                onUpdatePreferences({ fontScale: Math.min(1.38, preferences.fontScale + 0.08) })
              }
            >
              <Plus aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              aria-label="Cambiar tema de lectura"
              className={`grid min-h-11 min-w-11 place-items-center rounded-full border ${
                isLight ? "border-black/10 bg-white/45" : "border-white/10 bg-white/5"
              }`}
              onClick={() =>
                onUpdatePreferences({ readingTheme: isLight ? "dark" : "light" })
              }
            >
              {isLight ? <Moon aria-hidden="true" size={17} /> : <Sun aria-hidden="true" size={17} />}
            </button>
          </div>
        </header>

        <article className="mx-auto max-w-2xl pb-20 pt-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] opacity-60">
            {passage.book} {passage.chapter}
          </p>
          <h1 className="mb-8 font-serif text-4xl">{passage.reference}</h1>
          <p
            className="font-serif"
            style={{
              fontSize,
              lineHeight: preferences.lineHeight,
            }}
          >
            {passage.text}
          </p>
          <div className="mt-10 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.22em] opacity-55">Interlineado</span>
            {[1.55, 1.75, 1.95].map((height) => (
              <button
                key={height}
                type="button"
                aria-label={`Interlineado ${height}`}
                className={`h-10 w-10 rounded-full border text-sm ${
                  preferences.lineHeight === height
                    ? isLight
                      ? "border-[#5c3b17] bg-[#5c3b17] text-white"
                      : "border-[#f4dfb8] bg-[#f4dfb8] text-[#17110c]"
                    : isLight
                      ? "border-black/12"
                      : "border-white/12"
                }`}
                onClick={() => onUpdatePreferences({ lineHeight: height })}
              >
                {height.toFixed(1)}
              </button>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
