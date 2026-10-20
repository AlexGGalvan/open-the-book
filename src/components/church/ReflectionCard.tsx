import { ParticipantAvatar } from "@/components/church/ParticipantAvatar";
import { participantById } from "@/data/churchData";
import type { Reflection } from "@/domain/church";
import { formatSentAt } from "@/lib/churchDates";

export function ReflectionCard({ reflection, compact = false }: { reflection: Reflection; compact?: boolean }) {
  const participant = participantById.get(reflection.participantId);

  if (!participant) {
    return null;
  }

  return (
    <article className={`rounded-lg border border-[#d3e4f2] bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-3">
        <ParticipantAvatar participant={participant} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div>
              <p className="font-bold text-[#173f73]">{participant.name}</p>
              <p className="font-bold text-[#0873c9]">{reflection.reference}</p>
            </div>
            <time className="text-xs text-[#6884a6]" dateTime={reflection.sentAt}>
              {formatSentAt(reflection.sentAt)}
            </time>
          </div>
          <p className={`mt-1 text-[#244d78] ${compact ? "text-sm leading-5" : "leading-6"}`}>
            {reflection.reflectionText}
          </p>
        </div>
      </div>
    </article>
  );
}
