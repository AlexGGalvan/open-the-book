"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  ListMusic,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { worshipSongs, type SyncedLyricLine, type WorshipSong } from "@/data/worshipSongs";

export function WorshipSongCard() {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const selectedSong = useMemo(
    () => worshipSongs.find((song) => song.id === selectedSongId) ?? null,
    [selectedSongId],
  );

  if (!selectedSong) {
    return <WorshipLibrary onSelectSong={(song) => setSelectedSongId(song.id)} />;
  }

  return <WorshipPlayer song={selectedSong} onBack={() => setSelectedSongId(null)} />;
}

function WorshipLibrary({ onSelectSong }: { onSelectSong: (song: WorshipSong) => void }) {
  return (
    <section
      aria-labelledby="worship-library-title"
      className="overflow-hidden rounded-lg border border-[#9cebf0] bg-white/95 p-5 shadow-[0_26px_80px_rgba(0,82,150,0.16)] sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <div className="grid size-24 place-items-center rounded-full border border-[#9cebf0] bg-[#effdfb] text-[#00589d] shadow-[0_16px_30px_rgba(0,82,150,0.16)]">
          <ListMusic aria-hidden="true" size={38} strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase text-[#007cb3]">Repertorio</p>
        <h2
          id="worship-library-title"
          className="mt-2 font-serif text-4xl font-semibold leading-none text-[#00589d] sm:text-5xl"
        >
          Alabanzas
        </h2>
      </div>

      <div className="mt-7 space-y-3">
        {worshipSongs.map((song) => (
          <button
            key={song.id}
            className="group w-full overflow-hidden rounded-lg border border-[#bdeff2] bg-[#effdfb] text-left shadow-[0_14px_34px_rgba(0,82,150,0.09)] transition hover:-translate-y-0.5 hover:border-[#36d9e6] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#36d9e6]"
            onClick={() => onSelectSong(song)}
            type="button"
          >
            <div className="flex items-stretch">
              <div className="grid w-20 shrink-0 place-items-center bg-[#00589d] text-white sm:w-24">
                <Music2 aria-hidden="true" size={34} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-[#007cb3]">
                      {song.subtitle}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight text-[#073a5a] sm:text-3xl">
                      {song.title}
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#bdeff2] bg-white px-3 py-1 text-xs font-bold text-[#00689d]">
                    <Clock3 aria-hidden="true" size={14} />
                    {formatTime(song.duration)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug text-[#38667a]">
                  {song.lyrics[0]?.text}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorshipPlayer({ song, onBack }: { song: WorshipSong; onBack: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const activeLineIndex = getActiveLyricIndex(currentTime, song.lyrics);
  const displayLineIndex = activeLineIndex >= 0 ? activeLineIndex : 0;
  const activeLine = song.lyrics[displayLineIndex] ?? null;
  const previousLine = activeLineIndex > 0 ? song.lyrics[activeLineIndex - 1] : null;
  const nextLine = song.lyrics[displayLineIndex + 1] ?? null;
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  useEffect(() => {
    if (activeLineIndex < 0) {
      return;
    }

    lyricRefs.current[activeLineIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLineIndex]);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function seekTo(time: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextTime = Math.min(Math.max(time, 0), duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <section
      aria-labelledby="worship-song-title"
      className="overflow-hidden rounded-lg border border-[#9cebf0] bg-white/95 p-5 shadow-[0_26px_80px_rgba(0,82,150,0.16)] sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          aria-label="Volver al repertorio"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-[#bdeff2] bg-[#effdfb] text-[#00589d] transition hover:border-[#36d9e6] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#36d9e6]"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={21} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-bold uppercase text-[#007cb3]">{song.subtitle}</p>
          <h2
            id="worship-song-title"
            className="mt-1 truncate font-serif text-3xl font-semibold leading-none text-[#00589d] sm:text-4xl"
          >
            {song.title}
          </h2>
        </div>

        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-[#bdeff2] bg-[#effdfb] text-[#00589d]">
          <Music2 aria-hidden="true" size={22} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#bdeff2] bg-[#effdfb] shadow-[0_16px_34px_rgba(0,82,150,0.08)]">
        <div className="bg-[#00589d] px-5 py-7 text-center text-white sm:px-7 sm:py-8">
          <p className="min-h-7 font-serif text-lg font-semibold leading-snug text-white/70">
            {previousLine?.text ?? " "}
          </p>
          <p className="mt-3 font-serif text-[2.05rem] font-semibold leading-tight sm:text-[2.55rem]">
            {activeLine?.text ?? song.lyrics[0]?.text}
          </p>
          <p className="mt-3 min-h-8 font-serif text-xl font-semibold leading-snug text-white/75 sm:text-2xl">
            {nextLine?.text ?? " "}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || song.duration)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            preload="metadata"
            src={`${basePath}${song.audioSrc}`}
          />

          <div className="flex items-center gap-3">
            <button
              aria-label="Retroceder 10 segundos"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-[#bdeff2] bg-white text-[#00589d] transition hover:border-[#36d9e6] hover:bg-[#e8fbfb] focus:outline-none focus:ring-2 focus:ring-[#36d9e6]"
              onClick={() => seekTo(currentTime - 10)}
              type="button"
            >
              <SkipBack aria-hidden="true" size={20} />
            </button>
            <button
              aria-label={isPlaying ? "Pausar alabanza" : "Reproducir alabanza"}
              className="grid size-16 shrink-0 place-items-center rounded-full bg-[#00589d] text-white shadow-[0_14px_26px_rgba(0,82,150,0.22)] transition hover:bg-[#007cb3] focus:outline-none focus:ring-2 focus:ring-[#36d9e6] sm:size-20"
              onClick={() => void togglePlayback()}
              type="button"
            >
              {isPlaying ? (
                <Pause aria-hidden="true" size={30} fill="currentColor" />
              ) : (
                <Play aria-hidden="true" size={30} fill="currentColor" />
              )}
            </button>
            <button
              aria-label="Avanzar 10 segundos"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-[#bdeff2] bg-white text-[#00589d] transition hover:border-[#36d9e6] hover:bg-[#e8fbfb] focus:outline-none focus:ring-2 focus:ring-[#36d9e6]"
              onClick={() => seekTo(currentTime + 10)}
              type="button"
            >
              <SkipForward aria-hidden="true" size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <input
                aria-label="Progreso de la alabanza"
                className="h-2 w-full accent-[#00589d]"
                max={duration || song.duration}
                min={0}
                onChange={(event) => seekTo(Number(event.target.value))}
                step={0.1}
                type="range"
                value={currentTime}
              />
              <div className="mt-1 flex items-center justify-between text-xs font-bold text-[#00689d]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#00589d] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div aria-label="Letra sincronizada" className="mt-6 max-h-[430px] overflow-y-auto pr-1">
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
