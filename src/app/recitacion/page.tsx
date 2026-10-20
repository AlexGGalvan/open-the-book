import type { Metadata } from "next";
import { WeeklyRecitationCard } from "@/components/WeeklyRecitationCard";

export const metadata: Metadata = {
  title: "Recitación de la semana",
};

export default function RecitationPage() {
  return (
    <div className="mx-auto max-w-4xl py-2 sm:py-5">
      <WeeklyRecitationCard />
    </div>
  );
}
