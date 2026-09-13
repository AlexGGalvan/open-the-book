"use client";

import { useEffect } from "react";
import { WeeklyRecitationCard } from "@/components/WeeklyRecitationCard";
import { clearAppBrowserPersistence } from "@/lib/browserPersistence";

export function DailyMannaApp() {
  useEffect(() => {
    void clearAppBrowserPersistence();
  }, []);

  return (
    <main className="min-h-dvh bg-[#eafffb] text-[#073a5a]">
      <div className="recitation-texture min-h-dvh">
        <div className="mx-auto flex min-h-dvh w-full max-w-[780px] flex-col justify-center px-4 py-5 sm:px-8 sm:py-10">
          <div className="pb-10 pt-4">
            <WeeklyRecitationCard />
          </div>
        </div>
      </div>
    </main>
  );
}
