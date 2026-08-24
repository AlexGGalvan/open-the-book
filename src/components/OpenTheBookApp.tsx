"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { BottomNav, type AppTab } from "@/components/BottomNav";
import { GuestExperience } from "@/components/GuestExperience";
import { HomeView } from "@/components/HomeView";
import { IntroExperience } from "@/components/IntroExperience";
import { JourneyView } from "@/components/JourneyView";
import { MeetingNotesView } from "@/components/MeetingNotesView";
import { PassageView } from "@/components/PassageView";
import { ProfileView } from "@/components/ProfileView";
import { ReadingMode } from "@/components/ReadingMode";
import { ReadView } from "@/components/ReadView";
import { SavedView } from "@/components/SavedView";
import { getPassageForTheme } from "@/data/passages";
import { useOpenBookStore } from "@/hooks/useOpenBookStore";
import { tapHaptic } from "@/lib/haptics";
import type { Passage, ThemeKey } from "@/types/bible";

type Surface = "app" | "intro" | "guest" | "meeting";

export function OpenTheBookApp() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("t");
  const store = useOpenBookStore();
  const [surface, setSurface] = useState<Surface>(() =>
    initialTarget === "guest"
      ? "guest"
      : initialTarget === "meeting" || initialTarget === "notes"
        ? "meeting"
        : "app",
  );
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    initialTarget === "journal" ? "journey" : initialTarget === "study" ? "read" : "home",
  );
  const [skipIntroForNfc] = useState(
    () =>
      initialTarget === "journal" ||
      initialTarget === "study" ||
      initialTarget === "meeting" ||
      initialTarget === "notes",
  );
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("amor");
  const [readingMode, setReadingMode] = useState(false);

  const shouldShowIntro =
    store.hydrated &&
    surface !== "guest" &&
    surface !== "meeting" &&
    (surface === "intro" || (!store.preferences.introSeen && !skipIntroForNfc));

  const isSelectedSaved = useMemo(
    () =>
      selectedPassage
        ? store.savedVerses.some((verse) => verse.passageId === selectedPassage.id)
        : false,
    [selectedPassage, store.savedVerses],
  );

  function openPassage(passage: Passage, theme: ThemeKey = passage.themes[0]) {
    setSelectedPassage(passage);
    setSelectedTheme(theme);
    store.recordReading(passage, theme);
    tapHaptic(8);
  }

  function selectTheme(theme: ThemeKey) {
    openPassage(getPassageForTheme(theme), theme);
    setActiveTab("read");
  }

  function handleIntroComplete(theme?: ThemeKey) {
    store.markIntroSeen();
    setSurface("app");

    if (theme) {
      selectTheme(theme);
    }
  }

  function handleTabChange(tab: AppTab) {
    setSelectedPassage(null);
    setReadingMode(false);
    setSurface("app");
    setActiveTab(tab);
    tapHaptic(6);
  }

  if (!store.hydrated) {
    return <LoadingScreen />;
  }

  if (surface === "guest") {
    return <GuestExperience onEnterMain={() => setSurface("app")} />;
  }

  if (shouldShowIntro) {
    return <IntroExperience onComplete={handleIntroComplete} />;
  }

  return (
    <main className="min-h-dvh bg-[#080604] text-[#f8ebd2]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(244,223,184,0.16),transparent_32%),radial-gradient(circle_at_12%_18%,rgba(141,92,48,0.10),transparent_30%),linear-gradient(180deg,#100c09_0%,#070504_48%,#050403_100%)]" />
      <div className="paper-grain fixed inset-0 opacity-[0.28]" />
      <div className="relative z-10 mx-auto w-full max-w-[520px] px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {surface === "meeting" ? (
            <MeetingNotesView
              store={store}
              onBackHome={() => {
                setSurface("app");
                setActiveTab("home");
              }}
            />
          ) : selectedPassage ? (
            <PassageView
              passage={selectedPassage}
              selectedTheme={selectedTheme}
              isSaved={isSelectedSaved}
              onBack={() => setSelectedPassage(null)}
              onSave={() => store.saveVerse(selectedPassage, selectedTheme)}
              onReadFull={() => setReadingMode(true)}
              onSaveReflection={(text) => store.saveReflection(selectedPassage, selectedTheme, text)}
              onMemorize={() => {
                store.setMemorizePassage(selectedPassage.id);
                setActiveTab("saved");
                setSelectedPassage(null);
              }}
            />
          ) : activeTab === "home" ? (
            <HomeView
              store={store}
              onSelectTheme={selectTheme}
              onOpenPassage={openPassage}
              onNavigate={handleTabChange}
            />
          ) : activeTab === "read" ? (
            <ReadView store={store} onSelectTheme={selectTheme} onOpenPassage={openPassage} />
          ) : activeTab === "journey" ? (
            <JourneyView store={store} onOpenPassage={openPassage} />
          ) : activeTab === "saved" ? (
            <SavedView store={store} onOpenPassage={openPassage} />
          ) : (
            <ProfileView store={store} onReplayIntro={() => setSurface("intro")} />
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onChange={handleTabChange} />

      {selectedPassage && readingMode ? (
        <ReadingMode
          passage={selectedPassage}
          preferences={store.preferences}
          onClose={() => setReadingMode(false)}
          onUpdatePreferences={store.updatePreferences}
        />
      ) : null}
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#050403] px-6 text-center text-[#f8ebd2]">
      <div className="space-y-4">
        <div className="mx-auto h-px w-48 animate-pulse bg-gradient-to-r from-transparent via-[#f4dfb8] to-transparent" />
        <p className="font-serif text-3xl tracking-[0.22em]">OPEN THE BOOK</p>
      </div>
    </main>
  );
}
