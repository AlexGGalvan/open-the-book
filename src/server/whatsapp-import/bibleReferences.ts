export type BibleReference = {
  book: string;
  chapter: number;
  chapterEnd?: number;
  verseStart?: number;
  verseEnd?: number;
  normalized: string;
  raw: string;
  startIndex: number;
  endIndex: number;
};

const bookAliases: Record<string, string[]> = {
  Génesis: ["genesis", "gen", "gn"],
  Éxodo: ["exodo", "exo", "ex"],
  Levítico: ["levitico", "lev", "lv"],
  Números: ["numeros", "num", "nm"],
  Deuteronomio: ["deuteronomio", "deut", "dt"],
  Josué: ["josue", "jos"],
  Jueces: ["jueces", "jue"],
  Rut: ["rut", "rt"],
  "1 Samuel": ["1 samuel", "1 sam", "1 s"],
  "2 Samuel": ["2 samuel", "2 sam", "2 s"],
  "1 Reyes": ["1 reyes", "1 rey", "1 r"],
  "2 Reyes": ["2 reyes", "2 rey", "2 r"],
  "1 Crónicas": ["1 cronicas", "1 cron", "1 cr"],
  "2 Crónicas": ["2 cronicas", "2 cron", "2 cr"],
  Esdras: ["esdras", "esd"],
  Nehemías: ["nehemias", "neh"],
  Ester: ["ester", "est"],
  Job: ["job"],
  Salmos: ["salmos", "salmo", "sal", "sl"],
  Proverbios: ["proverbios", "prov", "pr"],
  Eclesiastés: ["eclesiastes", "ecl", "ec"],
  Cantares: ["cantares", "cant", "cnt"],
  Isaías: ["isaias", "isa", "is"],
  Jeremías: ["jeremias", "jer", "jr"],
  Lamentaciones: ["lamentaciones", "lam", "lm"],
  Ezequiel: ["ezequiel", "ezeq", "eze", "ezq", "ez"],
  Daniel: ["daniel", "dan", "dn"],
  Oseas: ["oseas", "ose", "os"],
  Joel: ["joel", "jl"],
  Amós: ["amos", "am"],
  Abdías: ["abdias", "abd"],
  Jonás: ["jonas", "jon"],
  Miqueas: ["miqueas", "miq", "mi"],
  Nahúm: ["nahum", "nah", "na"],
  Habacuc: ["habacuc", "hab"],
  Sofonías: ["sofonias", "sof"],
  Hageo: ["hageo", "hag"],
  Zacarías: ["zacarias", "zac"],
  Malaquías: ["malaquias", "mal"],
  Mateo: ["san mateo", "mateo", "mat", "mt"],
  Marcos: ["san marcos", "marcos", "mar", "mc"],
  Lucas: ["san lucas", "lucas", "luc", "lc"],
  Juan: ["san juan", "juan", "jn"],
  Hechos: ["hechos", "hech", "hch"],
  Romanos: ["romanos", "rom", "ro"],
  "1 Corintios": ["1 corintios", "1 cor", "1 co"],
  "2 Corintios": ["2 corintios", "2 cor", "2 co"],
  Gálatas: ["galatas", "gal", "ga"],
  Efesios: ["efesios", "efe", "ef"],
  Filipenses: ["filipenses", "fil", "flp"],
  Colosenses: ["colosenses", "col", "cl"],
  "1 Tesalonicenses": ["1 tesalonicenses", "1 tes", "1 ts"],
  "2 Tesalonicenses": ["2 tesalonicenses", "2 tes", "2 ts"],
  "1 Timoteo": ["1 timoteo", "1 tim", "1 ti"],
  "2 Timoteo": ["2 timoteo", "2 tim", "2 ti"],
  Tito: ["tito", "tit"],
  Filemón: ["filemon", "flm"],
  Hebreos: ["hebreos", "heb", "he"],
  Santiago: ["santiago", "sant", "stg"],
  "1 Pedro": ["1 pedro", "1 ped", "1 pe"],
  "2 Pedro": ["2 pedro", "2 ped", "2 pe"],
  "1 Juan": ["1 juan", "1 jn"],
  "2 Juan": ["2 juan", "2 jn"],
  "3 Juan": ["3 juan", "3 jn"],
  Judas: ["judas", "jud"],
  Apocalipsis: ["apocalipsis", "apoc", "apo", "ap"],
};

const canonicalByAlias = new Map<string, string>();

for (const [canonical, aliases] of Object.entries(bookAliases)) {
  for (const alias of aliases) {
    canonicalByAlias.set(normalizeText(alias), canonical);
  }
}

const bookPattern = [...canonicalByAlias.keys()]
  .sort((left, right) => right.length - left.length)
  .map(escapeRegex)
  .join("|");

const referencePattern = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${bookPattern})\\s+(?:\\(\\s*)?(\\d{1,3})(?:(?:\\s*:\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?)|(?:\\s*[-–—]\\s*(\\d{1,3})))?[ \\t]*\\)?`,
  "iu",
);

export function normalizeBibleReference(input: string): BibleReference | null {
  const normalizedInput = normalizeForMatching(input);
  const match = referencePattern.exec(normalizedInput);

  if (!match || match.index === undefined) {
    return null;
  }

  const [, prefix, rawAlias, rawChapter, rawVerseStart, rawVerseEnd, rawChapterEnd] = match;
  const book = canonicalByAlias.get(normalizeText(rawAlias));

  if (!book) {
    return null;
  }

  const startIndex = prefix === "(" ? match.index : match.index + prefix.length;
  const endIndex = match.index + match[0].length;
  const chapter = Number(rawChapter);
  const chapterEnd = rawChapterEnd ? Number(rawChapterEnd) : undefined;
  const verseStart = rawVerseStart ? Number(rawVerseStart) : undefined;
  const verseEnd = rawVerseEnd ? Number(rawVerseEnd) : undefined;
  const suffix = verseStart
    ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ""}`
    : chapterEnd
      ? `-${chapterEnd}`
      : "";

  return {
    book,
    chapter,
    chapterEnd,
    verseStart,
    verseEnd,
    normalized: `${book} ${chapter}${suffix}`,
    raw: input.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  };
}

export function normalizeText(value: string) {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es-MX");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
}

function normalizeForMatching(value: string) {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}
