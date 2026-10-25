import { createHash } from "node:crypto";
import { normalizeBibleReference, normalizeText, type BibleReference } from "./bibleReferences";

export const IMPORT_TIMEZONE = "America/Monterrey";

export type ReadingPlanDay = {
  date: string;
  references: string[];
};

export type ImportIssue =
  | "author_phone_redacted"
  | "missing_biblical_text"
  | "missing_reflection_text"
  | "reference_not_in_reading_plan";

export type ImportedReflection = {
  messageHash: string;
  author: string;
  sentAt: string;
  readingDate: string;
  reference: string;
  book: string;
  biblicalText: string;
  reflectionText: string;
  status: "pending" | "ambiguous";
  issues: ImportIssue[];
  published: false;
};

export type ImportResult = {
  records: ImportedReflection[];
  ignored: Array<{
    messageHash: string;
    reason: "no_bible_reference" | "reading_plan_announcement" | "system_message" | "weekly_recitation";
  }>;
  duplicates: number;
  totalMessages: number;
};

export type ImportedWeeklyRecitation = {
  sourceMessageHash: string;
  weekStart: string;
  reference: string;
  book: string;
  biblicalText: string;
  translation: "Reina-Valera 1960";
};

type ParsedMessage = {
  rawAuthor: string;
  content: string;
  localDate: string;
  hour: number;
  minute: number;
  second: number;
  sentAt: string;
};

type ImportOptions = {
  readingPlan: ReadingPlanDay[];
  dateOrder?: "auto" | "day-first" | "month-first";
  existingHashes?: Iterable<string>;
  previousDayCutoffHour?: number;
  timezone?: string;
};

const bracketMessagePattern = /^\s*\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?(?:\s*m\.?)?)?\]\s*([^:]+):\s?(.*)$/iu;
const dashMessagePattern = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?(?:\s*m\.?)?)?\s+-\s+([^:]+):\s?(.*)$/iu;

export function processWhatsAppExport(source: string, options: ImportOptions): ImportResult {
  const timezone = options.timezone ?? IMPORT_TIMEZONE;
  const cutoffHour = options.previousDayCutoffHour ?? 3;
  const parsedMessages = parseWhatsAppMessages(source, timezone, options.dateOrder ?? "auto");
  const messages = mergeSplitReflectionMessages(parsedMessages);
  const knownHashes = new Set(options.existingHashes ?? []);
  const seenHashes = new Set<string>();
  const records: ImportedReflection[] = [];
  const ignored: ImportResult["ignored"] = [];
  let duplicates = 0;

  for (const message of messages) {
    const messageHash = hashMessage(message);

    if (knownHashes.has(messageHash) || seenHashes.has(messageHash)) {
      duplicates += 1;
      continue;
    }

    seenHashes.add(messageHash);

    if (isReadingPlanAnnouncement(message.content)) {
      ignored.push({ messageHash, reason: "reading_plan_announcement" });
      continue;
    }

    if (isWeeklyRecitationMessage(message.content)) {
      ignored.push({ messageHash, reason: "weekly_recitation" });
      continue;
    }

    const reference = normalizeBibleReference(message.content);

    if (!reference) {
      ignored.push({ messageHash, reason: "no_bible_reference" });
      continue;
    }

    const authorResult = sanitizeAuthor(message.rawAuthor);
    const split = splitVerseAndReflection(message.content, reference);
    const readingDate = resolveReadingDate(message, reference, options.readingPlan, cutoffHour);
    const issues: ImportIssue[] = [];

    if (authorResult.redacted) issues.push("author_phone_redacted");
    if (!split.biblicalText) issues.push("missing_biblical_text");
    if (!split.reflectionText) issues.push("missing_reflection_text");
    if (!readingDate.matchesPlan) issues.push("reference_not_in_reading_plan");

    records.push({
      messageHash,
      author: authorResult.author,
      sentAt: message.sentAt,
      readingDate: readingDate.date,
      reference: reference.normalized,
      book: reference.book,
      biblicalText: split.biblicalText,
      reflectionText: split.reflectionText,
      status: issues.length > 0 ? "ambiguous" : "pending",
      issues,
      published: false,
    });
  }

  return { records, ignored, duplicates, totalMessages: parsedMessages.length };
}

