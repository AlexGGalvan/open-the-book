"use client";

import { useMemo, useState } from "react";
import { createPracticeText, practiceLevels, type PracticeLevel } from "@/lib/practice";

type PracticeModeProps = {
  text: string;
  reference: string;
};

export function PracticeMode({ text, reference }: PracticeModeProps) {
  const [level, setLevel] = useState<PracticeLevel>(2);
  const practiceText = useMemo(() => createPracticeText(text, level), [level, text]);

  return (
    <div className="rounded-lg border border-[#c8d3df] bg-[#f6f9fb] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#163a62]">Modo práctica</p>
          <p className="mt-1 text-xs text-[#657384]">
            {practiceLevels.find((item) => item.level === level)?.description}
          </p>
        </div>
        <div
          className="grid grid-cols-4 rounded-lg border border-[#d6e0e9] bg-white p-1"
          role="group"
          aria-label="Nivel de práctica"
        >
          {practiceLevels.map((item) => (
            <button
              key={item.level}
              type="button"
              className={`h-9 w-9 rounded-md text-sm font-semibold transition ${
                level === item.level
                  ? "bg-[#163a62] text-white shadow-sm"
                  : "text-[#536174] hover:bg-[#eef4f8]"
              }`}
              title={item.description}
              onClick={() => setLevel(item.level)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 font-serif text-2xl font-medium leading-[1.55] text-[#171511]">
        {practiceText}
      </p>
      <p className="mt-4 text-sm font-medium text-[#657384]">— {reference}</p>
    </div>
  );
}
