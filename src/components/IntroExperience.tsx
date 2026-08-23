"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { introThemes } from "@/data/themes";
import type { ThemeKey } from "@/types/bible";
import { TopicSelector } from "@/components/TopicSelector";

const lines = [
  "OPEN THE BOOK",
  "Este libro tiene miles de años.",
  "Pero algunas palabras llegan justo cuando las necesitamos.",
];

interface IntroExperienceProps {
  onComplete: (theme?: ThemeKey) => void;
}

export function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const showTopics = step >= lines.length;

  useEffect(() => {
    if (showTopics) {
      return;
    }

    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      reducedMotion ? 900 : step === 0 ? 2100 : 2600,
    );

    return () => window.clearTimeout(timer);
  }, [reducedMotion, showTopics, step]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#060504] px-6 py-12 text-[#f8ebd2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(240,199,124,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_26%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-px w-[76vw] max-w-sm -translate-x-1/2 bg-gradient-to-r from-transparent via-[#f4dfb8] to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: showTopics ? 0.9 : 1, opacity: showTopics ? 0.2 : 0.8 }}
        transition={{ duration: reducedMotion ? 0 : 1.6, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4dfb8]/10 blur-3xl"
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="relative z-10 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {!showTopics ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeOut" }}
              className="min-h-32"
            >
              <p
                className={
                  step === 0
                    ? "font-serif text-4xl tracking-[0.28em] text-[#fff7e9]"
                    : "font-serif text-3xl leading-tight text-[#f7ead4]"
                }
              >
                {lines[step]}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">OPEN THE BOOK</p>
                <h1 className="font-serif text-4xl text-[#fff7e9]">¿Qué estás buscando hoy?</h1>
              </div>
              <TopicSelector themes={introThemes} onSelect={onComplete} />
              <button
                type="button"
                className="text-sm text-[#b9aa92] underline-offset-4 transition hover:text-[#f8ebd2] hover:underline"
                onClick={() => onComplete()}
              >
                Entrar sin elegir tema
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
