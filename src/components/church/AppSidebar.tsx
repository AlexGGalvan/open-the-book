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
  mobileLabel: string;
  Icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Calendario", mobileLabel: "Inicio", Icon: CalendarDays },
  { href: "/reflexiones", label: "Reflexiones", mobileLabel: "Reflexiones", Icon: MessageCircle },
  { href: "/participantes", label: "Participantes", mobileLabel: "Personas", Icon: UsersRound },
  { href: "/recursos", label: "Recursos", mobileLabel: "Recursos", Icon: BookOpen },
  { href: "/recitacion", label: "Recitación semanal", mobileLabel: "Recitación", Icon: BookMarked },
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
      <aside className="church-sidebar hidden border-r border-[#dbeaf6] bg-[#f7fbff] px-3 py-7 lg:block">
        <nav aria-label="Secciones principales" className="church-sidebar-nav sticky top-7 space-y-3">
          {navigationItems.map((item) => (
            <NavigationLink item={item} pathname={pathname} key={item.href} />
          ))}
        </nav>
      </aside>

      <nav
        aria-label="Secciones principales"
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-[#cfe2f0] bg-white/95 px-1 pt-1 shadow-[0_-8px_28px_rgba(20,74,116,0.12)] backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-5">
          {navigationItems.map((item) => {
            const selected = pathname === item.href;

            return (
              <Link
                aria-current={selected ? "page" : undefined}
                aria-label={item.label}
                className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-[9px] font-semibold leading-3 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#38a7e5] min-[360px]:text-[10px] ${
                  selected ? "text-[#0b70bd]" : "text-[#557493] active:text-[#0b70bd]"
                }`}
                href={item.href}
                key={item.href}
              >
                {selected ? <span aria-hidden="true" className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#1387d5]" /> : null}
                <item.Icon aria-hidden="true" size={21} strokeWidth={selected ? 2.2 : 1.8} />
                <span className="whitespace-nowrap">{item.mobileLabel}</span>
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
      className={`church-sidebar-link flex min-h-16 items-center gap-4 rounded-md px-5 text-lg transition focus:outline-none focus:ring-2 focus:ring-[#38a7e5] ${
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
