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
  assert.equal(normalizeBibleReference("Lam (3:55-56)")?.normalized, "Lamentaciones 3:55-56");
  assert.equal(normalizeBibleReference("Ezeq 6:13")?.normalized, "Ezequiel 6:13");
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

test("asigna la lectura anterior aunque la reflexión llegue después de la hora de corte", () => {
  const source = `[10/19/26, 5:38:00 AM] Nely: Por esta causa doblo mis rodillas ante el Padre de nuestro señor Jesucristo  (Efe 3:14)

Bendito el que ah recibido a Dios como su salvador 🙏`;
  const result = processWhatsAppExport(source, {
    readingPlan: [
      { date: "2026-10-18", references: ["Jeremías 51-52", "Efesios 3"] },
      ...readingPlan,
    ],
    previousDayCutoffHour: 3,
  });

  assert.equal(result.records[0].readingDate, "2026-10-18");
  assert.equal(result.records[0].reference, "Efesios 3:14");
  assert.equal(result.records[0].reflectionText, "Bendito el que ah recibido a Dios como su salvador 🙏");
  assert.equal(result.records[0].status, "pending");
});

test("acepta una referencia entre paréntesis después del libro y omite el encabezado", () => {
  const source = `[10/20/26, 6:57:11 AM] Nely: Lectura de hoy

Invoque tu nombre, oh Jehová desde la cárcel profunda;
Oíste mi voz, no escondas tu oído al clamor de mis suspiros.

Lam (3:55-56)

👉 Nos indica que aún en los problemas más difíciles, si pedimos con fé, Dios te escuchará`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].reference, "Lamentaciones 3:55-56");
  assert.equal(
    result.records[0].biblicalText,
    "Invoque tu nombre, oh Jehová desde la cárcel profunda;\nOíste mi voz, no escondas tu oído al clamor de mis suspiros.",
  );
  assert.equal(
    result.records[0].reflectionText,
    "👉 Nos indica que aún en los problemas más difíciles, si pedimos con fé, Dios te escuchará",
  );
  assert.equal(result.records[0].status, "pending");
});

test("conserva la separación después de una referencia sin paréntesis", () => {
  const source = `[10/20/26, 12:29:47 AM] Alex: Antes sed benignos unos con otros, misericordiosos.
Efesios 4:32

Así como Dios nos perdona, debemos aprender a perdonar y amar a los demás.`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.records[0].readingDate, "2026-10-19");
  assert.equal(
    result.records[0].reflectionText,
    "Así como Dios nos perdona, debemos aprender a perdonar y amar a los demás.",
  );
  assert.equal(result.records[0].status, "pending");
});

test("une versículo, referencia y reflexión enviados por separado", () => {
  const source = `[10/21/26, 5:56:37 PM] Hortensia: La gracia sea con todos los que aman a nuestro Señor Jesucristo con amor inalterable. Amén.
[10/21/26, 5:56:52 PM] Hortensia: Efesios 6:24
[10/21/26, 6:00:00 PM] Hortensia: Amor eterno`;
  const result = processWhatsAppExport(source, { readingPlan });

  assert.equal(result.totalMessages, 3);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].reference, "Efesios 6:24");
  assert.equal(
    result.records[0].biblicalText,
    "La gracia sea con todos los que aman a nuestro Señor Jesucristo con amor inalterable. Amén.",
  );
  assert.equal(result.records[0].reflectionText, "Amor eterno");
  assert.equal(result.records[0].status, "pending");
});

test("une una reflexión dividida aunque haya mensajes eliminados entre sus partes", () => {
  const source = `[10/23/26, 8:39:00 PM] Hortensia: Por tanto, si hay alguna consolación en Cristo, si algún consuelo de amor.
[10/23/26, 8:42:00 PM] Hortensia: _Se eliminó este mensaje_
[10/23/26, 8:44:00 PM] Hortensia: _Se eliminó este mensaje_
[10/23/26, 8:45:00 PM] Hortensia: _Se eliminó este mensaje_
[10/23/26, 8:51:00 PM] Hortensia: Filipenses 2:1
[10/23/26, 8:52:00 PM] Hortensia: Sana el alma`;
  const result = processWhatsAppExport(source, {
    readingPlan: [{ date: "2026-10-23", references: ["Ezequiel 6-7", "Filipenses 2"] }],
  });

  assert.equal(result.totalMessages, 6);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].reference, "Filipenses 2:1");
  assert.equal(result.records[0].reflectionText, "Sana el alma");
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
