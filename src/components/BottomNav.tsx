"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, Bookmark, Footprints, Home, UserCircle } from "lucide-react";

export type AppTab = "home" | "read" | "journey" | "saved" | "profile";

const navItems: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "read", label: "Read", icon: BookOpen },
  { id: "journey", label: "Journey", icon: Footprints },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "profile", label: "Profile", icon: UserCircle },
];

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] px-4 pb-4"
    >
      <div className="grid grid-cols-5 rounded-[28px] border border-white/10 bg-[#15110d]/88 p-2 shadow-[0_-24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition ${
                isActive
                  ? "bg-[#f4dfb8] text-[#17110c] shadow-[0_12px_28px_rgba(244,223,184,0.18)]"
                  : "text-[#b9aa92] hover:bg-white/5 hover:text-[#f7ead4]"
              }`}
              onClick={() => onChange(item.id)}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
