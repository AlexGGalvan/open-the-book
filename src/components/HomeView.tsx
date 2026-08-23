"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import { BookOpen, Bookmark, ChevronRight, Clock, PenLine } from "lucide-react";
import { demoLastReading, demoReflections, demoSavedVerses } from "@/data/demo";
import { findPassageById } from "@/data/passages";
import { themeLabels, topicThemes } from "@/data/themes";
import { formatReadableDate, getGreeting } from "@/lib/dates";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";
import type { Passage, ThemeKey } from "@/types/bible";
import type { AppTab } from "@/components/BottomNav";
import { TopicSelector } from "@/components/TopicSelector";

interface HomeViewProps {
  store: OpenBookStore;
  onSelectTheme: (theme: ThemeKey) => void;
  onOpenPassage: (passage: Passage, theme?: ThemeKey) => void;
  onNavigate: (tab: AppTab) => void;
}

export function HomeView({ store, onSelectTheme, onOpenPassage, onNavigate }: HomeViewProps) {
  const lastReading = store.lastReading ?? demoLastReading;
  const lastPassage = findPassageById(lastReading.passageId ?? demoLastReading.passageId ?? "");
  const reflections = store.reflections.length > 0 ? store.reflections : demoReflections;
  const saved = store.savedVerses.length > 0 ? store.savedVerses : demoSavedVerses;
  const demoMode =
    store.reflections.length === 0 && store.savedVerses.length === 0 && !store.lastReading;

  return (
    <motion.section
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="space-y-2 pt-2">
        <p className="text-sm text-[#b9aa92]">{getGreeting()}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">My Bible</h1>
            <p className="mt-3 text-sm text-[#b9aa92]">Continúa donde te quedaste.</p>
          </div>
          {demoMode ? (
            <span className="rounded-full border border-[#f4dfb8]/18 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d7c5a1]">
              Demo
            </span>
          ) : null}
        </div>
      </header>

      <button
        type="button"
        className="group w-full rounded-[30px] border border-[#f4dfb8]/14 bg-[linear-gradient(145deg,rgba(244,223,184,0.16),rgba(255,255,255,0.04))] p-5 text-left shadow-[0_30px_90px_rgba(0,0,0,0.28)] transition hover:border-[#f4dfb8]/32 focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/45"
        onClick={() => onOpenPassage(lastPassage, lastPassage.themes[0])}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d7c5a1]">
            {lastReading.book}
          </span>
          <Clock aria-hidden="true" className="text-[#d7c5a1]" size={17} />
        </div>
        <p className="font-serif text-3xl text-[#fff7e9]">{lastReading.reference}</p>
        <p className="mt-2 text-sm text-[#b9aa92]">{formatReadableDate(lastReading.date)}</p>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#f4dfb8]">
          Continuar leyendo
          <ChevronRight
            aria-hidden="true"
            size={16}
            className="transition group-hover:translate-x-1"
          />
        </span>
      </button>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-[#fff7e9]">¿Qué estás buscando hoy?</h2>
          <button
            type="button"
            className="text-sm text-[#d7c5a1]"
            onClick={() => onNavigate("read")}
          >
            Ver todo
          </button>
        </div>
        <TopicSelector themes={topicThemes.slice(0, 8)} onSelect={onSelectTheme} compact />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <QuickCard
          icon={BookOpen}
          label="Lectura actual"
          value={lastReading.reference}
          onClick={() => onNavigate("read")}
        />
        <QuickCard
          icon={PenLine}
          label="Reflections"
          value={`${reflections.length} entradas`}
          onClick={() => onNavigate("journey")}
        />
        <QuickCard
          icon={Bookmark}
          label="Saved"
          value={`${saved.length} pasajes`}
          onClick={() => onNavigate("saved")}
        />
        <QuickCard
          icon={Clock}
          label="Your Journey"
          value="Ritmo discreto"
          onClick={() => onNavigate("profile")}
        />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#15100c]/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-[#fff7e9]">Última lectura</h2>
          <span className="text-xs uppercase tracking-[0.22em] text-[#958873]">
            {demoMode ? "Demo" : "Local"}
          </span>
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-[#d7c5a1]">{lastReading.book}</p>
        <p className="mt-2 text-xl text-[#f7ead4]">{lastReading.reference}</p>
        <p className="mt-1 text-sm text-[#958873]">{formatReadableDate(lastReading.date)}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-3xl text-[#fff7e9]">Reflections</h2>
        {reflections.slice(0, 2).map((reflection) => (
          <button
            key={reflection.id}
            type="button"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
            onClick={() => onNavigate("journey")}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#f7ead4]">{reflection.reference}</p>
              <span className="rounded-full bg-[#f4dfb8]/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#d7c5a1]">
                {themeLabels[reflection.theme]}
              </span>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-[#b9aa92]">“{reflection.text}”</p>
          </button>
        ))}
      </section>
    </motion.section>
  );
}

type QuickCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  onClick: () => void;
};

function QuickCard({ icon: Icon, label, value, onClick }: QuickCardProps) {
  return (
    <button
      type="button"
      className="min-h-32 rounded-[24px] border border-white/10 bg-[#15100c]/78 p-4 text-left transition hover:border-[#f4dfb8]/24 hover:bg-[#1b140f] focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/35"
      onClick={onClick}
    >
      <Icon aria-hidden="true" className="mb-5 text-[#d7c5a1]" size={20} strokeWidth={1.8} />
      <p className="text-xs uppercase tracking-[0.22em] text-[#958873]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-5 text-[#f7ead4]">{value}</p>
    </button>
  );
}
