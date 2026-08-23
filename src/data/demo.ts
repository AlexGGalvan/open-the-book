import { findPassageById } from "@/data/passages";
import type {
  LastReading,
  ReadingHistoryEntry,
  ReflectionEntry,
  SavedVerse,
} from "@/types/bible";

const romans = findPassageById("romans-13-8-13");
const psalm = findPassageById("psalm-34-4-8");
const matthew = findPassageById("matthew-6-25-34");
const corinthians = findPassageById("first-corinthians-13-4-8");
const proverbs = findPassageById("proverbs-4-20-27");
const romansHope = findPassageById("romans-8-31-39");

export const demoLastReading: LastReading = {
  id: "demo-last-reading",
  book: romans.book,
  chapter: romans.chapter,
  verses: romans.verses,
  reference: romans.reference,
  date: "2026-08-22T20:18:00.000Z",
  passageId: romans.id,
};

export const demoReflections: ReflectionEntry[] = [
  {
    id: "demo-reflection-romans",
    date: "2026-08-22T20:28:00.000Z",
    book: romans.book,
    chapter: romans.chapter,
    verses: "8-10",
    reference: "Romanos 13:8-10",
    theme: "amor",
    passageId: "romans-13-8-10",
    text: "Hoy entendí que amar al prójimo no es una idea amplia; empieza con lo que decido deber o soltar en lo cotidiano.",
    isDemo: true,
  },
  {
    id: "demo-reflection-psalm",
    date: "2026-08-19T07:42:00.000Z",
    book: psalm.book,
    chapter: psalm.chapter,
    verses: psalm.verses,
    reference: psalm.reference,
    theme: "temor",
    passageId: psalm.id,
    text: "La frase sobre buscar y ser oído me dejó respirar. No necesito ordenar todo antes de acercarme.",
    isDemo: true,
  },
  {
    id: "demo-reflection-matthew",
    date: "2026-08-15T22:06:00.000Z",
    book: matthew.book,
    chapter: matthew.chapter,
    verses: matthew.verses,
    reference: matthew.reference,
    theme: "ansiedad",
    passageId: matthew.id,
    text: "Me habló la idea de no vivir adelantado al día de mañana. Hoy tiene su propio margen de gracia.",
    isDemo: true,
  },
];

export const demoSavedVerses: SavedVerse[] = [
  {
    id: "demo-saved-corinthians",
    date: "2026-08-22T21:00:00.000Z",
    reference: corinthians.reference,
    preview: corinthians.text.slice(0, 155),
    theme: "amor",
    passageId: corinthians.id,
    isDemo: true,
  },
  {
    id: "demo-saved-proverbs",
    date: "2026-08-20T07:20:00.000Z",
    reference: proverbs.reference,
    preview: proverbs.text.slice(0, 155),
    theme: "sabiduria",
    passageId: proverbs.id,
    isDemo: true,
  },
  {
    id: "demo-saved-romans-hope",
    date: "2026-08-18T18:10:00.000Z",
    reference: romansHope.reference,
    preview: romansHope.text.slice(0, 155),
    theme: "esperanza",
    passageId: romansHope.id,
    isDemo: true,
  },
];

export const demoReadingHistory: ReadingHistoryEntry[] = [
  {
    id: "demo-history-romans",
    date: "2026-08-22T20:18:00.000Z",
    book: romans.book,
    chapter: romans.chapter,
    reference: "Romanos 13",
    theme: "amor",
    passageId: romans.id,
    isDemo: true,
  },
  {
    id: "demo-history-psalm",
    date: "2026-08-19T07:35:00.000Z",
    book: psalm.book,
    chapter: psalm.chapter,
    reference: "Salmos 34",
    theme: "temor",
    passageId: psalm.id,
    isDemo: true,
  },
  {
    id: "demo-history-matthew",
    date: "2026-08-15T21:55:00.000Z",
    book: matthew.book,
    chapter: matthew.chapter,
    reference: "Mateo 6",
    theme: "ansiedad",
    passageId: matthew.id,
    isDemo: true,
  },
];
