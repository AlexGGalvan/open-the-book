export type ReadingPassage = {
  reference: string;
  book: string;
  startChapter: number;
  endChapter?: number;
};

export type ReadingDay = {
  date: string;
  passages: ReadingPassage[];
  reflectionCount: number;
};

export type Participant = {
  id: string;
  name: string;
  initials: string;
  color: string;
  reflectionCount: number;
  lastParticipation: string;
};

export type Reflection = {
  id: string;
  participantId: string;
  readingDate: string;
  sentAt: string;
  reference: string;
  book: string;
  biblicalText: string;
  reflectionText: string;
};

export type ResourceKind = "reading-plan" | "guide" | "bible" | "study" | "video" | "church";

export type ChurchResource = {
  id: string;
  kind: ResourceKind;
  title: string;
  description: string;
  details: string;
  actionLabel?: string;
  downloadPath?: string;
};

export type WeeklyRecitation = {
  id: string;
  weekStart: string;
  reference: string;
  text: string;
  translation: string;
};
