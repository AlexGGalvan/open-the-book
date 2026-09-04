"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";

type ShareButtonProps = {
  title: string;
  text: string;
  className?: string;
};

export function ShareButton({ title, text, className }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied">("idle");

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text });
        setStatus("shared");
      } else {
        await copyTextToClipboard(text);
        setStatus("copied");
      }

      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleShare}
      aria-label="Compartir versículo"
      title="Compartir"
    >
      <Share2 aria-hidden="true" size={18} />
      <span>{status === "copied" ? "Copiado" : status === "shared" ? "Compartido" : "Compartir"}</span>
    </button>
  );
}
