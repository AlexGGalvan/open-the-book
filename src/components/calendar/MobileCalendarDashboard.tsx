"use client";

import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { ReflectionCard } from "@/components/church/ReflectionCard";
import type { ReadingDay, Reflection, WeeklyRecitation } from "@/domain/church";
import { formatLocalDate } from "@/lib/dates";
import { toIsoDate } from "@/lib/churchDates";

type VisibleMonth = { year: number; month: number };

type MobileCalendarDashboardProps = {
  calendarCells: Array<number | null>;
  currentDate: string;
  currentRecitation?: WeeklyRecitation;
  latestReflections: Reflection[];
  nextRecitation?: WeeklyRecitation;
  onChangeMonth: (offset: number) => void;
  onSelectAdjacentDay: (offset: number) => void;
  onSelectDate: (date: string) => void;
  onSelectToday: () => void;
  readingDayByDate: Map<string, ReadingDay>;
  selectedDate: string;
  selectedDay?: ReadingDay;
  visibleMonth: VisibleMonth;
};

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

const weekdays = [
  { short: "D", label: "Domingo" },
  { short: "L", label: "Lunes" },
  { short: "M", label: "Martes" },
  { short: "M", label: "Miércoles" },
  { short: "J", label: "Jueves" },
  { short: "V", label: "Viernes" },
  { short: "S", label: "Sábado" },
];

