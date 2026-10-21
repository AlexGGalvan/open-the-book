"use client";

import { Fragment, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import { ParticipantAvatar } from "@/components/church/ParticipantAvatar";
import { ReflectionCard } from "@/components/church/ReflectionCard";
import { formatShortDate } from "@/lib/churchDates";

export function ParticipantsDirectory() {
  const { error, isLoading, participants, reflections } = useChurchData();
  const [openParticipantId, setOpenParticipantId] = useState<string | null>(null);
  const totalReflections = participants.reduce((total, participant) => total + participant.reflectionCount, 0);

  return (
    <>
      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#9a3434]">
          No fue posible cargar los participantes desde Supabase.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat value={String(participants.length)} label="Hermanos participantes" />
        <Stat value={String(totalReflections)} label="Reflexiones compartidas" />
        <Stat value="Octubre 2026" label="Período seleccionado" />
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-[#d2e3f0] bg-white">
        <table className="min-w-[760px] w-full border-collapse text-left">
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
              const participantReflections = reflections.filter(
                (reflection) => reflection.participantId === participant.id,
              );
              const historyId = `participant-history-${participant.id}`;

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
                        onClick={() => setOpenParticipantId(isOpen ? null : participant.id)}
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
                        <section className="px-5 py-4" id={historyId} aria-label={`Historial de ${participant.name}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h2 className="text-lg font-bold text-[#103a6d]">Historial de {participant.name}</h2>
                              <p className="mt-1 flex items-center gap-2 text-sm text-[#617f9f]">
                                <MessageCircle aria-hidden="true" size={16} />
                                {participant.reflectionCount} participaciones en el período
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5d7ca0]">
                              Octubre 2026
                            </span>
                          </div>

                          {participantReflections.length > 0 ? (
                            <div className="mt-4 grid gap-3 xl:grid-cols-2">
                              {participantReflections.map((reflection) => (
                                <ReflectionCard key={reflection.id} reflection={reflection} />
                              ))}
                            </div>
                          ) : (
                            <p className="mt-4 rounded-md border border-dashed border-[#c9ddec] bg-white px-5 py-5 text-[#66819e]">
                              No hay reflexiones publicadas para este participante.
                            </p>
                          )}
                        </section>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-[#d6e6f2] bg-[#eaf5fc] px-5 py-4">
      <p className="text-2xl font-bold text-[#1169b6] sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-[#5d7ca0] sm:text-base">{label}</p>
    </div>
  );
}
