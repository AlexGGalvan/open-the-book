"use client";

import { useEffect, useRef, useState } from "react";
import { Music2 } from "lucide-react";
import { worshipSongs, type SyncedLyricLine } from "@/data/worshipSongs";

const song = worshipSongs[0];

export function WorshipSongCard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.duration);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const activeLineIndex = getActiveLyricIndex(currentTime, song.lyrics);

  useEffect(() => {
    if (activeLineIndex < 0) {
      return;
    }

    lyricRefs.current[activeLineIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLineIndex]);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  function seekTo(time: number) {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  return (
    <section
      aria-labelledby="worship-song-title"
      className="overflow-hidden rounded-lg border border-[#9cebf0] bg-white/95 p-5 shadow-[0_26px_80px_rgba(0,82,150,0.16)] sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <div className="grid size-24 place-items-center rounded-full border border-[#9cebf0] bg-[#effdfb] text-[#00589d] shadow-[0_16px_30px_rgba(0,82,150,0.16)]">
          <Music2 aria-hidden="true" size={38} strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase text-[#007cb3]">Alabanza</p>
        <h2
          id="worship-song-title"
          className="mt-2 font-serif text-4xl font-semibold leading-none text-[#00589d] sm:text-5xl"
        >
          {song.title}
        </h2>
      </div>

      <div className="mt-7 rounded-lg border border-[#bdeff2] bg-[#effdfb] p-4 shadow-[0_12px_28px_rgba(0,82,150,0.08)]">
        <audio
          ref={audioRef}
          className="w-full"
          controls
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || song.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          preload="metadata"
          src={`${basePath}${song.audioSrc}`}
        />

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#00589d] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#00689d]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div
        aria-label="Letra sincronizada"
        className="mt-6 max-h-[430px] overflow-y-auto pr-1"
      >
        <div className="space-y-2">
          {song.lyrics.map((line, index) => {
            const isActive = index === activeLineIndex;
            const hasPlayed = activeLineIndex >= index;

            return (
              <button
                key={`${line.time}-${line.text}`}
                ref={(element) => {
                  lyricRefs.current[index] = element;
                }}
                aria-current={isActive ? "true" : undefined}
                className={`w-full rounded-md border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#36d9e6] ${
                  isActive
                    ? "border-[#00589d] bg-[#00589d] text-white shadow-[0_12px_24px_rgba(0,82,150,0.18)]"
                    : hasPlayed
                      ? "border-[#bdeff2] bg-[#e8fbfb] text-[#073a5a]"
                      : "border-transparent bg-white/70 text-[#38667a] hover:border-[#bdeff2] hover:bg-white"
                }`}
                onClick={() => seekTo(line.time)}
                type="button"
              >
                <span className="block text-[0.7rem] font-bold uppercase opacity-70">
                  {formatTime(line.time)}
                </span>
                <span className="mt-1 block font-serif text-xl font-semibold leading-snug sm:text-2xl">
                  {line.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getActiveLyricIndex(currentTime: number, lyrics: SyncedLyricLine[]) {
  let activeIndex = -1;

  for (let index = 0; index < lyrics.length; index += 1) {
    if (currentTime >= lyrics[index].time) {
      activeIndex = index;
    } else {
      break;
    }
  }

  return activeIndex;
}

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(seconds, 0) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
