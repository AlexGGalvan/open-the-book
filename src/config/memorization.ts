export const MEMORIZATION_CONFIG = {
  anchorDate: "2026-08-31",
  anchorReference: "Eclesiastés 11:9",
  weekStartsOn: 1,
  timezone: "America/Monterrey",
  expectedTotalReferences: 244,
  showWeekCounter: false,
} as const;

export type MemorizationConfig = typeof MEMORIZATION_CONFIG;
