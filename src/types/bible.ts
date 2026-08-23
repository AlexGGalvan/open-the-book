export type ThemeKey =
  | "direccion"
  | "paz"
  | "sabiduria"
  | "fortaleza"
  | "perdon"
  | "gratitud"
  | "amor"
  | "esperanza"
  | "ansiedad"
  | "proposito"
  | "soledad"
  | "fe"
  | "temor";

export type ReadingTheme = "dark" | "light";

export interface Passage {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  reference: string;
  themes: ThemeKey[];
  text: string;
  context: string;
  source: string;
}

export interface LastReading {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  reference: string;
  date: string;
  passageId?: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  book: string;
  chapter: number;
  verses: string;
  reference: string;
  theme: ThemeKey;
  text: string;
  passageId: string;
  isDemo?: boolean;
}

export interface SavedVerse {
  id: string;
  date: string;
  reference: string;
  preview: string;
  theme: ThemeKey;
  passageId: string;
  isDemo?: boolean;
}

export interface ReadingHistoryEntry {
  id: string;
  date: string;
  book: string;
  chapter: number;
  reference: string;
  theme?: ThemeKey;
  passageId?: string;
  isDemo?: boolean;
}

export interface MemorizeVerse {
  passageId: string;
  reference: string;
  text: string;
}

export interface UserPreferences {
  introSeen: boolean;
  readingTheme: ReadingTheme;
  fontScale: number;
  lineHeight: number;
}
