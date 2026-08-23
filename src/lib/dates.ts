export function toDateKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
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
  const hour = now.getHours();

  if (hour < 12) {
    return "Buenos días.";
  }

  if (hour < 19) {
    return "Buenas tardes.";
  }

  return "Buenas noches.";
}
