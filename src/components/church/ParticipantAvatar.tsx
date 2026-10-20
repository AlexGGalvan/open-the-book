import type { Participant } from "@/domain/church";

export function ParticipantAvatar({ participant, size = "md" }: { participant: Participant; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "size-8 text-sm" : size === "lg" ? "size-12 text-lg" : "size-10 text-base";

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: participant.color }}
    >
      {participant.initials}
    </span>
  );
}
