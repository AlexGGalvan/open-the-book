"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readingDays as localReadingDays, resources as localResources } from "@/data/churchData";
import type { ChurchDataSnapshot } from "@/lib/supabase/churchRepository";
import { loadChurchData } from "@/lib/supabase/churchRepository";

type ChurchDataContextValue = ChurchDataSnapshot & {
  error: string | null;
  isLoading: boolean;
};

const initialData: ChurchDataSnapshot = {
  readingDays: localReadingDays.map((day) => ({ ...day, reflectionCount: 0 })),
  participants: [],
  reflections: [],
  resources: localResources,
  weeklyRecitations: [],
};

const ChurchDataContext = createContext<ChurchDataContextValue | null>(null);

export function ChurchDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadChurchData()
      .then((snapshot) => {
        if (active) setData(snapshot);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ ...data, error, isLoading }),
    [data, error, isLoading],
  );

  return <ChurchDataContext.Provider value={value}>{children}</ChurchDataContext.Provider>;
}

export function useChurchData() {
  const value = useContext(ChurchDataContext);
  if (!value) throw new Error("useChurchData debe usarse dentro de ChurchDataProvider.");
  return value;
}
