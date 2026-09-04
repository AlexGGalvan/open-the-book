"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TodayMannaCard } from "@/components/TodayMannaCard";
import { WeeklyMemorizationCard } from "@/components/WeeklyMemorizationCard";
import { MEMORIZATION_CONFIG } from "@/config/memorization";
import { clearAppBrowserPersistence } from "@/lib/browserPersistence";
import { formatLocalDate, getGreeting, getLocalDate } from "@/lib/dates";
import { getBibleHabitMannaForDate, getMannaForDate } from "@/services/mannaProvider";
import {
  getMemorizationForDate,
  type MemorizationSelection,
} from "@/services/memorizationProvider";
import type { Manna } from "@/types/bible";

type DailyMannaState = {
  greeting: string;
  dateLabel: string;
  manna: Manna;
  memorization: MemorizationSelection;
};

function getDailyMannaState(): DailyMannaState {
  const now = new Date();
  const dateKey = getLocalDate(now, MEMORIZATION_CONFIG.timezone);

  return {
    greeting: getGreeting(now),
    dateLabel: formatLocalDate(dateKey),
    manna: getMannaForDate(now, MEMORIZATION_CONFIG.timezone),
    memorization: getMemorizationForDate(now),
  };
}

export function DailyMannaApp() {
  const [dailyState, setDailyState] = useState<DailyMannaState | null>(null);

  const refreshDailyState = useCallback(async () => {
    const baseState = getDailyMannaState();

    setDailyState((currentState) => {
      if (currentState?.manna.id.startsWith("bible-habit-")) {
        return { ...baseState, manna: currentState.manna };
      }

      return baseState;
    });

    try {
      const remoteManna = await getBibleHabitMannaForDate(new Date(), MEMORIZATION_CONFIG.timezone);
      setDailyState((currentState) =>
        currentState ? { ...currentState, manna: remoteManna } : { ...baseState, manna: remoteManna },
      );
    } catch {
      setDailyState(baseState);
    }
  }, []);

  useEffect(() => {
    void clearAppBrowserPersistence();

    const initialTimer = window.setTimeout(() => {
      refreshDailyState();
    }, 0);

    const timer = window.setInterval(() => {
      refreshDailyState();
    }, 60 * 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [refreshDailyState]);

  if (!dailyState) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#fbf8f1] px-6 text-center text-[#171511]">
        <div>
          <p className="font-serif text-5xl font-semibold">Daily Manna</p>
          <p className="mt-3 text-sm text-[#6f685d]">Preparando la lectura de hoy.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#fbf8f1] text-[#171511]">
      <div className="manna-texture min-h-dvh">
        <div className="mx-auto flex min-h-dvh w-full max-w-[780px] flex-col px-4 py-5 sm:px-8 sm:py-10">
          <Header greeting={dailyState.greeting} />

          <div className="space-y-5 pb-10">
            <TodayMannaCard dateLabel={dailyState.dateLabel} manna={dailyState.manna} />
            <WeeklyMemorizationCard selection={dailyState.memorization} />
          </div>

          <footer className="mt-auto pb-5 pt-2 text-center text-xs leading-5 text-[#82796c]">
            Daily Manna usa la fecha local de {MEMORIZATION_CONFIG.timezone}.
          </footer>
        </div>
      </div>
    </main>
  );
}
