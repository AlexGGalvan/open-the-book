import mannaItems from "@/data/manna.json";
import { getDaysDifference, getLocalDate, mod, type DateInput } from "@/lib/dates";
import type { Manna } from "@/types/bible";

export const MANNA_CONFIG = {
  anchorDate: "2026-09-04",
  timezone: "America/Monterrey",
} as const;

const manna = mannaItems as Manna[];

export function getMannaForDate(date: DateInput = new Date(), timezone = MANNA_CONFIG.timezone) {
  const dateKey = getLocalDate(date, timezone);
  const exactManna = manna.find((item) => item.date === dateKey);

  if (exactManna) {
    return exactManna;
  }

  const offset = getDaysDifference(MANNA_CONFIG.anchorDate, dateKey);
  return manna[mod(offset, manna.length)];
}
