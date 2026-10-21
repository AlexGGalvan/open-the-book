import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBibleReference } from "./bibleReferences";
import { extractWeeklyRecitations, processWhatsAppExport, type ReadingPlanDay } from "./importer";

const readingPlan: ReadingPlanDay[] = [
  { date: "2026-10-19", references: ["Lamentaciones 1-2", "Efesios 4"] },
  { date: "2026-10-20", references: ["Lamentaciones 3-5", "Efesios 5"] },
  { date: "2026-10-21", references: ["Ezequiel 1-2", "Efesios 6"] },
];

test("normaliza abreviaturas y rangos de versículos", () => {
  assert.equal(normalizeBibleReference("Lam 2:21")?.normalized, "Lamentaciones 2:21");
  assert.equal(normalizeBibleReference("EFESIOS 4:11-12")?.normalized, "Efesios 4:11-12");
  assert.equal(normalizeBibleReference("Heb 9:27–28")?.normalized, "Hebreos 9:27-28");
});

test("extrae autor, fecha, cita, texto bíblico y reflexión", () => {
  const source = `[20/10/2026, 08:14] Ramiro: EFESIOS 5:1-2
Texto: Sed, pues, imitadores de Dios como hijos amados.
Reflexión: Ser imitadores de Dios es caminar en amor.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records.length, 1);
  assert.deepEqual(result.records[0], {
    messageHash: result.records[0].messageHash,
    author: "Ramiro",
    sentAt: "2026-10-20T14:14:00.000Z",
    readingDate: "2026-10-20",
    reference: "Efesios 5:1-2",
    book: "Efesios",
    biblicalText: "Sed, pues, imitadores de Dios como hijos amados.",
    reflectionText: "Ser imitadores de Dios es caminar en amor.",
    status: "pending",
    issues: [],
    published: false,
  });
});

test("detecta fechas mes/día en exportaciones de WhatsApp en inglés", () => {
  const source = `[10/20/26, 8:14:00 AM] Ramiro: EFESIOS 5:1-2
Texto: Sed, pues, imitadores de Dios como hijos amados.
Reflexión: Ser imitadores de Dios es caminar en amor.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].sentAt, "2026-10-20T14:14:00.000Z");
  assert.equal(result.records[0].readingDate, "2026-10-20");
  assert.equal(result.records[0].status, "pending");
});

test("asigna al día anterior un mensaje posterior a medianoche cuando coincide con el plan", () => {
  const source = `21/10/2026, 12:35 a. m. - Ana: Efe 5:8
Texto: Ahora sois luz en el Señor.

Debemos vivir de una manera que refleje esa luz.`;
  const result = processWhatsAppExport(source, { readingPlan, previousDayCutoffHour: 3 });

  assert.equal(result.records[0].readingDate, "2026-10-20");
  assert.equal(result.records[0].status, "pending");
});

test("evita duplicados dentro del archivo y contra hashes existentes", () => {
  const message = `[20/10/2026, 09:02] Ana: Lam 3:22-23
Texto: Nuevas son cada mañana sus misericordias.
Reflexión: Dios sigue siendo fiel.`;
  const first = processWhatsAppExport(`${message}\n${message}`, { readingPlan });
  assert.equal(first.records.length, 1);
  assert.equal(first.duplicates, 1);

  const second = processWhatsAppExport(message, {
    readingPlan,
    existingHashes: [first.records[0].messageHash],
  });
  assert.equal(second.records.length, 0);
  assert.equal(second.duplicates, 1);
});

test("marca como ambiguo un mensaje sin separación de reflexión", () => {
  const source = `[20/10/2026, 10:37] Luis: Efesios 5:8 Ahora sois luz en el Señor.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].status, "ambiguous");
  assert.ok(result.records[0].issues.includes("missing_reflection_text"));
  assert.equal(result.records[0].published, false);
});

test("ignora conversación sin cita y nunca conserva su contenido", () => {
  const source = `[20/10/2026, 11:00] Carlos: Buenos días, hermanos.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records.length, 0);
  assert.equal(result.ignored.length, 1);
  assert.deepEqual(Object.keys(result.ignored[0]).sort(), ["messageHash", "reason"]);
});

test("ignora anuncios del plan aunque contengan referencias", () => {
  const source = `[10/20/26, 7:16:25 AM] Tomás: Lectura bíblica de hoy

Pasajes de hoy:
- Lamentaciones 3-5
- Efesios 5

Después de leer, compartan una frase.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records.length, 0);
  assert.equal(result.ignored.length, 1);
  assert.equal(result.ignored[0].reason, "reading_plan_announcement");
});

test("separa recitaciones semanales de las reflexiones", () => {
  const source = `[10/17/26, 9:54:53 AM] Celeste: Recitación de esta semana.

San Mateo 10:28
Y no temáis a los que matan el cuerpo, mas el alma no pueden matar.

Recitación de próxima semana.

HEBREOS 9:27-28
Y de la manera que está establecido para los hombres que mueran una sola vez, y después de esto el juicio.`;
  const result = processWhatsAppExport(source, { readingPlan });
  const recitations = extractWeeklyRecitations(source);

  assert.equal(result.records.length, 0);
  assert.equal(result.ignored[0].reason, "weekly_recitation");
  assert.deepEqual(
    recitations.map(({ weekStart, reference }) => ({ weekStart, reference })),
    [
      { weekStart: "2026-10-12", reference: "Mateo 10:28" },
      { weekStart: "2026-10-19", reference: "Hebreos 9:27-28" },
    ],
  );
});

test("oculta números telefónicos usados como autor", () => {
  const source = `[20/10/2026, 12:11] +52 871 555 0101: Lam 3:25
Texto: Bueno es Jehová a los que en él esperan.
Reflexión: Esperar en el Señor renueva mi confianza.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].author, "Participante sin nombre");
  assert.equal(result.records[0].status, "ambiguous");
  assert.ok(result.records[0].issues.includes("author_phone_redacted"));
});

test("marca referencias que no corresponden al calendario", () => {
  const source = `[20/10/2026, 13:00] Marta: Romanos 14:11
Texto: Ante mí se doblará toda rodilla.
Reflexión: Todos daremos cuenta delante de Dios.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].readingDate, "2026-10-20");
  assert.ok(result.records[0].issues.includes("reference_not_in_reading_plan"));
  assert.equal(result.records[0].status, "ambiguous");
});
