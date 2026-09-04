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

  if (!text) {
    return (
      <div
        className={`rounded-lg border border-dashed border-[#d8cda9] bg-[#fffaf0] px-4 py-5 text-sm leading-6 text-[#7a6f60] ${className}`}
      >
        Texto bíblico pendiente para esta referencia.
      </div>
    );
  }

  return (
    <blockquote className={className}>
      <p className="font-serif text-[1.62rem] font-medium leading-[1.42] text-[#171511] sm:text-[2rem]">
        {text}
      </p>
      {showReference ? (
        <footer className="mt-5 text-sm font-medium text-[#736b5c]">— {passage.reference}</footer>
      ) : null}
    </blockquote>
  );
}
