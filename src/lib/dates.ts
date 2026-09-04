export const DEFAULT_TIMEZONE = "America/Monterrey";
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

export type DateInput = Date | string;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function toDateKey(date: DateInput) {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function getLocalDate(date: DateInput = new Date(), timezone = DEFAULT_TIMEZONE) {
  if (typeof date === "string") {
    return toDateKey(date);
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function dateKeyToUtcDate(dateKey: string) {
  const [year = "1970", month = "01", day = "01"] = dateKey.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const value = dateKeyToUtcDate(dateKey);
  value.setUTCDate(value.getUTCDate() + days);
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

export function getDaysDifference(startDate: string, endDate: string) {
  const start = dateKeyToUtcDate(startDate).getTime();
  const end = dateKeyToUtcDate(endDate).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

export function getStartOfWeekDateKey(date: DateInput, weekStartsOn = 1) {
  const dateKey = toDateKey(date);
  const value = dateKeyToUtcDate(dateKey);
  const day = value.getUTCDay();
  const daysSinceStart = mod(day - weekStartsOn, 7);

  value.setUTCDate(value.getUTCDate() - daysSinceStart);

  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

export function getWeeksDifference(anchorDate: string, currentDate: DateInput, weekStartsOn = 1) {
  const anchorWeekStart = dateKeyToUtcDate(getStartOfWeekDateKey(anchorDate, weekStartsOn));
  const currentWeekStart = dateKeyToUtcDate(getStartOfWeekDateKey(currentDate, weekStartsOn));

  return Math.round((currentWeekStart.getTime() - anchorWeekStart.getTime()) / MS_PER_WEEK);
}

export function getCurrentWeekIndex(
  anchorDate: string,
  currentDate: DateInput,
  totalWeeks: number,
  weekStartsOn = 1,
) {
  return mod(getWeeksDifference(anchorDate, currentDate, weekStartsOn), totalWeeks);
}

export function formatLocalDate(date: DateInput, locale = "es-MX") {
  const dateKey = toDateKey(date);

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(dateKeyToUtcDate(dateKey));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(date))
    .replace(".", "")
    .toUpperCase();
}

export function formatReadableDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTimelineDate(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).formatToParts(new Date(date));

  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return { month: month.toUpperCase(), day };
}

export function getGreeting(now = new Date()) {
  const rawHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: DEFAULT_TIMEZONE,
    }).format(now),
  );
  const hour = rawHour === 24 ? 0 : rawHour;

  if (hour < 12) {
    return "Buenos días";
  }

  if (hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}