export function extractWeeklyRecitations(
  source: string,
  timezone = IMPORT_TIMEZONE,
  dateOrder: "auto" | "day-first" | "month-first" = "auto",
): ImportedWeeklyRecitation[] {
  const recitationsByWeek = new Map<string, ImportedWeeklyRecitation>();
  const currentLabelPattern = /recitaci[oó]n\s+de\s+esta\s+semana\s*\.?/iu;
  const nextLabelPattern = /recitaci[oó]n\s+de\s+pr[oó]xima\s+semana\s*\.?/iu;

  for (const message of parseWhatsAppMessages(source, timezone, dateOrder)) {
    const currentLabel = currentLabelPattern.exec(message.content);
    if (!currentLabel?.index && currentLabel?.index !== 0) continue;

    const afterCurrent = message.content.slice(currentLabel.index + currentLabel[0].length);
    const nextLabel = nextLabelPattern.exec(afterCurrent);
    const currentSegment = nextLabel ? afterCurrent.slice(0, nextLabel.index) : afterCurrent;
    const currentWeekStart = startOfIsoWeek(message.localDate);
    const sourceMessageHash = hashMessage(message);
    const currentRecitation = parseWeeklyRecitationSegment(currentSegment, currentWeekStart, sourceMessageHash);
    if (currentRecitation) recitationsByWeek.set(currentWeekStart, currentRecitation);

    if (nextLabel) {
      const nextSegment = afterCurrent.slice(nextLabel.index + nextLabel[0].length);
      const nextWeekStart = shiftDate(currentWeekStart, 7);
      const nextRecitation = parseWeeklyRecitationSegment(nextSegment, nextWeekStart, sourceMessageHash);
      if (nextRecitation) recitationsByWeek.set(nextWeekStart, nextRecitation);
    }
  }

  return [...recitationsByWeek.values()].sort((left, right) => left.weekStart.localeCompare(right.weekStart));
}

export function parseWhatsAppMessages(
  source: string,
  timezone = IMPORT_TIMEZONE,
  dateOrder: "auto" | "day-first" | "month-first" = "auto",
): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  let current: ParsedMessage | null = null;
  const resolvedDateOrder = dateOrder === "auto" ? detectDateOrder(source) : dateOrder;

  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    const match = bracketMessagePattern.exec(line) ?? dashMessagePattern.exec(line);

    if (match) {
      const [, rawFirstDatePart, rawSecondDatePart, rawYear, rawHour, rawMinute, rawSecond, meridiem, rawAuthor, firstLine] = match;
      const year = normalizeYear(Number(rawYear));
      const firstDatePart = Number(rawFirstDatePart);
      const secondDatePart = Number(rawSecondDatePart);
      const month = resolvedDateOrder === "month-first" ? firstDatePart : secondDatePart;
      const day = resolvedDateOrder === "month-first" ? secondDatePart : firstDatePart;
      const hour = normalizeHour(Number(rawHour), meridiem);
      const minute = Number(rawMinute);
      const second = Number(rawSecond ?? 0);
      const localDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      current = {
        rawAuthor: rawAuthor.trim(),
        content: firstLine,
        localDate,
        hour,
        minute,
        second,
        sentAt: zonedDateTimeToIso({ year, month, day, hour, minute, second }, timezone),
      };
      messages.push(current);
      continue;
    }

    if (current) {
      current.content = `${current.content}\n${line}`;
    }
  }

  return messages;
}

function mergeSplitReflectionMessages(messages: ParsedMessage[]) {
  const mergeCandidates = messages.filter((message) => !isDeletedMessage(message.content));
  const merged: ParsedMessage[] = [];

  for (let index = 0; index < mergeCandidates.length; index += 1) {
    const biblicalTextMessage = mergeCandidates[index];
    const referenceMessage = mergeCandidates[index + 1];
    const reflectionMessage = mergeCandidates[index + 2];

    if (canMergeSplitReflection(biblicalTextMessage, referenceMessage, reflectionMessage)) {
      merged.push({
        ...referenceMessage,
        content: [biblicalTextMessage.content, referenceMessage.content, reflectionMessage.content].join("\n\n"),
      });
      index += 2;
      continue;
    }

    merged.push(biblicalTextMessage);
  }

  return merged;
}

