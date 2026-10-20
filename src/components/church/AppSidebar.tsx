"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  MessageCircle,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Calendario", Icon: CalendarDays },
  { href: "/reflexiones", label: "Reflexiones", Icon: MessageCircle },
  { href: "/participantes", label: "Participantes", Icon: UsersRound },
  { href: "/recursos", label: "Recursos", Icon: BookOpen },
  { href: "/recitacion", label: "Recitación semanal", Icon: BookMarked },
];

function normalizePath(pathname: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const withoutBase = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const normalized = withoutBase.replace(/\/$/, "");
  return normalized || "/";
}

export function AppSidebar() {
  const pathname = normalizePath(usePathname());

  return (
    <>
      <aside className="hidden border-r border-[#dbeaf6] bg-[#f7fbff] px-3 py-7 lg:block">
        <nav aria-label="Secciones principales" className="sticky top-7 space-y-3">
          {navigationItems.map((item) => (
            <NavigationLink item={item} pathname={pathname} key={item.href} />
          ))}
        </nav>
      </aside>

      <nav
        aria-label="Secciones principales"
        className="border-b border-[#dbeaf6] bg-white px-3 py-2 lg:hidden"
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => {
            const selected = pathname === item.href;

            return (
              <Link
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-12 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
                  selected ? "bg-[#1677c8] text-white" : "bg-[#eef6fd] text-[#244b78] hover:bg-[#deeffc]"
                }`}
                href={item.href}
                key={item.href}
              >
                <item.Icon aria-hidden="true" size={18} strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function NavigationLink({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const selected = pathname === item.href;

  return (
    <Link
      aria-current={selected ? "page" : undefined}
      className={`flex min-h-16 items-center gap-4 rounded-md px-5 text-lg transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
        selected
          ? "bg-[#1978ca] font-bold text-white shadow-[0_10px_24px_rgba(25,120,202,0.22)]"
          : "font-medium text-[#2d4f78] hover:bg-[#e8f4fd] hover:text-[#0b65b5]"
      }`}
      href={item.href}
    >
      <item.Icon aria-hidden="true" size={27} strokeWidth={1.8} />
      <span>{item.label}</span>
    </Link>
  );
}
