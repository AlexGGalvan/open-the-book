import { resources as localResources } from "@/data/churchData";
import type {
  ChurchResource,
  Participant,
  ReadingDay,
  Reflection,
  ResourceKind,
  WeeklyRecitation,
} from "@/domain/church";
import { getSupabasePublicClient } from "./publicClient";

export type ChurchDataSnapshot = {
  readingDays: ReadingDay[];
  participants: Participant[];
  reflections: Reflection[];
  resources: ChurchResource[];
  weeklyRecitations: WeeklyRecitation[];
};

type ReadingDayRow = { id: string; reading_date: string };
type ReadingPassageRow = {
  reading_day_id: string;
  reference: string;
  book_name: string;
  start_chapter: number;
  end_chapter: number | null;
};
type ParticipantRow = {
  id: string;
  display_name: string;
  initials: string;
  avatar_color: string;
};
type ReflectionRow = {
  id: string;
  participant_id: string;
  reading_date: string;
  sent_at: string;
  reference: string;
  book_key: string;
  biblical_text: string;
  reflection_text: string;
};
type ResourceRow = {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  resource_url: string | null;
};
type WeeklyRecitationRow = {
  id: string;
  week_start: string;
  reference: string;
  biblical_text: string;
  translation: string;
};

let snapshotRequest: Promise<ChurchDataSnapshot> | null = null;

export function loadChurchData() {
  if (!snapshotRequest) {
    snapshotRequest = fetchChurchData().catch((error) => {
      snapshotRequest = null;
      throw error;
    });
  }

  return snapshotRequest;
}

async function fetchChurchData(): Promise<ChurchDataSnapshot> {
  const supabase = getSupabasePublicClient();
  const [
    readingDayResult,
    passageResult,
    participantResult,
    reflectionResult,
    resourceResult,
    recitationResult,
  ] = await Promise.all([
    supabase.from("reading_days").select("id,reading_date").order("reading_date"),
    supabase
      .from("reading_passages")
      .select("reading_day_id,reference,book_name,start_chapter,end_chapter")
      .order("display_order"),
    supabase
      .from("participants")
      .select("id,display_name,initials,avatar_color")
      .eq("is_active", true)
      .order("display_name"),
    supabase
      .from("reflections")
      .select("id,participant_id,reading_date,sent_at,reference,book_key,biblical_text,reflection_text")
      .order("sent_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id,title,description,resource_type,resource_url")
      .eq("is_published", true)
      .order("display_order"),
    supabase
      .from("weekly_recitations")
      .select("id,week_start,reference,biblical_text,translation")
      .eq("is_published", true)
      .order("week_start"),
  ]);

  throwForQueryError(readingDayResult.error, "calendario");
  throwForQueryError(passageResult.error, "lecturas");
  throwForQueryError(participantResult.error, "participantes");
  throwForQueryError(reflectionResult.error, "reflexiones");
  throwForQueryError(resourceResult.error, "recursos");
  throwForQueryError(recitationResult.error, "recitaciones");

  const reflectionRows = (reflectionResult.data ?? []) as ReflectionRow[];
  const reflections: Reflection[] = reflectionRows.map((row) => ({
    id: row.id,
    participantId: row.participant_id,
    readingDate: row.reading_date,
    sentAt: row.sent_at,
    reference: row.reference,
    book: row.book_key,
    biblicalText: row.biblical_text,
    reflectionText: row.reflection_text,
  }));

  const reflectionsByParticipant = groupBy(reflections, (reflection) => reflection.participantId);
  const participants = ((participantResult.data ?? []) as ParticipantRow[])
    .map((row): Participant | null => {
      const participantReflections = reflectionsByParticipant.get(row.id) ?? [];
      if (participantReflections.length === 0) return null;

      return {
        id: row.id,
        name: row.display_name,
        initials: row.initials,
        color: row.avatar_color,
        reflectionCount: participantReflections.length,
        lastParticipation: participantReflections
          .map((reflection) => reflection.readingDate)
          .sort()
          .at(-1)!,
      };
    })
    .filter((participant): participant is Participant => participant !== null)
    .sort((left, right) => right.reflectionCount - left.reflectionCount || left.name.localeCompare(right.name, "es"));

  const passagesByDay = groupBy(
    (passageResult.data ?? []) as ReadingPassageRow[],
    (passage) => passage.reading_day_id,
  );
  const reflectionCountByDate = new Map<string, number>();
  for (const reflection of reflections) {
    reflectionCountByDate.set(
      reflection.readingDate,
      (reflectionCountByDate.get(reflection.readingDate) ?? 0) + 1,
    );
  }

  const readingDays: ReadingDay[] = ((readingDayResult.data ?? []) as ReadingDayRow[]).map((row) => ({
    date: row.reading_date,
    passages: (passagesByDay.get(row.id) ?? []).map((passage) => ({
      reference: passage.reference,
      book: passage.book_name,
      startChapter: passage.start_chapter,
      endChapter: passage.end_chapter ?? undefined,
    })),
    reflectionCount: reflectionCountByDate.get(row.reading_date) ?? 0,
  }));

  const remoteResources = ((resourceResult.data ?? []) as ResourceRow[]).map((row): ChurchResource => ({
    id: row.id,
    kind: toResourceKind(row.resource_type),
    title: row.title,
    description: row.description,
    details: row.description,
    actionLabel: row.resource_url ? "Abrir recurso" : undefined,
    downloadPath: row.resource_url ?? undefined,
  }));

  const weeklyRecitations = ((recitationResult.data ?? []) as WeeklyRecitationRow[]).map(
    (row): WeeklyRecitation => ({
      id: row.id,
      weekStart: row.week_start,
      reference: row.reference,
      text: row.biblical_text,
      translation: row.translation,
    }),
  );

  return {
    readingDays,
    participants,
    reflections,
    resources: remoteResources.length > 0 ? remoteResources : localResources,
    weeklyRecitations,
  };
}

function groupBy<T>(values: T[], getKey: (value: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const value of values) {
    const key = getKey(value);
    grouped.set(key, [...(grouped.get(key) ?? []), value]);
  }
  return grouped;
}

function toResourceKind(resourceType: string): ResourceKind {
  const mapping: Record<string, ResourceKind> = {
    pdf: "reading-plan",
    guide: "guide",
    link: "study",
    video: "video",
    study: "study",
    other: "bible",
  };
  return mapping[resourceType] ?? "study";
}

function throwForQueryError(error: { message: string } | null, resource: string): asserts error is null {
  if (error) throw new Error(`No se pudieron cargar ${resource}: ${error.message}`);
}
