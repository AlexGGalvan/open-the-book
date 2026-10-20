import { readFile } from "node:fs/promises";
import { readingDays } from "../src/data/churchData";
import { buildReadingPlan, processWhatsAppExport } from "../src/server/whatsapp-import/importer";

const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error("Uso: npm run import:whatsapp -- <ruta-al-archivo.txt>");
  process.exitCode = 1;
} else {
  const source = await readFile(sourcePath, "utf8");
  const result = processWhatsAppExport(source, { readingPlan: buildReadingPlan(readingDays) });

  console.log(
    JSON.stringify(
      {
        totalMessages: result.totalMessages,
        candidates: result.records.length,
        pending: result.records.filter((record) => record.status === "pending").length,
        ambiguous: result.records.filter((record) => record.status === "ambiguous").length,
        ignored: result.ignored.length,
        duplicates: result.duplicates,
        reviewQueue: result.records.map((record) => ({
          author: record.author,
          sentAt: record.sentAt,
          readingDate: record.readingDate,
          reference: record.reference,
          status: record.status,
          issues: record.issues,
        })),
      },
      null,
      2,
    ),
  );
}
