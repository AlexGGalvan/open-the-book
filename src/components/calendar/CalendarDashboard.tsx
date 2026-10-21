"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useChurchData } from "@/components/church/ChurchDataProvider";
import { ReflectionCard } from "@/components/church/ReflectionCard";
import { formatLongDate, shiftIsoDate, toIsoDate } from "@/lib/churchDates";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const TODAY = "2026-10-20";

export function CalendarDashboard() {
  const { error, isLoading, readingDays, reflections } = useChurchData();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [visibleMonth, setVisibleMonth] = useState({ year: 2026, month: 9 });
  const readingDayByDate = useMemo(
    () => new Map(readingDays.map((day) => [day.date, day])),
    [readingDays],
  );
  const calendarCells = useMemo(
    () => buildCalendarCells(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );
  const selectedDay = readingDayByDate.get(selectedDate);
  const dayReflections = reflections.filter((reflection) => reflection.readingDate === selectedDate);

  function changeMonth(offset: number) {
    const next = new Date(Date.UTC(visibleMonth.year, visibleMonth.month + offset, 1));
    setVisibleMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  function selectToday() {
    setVisibleMonth({ year: 2026, month: 9 });
    setSelectedDate(TODAY);
  }

  function selectAdjacentDay(offset: number) {
    const nextDate = shiftIsoDate(selectedDate, offset);
    const [year, month] = nextDate.split("-").map(Number);
    setSelectedDate(nextDate);
    setVisibleMonth({ year, month: month - 1 });
  }

  return (
    <>
      {isLoading ? (
        <p aria-live="polite" className="mb-3 text-sm font-semibold text-[#527596]">Cargando información de la iglesia…</p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-3 rounded-md border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#9a3434]">
          No fue posible actualizar la información. Se muestra el calendario local sin reflexiones.
        </p>
      ) : null}
      <div className="calendar-dashboard grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.95fr)]">
      <section className="calendar-panel calendar-panel--month min-w-0 rounded-lg border border-[#dbe9f4] bg-white p-4 sm:p-6" aria-labelledby="calendar-title">
        <div className="calendar-toolbar mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 id="calendar-title" className="calendar-month-title text-3xl font-bold text-[#092f63] sm:text-4xl">
              {monthNames[visibleMonth.month]} {visibleMonth.year}
            </h1>
            <MonthButton label="Mes anterior" onClick={() => changeMonth(-1)}>
              <ChevronLeft aria-hidden="true" size={21} />
            </MonthButton>
            <MonthButton label="Mes siguiente" onClick={() => changeMonth(1)}>
              <ChevronRight aria-hidden="true" size={21} />
            </MonthButton>
          </div>
          <button
            className="min-h-11 rounded-md border border-[#c7dff0] bg-white px-6 font-bold text-[#0a68bb] transition hover:bg-[#eef7fd] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
            onClick={selectToday}
            type="button"
          >
            Hoy
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#cddfed]">
          <div className="min-w-[700px]" role="grid" aria-label={`${monthNames[visibleMonth.month]} de ${visibleMonth.year}`}>
            <div className="grid grid-cols-7 bg-[#eaf5fc]" role="row">
              {weekdays.map((day) => (
                <div
                  className="calendar-weekday border-r border-[#cddfed] px-2 py-3 text-center text-xs font-bold uppercase text-[#1768ad] last:border-r-0"
                  key={day}
                  role="columnheader"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7" role="rowgroup">
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return <div aria-hidden="true" className="calendar-day-cell min-h-28 border-r border-t border-[#d8e6f1] bg-[#fbfdff]" key={`empty-${index}`} />;
                }

                const date = toIsoDate(visibleMonth.year, visibleMonth.month, day);
                const reading = readingDayByDate.get(date);
                const selected = date === selectedDate;

                return (
                  <button
                    aria-label={`${day} de ${monthNames[visibleMonth.month]}`}
                    aria-selected={selected}
                    className={`calendar-day-cell min-h-28 border-r border-t border-[#d8e6f1] p-2 text-left transition focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#168ce1] ${
                      selected ? "bg-[#dff1fd] shadow-[inset_0_0_0_2px_#168ce1]" : "bg-white hover:bg-[#f2f9fe]"
                    }`}
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    role="gridcell"
                    type="button"
                  >
                    <span className={`calendar-day-number text-lg font-bold ${selected ? "text-[#0871c7]" : "text-[#163962]"}`}>{day}</span>
                    {reading ? (
                      <span className="calendar-day-reading mt-1 block space-y-1 text-sm text-[#315783]">
                        {reading.passages.map((passage) => (
                          <span className="block truncate" key={passage.reference} title={passage.reference}>
                            {abbreviateReference(passage.reference)}
                          </span>
                        ))}
                        <span className="flex items-center gap-1 text-[#0982de]">
                          <MessageCircle aria-hidden="true" size={15} />
                          {reading.reflectionCount}
                        </span>
                      </span>
                    ) : (
                      <span className="mt-4 block text-xs text-[#8aa0b7]">Sin lecturas</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <blockquote className="calendar-quote mt-4 flex items-center gap-4 rounded-lg bg-[#e6f4fd] px-5 py-4 text-[#1c68aa]">
          <BookOpen aria-hidden="true" className="shrink-0" size={31} strokeWidth={1.8} />
          <div>
            <p>La palabra tiene poder para sobreedificarnos y daros herencia con todos los santificados.</p>
            <footer className="mt-1 text-xs text-[#5f82a8]">Hechos 20:32</footer>
          </div>
        </blockquote>
      </section>

      <aside className="calendar-panel calendar-panel--detail rounded-lg border border-[#dbe9f4] bg-white p-4 sm:p-6" aria-labelledby="selected-day-title">
        <div className="calendar-detail-header flex items-center justify-between gap-3">
          <h2 id="selected-day-title" className="calendar-detail-title text-2xl font-bold text-[#092f63] sm:text-3xl">
            {formatLongDate(selectedDate)}
          </h2>
          <div className="flex gap-2">
            <MonthButton label="Día anterior" onClick={() => selectAdjacentDay(-1)}>
              <ChevronLeft aria-hidden="true" size={21} />
            </MonthButton>
            <MonthButton label="Día siguiente" onClick={() => selectAdjacentDay(1)}>
              <ChevronRight aria-hidden="true" size={21} />
            </MonthButton>
          </div>
        </div>

        <section className="calendar-readings mt-7" aria-labelledby="daily-readings-title">
          <h3 id="daily-readings-title" className="flex items-center gap-3 text-lg font-bold text-[#0968b8]">
            <BookOpen aria-hidden="true" size={26} strokeWidth={1.8} />
            Lecturas del día
          </h3>
          <div className="calendar-reading-box mt-3 rounded-lg bg-[#edf5fb] px-5 py-4">
            {selectedDay ? (
              selectedDay.passages.map((passage) => (
                <p className="text-xl font-bold leading-8 text-[#1a3f6f]" key={passage.reference}>
                  {passage.reference}
                </p>
              ))
            ) : (
              <p className="text-[#66809e]">No hay lecturas cargadas para esta fecha.</p>
            )}
          </div>
        </section>

        <section className="calendar-reflections mt-6 border-t border-[#d7e6f1] pt-5" aria-labelledby="daily-reflections-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="daily-reflections-title" className="flex items-center gap-3 text-lg font-bold text-[#0968b8]">
              <MessageCircle aria-hidden="true" size={25} strokeWidth={1.8} />
              Reflexiones del día
            </h3>
            <span className="text-sm text-[#6d87a6]">{dayReflections.length} reflexiones</span>
          </div>
          <div className="calendar-reflection-list mt-3 space-y-2">
            {dayReflections.length > 0 ? (
              dayReflections.slice(0, 4).map((reflection) => (
                <ReflectionCard compact key={reflection.id} reflection={reflection} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#cbddea] px-4 py-8 text-center text-[#7189a5]">
                Aún no hay reflexiones publicadas para este día.
              </div>
            )}
          </div>
          <Link
            className="calendar-reflections-link mt-5 flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#e9f4fc] px-4 font-semibold text-[#0868b8] transition hover:bg-[#d9edfb] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
            href="/reflexiones"
          >
            Ver todas las reflexiones
            <ChevronRight aria-hidden="true" size={19} />
          </Link>
        </section>
      </aside>
      </div>
    </>
  );
}
function MonthButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className="calendar-icon-button grid size-12 shrink-0 place-items-center rounded-md bg-[#eef4f9] text-[#28547f] transition hover:bg-[#dcecf7] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function buildCalendarCells(year: number, month: number) {
  const leadingCells = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<number | null> = Array.from({ length: leadingCells }, () => null);

  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function abbreviateReference(reference: string) {
  return reference
    .replace("Jeremías", "Jer")
    .replace("Lamentaciones", "Lam")
    .replace("Ezequiel", "Ezq")
    .replace("2 Corintios", "2 Cor")
    .replace("Gálatas", "Gál")
    .replace("Efesios", "Efe")
    .replace("Filipenses", "Flp")
    .replace("Colosenses", "Col")
    .replace("Tesalonicenses", "Tes");
}
