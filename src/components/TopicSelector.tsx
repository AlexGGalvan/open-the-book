"use client";

import { motion } from "framer-motion";
import { themeLabels } from "@/data/themes";
import type { ThemeKey } from "@/types/bible";

interface TopicSelectorProps {
  themes: ThemeKey[];
  onSelect: (theme: ThemeKey) => void;
  compact?: boolean;
}

export function TopicSelector({ themes, onSelect, compact = false }: TopicSelectorProps) {
  return (
    <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-2 gap-3 sm:grid-cols-3"}`}>
      {themes.map((theme, index) => (
        <motion.button
          key={theme}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.035 }}
          className="min-h-12 rounded-full border border-[#d7c5a1]/18 bg-[#f8ebd2]/7 px-4 text-sm font-medium text-[#f5e7ce] transition hover:border-[#f4dfb8]/45 hover:bg-[#f4dfb8]/12 focus:outline-none focus:ring-2 focus:ring-[#f4dfb8]/55"
          onClick={() => onSelect(theme)}
        >
          {themeLabels[theme]}
        </motion.button>
      ))}
    </div>
  );
}
