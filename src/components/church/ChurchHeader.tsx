import Image from "next/image";

export function ChurchHeader() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <header className="border-b border-[#d6e8f6] bg-white" aria-label="Iglesia de Torreón">
      <div className="relative hidden h-[clamp(152px,10.52vw,202px)] overflow-hidden md:block">
        <Image
          alt="Iglesia de Torreón, Lectura diaria. La palabra tiene poder para sobreedificarnos y daros herencia con todos los santificados. Hechos 20:32."
          className="object-cover object-top"
          fill
          priority
          sizes="100vw"
          src={`${basePath}/brand/church-header.png`}
        />
      </div>

      <div className="flex h-28 items-center gap-4 px-4 md:hidden">
        <Image
          alt="Logo de la Iglesia de Torreón"
          className="size-20 shrink-0 object-contain"
          height={80}
          priority
          src={`${basePath}/logos/recitation-logo.png`}
          width={80}
        />
        <div className="min-w-0">
          <p className="font-serif text-3xl font-bold leading-none text-[#082b59]">Iglesia de Torreón</p>
          <p className="mt-2 text-xs font-semibold uppercase text-[#315b8f]">Lectura diaria</p>
        </div>
      </div>
    </header>
  );
}
