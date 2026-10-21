"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import { ReflectionCard } from "@/components/church/ReflectionCard";

export function ReflectionsDirectory() {
  const { error, isLoading, participants, reflections } = useChurchData();
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("Todas");
  const [participantId, setParticipantId] = useState("all");
  const participantNames = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant.name])),
    [participants],
  );
  const bookFilters = useMemo(
    () => ["Todas", ...new Set(reflections.map((reflection) => reflection.book))],
    [reflections],
  );
  const filteredReflections = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es-MX");

    return reflections.filter((reflection) => {
      const participantName = participantNames.get(reflection.participantId) ?? "";
      const searchable = [participantName, reflection.book, reflection.reference, reflection.reflectionText]
        .join(" ")
        .toLocaleLowerCase("es-MX");
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesBook = book === "Todas" || reflection.book === book;
      const matchesParticipant = participantId === "all" || reflection.participantId === participantId;
      return matchesQuery && matchesBook && matchesParticipant;
    });
  }, [book, participantId, participantNames, query, reflections]);

  const hasFilters = query.length > 0 || book !== "Todas" || participantId !== "all";

  function clearFilters() {
    setQuery("");
    setBook("Todas");
    setParticipantId("all");
  }

  return (
    <>
      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#9a3434]">
          No fue posible cargar las reflexiones desde Supabase.
        </p>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <label className="relative block">
          <span className="sr-only">Buscar reflexiones</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7893b0]" size={22} />
          <input
            className="min-h-14 w-full rounded-lg border border-[#cddfed] bg-white py-3 pl-12 pr-4 text-[#153d6b] outline-none placeholder:text-[#8199b4] focus:border-[#1683d8] focus:ring-2 focus:ring-[#bde2fa]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por palabra, libro, versículo o participante..."
            type="search"
            value={query}
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filtrar por participante</span>
          <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7893b0]" size={20} />
          <select
            className="min-h-14 w-full appearance-none rounded-lg border border-[#cddfed] bg-white py-3 pl-12 pr-10 font-semibold text-[#31567f] outline-none focus:border-[#1683d8] focus:ring-2 focus:ring-[#bde2fa]"
            onChange={(event) => setParticipantId(event.target.value)}
            value={participantId}
          >
            <option value="all">Todos los participantes</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {bookFilters.map((filter) => {
          const selected = book === filter;
          return (
            <button
              aria-pressed={selected}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
                selected ? "bg-[#1677c8] text-white" : "bg-[#eaf4fc] text-[#315b87] hover:bg-[#dceefa]"
              }`}
              key={filter}
              onClick={() => setBook(filter)}
              type="button"
            >
              {filter}
            </button>
          );
        })}
        {hasFilters ? (
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#5b7695] transition hover:bg-[#eef5fa] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
            onClick={clearFilters}
            type="button"
          >
            <X aria-hidden="true" size={16} />
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[#173f70]">Reflexiones recientes</h2>
        <p aria-live="polite" className="text-sm text-[#6a85a5]">
          {filteredReflections.length} resultados
        </p>
      </div>

      {filteredReflections.length > 0 ? (
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {filteredReflections.map((reflection) => (
            <ReflectionCard key={reflection.id} reflection={reflection} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-[#cbddea] bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-[#345a82]">
            {isLoading ? "Cargando reflexiones…" : "No encontramos reflexiones con esos filtros."}
          </p>
          {!isLoading ? (
            <button className="mt-4 font-bold text-[#0871c7]" onClick={clearFilters} type="button">
              Mostrar todas
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