function canMergeSplitReflection(
  biblicalTextMessage: ParsedMessage | undefined,
  referenceMessage: ParsedMessage | undefined,
  reflectionMessage: ParsedMessage | undefined,
) {
  if (!biblicalTextMessage || !referenceMessage || !reflectionMessage) return false;

  const author = normalizeText(referenceMessage.rawAuthor);
  if (
    normalizeText(biblicalTextMessage.rawAuthor) !== author
    || normalizeText(reflectionMessage.rawAuthor) !== author
  ) {
    return false;
  }

  const reference = normalizeBibleReference(referenceMessage.content);
  if (
    !reference
    || !isReferenceOnly(referenceMessage.content, reference)
    || normalizeBibleReference(biblicalTextMessage.content)
    || normalizeBibleReference(reflectionMessage.content)
  ) {
    return false;
  }

  return isWithinMergeWindow(biblicalTextMessage, referenceMessage)
    && isWithinMergeWindow(referenceMessage, reflectionMessage);
}

function isReferenceOnly(content: string, reference: BibleReference) {
  const remainder = `${content.slice(0, reference.startIndex)}${content.slice(reference.endIndex)}`;
  return remainder.replace(/[\p{P}\p{S}\s]/gu, "") === "";
}

function isWithinMergeWindow(earlier: ParsedMessage, later: ParsedMessage) {
  const difference = Date.parse(later.sentAt) - Date.parse(earlier.sentAt);
  return difference >= 0 && difference <= 15 * 60 * 1_000;
}

function isDeletedMessage(content: string) {
  return normalizeText(content).includes("se elimino este mensaje");
}

function detectDateOrder(source: string): "day-first" | "month-first" {
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    const match = bracketMessagePattern.exec(line) ?? dashMessagePattern.exec(line);
    if (!match) continue;

    const firstDatePart = Number(match[1]);
    const secondDatePart = Number(match[2]);
    if (firstDatePart > 12) return "day-first";
    if (secondDatePart > 12) return "month-first";
  }

  return "day-first";
}

export function buildReadingPlan(readingDays: Array<{ date: string; passages: Array<{ reference: string }> }>): ReadingPlanDay[] {
  return readingDays.map((day) => ({ date: day.date, references: day.passages.map((passage) => passage.reference) }));
}

function resolveReadingDate(message: ParsedMessage, reference: BibleReference, readingPlan: ReadingPlanDay[], cutoffHour: number) {
  const previousDate = shiftDate(message.localDate, -1);
  const candidates = message.hour < cutoffHour
    ? [previousDate, message.localDate]
    : [message.localDate, previousDate];

  for (const date of candidates) {
    if (referenceMatchesDay(reference, readingPlan.find((day) => day.date === date))) {
      return { date, matchesPlan: true };
    }
  }

  return { date: message.hour < cutoffHour ? previousDate : message.localDate, matchesPlan: false };
}

function referenceMatchesDay(reference: BibleReference, readingDay: ReadingPlanDay | undefined) {
  if (!readingDay) return false;

  return readingDay.references.some((plannedReference) => {
    const planned = normalizeBibleReference(plannedReference);
    if (!planned || planned.book !== reference.book) return false;
    const plannedEnd = planned.chapterEnd ?? planned.chapter;
    return reference.chapter >= planned.chapter && reference.chapter <= plannedEnd;
  });
}

