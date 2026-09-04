import { BookOpenText } from "lucide-react";

type HeaderProps = {
  greeting: string;
};

export function Header({ greeting }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-5 pb-8 pt-2">
      <div className="min-w-0 space-y-3">
        <p className="text-lg font-medium text-[#163a62] sm:text-xl">{greeting}</p>
        <div>
          <h1 className="font-serif text-5xl font-semibold leading-none text-[#15130f] sm:text-6xl">
            Daily Manna
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6f685d] sm:text-base">
            Give us this day our daily bread.
          </p>
        </div>
      </div>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#d9cfae] bg-[#fffdf7] text-[#163a62] shadow-[0_18px_40px_rgba(54,45,27,0.08)]">
        <BookOpenText aria-hidden="true" size={23} strokeWidth={1.7} />
      </div>
    </header>
  );
}
