"use client";

import { Fragment, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, MessageCircle } from "lucide-react";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import { ParticipantAvatar } from "@/components/church/ParticipantAvatar";
import { ReflectionCard } from "@/components/church/ReflectionCard";
import type { Participant, Reflection } from "@/domain/church";
import { formatShortDate } from "@/lib/churchDates";

export function ParticipantsDirectory() {
  const { error, isLoading, participants, reflections } = useChurchData();
  const [openParticipantId, setOpenParticipantId] = useState<string | null>(null);
  const totalReflections = participants.reduce((total, participant) => total + participant.reflectionCount, 0);
  const reflectionsByParticipant = useMemo(() => {
    const grouped = new Map<string, Reflection[]>();

    [...reflections]
      .sort((left, right) => Date.parse(right.sentAt) - Date.parse(left.sentAt))
      .forEach((reflection) => {
        const participantReflections = grouped.get(reflection.participantId) ?? [];
        participantReflections.push(reflection);
        grouped.set(reflection.participantId, participantReflections);
      });

    return grouped;
  }, [reflections]);

  function toggleHistory(participantId: string) {
    setOpenParticipantId((current) => (current === participantId ? null : participantId));
  }

  return (
    <>
      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#9a3434]">
          No fue posible cargar los participantes desde Supabase.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat value={String(participants.length)} label="Hermanos participantes" />
        <Stat value={String(totalReflections)} label="Reflexiones compartidas" />
        <div className="col-span-2 sm:col-span-1">
          <Stat value="Octubre 2026" label="Período seleccionado" />
        </div>
      </div>

      <div className="mt-5 space-y-3 xl:hidden">
        {participants.length === 0 ? <EmptyParticipants isLoading={isLoading} /> : null}

        {participants.map((participant, index) => {
          const isOpen = openParticipantId === participant.id;
          const participantReflections = reflectionsByParticipant.get(participant.id) ?? [];
          const historyId = `mobile-participant-history-${participant.id}`;

          return (
            <article
              className={`overflow-hidden rounded-lg border bg-white shadow-[0_8px_24px_rgba(30,91,139,0.06)] transition-colors ${
                isOpen ? "border-[#9fcde9]" : "border-[#d3e4f1]"
              }`}
              key={participant.id}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <ParticipantAvatar participant={participant} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-[#143f72]">{participant.name}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#6a86a4]">
                      Participante #{index + 1}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 divide-x divide-[#dce9f3] rounded-md bg-[#f2f8fd] px-1 py-3">
                  <div className="px-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#7690aa]">Reflexiones</p>
                    <p className="mt-1 text-base font-bold text-[#126bb7]">{participant.reflectionCount}</p>
                  </div>
                  <div className="px-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#7690aa]">Última participación</p>
                    <p className="mt-1 text-sm font-bold text-[#31577f]">
                      {formatShortDate(participant.lastParticipation)}
                    </p>
                  </div>
                </div>

                <button
                  aria-controls={historyId}
                  aria-expanded={isOpen}
                  className={`mt-3 flex min-h-11 w-full items-center justify-between rounded-md px-3.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
                    isOpen
                      ? "bg-[#1677c8] text-white"
                      : "border border-[#c9dfef] bg-white text-[#0871c7] active:bg-[#e9f5fc]"
                  }`}
                  onClick={() => toggleHistory(participant.id)}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle aria-hidden="true" size={18} />
                    {isOpen ? "Ocultar historial" : "Ver historial"}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    size={19}
                  />
                </button>
              </div>

              {isOpen ? (
                <ParticipantHistory
                  compact
                  id={historyId}
                  participant={participant}
                  reflections={participantReflections}
                />
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-5 hidden overflow-x-auto rounded-lg border border-[#d2e3f0] bg-white xl:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-[#e8f3fb] text-[#31577f]">
            <tr>
              <th className="px-5 py-3 text-sm font-bold">#</th>
              <th className="px-5 py-3 text-sm font-bold">Nombre</th>
              <th className="px-5 py-3 text-sm font-bold">Reflexiones</th>
              <th className="px-5 py-3 text-sm font-bold">Última participación</th>
              <th className="px-5 py-3 text-right text-sm font-bold">Historial</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr className="border-t border-[#dde9f3]">
                <td className="px-5 py-12 text-center text-[#66819e]" colSpan={5}>
                  {isLoading ? "Cargando participantes…" : "Aún no hay participantes publicados."}
                </td>
              </tr>
            ) : null}

            {participants.map((participant, index) => {
              const isOpen = openParticipantId === participant.id;
              const participantReflections = reflectionsByParticipant.get(participant.id) ?? [];
              const historyId = `desktop-participant-history-${participant.id}`;

              return (
                <Fragment key={participant.id}>
                  <tr className={`border-t border-[#dde9f3] text-[#31567f] ${isOpen ? "bg-[#f4f9fd]" : "hover:bg-[#f7fbfe]"}`}>
                    <td className="px-5 py-3 font-semibold">{index + 1}</td>
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-3">
                        <ParticipantAvatar participant={participant} size="sm" />
                        <span className="font-bold text-[#174175]">{participant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-[#e1f2fd] px-3 py-1 font-bold text-[#0871c7]">
                        {participant.reflectionCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">{formatShortDate(participant.lastParticipation)}</td>
                    <td className="px-5 py-2 text-right">
                      <button
                        aria-controls={historyId}
                        aria-expanded={isOpen}
                        className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#cfe2f1] bg-white px-3 font-semibold text-[#0871c7] transition hover:bg-[#e7f3fc] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
                        onClick={() => toggleHistory(participant.id)}
                        type="button"
                      >
                        <span>{isOpen ? "Ocultar" : "Ver historial"}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                          size={18}
                        />
                      </button>
                    </td>
                  </tr>

                  {isOpen ? (
                    <tr className="border-t border-[#d6e6f2] bg-[#f4f9fd]">
                      <td className="p-0" colSpan={5}>
                        <ParticipantHistory
                          id={historyId}
                          participant={participant}
                          reflections={participantReflections}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ParticipantHistory({
  compact = false,
  id,
  participant,
  reflections,
}: {
  compact?: boolean;
  id: string;
  participant: Participant;
  reflections: Reflection[];
}) {
  return (
    <section
      aria-label={`Historial de ${participant.name}`}
      className={compact ? "border-t border-[#d6e7f2] bg-[#f4f9fd] p-4" : "px-5 py-4"}
      id={id}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className={`${compact ? "text-base" : "text-lg"} font-bold text-[#103a6d]`}>
            Historial de {participant.name}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#617f9f]">
            <MessageCircle aria-hidden="true" size={16} />
            {participant.reflectionCount} participaciones en el período
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5d7ca0]">
          <CalendarDays aria-hidden="true" size={14} />
          Octubre 2026
        </span>
      </div>

      {reflections.length > 0 ? (
        <div className={compact ? "mt-3 space-y-2" : "mt-4 grid gap-3 xl:grid-cols-2"}>
          {reflections.map((reflection) => (
            <ReflectionCard compact={compact} key={reflection.id} reflection={reflection} />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-[#c9ddec] bg-white px-5 py-5 text-[#66819e]">
          No hay reflexiones publicadas para este participante.
        </p>
      )}
    </section>
  );
}

function EmptyParticipants({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-[#c9ddec] bg-white px-5 py-10 text-center text-[#66819e]">
      {isLoading ? "Cargando participantes…" : "Aún no hay participantes publicados."}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="h-full rounded-lg border border-[#d6e6f2] bg-[#eaf5fc] px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-xl font-bold text-[#1169b6] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#5d7ca0] sm:text-base">{label}</p>
    </div>
  );
}
