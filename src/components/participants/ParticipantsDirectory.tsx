"use client";

import { useState } from "react";
import { ChevronRight, MessageCircle, X } from "lucide-react";
import { ParticipantAvatar } from "@/components/church/ParticipantAvatar";
import { ReflectionCard } from "@/components/church/ReflectionCard";
import { participants, reflections } from "@/data/churchData";
import { formatShortDate } from "@/lib/churchDates";

export function ParticipantsDirectory() {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const selectedParticipant = participants.find((participant) => participant.id === selectedParticipantId);
  const selectedReflections = reflections.filter((reflection) => reflection.participantId === selectedParticipantId);
  const totalReflections = participants.reduce((total, participant) => total + participant.reflectionCount, 0);

  return (
    <>
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
            {participants.map((participant, index) => (
              <tr className="border-t border-[#dde9f3] text-[#31567f] hover:bg-[#f7fbfe]" key={participant.id}>
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
                    aria-label={`Ver historial de ${participant.name}`}
                    className="inline-grid size-10 place-items-center rounded-md text-[#0871c7] transition hover:bg-[#e7f3fc] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
                    onClick={() => setSelectedParticipantId(participant.id)}
                    title={`Ver historial de ${participant.name}`}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" size={21} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedParticipant ? (
        <section className="mt-5 rounded-lg border border-[#cfe1ef] bg-white p-5" aria-labelledby="participant-history-title">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <ParticipantAvatar participant={selectedParticipant} size="lg" />
              <div>
                <h2 id="participant-history-title" className="text-2xl font-bold text-[#103a6d]">
                  Historial de {selectedParticipant.name}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-[#617f9f]">
                  <MessageCircle aria-hidden="true" size={17} />
                  {selectedParticipant.reflectionCount} participaciones en el período
                </p>
              </div>
            </div>
            <button
              aria-label="Cerrar historial"
              className="grid size-10 place-items-center rounded-md text-[#507392] hover:bg-[#eef5fa] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
              onClick={() => setSelectedParticipantId(null)}
              title="Cerrar historial"
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          {selectedReflections.length > 0 ? (
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {selectedReflections.map((reflection) => (
                <ReflectionCard key={reflection.id} reflection={reflection} />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-[#f1f7fb] px-5 py-6 text-[#66819e]">
              El historial completo se mostrará aquí cuando se conecten los datos de Supabase.
            </p>
          )}
        </section>
      ) : null}
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
