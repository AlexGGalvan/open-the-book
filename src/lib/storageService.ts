import type {
  LastReading,
  MemorizeVerse,
  ReadingHistoryEntry,
  ReflectionEntry,
  SavedVerse,
  UserPreferences,
} from "@/types/bible";

const keys = {
  preferences: "open-the-book:preferences",
  lastReading: "open-the-book:last-reading",
  reflections: "open-the-book:reflections",
  savedVerses: "open-the-book:saved-verses",
  history: "open-the-book:history",
  memorize: "open-the-book:memorize",
};

export const defaultPreferences: UserPreferences = {
  introSeen: false,
  readingTheme: "dark",
  fontScale: 1,
  lineHeight: 1.75,
};

function canStore() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canStore()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canStore()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storageService = {
  getPreferences() {
    return {
      ...defaultPreferences,
      ...readJson<UserPreferences>(keys.preferences, defaultPreferences),
    };
  },

  savePreferences(preferences: UserPreferences) {
    writeJson(keys.preferences, preferences);
    return preferences;
  },

  getLastReading() {
    return readJson<LastReading | null>(keys.lastReading, null);
  },

  saveLastReading(reading: LastReading) {
    writeJson(keys.lastReading, reading);
    return reading;
  },

  getReflections() {
    return readJson<ReflectionEntry[]>(keys.reflections, []);
  },

  saveReflection(reflection: ReflectionEntry) {
    const next = [reflection, ...this.getReflections()];
    writeJson(keys.reflections, next);
    return next;
  },

  deleteReflection(id: string) {
    const next = this.getReflections().filter((reflection) => reflection.id !== id);
    writeJson(keys.reflections, next);
    return next;
  },

  getSavedVerses() {
    return readJson<SavedVerse[]>(keys.savedVerses, []);
  },

  saveVerse(verse: SavedVerse) {
    const existing = this.getSavedVerses();
    const next = [verse, ...existing.filter((item) => item.passageId !== verse.passageId)];
    writeJson(keys.savedVerses, next);
    return next;
  },

  removeSavedVerse(id: string) {
    const next = this.getSavedVerses().filter((verse) => verse.id !== id);
    writeJson(keys.savedVerses, next);
    return next;
  },

  getReadingHistory() {
    return readJson<ReadingHistoryEntry[]>(keys.history, []);
  },

  addReadingHistory(entry: ReadingHistoryEntry) {
    const existing = this.getReadingHistory();
    const next = [entry, ...existing].slice(0, 80);
    writeJson(keys.history, next);
    return next;
  },

  getMemorizeVerse() {
    return readJson<MemorizeVerse | null>(keys.memorize, null);
  },

  saveMemorizeVerse(verse: MemorizeVerse) {
    writeJson(keys.memorize, verse);
    return verse;
  },

  clearUserData() {
    if (!canStore()) {
      return;
    }

    Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
  },
};
