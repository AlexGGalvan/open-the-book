export const APP_TIMEZONE = "America/Monterrey";

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatLongDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} de ${monthNames[month - 1]} de ${year}`;
}

export function formatShortDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${monthNames[month - 1].slice(0, 3)} ${year}`;
}

export function formatSentAt(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIMEZONE,
  })
    .format(new Date(date))
    .replace(".", "");
}

export function toIsoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function shiftIsoDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}
