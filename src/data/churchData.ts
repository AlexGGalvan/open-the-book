import type { ChurchResource, Participant, ReadingDay, Reflection } from "@/domain/church";

const octoberReadings = [
  ["Jeremías 9-10", "2 Corintios 5"],
  ["Jeremías 11-12", "2 Corintios 6"],
  ["Jeremías 13-15", "2 Corintios 7"],
  ["Jeremías 16-17", "2 Corintios 8"],
  ["Jeremías 18-20", "2 Corintios 9"],
  ["Jeremías 21-22", "2 Corintios 10"],
  ["Jeremías 23-25", "2 Corintios 11"],
  ["Jeremías 26-27", "2 Corintios 12"],
  ["Jeremías 28-30", "2 Corintios 13"],
  ["Jeremías 31-32", "Gálatas 1"],
  ["Jeremías 33-35", "Gálatas 2"],
  ["Jeremías 36-37", "Gálatas 3"],
  ["Jeremías 38-40", "Gálatas 4"],
  ["Jeremías 41-42", "Gálatas 5"],
  ["Jeremías 43-45", "Gálatas 6"],
  ["Jeremías 46-47", "Efesios 1"],
  ["Jeremías 48-50", "2 Juan 1"],
  ["Jeremías 51-52", "Efesios 3"],
  ["Lamentaciones 1-2", "Efesios 4"],
  ["Lamentaciones 3-5", "Efesios 5"],
  ["Ezequiel 1-2", "Efesios 6"],
  ["Ezequiel 3-5", "Filipenses 1"],
  ["Ezequiel 6-7", "Filipenses 2"],
  ["Ezequiel 8-10", "Filipenses 3"],
  ["Ezequiel 11-12", "Filipenses 4"],
  ["Ezequiel 13-15", "Colosenses 1"],
  ["Ezequiel 16-17", "Colosenses 2"],
  ["Ezequiel 18-20", "Colosenses 3"],
  ["Ezequiel 21-22", "Colosenses 4"],
  ["Ezequiel 23-25", "1 Tesalonicenses 1-2"],
  ["Ezequiel 26-27", "1 Tesalonicenses 3-5"],
] as const;

const reflectionCounts = [3, 2, 1, 4, 2, 1, 3, 4, 2, 1, 5, 3, 2, 4, 3, 2, 1, 3, 6, 4, 3, 2, 3, 1, 2, 3, 1, 4, 2, 3, 2];

const bookAliases: Record<string, string> = {
  Jeremías: "Jeremías",
  Lamentaciones: "Lamentaciones",
  Ezequiel: "Ezequiel",
  "2 Corintios": "2 Corintios",
  Gálatas: "Gálatas",
  Efesios: "Efesios",
  "2 Juan": "2 Juan",
  Filipenses: "Filipenses",
  Colosenses: "Colosenses",
  "1 Tesalonicenses": "1 Tesalonicenses",
};

function toPassage(reference: string) {
  const match = reference.match(/^(.+?)\s(\d+)(?:-(\d+))?$/);

  if (!match) {
    throw new Error(`Referencia de ejemplo inválida: ${reference}`);
  }

  const [, rawBook, startChapter, endChapter] = match;

  return {
    reference,
    book: bookAliases[rawBook] ?? rawBook,
    startChapter: Number(startChapter),
    endChapter: endChapter ? Number(endChapter) : undefined,
  };
}

export const readingDays: ReadingDay[] = octoberReadings.map((references, index) => ({
  date: `2026-10-${String(index + 1).padStart(2, "0")}`,
  passages: references.map(toPassage),
  reflectionCount: reflectionCounts[index],
}));

