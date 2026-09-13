import type { BiblePassage } from "@/types/bible";

type BibleVerseProps = {
  passage: BiblePassage;
  className?: string;
  showReference?: boolean;
  textOverride?: string;
};

export function BibleVerse({
  passage,
  className = "",
  showReference = true,
  textOverride,
}: BibleVerseProps) {
  const text = textOverride ?? passage.text;
  const isLongPassage = text ? text.length > 520 : false;

  if (!text) {
    return (
      <div
        className={`rounded-lg border border-dashed border-[#88e7ef] bg-[#effdfb] px-4 py-5 ${className}`}
      >
        <p className="font-serif text-3xl font-semibold leading-tight text-[#073a5a]">
          {passage.reference}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#38667a]">
          Texto bíblico pendiente de una traducción autorizada.
        </p>
      </div>
    );
  }

  return (
    <blockquote className={className}>
      <p
        className={
          isLongPassage
            ? "whitespace-pre-line font-serif text-lg font-medium leading-8 text-[#073a5a] sm:text-xl"
            : "font-serif text-[1.62rem] font-medium leading-[1.42] text-[#073a5a] sm:text-[2rem]"
        }
      >
        {text}
      </p>
      {showReference ? (
        <footer className="mt-5 text-sm font-medium text-[#00689d]">
          — {passage.reference}
          {passage.translation ? ` · ${passage.translation}` : ""}
        </footer>
      ) : null}
      {passage.copyrightNotice ? (
        <p className="mt-3 text-xs leading-5 text-[#50798a]">{passage.copyrightNotice}</p>
      ) : null}
    </blockquote>
  );
}
