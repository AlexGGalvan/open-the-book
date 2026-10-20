import type { Metadata } from "next";
import { PageHeading } from "@/components/church/PageHeading";
import { ReflectionsDirectory } from "@/components/reflections/ReflectionsDirectory";

export const metadata: Metadata = {
  title: "Reflexiones",
};

export default function ReflectionsPage() {
  return (
    <>
      <PageHeading
        title="Reflexiones"
        description="Todas las reflexiones compartidas por los hermanos, organizadas en un solo lugar."
      />
      <ReflectionsDirectory />
    </>
  );
}