export const participants: Participant[] = [
  { id: "ramiro", name: "Ramiro", initials: "R", color: "#4f86c6", reflectionCount: 12, lastParticipation: "2026-10-20" },
  { id: "ana", name: "Ana", initials: "A", color: "#43a8da", reflectionCount: 10, lastParticipation: "2026-10-20" },
  { id: "luis", name: "Luis", initials: "L", color: "#9957bd", reflectionCount: 8, lastParticipation: "2026-10-20" },
  { id: "maria", name: "María", initials: "M", color: "#c74b91", reflectionCount: 7, lastParticipation: "2026-10-20" },
  { id: "carlos", name: "Carlos", initials: "C", color: "#ee952d", reflectionCount: 6, lastParticipation: "2026-10-19" },
  { id: "elena", name: "Elena", initials: "E", color: "#dfb94d", reflectionCount: 5, lastParticipation: "2026-10-19" },
  { id: "jose", name: "José", initials: "J", color: "#26b1a1", reflectionCount: 4, lastParticipation: "2026-10-18" },
  { id: "daniel", name: "Daniel", initials: "D", color: "#2498b2", reflectionCount: 4, lastParticipation: "2026-10-18" },
  { id: "sofia", name: "Sofía", initials: "S", color: "#55a3cf", reflectionCount: 3, lastParticipation: "2026-10-18" },
  { id: "pedro", name: "Pedro", initials: "P", color: "#d47a3b", reflectionCount: 3, lastParticipation: "2026-10-16" },
  { id: "isabel", name: "Isabel", initials: "I", color: "#5065b7", reflectionCount: 2, lastParticipation: "2026-10-15" },
  { id: "marta", name: "Marta", initials: "M", color: "#9560ad", reflectionCount: 2, lastParticipation: "2026-10-14" },
];

export const reflections: Reflection[] = [
  {
    id: "reflection-ramiro-1",
    participantId: "ramiro",
    readingDate: "2026-10-20",
    sentAt: "2026-10-20T14:14:00.000Z",
    reference: "Efesios 5:1-2",
    book: "Efesios",
    biblicalText: "Sed, pues, imitadores de Dios como hijos amados. Y andad en amor, como también Cristo nos amó.",
    reflectionText: "Ser imitadores de Dios es caminar en amor, así como Cristo nos amó.",
  },
  {
    id: "reflection-ana-1",
    participantId: "ana",
    readingDate: "2026-10-20",
    sentAt: "2026-10-20T15:02:00.000Z",
    reference: "Lamentaciones 3:22-23",
    book: "Lamentaciones",
    biblicalText: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias.",
    reflectionText: "Cada mañana sus misericordias son nuevas. Aun en medio del dolor, Dios sigue siendo fiel.",
  },
  {
    id: "reflection-luis-1",
    participantId: "luis",
    readingDate: "2026-10-20",
    sentAt: "2026-10-20T16:37:00.000Z",
    reference: "Efesios 5:8",
    book: "Efesios",
    biblicalText: "Porque en otro tiempo erais tinieblas, mas ahora sois luz en el Señor; andad como hijos de luz.",
    reflectionText: "Antes éramos tinieblas, pero ahora somos luz en el Señor. Debemos vivir de manera que refleje esa luz.",
  },
  {
    id: "reflection-maria-1",
    participantId: "maria",
    readingDate: "2026-10-20",
    sentAt: "2026-10-20T18:11:00.000Z",
    reference: "Lamentaciones 3:25",
    book: "Lamentaciones",
    biblicalText: "Bueno es Jehová a los que en él esperan, al alma que le busca.",
    reflectionText: "El Señor es bueno para los que en Él esperan.",
  },
  {
    id: "reflection-carlos-1",
    participantId: "carlos",
    readingDate: "2026-10-19",
    sentAt: "2026-10-20T01:22:00.000Z",
    reference: "2 Corintios 5:17",
    book: "2 Corintios",
    biblicalText: "De modo que si alguno está en Cristo, nueva criatura es.",
    reflectionText: "Si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron.",
  },
  {
    id: "reflection-elena-1",
    participantId: "elena",
    readingDate: "2026-10-19",
    sentAt: "2026-10-20T02:04:00.000Z",
    reference: "Jeremías 29:11",
    book: "Jeremías",
    biblicalText: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.",
    reflectionText: "Dios tiene pensamientos de paz y esperanza para quienes confían en Él.",
  },
  {
    id: "reflection-jose-1",
    participantId: "jose",
    readingDate: "2026-10-18",
    sentAt: "2026-10-18T23:10:00.000Z",
    reference: "Gálatas 2:20",
    book: "Gálatas",
    biblicalText: "Con Cristo estoy juntamente crucificado, y ya no vivo yo, mas vive Cristo en mí.",
    reflectionText: "Ya no vivo yo, mas vive Cristo en mí.",
  },
  {
    id: "reflection-daniel-1",
    participantId: "daniel",
    readingDate: "2026-10-17",
    sentAt: "2026-10-18T00:05:00.000Z",
    reference: "2 Juan 1:6",
    book: "2 Juan",
    biblicalText: "Y este es el amor, que andemos según sus mandamientos.",
    reflectionText: "El amor a Dios se hace visible cuando escogemos andar en sus mandamientos.",
  },
  {
    id: "reflection-sofia-1",
    participantId: "sofia",
    readingDate: "2026-10-18",
    sentAt: "2026-10-19T03:37:00.000Z",
    reference: "Filipenses 4:6-7",
    book: "Filipenses",
    biblicalText: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios.",
    reflectionText: "No se inquieten por nada: presenten sus peticiones a Dios con oración.",
  },
  {
    id: "reflection-pedro-1",
    participantId: "pedro",
    readingDate: "2026-10-16",
    sentAt: "2026-10-16T22:45:00.000Z",
    reference: "Efesios 1:7",
    book: "Efesios",
    biblicalText: "En quien tenemos redención por su sangre, el perdón de pecados.",
    reflectionText: "La gracia de Dios no solo nos perdona: también nos recuerda cuánto costó nuestra redención.",
  },
  {
    id: "reflection-isabel-1",
    participantId: "isabel",
    readingDate: "2026-10-15",
    sentAt: "2026-10-15T21:20:00.000Z",
    reference: "Gálatas 6:9",
    book: "Gálatas",
    biblicalText: "No nos cansemos, pues, de hacer bien.",
    reflectionText: "El fruto llega en el tiempo de Dios; nuestra parte es permanecer fieles haciendo el bien.",
  },
  {
    id: "reflection-marta-1",
    participantId: "marta",
    readingDate: "2026-10-14",
    sentAt: "2026-10-14T20:50:00.000Z",
    reference: "Jeremías 42:3",
    book: "Jeremías",
    biblicalText: "Para que Jehová tu Dios nos enseñe el camino por donde vayamos.",
    reflectionText: "Antes de decidir, podemos pedir al Señor que nos muestre el camino y nos enseñe cómo andar.",
  },
];

