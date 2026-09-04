import { MEMORIZATION_CONFIG, type MemorizationConfig } from "@/config/memorization";
import { memorizationVerses } from "@/data/memorizationVerses";
import {
  addDaysToDateKey,
  getLocalDate,
  getStartOfWeekDateKey,
  getWeeksDifference,
  mod,
  type DateInput,
} from "@/lib/dates";
import type { MemorizationVerse } from "@/types/bible";

export type MemorizationSelection = {
  verse: MemorizationVerse;
  index: number;
  anchorIndex: number;
  weeksPassed: number;
  weekStartDate: string;
  weekEndDate: string;
  loadedReferences: number;
  expectedReferences: number;
  showWeekCounter: boolean;
};

export function getMemorizationForDate(
  date: DateInput = new Date(),
  config: MemorizationConfig = MEMORIZATION_CONFIG,
  verses = memorizationVerses,
): MemorizationSelection {
  if (!verses.length) {
    throw new Error("No hay referencias de memorización cargadas.");
  }

  const dateKey = getLocalDate(date, config.timezone);
  const anchorIndex = verses.findIndex((verse) => verse.reference === config.anchorReference);
  const safeAnchorIndex = anchorIndex >= 0 ? anchorIndex : 0;
  const weeksPassed = getWeeksDifference(config.anchorDate, dateKey, config.weekStartsOn);
  const index = mod(safeAnchorIndex + weeksPassed, verses.length);
  const weekStartDate = getStartOfWeekDateKey(dateKey, config.weekStartsOn);

  return {
    verse: verses[index],
    index,
    anchorIndex: safeAnchorIndex,
    weeksPassed,
    weekStartDate,
    weekEndDate: addDaysToDateKey(weekStartDate, 6),
    loadedReferences: verses.length,
    expectedReferences: config.expectedTotalReferences,
    showWeekCounter: config.showWeekCounter,
  };
}

export function getBibleText(reference: string, translation = "inline") {
  if (translation !== "inline") {
    return null;
  }

  return memorizationVerses.find((verse) => verse.reference === reference)?.text ?? null;
}
