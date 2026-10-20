import type { Metadata } from "next";
import { PageHeading } from "@/components/church/PageHeading";
import { ParticipantsDirectory } from "@/components/participants/ParticipantsDirectory";

export const metadata: Metadata = {
  title: "Participantes",
};

export default function ParticipantsPage() {
  return (
    <>
      <PageHeading
        title="Participantes"
        description="Hermanos que han compartido versículos y reflexiones de las lecturas diarias."
      />
      <ParticipantsDirectory />
    </>
  );
}
