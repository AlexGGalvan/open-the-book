import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { readingDays } from "../src/data/churchData";
import { normalizeBibleReference, normalizeText } from "../src/server/whatsapp-import/bibleReferences";
import {
  buildReadingPlan,
  extractWeeklyRecitations,
  processWhatsAppExport,
} from "../src/server/whatsapp-import/importer";

const sourceArgument = process.argv[2];
const palette = ["#4f86c6", "#43a8da", "#9957bd", "#c74b91", "#ee952d", "#26b1a1", "#2498b2"];

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name} en .env.local.`);
  return value;
}

async function main() {
  if (!sourceArgument) {
    throw new Error("Uso: npm run import:whatsapp:supabase -- <ruta-al-archivo.txt>");
  }

  const sourcePath = resolve(sourceArgument);
  const source = await readFile(sourcePath, "utf8");
  const sourceFileHash = createHash("sha256").update(source).digest("hex");
  const supabaseUrl = requireEnvironmentVariable("SUPABASE_URL");
  const secretKey = process.env.SUPABASE_SECRET_KEY
    ?? requireEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const weeklyRecitations = extractWeeklyRecitations(source);
  const weeklyRecitationMessageHashes = [
    ...new Set(weeklyRecitations.map((recitation) => recitation.sourceMessageHash)),
  ];

  if (weeklyRecitationMessageHashes.length > 0) {
    const removeReflectionResult = await admin
      .from("reflections")
      .delete()
      .in("source_message_hash", weeklyRecitationMessageHashes);
    throwOnError(removeReflectionResult.error, "No se pudieron separar las recitaciones anteriores");

    const removeIssuesResult = await admin
      .from("import_issues")
      .delete()
      .in("source_message_hash", weeklyRecitationMessageHashes);
    throwOnError(removeIssuesResult.error, "No se pudieron limpiar las incidencias de recitación");
  }

  const existingReflectionResult = await admin
    .from("reflections")
    .select("source_message_hash")
    .eq("status", "authorized")
    .limit(10_000);
  throwOnError(existingReflectionResult.error, "No se pudieron consultar los hashes autorizados");

  const existingHashes = (existingReflectionResult.data ?? []).map((row) => row.source_message_hash as string);
  const importResult = processWhatsAppExport(source, {
    existingHashes,
    readingPlan: buildReadingPlan(readingDays),
  });

  const batchResult = await admin
    .from("import_batches")
    .upsert(
      {
        source_file_hash: sourceFileHash,
        timezone: "America/Monterrey",
        status: "pending",
        total_messages: importResult.totalMessages,
        candidate_messages: importResult.records.length + importResult.duplicates,
        duplicate_messages: importResult.duplicates,
        ignored_messages: importResult.ignored.length,
        imported_at: new Date().toISOString(),
      },
      { onConflict: "source_file_hash" },
    )
    .select("id")
    .single();
  throwOnError(batchResult.error, "No se pudo registrar el lote de importación");

  const readingDayRows = readingDays.map((day) => ({
    reading_date: day.date,
    timezone: "America/Monterrey",
  }));
  const readingDayResult = await admin
    .from("reading_days")
    .upsert(readingDayRows, { onConflict: "reading_date" })
    .select("id,reading_date");
  throwOnError(readingDayResult.error, "No se pudo guardar el calendario");

  const readingDayIds = new Map(
    (readingDayResult.data ?? []).map((row) => [row.reading_date as string, row.id as string]),
  );
  const passageRows = readingDays.flatMap((day) => {
    const readingDayId = readingDayIds.get(day.date);
    if (!readingDayId) throw new Error(`No se encontró el día de lectura ${day.date}.`);

    return day.passages.map((passage, displayOrder) => {
      const parsed = normalizeBibleReference(passage.reference);
      if (!parsed) throw new Error(`Referencia del calendario inválida: ${passage.reference}`);

      return {
        reading_day_id: readingDayId,
        display_order: displayOrder,
        book_key: toBookKey(parsed.book),
        book_name: parsed.book,
        start_chapter: parsed.chapter,
        end_chapter: parsed.chapterEnd ?? null,
        start_verse: parsed.verseStart ?? null,
        end_verse: parsed.verseEnd ?? null,
        reference: parsed.normalized,
      };
    });
  });
  const passagesResult = await admin
    .from("reading_passages")
    .upsert(passageRows, { onConflict: "reading_day_id,reference" });
  throwOnError(passagesResult.error, "No se pudieron guardar las lecturas");

  const weeklyRecitationRows = weeklyRecitations.map((recitation) => {
    const parsed = normalizeBibleReference(recitation.reference);
    if (!parsed) throw new Error(`Recitación inválida: ${recitation.reference}`);

    return {
      week_start: recitation.weekStart,
      timezone: "America/Monterrey",
      reference: recitation.reference,
      normalized_reference: recitation.reference,
      book_key: toBookKey(recitation.book),
      start_chapter: parsed.chapter,
      end_chapter: parsed.chapterEnd ?? null,
      start_verse: parsed.verseStart ?? null,
      end_verse: parsed.verseEnd ?? null,
      biblical_text: recitation.biblicalText,
      translation: recitation.translation,
      is_published: true,
    };
  });

  if (weeklyRecitationRows.length > 0) {
    const recitationsResult = await admin
      .from("weekly_recitations")
      .upsert(weeklyRecitationRows, { onConflict: "week_start" });
    throwOnError(recitationsResult.error, "No se pudieron guardar las recitaciones semanales");
  }

  const participantResult = await admin
    .from("participants")
    .select("id,display_name,is_active");
  throwOnError(participantResult.error, "No se pudieron consultar los participantes");

  const participantsByName = new Map(
    (participantResult.data ?? []).map((participant) => [
      normalizeText(participant.display_name as string),
      participant as { id: string; display_name: string; is_active: boolean },
    ]),
  );
  const participantIdByAuthor = new Map<string, string>();

  for (const record of importResult.records) {
    const displayName = normalizeDisplayName(record.author);
    const normalizedName = normalizeText(displayName);
    const shouldBePublic = record.status === "pending";
    let participant = participantsByName.get(normalizedName);

    if (!participant) {
      const insertResult = await admin
        .from("participants")
        .insert({
          display_name: displayName,
          initials: getInitials(displayName),
          avatar_color: colorForName(displayName),
          is_active: shouldBePublic,
        })
        .select("id,display_name,is_active")
        .single();
      throwOnError(insertResult.error, `No se pudo crear el participante ${displayName}`);
      participant = insertResult.data as { id: string; display_name: string; is_active: boolean };
      participantsByName.set(normalizedName, participant);
    } else if (shouldBePublic && !participant.is_active) {
      const activateResult = await admin
        .from("participants")
        .update({ is_active: true })
        .eq("id", participant.id);
      throwOnError(activateResult.error, `No se pudo activar el participante ${displayName}`);
      participant.is_active = true;
    }

    participantIdByAuthor.set(record.author, participant.id);
  }

  const authorizedAt = new Date().toISOString();
  const reflectionRows = importResult.records.map((record) => {
    const parsed = normalizeBibleReference(record.reference);
    const participantId = participantIdByAuthor.get(record.author);
    const readingDayId = readingDayIds.get(record.readingDate);

    if (!parsed || !participantId || !readingDayId) {
      throw new Error(`No se pudo relacionar la reflexión ${record.messageHash}.`);
    }

    const authorized = record.status === "pending";
    return {
      participant_id: participantId,
      reading_day_id: readingDayId,
      sent_at: record.sentAt,
      reading_date: record.readingDate,
      reference: record.reference,
      normalized_reference: record.reference,
      book_key: parsed.book,
      start_chapter: parsed.chapter,
      end_chapter: parsed.chapterEnd ?? null,
      start_verse: parsed.verseStart ?? null,
      end_verse: parsed.verseEnd ?? null,
      biblical_text: record.biblicalText,
      reflection_text: record.reflectionText,
      status: authorized ? "authorized" : "ambiguous",
      source_message_hash: record.messageHash,
      authorized_at: authorized ? authorizedAt : null,
    };
  });

  if (reflectionRows.length > 0) {
    const reviewedHashes = reflectionRows.map((row) => row.source_message_hash);
    const clearIssuesResult = await admin
      .from("import_issues")
      .delete()
      .in("source_message_hash", reviewedHashes);
    throwOnError(clearIssuesResult.error, "No se pudieron actualizar las incidencias revisadas");

    const reflectionsResult = await admin
      .from("reflections")
      .upsert(reflectionRows, { onConflict: "source_message_hash" });
    throwOnError(reflectionsResult.error, "No se pudieron guardar las reflexiones");
  }

  const issueRows = importResult.records.flatMap((record) =>
    record.issues.map((issueCode) => ({
      import_batch_id: batchResult.data.id,
      source_message_hash: record.messageHash,
      issue_code: issueCode,
      metadata: { readingDate: record.readingDate, reference: record.reference },
    })),
  );

  if (issueRows.length > 0) {
    const issuesResult = await admin
      .from("import_issues")
      .upsert(issueRows, { onConflict: "import_batch_id,source_message_hash,issue_code" });
    throwOnError(issuesResult.error, "No se pudieron guardar las incidencias de revisión");
  }

  const finishResult = await admin
    .from("import_batches")
    .update({ status: "imported", imported_at: new Date().toISOString() })
    .eq("id", batchResult.data.id);
  throwOnError(finishResult.error, "No se pudo finalizar el lote de importación");

  const authorizedCount = importResult.records.filter((record) => record.status === "pending").length;
  const ambiguousCount = importResult.records.filter((record) => record.status === "ambiguous").length;
  console.log(
    [
      `Archivo procesado: ${sourceFileHash.slice(0, 12)}`,
      `Mensajes detectados: ${importResult.totalMessages}`,
      `Reflexiones autorizadas e importadas: ${authorizedCount}`,
      `Mensajes ambiguos para revisión privada: ${ambiguousCount}`,
      `Recitaciones semanales publicadas: ${weeklyRecitations.length}`,
      `Mensajes ignorados sin conservar contenido: ${importResult.ignored.length}`,
      `Duplicados omitidos: ${importResult.duplicates}`,
    ].join("\n"),
  );
}

function normalizeDisplayName(author: string) {
  if (author === "Tú") return process.env.WHATSAPP_SELF_NAME?.trim() || "Alejandro";
  return author.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").replace(/\s+/g, " ").trim();
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("es-MX");
}

function colorForName(name: string) {
  const colorIndex = createHash("sha256").update(normalizeText(name)).digest()[0] % palette.length;
  return palette[colorIndex];
}

function toBookKey(book: string) {
  return normalizeText(book).replace(/\s+/g, "-");
}

function throwOnError(error: { message: string } | null, context: string): asserts error is null {
  if (error) throw new Error(`${context}: ${error.message}`);
}

void main();
