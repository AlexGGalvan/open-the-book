import type { ReactNode } from "react";
import { AppSidebar } from "@/components/church/AppSidebar";
import { BrowserCleanup } from "@/components/church/BrowserCleanup";
import { ChurchHeader } from "@/components/church/ChurchHeader";

export function ChurchAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#edf6fc] text-[#143965]">
      <BrowserCleanup />
      <ChurchHeader />
      <div className="lg:grid lg:min-h-[calc(100dvh-10.52vw)] lg:grid-cols-[264px_minmax(0,1fr)]">
        <AppSidebar />
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