function splitVerseAndReflection(content: string, reference: BibleReference) {
  const withoutReference = `${content.slice(0, reference.startIndex)}${content.slice(reference.endIndex)}`
    .replace(/^\s*[-–—:|]+\s*/, "")
    .replace(
      /^\s*(?:[\p{Extended_Pictographic}\uFE0F]\s*)*(?:\*{1,2})?lectura(?:\s+b[ií]blica)?\s+de\s+hoy(?:\*{1,2})?\s*:?\s*(?:\n+|$)/iu,
      "",
    )
    .trim();
  const reflectionLabel = /(?:^|\n)\s*reflexi[oó]n\s*:\s*/iu;
  const reflectionMatch = reflectionLabel.exec(withoutReference);

  if (reflectionMatch?.index !== undefined) {
    const biblicalText = cleanSection(withoutReference.slice(0, reflectionMatch.index), ["texto", "versículo", "versiculo", "cita"]);
    const reflectionText = cleanSection(withoutReference.slice(reflectionMatch.index + reflectionMatch[0].length), []);
    return { biblicalText, reflectionText };
  }

  const paragraphs = withoutReference.split(/\n\s*\n/).map((section) => section.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    return {
      biblicalText: cleanSection(paragraphs[0], ["texto", "versículo", "versiculo", "cita"]),
      reflectionText: cleanSection(paragraphs.slice(1).join("\n\n"), []),
    };
  }

  return {
    biblicalText: cleanSection(withoutReference, ["texto", "versículo", "versiculo", "cita"]),
    reflectionText: "",
  };
}

function cleanSection(value: string, labels: string[]) {
  let cleaned = value
    .replace(/\(\s*[\u200e\u200f\u202a-\u202e\u2066-\u2069]*\s*\)/gu, "")
    .trim();
  for (const label of labels) {
    cleaned = cleaned.replace(new RegExp(`^${label}\\s*:\\s*`, "iu"), "");
  }
  return cleaned.trim();
}

function isReadingPlanAnnouncement(content: string) {
  const normalized = normalizeText(content);
  return normalized.includes("lectura biblica de hoy") && normalized.includes("pasajes de hoy");
}

function isWeeklyRecitationMessage(content: string) {
  return normalizeText(content).includes("recitacion de esta semana");
}

function parseWeeklyRecitationSegment(
  segment: string,
  weekStart: string,
  sourceMessageHash: string,
): ImportedWeeklyRecitation | null {
  const reference = normalizeBibleReference(segment);
  if (!reference) return null;

  const biblicalText = cleanSection(segment.slice(reference.endIndex), []);
  if (!biblicalText) return null;

  return {
    sourceMessageHash,
    weekStart,
    reference: reference.normalized,
    book: reference.book,
    biblicalText,
    translation: "Reina-Valera 1960",
  };
}

function startOfIsoWeek(date: string) {
  const utcDate = new Date(`${date}T00:00:00.000Z`);
  const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7;
  return shiftDate(date, -daysSinceMonday);
}

function sanitizeAuthor(rawAuthor: string) {
  const digitCount = rawAuthor.replace(/\D/g, "").length;
  const redacted = digitCount >= 8 || /^\+?[\d\s()-]+$/.test(rawAuthor.trim());
  return { author: redacted ? "Participante sin nombre" : rawAuthor.trim(), redacted };
}

function hashMessage(message: ParsedMessage) {
  return createHash("sha256")
    .update(`${normalizeText(message.rawAuthor)}|${message.sentAt}|${normalizeText(message.content)}`)
    .digest("hex");
}

function normalizeYear(year: number) {
  return year < 100 ? 2000 + year : year;
}

function normalizeHour(hour: number, meridiem?: string) {
  if (!meridiem) return hour;
  const normalized = normalizeText(meridiem).replace(/\s|\./g, "");
  if (normalized === "pm" && hour < 12) return hour + 12;
  if (normalized === "am" && hour === 12) return 0;
  return hour;
}

function shiftDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function zonedDateTimeToIso(
  parts: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  timezone: string,
) {
  const requestedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const displayed = Object.fromEntries(formatter.formatToParts(new Date(requestedAsUtc)).map((part) => [part.type, part.value]));
  const displayedAsUtc = Date.UTC(
    Number(displayed.year),
    Number(displayed.month) - 1,
    Number(displayed.day),
    Number(displayed.hour),
    Number(displayed.minute),
    Number(displayed.second),
  );
  const timezoneOffset = displayedAsUtc - requestedAsUtc;
  return new Date(requestedAsUtc - timezoneOffset).toISOString();
}
