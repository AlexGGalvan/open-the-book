"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Music2, type LucideIcon } from "lucide-react";
import { WeeklyRecitationCard } from "@/components/WeeklyRecitationCard";
import { WorshipSongCard } from "@/components/WorshipSongCard";
import { clearAppBrowserPersistence } from "@/lib/browserPersistence";

type AppSection = "recitation" | "worship";

type SectionNavigationItem = {
  id: AppSection;
  label: string;
  Icon: LucideIcon;
};

const sectionNavigation: SectionNavigationItem[] = [
  { id: "recitation", label: "Biblia", Icon: BookOpenText },
  { id: "worship", label: "Alabanzas", Icon: Music2 },
];

export function DailyMannaApp() {
  const [activeSection, setActiveSection] = useState<AppSection>("recitation");

  useEffect(() => {
    void clearAppBrowserPersistence();
  }, []);

  return (
    <main className="min-h-dvh bg-[#eafffb] text-[#073a5a]">
      <div className="recitation-texture min-h-dvh">
        <div className="mx-auto flex min-h-dvh w-full max-w-[780px] flex-col justify-center px-4 py-5 sm:px-8 sm:py-10">
          <div className="relative pb-10 pt-4">
            <nav
              aria-label="Secciones"
              className="mb-5 flex justify-center gap-4 xl:absolute xl:left-[-188px] xl:top-1/2 xl:mb-0 xl:-translate-y-1/2 xl:flex-col xl:gap-20"
            >
              {sectionNavigation.map((item) => {
                const selected = item.id === activeSection;

                return (
                  <button
                    key={item.id}
                    aria-label={item.label}
                    aria-pressed={selected}
                    className={`grid size-20 place-items-center rounded-full border shadow-[0_16px_34px_rgba(0,82,150,0.16)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#36d9e6] sm:size-24 ${
                      selected
                        ? "border-[#00589d] bg-[#00589d] text-white hover:border-[#00589d] hover:bg-[#00589d]"
                        : "border-[#9cebf0] bg-white/90 text-[#00689d] hover:border-[#36d9e6] hover:bg-white"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                    title={item.label}
                    type="button"
                  >
                    <item.Icon aria-hidden={true} size={38} strokeWidth={1.8} />
                    <span className="sr-only">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {activeSection === "recitation" ? <WeeklyRecitationCard /> : <WorshipSongCard />}
          </div>
        </div>
      </div>
    </main>
  );
}
