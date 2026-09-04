import mannaItems from "@/data/manna.json";
import { getRvr1960Passage } from "@/data/rvr1960Passages";
import { getDaysDifference, getLocalDate, mod, type DateInput } from "@/lib/dates";
import type { Manna } from "@/types/bible";

export const MANNA_CONFIG = {
  anchorDate: "2026-09-04",
  timezone: "America/Monterrey",
  bibleHabitApiUrl:
    "https://api--bible-habit-server--26zn8kx8mjzy.code.run/api/daily-manna/today",
} as const;

const manna = mannaItems as Manna[];

type BibleHabitMannaVerse = {
  book: string;
  verse: string;
  content: string;
  bookname?: string;
};

type BibleHabitMannaResponse = {
  id: string;
  dateKey: string;
  referenceText: string;
  source?: string;
  fetchedAt?: string;
  verses: BibleHabitMannaVerse[];
};

export function getMannaForDate(date: DateInput = new Date(), timezone = MANNA_CONFIG.timezone) {
  const dateKey = getLocalDate(date, timezone);
  const exactManna = manna.find((item) => item.date === dateKey);

  if (exactManna) {
    return exactManna;
  }

  const offset = getDaysDifference(MANNA_CONFIG.anchorDate, dateKey);
  return manna[mod(offset, manna.length)];
}

export async function getBibleHabitMannaForDate(
  date: DateInput = new Date(),
  timezone = MANNA_CONFIG.timezone,
): Promise<Manna> {
  const fallback = getMannaForDate(date, timezone);
  const dateKey = getLocalDate(date, timezone);
  const requestUrl = new URL(MANNA_CONFIG.bibleHabitApiUrl);
  requestUrl.searchParams.set("clientDate", dateKey);
  requestUrl.searchParams.set("cacheBust", String(Date.now()));

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return fallback;
  }

  const payload = (await response.json()) as BibleHabitMannaResponse;
  const reference = toSpanishReference(payload.referenceText, payload.verses);

  if (!reference) {
    return fallback;
  }

  const text = getNonKoreanVerseText(payload.verses);
  const spanishPassage = getRvr1960Passage(reference);
  const resolvedText = text ?? spanishPassage?.text;

  return {
    id: `bible-habit-${payload.id}`,
    date: payload.dateKey,
    reference,
    title: "Pasaje de hoy",
    text: resolvedText,
    translation: spanishPassage?.translation,
    copyrightNotice: spanishPassage?.copyrightNotice,
    reflection:
      resolvedText === undefined
        ? "Referencia sincronizada desde Bible Habit. El texto se mostrará cuando conectemos una traducción bíblica autorizada."
        : undefined,
    source: payload.source ? `Bible Habit API: ${payload.source}` : "Bible Habit API",
  };
}

function getNonKoreanVerseText(verses: BibleHabitMannaVerse[]) {
  const combined = verses
    .map((verse) => verse.content.trim())
    .filter(Boolean)
    .join(" ");

  if (!combined || /\p{Script=Hangul}/u.test(combined)) {
    return undefined;
  }

  return combined;
}

function toSpanishReference(referenceText: string, verses: BibleHabitMannaVerse[]) {
  const trimmed = referenceText.trim();
  const parsed = parseReference(trimmed);

  if (parsed) {
    return parsed;
  }

  const first = verses[0];
  const last = verses[verses.length - 1];

  if (!first || !last) {
    return "";
  }

  const book = koreanBookNames[first.book] ?? first.book;
  const start = first.verse;
  const end = last.verse.includes(":") ? last.verse.split(":")[1] : last.verse;

  return start === last.verse ? `${book} ${start}` : `${book} ${start}-${end}`;
}

function parseReference(referenceText: string) {
  const match = referenceText.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);

  if (!match) {
    return "";
  }

  const [, bookKey, chapter, verseStart, verseEnd] = match;
  const book = koreanBookNames[bookKey] ?? bookKey;

  return `${book} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ""}`;
}

const koreanBookNames: Record<string, string> = {
  창: "Génesis",
  출: "Éxodo",
  레: "Levítico",
  민: "Números",
  신: "Deuteronomio",
  수: "Josué",
  삿: "Jueces",
  룻: "Rut",
  삼상: "1 Samuel",
  삼하: "2 Samuel",
  왕상: "1 Reyes",
  왕하: "2 Reyes",
  대상: "1 Crónicas",
  대하: "2 Crónicas",
  스: "Esdras",
  느: "Nehemías",
  에: "Ester",
  욥: "Job",
  시: "Salmos",
  잠: "Proverbios",
  전: "Eclesiastés",
  아: "Cantares",
  사: "Isaías",
  렘: "Jeremías",
  애: "Lamentaciones",
  겔: "Ezequiel",
  단: "Daniel",
  호: "Oseas",
  욜: "Joel",
  암: "Amós",
  옵: "Abdías",
  욘: "Jonás",
  미: "Miqueas",
  나: "Nahúm",
  합: "Habacuc",
  습: "Sofonías",
  학: "Hageo",
  슥: "Zacarías",
  말: "Malaquías",
  마: "Mateo",
  막: "Marcos",
  눅: "Lucas",
  요: "Juan",
  행: "Hechos",
  롬: "Romanos",
  고전: "1 Corintios",
  고후: "2 Corintios",
  갈: "Gálatas",
  엡: "Efesios",
  빌: "Filipenses",
  골: "Colosenses",
  살전: "1 Tesalonicenses",
  살후: "2 Tesalonicenses",
  딤전: "1 Timoteo",
  딤후: "2 Timoteo",
  딛: "Tito",
  몬: "Filemón",
  히: "Hebreos",
  약: "Santiago",
  벧전: "1 Pedro",
  벧후: "2 Pedro",
  요일: "1 Juan",
  요이: "2 Juan",
  요삼: "3 Juan",
  유: "Judas",
  계: "Apocalipsis",
};