export const resources: ChurchResource[] = [
  {
    id: "reading-plan",
    kind: "reading-plan",
    title: "Plan de lectura",
    description: "Calendario mensual de lecturas bíblicas",
    details: "Consulta y descarga el plan de octubre de 2026 para seguir las lecturas de cada día.",
    actionLabel: "Descargar plan",
    downloadPath: "/resources/plan-lectura-octubre-2026.txt",
  },
  {
    id: "plan-guide",
    kind: "guide",
    title: "Guía del plan",
    description: "Introducción y recomendaciones de lectura",
    details: "Una guía breve para leer, meditar y compartir una reflexión clara y centrada en el pasaje.",
    actionLabel: "Descargar guía",
    downloadPath: "/resources/guia-del-plan.txt",
  },
  {
    id: "online-bibles",
    kind: "bible",
    title: "Biblias en línea",
    description: "Consulta distintas versiones de las Escrituras",
    details: "Este espacio quedará preparado para incluir enlaces autorizados a Biblias y herramientas de consulta.",
  },
  {
    id: "studies",
    kind: "study",
    title: "Estudios y devocionales",
    description: "Artículos y materiales de estudio bíblico",
    details: "Colección de apoyo para profundizar en los libros incluidos en el plan mensual.",
  },
  {
    id: "videos",
    kind: "video",
    title: "Videos recomendados",
    description: "Predicaciones, mensajes y enseñanzas",
    details: "Aquí podrán organizarse futuras enseñanzas en video relacionadas con las lecturas del mes.",
  },
  {
    id: "church",
    kind: "church",
    title: "Sobre nuestra iglesia",
    description: "Conoce nuestras reuniones y actividades",
    details: "Información general de la Iglesia de Torreón y materiales de bienvenida para visitantes.",
  },
];

export const participantById = new Map(participants.map((participant) => [participant.id, participant]));
export const readingDayByDate = new Map(readingDays.map((day) => [day.date, day]));
