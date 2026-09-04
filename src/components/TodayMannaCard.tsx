"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BibleVerse } from "@/components/BibleVerse";
import { ShareButton } from "@/components/ShareButton";
import { copyTextToClipboard, formatPassageForSharing } from "@/lib/clipboard";
import type { Manna } from "@/types/bible";

type TodayMannaCardProps = {
  dateLabel: string;
  manna: Manna;
};

const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9cfad] bg-white px-4 text-sm font-semibold text-[#1b3658] shadow-[0_10px_24px_rgba(54,45,27,0.06)] transition hover:-translate-y-0.5 hover:border-[#b9c8d9] hover:bg-[#fbfdff] focus:outline-none focus:ring-2 focus:ring-[#9eb7d1]";

export function TodayMannaCard({ dateLabel, manna }: TodayMannaCardProps) {
  const [copied, setCopied] = useState(false);
  const shareText = formatPassageForSharing(manna.text, manna.reference, manna.translation);

  async function handleCopy() {
    await copyTextToClipboard(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section
      aria-labelledby="today-manna-title"
      className="rounded-lg border border-[#ded5b8] bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(61,51,32,0.10)] sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#163a62]">
            {"Today's Manna"}
          </p>
          <time className="mt-2 block text-sm text-[#7a7165]">{dateLabel}</time>
        </div>
        {manna.isDemo ? (
          <span className="rounded-md border border-[#eadfbf] bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#8a641a]">
            Demo
          </span>
        ) : null}
      </div>

      {manna.title ? (
        <h2 id="today-manna-title" className="mt-7 text-lg font-semibold text-[#171511]">
          {manna.title}
        </h2>
      ) : (
        <h2 id="today-manna-title" className="sr-only">
          Palabra de hoy
        </h2>
      )}

      <BibleVerse passage={manna} className="mt-4" />

      {manna.reflection ? (
        <p className="mt-6 border-l-2 border-[#d0a33a] pl-4 text-base leading-7 text-[#5e584e]">
          {manna.reflection}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" className={actionClass} onClick={handleCopy}>
          {copied ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
          <span>{copied ? "Copiado" : "Copiar versículo"}</span>
        </button>
        <ShareButton title="Today's Manna" text={shareText} className={actionClass} />
      </div>
    </section>
  );
}
