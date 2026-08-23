import type { ThemeKey } from "@/types/bible";

export const themeLabels: Record<ThemeKey, string> = {
  direccion: "Dirección",
  paz: "Paz",
  sabiduria: "Sabiduría",
  fortaleza: "Fortaleza",
  perdon: "Perdón",
  gratitud: "Gratitud",
  amor: "Amor",
  esperanza: "Esperanza",
  ansiedad: "Ansiedad",
  proposito: "Propósito",
  soledad: "Soledad",
  fe: "Fe",
  temor: "Temor",
};

export const introThemes: ThemeKey[] = [
  "direccion",
  "paz",
  "sabiduria",
  "fortaleza",
  "perdon",
  "gratitud",
  "amor",
  "esperanza",
];

export const topicThemes: ThemeKey[] = [
  "paz",
  "ansiedad",
  "amor",
  "perdon",
  "proposito",
  "sabiduria",
  "fortaleza",
  "soledad",
  "gratitud",
  "fe",
  "esperanza",
  "temor",
];
