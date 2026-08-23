import { Suspense } from "react";
import { OpenTheBookApp } from "@/components/OpenTheBookApp";

export default function Home() {
  return (
    <Suspense fallback={<Fallback />}>
      <OpenTheBookApp />
    </Suspense>
  );
}

function Fallback() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#050403] text-[#f8ebd2]">
      <p className="font-serif text-3xl tracking-[0.22em]">OPEN THE BOOK</p>
    </main>
  );
}
