import type { Metadata } from "next";
import { PageHeading } from "@/components/church/PageHeading";
import { ResourcesGrid } from "@/components/resources/ResourcesGrid";

export const metadata: Metadata = {
  title: "Recursos",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHeading
        title="Recursos"
        description="Materiales de apoyo para nuestro plan de lectura y para el crecimiento en la Palabra de Dios."
      />
      <ResourcesGrid />
    </>
  );
}
