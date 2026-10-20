"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Church,
  Download,
  FileText,
  Link2,
  PlaySquare,
  X,
  type LucideIcon,
} from "lucide-react";
import { resources } from "@/data/churchData";
import type { ResourceKind } from "@/domain/church";

const iconByKind: Record<ResourceKind, LucideIcon> = {
  "reading-plan": BookOpen,
  guide: FileText,
  bible: BookOpen,
  study: Link2,
  video: PlaySquare,
  church: Church,
};

export function ResourcesGrid() {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const selectedResource = resources.find((resource) => resource.id === selectedResourceId);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {resources.map((resource) => {
          const Icon = iconByKind[resource.kind];
          return (
            <button
              className="group flex min-h-36 w-full items-center gap-5 rounded-lg border border-[#d3e4f1] bg-white p-5 text-left transition hover:border-[#9ccbec] hover:bg-[#f9fcff] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
              key={resource.id}
              onClick={() => setSelectedResourceId(resource.id)}
              type="button"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#e1f2fc] text-[#0875ca]">
                <Icon aria-hidden="true" size={34} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold text-[#123c70]">{resource.title}</span>
                <span className="mt-2 block leading-6 text-[#6682a3]">{resource.description}</span>
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-[#0875ca] transition group-hover:translate-x-1" size={22} />
            </button>
          );
        })}
      </div>

      {selectedResource ? (
        <section className="mt-5 rounded-lg border border-[#cfe2f0] bg-white p-5" aria-labelledby="resource-detail-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-[#0b75c6]">Recurso</p>
              <h2 id="resource-detail-title" className="mt-1 text-2xl font-bold text-[#103a6d]">
                {selectedResource.title}
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-[#567799]">{selectedResource.details}</p>
            </div>
            <button
              aria-label="Cerrar detalle"
              className="grid size-10 place-items-center rounded-md text-[#527595] hover:bg-[#eef5fa] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
              onClick={() => setSelectedResourceId(null)}
              title="Cerrar detalle"
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          {selectedResource.downloadPath && selectedResource.actionLabel ? (
            <a
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#1677c8] px-5 font-bold text-white transition hover:bg-[#0d67b2] focus:outline-none focus:ring-2 focus:ring-[#38a7e5]"
              download
              href={`${basePath}${selectedResource.downloadPath}`}
            >
              <Download aria-hidden="true" size={19} />
              {selectedResource.actionLabel}
            </a>
          ) : (
            <p className="mt-5 inline-flex rounded-md bg-[#edf5fb] px-4 py-3 text-sm font-semibold text-[#5d7d9f]">
              Material preparado para una próxima publicación.
            </p>
          )}
        </section>
      ) : null}

      <blockquote className="mt-6 flex items-center gap-4 rounded-lg bg-[#e4f3fc] px-5 py-4 text-[#185f9e]">
        <BookOpen aria-hidden="true" size={31} strokeWidth={1.8} />
        <div>
          <p className="font-bold">La palabra de Dios es viva y eficaz.</p>
          <footer className="mt-1 text-[#6784a3]">Hebreos 4:12</footer>
        </div>
      </blockquote>
    </>
  );
}
