"use client";

import { useCallback, useEffect, useState } from "react";
import { findPassageById, passages } from "@/data/passages";
import { tapHaptic } from "@/lib/haptics";
import {
  defaultPreferences,
  storageService,
} from "@/lib/storageService";
import type {
  LastReading,
  MemorizeVerse,
  Passage,
  ReadingHistoryEntry,
  ReflectionEntry,
  SavedVerse,
  ThemeKey,
  UserPreferences,
} from "@/types/bible";

function createId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}-${random}`;
}

export function useOpenBookStore() {
  const [hydrated, setHydrated] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [lastReading, setLastReading] = useState<LastReading | null>(null);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryEntry[]>([]);
  const [memorizeVerse, setMemorizeVerse] = useState<MemorizeVerse | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setPreferences(storageService.getPreferences());
      setLastReading(storageService.getLastReading());
      setReflections(storageService.getReflections());
      setSavedVerses(storageService.getSavedVerses());
      setReadingHistory(storageService.getReadingHistory());
      setMemorizeVerse(storageService.getMemorizeVerse());
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => undefined);
    }
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...partial };
      storageService.savePreferences(next);
      return next;
    });
  }, []);

  const saveLastReading = useCallback((reading: LastReading) => {
    storageService.saveLastReading(reading);
    setLastReading(reading);
  }, []);

  const recordReading = useCallback(
    (passage: Passage, theme?: ThemeKey) => {
      const now = new Date().toISOString();
      const reading: LastReading = {
        id: createId("reading"),
        book: passage.book,
        chapter: passage.chapter,
        verses: passage.verses,
        reference: passage.reference,
        date: now,
        passageId: passage.id,
      };
      const history: ReadingHistoryEntry = {
        id: createId("history"),
        date: now,
        book: passage.book,
        chapter: passage.chapter,
        reference: `${passage.book} ${passage.chapter}`,
        theme: theme ?? passage.themes[0],
        passageId: passage.id,
      };

      saveLastReading(reading);
      setReadingHistory(storageService.addReadingHistory(history));
    },
    [saveLastReading],
  );

  const saveManualReading = useCallback(
    (reading: Omit<LastReading, "id" | "date">) => {
      saveLastReading({
        ...reading,
        id: createId("manual-reading"),
        date: new Date().toISOString(),
      });
    },
    [saveLastReading],
  );

  const saveReflection = useCallback(
    (passage: Passage, theme: ThemeKey, text: string) => {
      const reflection: ReflectionEntry = {
        id: createId("reflection"),
        date: new Date().toISOString(),
        book: passage.book,
        chapter: passage.chapter,
        verses: passage.verses,
        reference: passage.reference,
        theme,
        text,
        passageId: passage.id,
      };

      setReflections(storageService.saveReflection(reflection));
      recordReading(passage, theme);
      tapHaptic([8, 28, 8]);
      return reflection;
    },
    [recordReading],
  );

  const saveVerse = useCallback((passage: Passage, theme: ThemeKey) => {
    const verse: SavedVerse = {
      id: createId("saved"),
      date: new Date().toISOString(),
      reference: passage.reference,
      preview: passage.text.slice(0, 180),
      theme,
      passageId: passage.id,
    };

    setSavedVerses(storageService.saveVerse(verse));
    tapHaptic(18);
    return verse;
  }, []);

  const removeSavedVerse = useCallback((id: string) => {
    setSavedVerses(storageService.removeSavedVerse(id));
    tapHaptic(8);
  }, []);

  const setMemorizePassage = useCallback((passageId: string) => {
    const passage = findPassageById(passageId);
    const verse: MemorizeVerse = {
      passageId: passage.id,
      reference: passage.reference,
      text: passage.text,
    };

    setMemorizeVerse(storageService.saveMemorizeVerse(verse));
    tapHaptic(10);
  }, []);

  const markIntroSeen = useCallback(() => {
    updatePreferences({ introSeen: true });
  }, [updatePreferences]);

  const clearUserData = useCallback(() => {
    storageService.clearUserData();
    setPreferences({ ...defaultPreferences, introSeen: true });
    storageService.savePreferences({ ...defaultPreferences, introSeen: true });
    setLastReading(null);
    setReflections([]);
    setSavedVerses([]);
    setReadingHistory([]);
    setMemorizeVerse(null);
  }, []);

  return {
    hydrated,
    preferences,
    lastReading,
    reflections,
    savedVerses,
    readingHistory,
    memorizeVerse,
    allPassages: passages,
    updatePreferences,
    markIntroSeen,
    saveLastReading,
    saveManualReading,
    recordReading,
    saveReflection,
    saveVerse,
    removeSavedVerse,
    setMemorizePassage,
    clearUserData,
  };
}

export type OpenBookStore = ReturnType<typeof useOpenBookStore>;