export function MobileCalendarDashboard({
  calendarCells,
  currentDate,
  currentRecitation,
  latestReflections,
  nextRecitation,
  onChangeMonth,
  onSelectAdjacentDay,
  onSelectDate,
  onSelectToday,
  readingDayByDate,
  selectedDate,
  selectedDay,
  visibleMonth,
}: MobileCalendarDashboardProps) {
  return (
    <div className="mobile-dashboard space-y-4 md:hidden">
      <header className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-[#1775ba]">Lectura diaria</p>
          <h1 className="mt-1 text-[1.35rem] font-bold leading-tight text-[#0a315f] min-[360px]:text-2xl">
            {capitalize(formatLocalDate(selectedDate))}
          </h1>
        </div>
        <button
          aria-label="Ir a hoy"
          className="grid size-11 shrink-0 place-items-center rounded-md border border-[#c9e0f1] bg-white text-[#116db5] shadow-sm transition active:bg-[#eaf5fc] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
          onClick={onSelectToday}
          title="Ir a hoy"
          type="button"
        >
          <CalendarDays aria-hidden="true" size={21} />
        </button>
      </header>

      <section
        aria-labelledby="mobile-readings-title"
        className="rounded-lg border border-[#d4e6f3] bg-white p-4 shadow-[0_8px_24px_rgba(30,91,139,0.07)]"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="mobile-readings-title" className="flex items-center gap-2 text-base font-bold text-[#0b65b0]">
            <BookOpen aria-hidden="true" size={20} />
            Lecturas del día
          </h2>
          <div className="flex gap-1">
            <MobileIconButton label="Día anterior" onClick={() => onSelectAdjacentDay(-1)}>
              <ChevronLeft aria-hidden="true" size={19} />
            </MobileIconButton>
            <MobileIconButton label="Día siguiente" onClick={() => onSelectAdjacentDay(1)}>
              <ChevronRight aria-hidden="true" size={19} />
            </MobileIconButton>
          </div>
        </div>

        {selectedDay ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {selectedDay.passages.map((passage) => (
              <p
                className="min-w-0 border-l-2 border-[#35a7df] py-1 pl-3 text-sm font-bold leading-5 text-[#173f6d]"
                key={passage.reference}
              >
                {passage.reference}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#66809e]">No hay lecturas cargadas para esta fecha.</p>
        )}
      </section>

      <section
        aria-labelledby="mobile-calendar-title"
        className="rounded-lg border border-[#d4e6f3] bg-white p-3 shadow-[0_8px_24px_rgba(30,91,139,0.07)]"
      >
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <h2 id="mobile-calendar-title" className="text-xl font-bold text-[#0a315f]">
            {monthNames[visibleMonth.month]} {visibleMonth.year}
          </h2>
          <div className="flex gap-1">
            <MobileIconButton label="Mes anterior" onClick={() => onChangeMonth(-1)}>
              <ChevronLeft aria-hidden="true" size={19} />
            </MobileIconButton>
            <MobileIconButton label="Mes siguiente" onClick={() => onChangeMonth(1)}>
              <ChevronRight aria-hidden="true" size={19} />
            </MobileIconButton>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${monthNames[visibleMonth.month]} de ${visibleMonth.year}`}>
          {weekdays.map((weekday) => (
            <span
              aria-label={weekday.label}
              className="grid h-7 place-items-center text-[11px] font-bold text-[#6280a0]"
              key={weekday.label}
              role="columnheader"
            >
              {weekday.short}
            </span>
          ))}

          {calendarCells.map((day, index) => {
            if (day === null) {
              return <span aria-hidden="true" className="h-11" key={`mobile-empty-${index}`} />;
            }

            const date = toIsoDate(visibleMonth.year, visibleMonth.month, day);
            const reading = readingDayByDate.get(date);
            const selected = date === selectedDate;
            const today = date === currentDate;
            const reflectionCount = reading?.reflectionCount ?? 0;

            return (
              <button
                aria-label={`${day} de ${monthNames[visibleMonth.month]}, ${reflectionCount} reflexiones`}
                aria-selected={selected}
                className={`relative grid h-11 min-w-0 place-items-center rounded-md text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
                  selected
                    ? "bg-[#1677c8] text-white shadow-[0_6px_14px_rgba(22,119,200,0.25)]"
                    : today
                      ? "border border-[#42abd9] bg-[#eef9fd] text-[#0a62a5]"
                      : "text-[#244d78] active:bg-[#e9f5fc]"
                }`}
                key={date}
                onClick={() => onSelectDate(date)}
                role="gridcell"
                type="button"
              >
                <span className={reflectionCount > 0 ? "-translate-y-1" : ""}>{day}</span>
                {reflectionCount > 0 ? (
                  <span
                    className={`absolute bottom-0.5 min-w-4 rounded-full px-1 text-center text-[9px] leading-3 ${
                      selected ? "bg-white/20 text-white" : "bg-[#dff1fb] text-[#0872bd]"
                    }`}
                  >
                    {reflectionCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <Link
        className="block rounded-lg border border-[#9ddfe8] bg-[#f4fdfd] p-4 shadow-[0_10px_28px_rgba(11,105,157,0.09)] transition active:bg-white focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
        href="/recitacion"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#dff7f8] text-[#0878a3]">
            <BookMarked aria-hidden="true" size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase text-[#1681a5]">Recitación semanal</p>
            <h2 className="mt-1 text-xl font-bold text-[#0b3d62]">
              {currentRecitation?.reference ?? "Pendiente de publicación"}
            </h2>
          </div>
          <ChevronRight aria-hidden="true" className="mt-2 shrink-0 text-[#1681a5]" size={20} />
        </div>

        {currentRecitation ? (
          <p className="mobile-recitation-copy mt-3 text-sm leading-6 text-[#315c78]">
            {currentRecitation.text}
          </p>
        ) : null}

        {nextRecitation ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#c9eaed] pt-3 text-sm">
            <span className="text-[#5a7c91]">Próxima semana</span>
            <strong className="text-right text-[#0b5f85]">{nextRecitation.reference}</strong>
          </div>
        ) : null}
      </Link>

      <section aria-labelledby="mobile-latest-reflections-title" className="pb-2">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 id="mobile-latest-reflections-title" className="flex items-center gap-2 text-lg font-bold text-[#0a315f]">
            <MessageCircle aria-hidden="true" size={21} className="text-[#1376ba]" />
            Últimas reflexiones
          </h2>
          <Link
            aria-label="Ver todas las reflexiones"
            className="grid size-10 place-items-center rounded-md text-[#1376ba] transition active:bg-white focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
            href="/reflexiones"
            title="Ver todas las reflexiones"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </Link>
        </div>

        <div className="space-y-2">
          {latestReflections.length > 0 ? (
            latestReflections.map((reflection) => (
              <ReflectionCard compact key={reflection.id} reflection={reflection} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#cbddea] bg-white px-4 py-8 text-center text-sm text-[#7189a5]">
              Aún no hay reflexiones publicadas.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MobileIconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-md text-[#28547f] transition active:bg-[#e7f3fb] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("es-MX") + value.slice(1);
}
