"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { passages } from "@/data/passages";
import type { Passage } from "@/types/bible";

const guestPassages = passages.filter((passage) =>
  passage.themes.some((theme) => ["paz", "esperanza", "fortaleza"].includes(theme)),
);

interface GuestExperienceProps {
  onEnterMain: () => void;
}

export function GuestExperience({ onEnterMain }: GuestExperienceProps) {
  const [index, setIndex] = useState(0);
  const passage: Passage = useMemo(
    () => guestPassages[index % guestPassages.length],
    [index],
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#040302] px-6 py-10 text-[#f8ebd2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(244,223,184,0.17),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%)]" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-xs uppercase tracking-[0.34em] text-[#b9aa92]"
        >
          Ya que encontraste esto...
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.article
            key={passage.id}
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.75 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-[#d7c5a1]">{passage.reference}</p>
              <p className="font-serif text-2xl leading-relaxed text-[#fff7e9]">{passage.text}</p>
            </div>
            <p className="font-serif text-3xl leading-tight text-[#f4dfb8]">
              Tal vez necesitabas leer esto hoy.
            </p>
          </motion.article>
        </AnimatePresence>

        <div className="mt-10 flex flex-col gap-3">
          <button
            type="button"
            className="min-h-12 rounded-full bg-[#f4dfb8] px-5 text-sm font-semibold text-[#17110c] transition hover:bg-[#fff1d2] focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/60"
            onClick={() => setIndex((current) => current + 1)}
          >
            Open the Book
          </button>
          <button
            type="button"
            className="min-h-12 rounded-full border border-white/12 px-5 text-sm font-medium text-[#e8d8bd] transition hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/45"
            onClick={onEnterMain}
          >
            Entrar a la experiencia principal
          </button>
        </div>
      </section>
    </main>
  );
}
