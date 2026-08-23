"use client";

import { motion } from "framer-motion";
import { RotateCcw, Settings, Trash2 } from "lucide-react";
import { demoReadingHistory, demoReflections, demoSavedVerses } from "@/data/demo";
import { formatReadableDate, toDateKey } from "@/lib/dates";
import type { OpenBookStore } from "@/hooks/useOpenBookStore";

interface ProfileViewProps {
  store: OpenBookStore;
  onReplayIntro: () => void;
}

export function ProfileView({ store, onReplayIntro }: ProfileViewProps) {
  const reflections = store.reflections.length > 0 ? store.reflections : demoReflections;
  const history = store.readingHistory.length > 0 ? store.readingHistory : demoReadingHistory;
  const saved = store.savedVerses.length > 0 ? store.savedVerses : demoSavedVerses;
  const demoMode =
    store.reflections.length === 0 && store.readingHistory.length === 0 && store.savedVerses.length === 0;

  const readingDays = new Set(history.map((entry) => toDateKey(entry.date))).size;
  const booksExplored = new Set(history.map((entry) => entry.book)).size;

  return (
    <motion.section
      key="profile"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-28"
    >
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#b9aa92]">Profile</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-5xl leading-none text-[#fff7e9]">Your Journey</h1>
            <p className="mt-3 text-sm text-[#b9aa92]">Un registro quieto, no una competencia.</p>
          </div>
          {demoMode ? (
            <span className="rounded-full border border-[#f4dfb8]/18 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d7c5a1]">
              Demo
            </span>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <StatCard value={`${readingDays}`} label="días leyendo" />
        <StatCard value={`${reflections.length}`} label="reflexiones" />
        <StatCard value={`${booksExplored}`} label="libros explorados" />
        <StatCard value={`${saved.length}`} label="pasajes guardados" />
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[#15100c]/76 p-5">
        <div className="mb-5">
          <h2 className="font-serif text-3xl text-[#fff7e9]">Calendario</h2>
          <p className="text-sm text-[#958873]">Últimos 35 días con actividad de lectura.</p>
        </div>
        <Heatmap activeDates={new Set(history.map((entry) => toDateKey(entry.date)))} />
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[#15100c]/76 p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4dfb8]/12 text-[#f4dfb8]">
            <Settings aria-hidden="true" size={19} />
          </span>
          <div>
            <h2 className="font-serif text-3xl text-[#fff7e9]">Settings</h2>
            <p className="text-sm text-[#958873]">Preferencias guardadas en este dispositivo.</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left text-[#f7ead4] transition hover:bg-white/[0.08]"
            onClick={onReplayIntro}
          >
            <span>
              <span className="block text-sm font-medium">Replay introduction</span>
              <span className="text-xs text-[#958873]">Volver a ver OPEN THE BOOK.</span>
            </span>
            <RotateCcw aria-hidden="true" size={17} />
          </button>
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left text-[#f7ead4] transition hover:bg-white/[0.08]"
            onClick={store.clearUserData}
          >
            <span>
              <span className="block text-sm font-medium">Clear local data</span>
              <span className="text-xs text-[#958873]">Elimina lecturas, reflexiones y favoritos reales.</span>
            </span>
            <Trash2 aria-hidden="true" size={17} />
          </button>
        </div>
      </section>

      <p className="px-2 text-center text-xs leading-5 text-[#7d725f]">
        Última actividad visible: {formatReadableDate(history[0]?.date ?? new Date().toISOString())}
      </p>
    </motion.section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="min-h-28 rounded-[24px] border border-white/10 bg-[#15100c]/76 p-4">
      <p className="font-serif text-4xl leading-none text-[#fff7e9]">{value}</p>
      <p className="mt-3 text-sm leading-5 text-[#b9aa92]">{label}</p>
    </article>
  );
}

function Heatmap({ activeDates }: { activeDates: Set<string> }) {
  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - index));
    return date;
  });

  return (
    <div className="grid grid-cols-7 gap-2" aria-label="Calendario de lectura">
      {days.map((date) => {
        const key = toDateKey(date);
        const active = activeDates.has(key);

        return (
          <span
            key={key}
            title={formatReadableDate(date.toISOString())}
            aria-label={`${formatReadableDate(date.toISOString())}${active ? ", con lectura" : ""}`}
            className={`aspect-square rounded-lg border ${
              active
                ? "border-[#f4dfb8]/45 bg-[#f4dfb8]/70 shadow-[0_0_22px_rgba(244,223,184,0.18)]"
                : "border-white/[0.06] bg-white/[0.035]"
            }`}
          />
        );
      })}
    </div>
  );
}
