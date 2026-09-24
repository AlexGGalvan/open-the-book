export type SyncedLyricLine = {
  time: number;
  text: string;
};

export type WorshipSong = {
  id: string;
  title: string;
  subtitle: string;
  audioSrc: string;
  duration: number;
  lyricPageStarts?: number[];
  lyrics: SyncedLyricLine[];
};

export const worshipSongs: WorshipSong[] = [
  {
    id: "de-gloria-en-gloria-te-veo",
    title: "De gloria en gloria te veo",
    subtitle: "Alabanza congregacional",
    audioSrc: "/audio/de-gloria-en-gloria-te-veo.mp3",
    duration: 243.912,
    lyricPageStarts: [0, 6, 15, 22, 30],
    lyrics: [
      { time: 12, text: "De gloria en gloria, Te veo" },
      { time: 18, text: "Cuanto más Te conozco" },
      { time: 22, text: "Quiero saber más de Ti" },
      { time: 27, text: "Mi Dios, cuán buen alfarero" },
      { time: 36, text: "Quebrántame, transfórmame" },
      { time: 41, text: "Moldéame a Tu imagen, Señor" },
      { time: 48, text: "Quiero ser más como Tú, Señor" },
      { time: 55.5, text: "Quiero ser más como Tú" },
      { time: 61, text: "Ver la vida como Tú" },
      { time: 65.5, text: "Saturarme de Tu espíritu" },
      { time: 74, text: "Y reflejar al mundo Tu amor" },
      { time: 83, text: "Quiero ser más como Tú" },
      { time: 91, text: "Ver la vida como Tú" },
      { time: 100, text: "Saturarme de Tu espíritu" },
      { time: 107.5, text: "Y reflejar al mundo Tu amor" },
      { time: 116, text: "De gloria en gloria, Te veo (cuanto más Te conozco, Señor)" },
      { time: 124, text: "Cuanto más Te conozco" },
      { time: 128, text: "Quiero saber más de Ti" },
      { time: 133, text: "(Mi Dios)" },
      { time: 134, text: "Mi Dios, cuán buen alfarero (quebrántame, Señor)" },
      { time: 142, text: "Quebrántame, transfórmame" },
      { time: 149, text: "Moldéame a Tu imagen, Señor" },
      { time: 154, text: "(Quiero ser)" },
      { time: 155, text: "Quiero ser más como Tú" },
      { time: 164, text: "Ver la vida como Tú" },
      { time: 172, text: "Saturarme de Tu espíritu" },
      { time: 180, text: "Y reflejar al mundo Tu amor" },
      { time: 189, text: "Quiero ser más como Tú" },
      { time: 197, text: "Ver la vida como Tú" },
      { time: 206, text: "Saturarme de Tu espíritu" },
      { time: 214, text: "Y reflejar al mundo Tu amor" },
      { time: 222, text: "Y reflejar al mundo Tu amor (reflejar al mundo)" },
      { time: 233, text: "Y reflejar al mundo Tu amor" },
    ],
  },
];
