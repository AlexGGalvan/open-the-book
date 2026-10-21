"use client";

import { ParticipantAvatar } from "@/components/church/ParticipantAvatar";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import type { Reflection } from "@/domain/church";
import { formatSentAt } from "@/lib/churchDates";

export function ReflectionCard({ reflection, compact = false }: { reflection: Reflection; compact?: boolean }) {
  const { participants } = useChurchData();
  const participant = participants.find((item) => item.id === reflection.participantId);

  if (!participant) {
    return null;
  }

  return (
    <article
      className={`reflection-card rounded-lg border border-[#d3e4f2] bg-white ${
        compact ? "reflection-card--compact p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <ParticipantAvatar participant={participant} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div>
              <p className="reflection-card-name font-bold text-[#173f73]">{participant.name}</p>
              <p className="reflection-card-reference font-bold text-[#0873c9]">{reflection.reference}</p>
            </div>
            <time className="text-xs text-[#6884a6]" dateTime={reflection.sentAt}>
              {formatSentAt(reflection.sentAt)}
            </time>
          </div>
          <p className={`reflection-card-text mt-1 text-[#244d78] ${compact ? "text-sm leading-5" : "leading-6"}`}>
            {reflection.reflectionText}
          </p>
        </div>
      </div>
    </article>
  );
}
