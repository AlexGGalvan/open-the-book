import type { ReactNode } from "react";

export function PageHeading({ title, description, aside }: { title: string; description?: string; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-bold text-[#092f63] sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-base leading-7 text-[#58799f] sm:text-lg">{description}</p> : null}
      </div>
      {aside}
    </div>
  );
}
