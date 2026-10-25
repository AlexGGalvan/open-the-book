import Image from "next/image";

export function ChurchHeader() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <header className="border-b border-[#d6e8f6] bg-white" aria-label="Iglesia de Torreón">
      <div className="church-header-hero relative hidden h-[clamp(152px,10.52vw,202px)] overflow-hidden md:block">
        <Image
          alt="Iglesia de Torreón, Lectura diaria. La palabra tiene poder para sobreedificarnos y daros herencia con todos los santificados. Hechos 20:32."
          className="object-cover object-top"
          fill
          priority
          sizes="100vw"
          src={`${basePath}/brand/church-header.png`}
        />
      </div>

      <div className="flex h-20 items-center gap-3 px-4 md:hidden">
        <Image
          alt="Logo de la Iglesia de Torreón"
          className="size-14 shrink-0 object-contain"
          height={56}
          priority
          src={`${basePath}/logos/recitation-logo.png`}
          width={56}
        />
        <div className="min-w-0">
          <p className="font-serif text-[1.45rem] font-bold leading-none text-[#082b59] min-[360px]:text-[1.7rem]">Iglesia de Torreón</p>
          <p className="mt-1.5 text-[10px] font-semibold uppercase text-[#315b8f]">Lectura diaria</p>
        </div>
      </div>
    </header>
  );
}
