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
  lyrics: SyncedLyricLine[];
};

export const worshipSongs: WorshipSong[] = [
  {
    id: "de-gloria-en-gloria-te-veo",
    title: "De gloria en gloria te veo",
    subtitle: "Alabanza congregacional",
    audioSrc: "/audio/de-gloria-en-gloria-te-veo.mp3",
    duration: 243.912,
    lyrics: [
      { time: 8, text: "De gloria en gloria, Te veo" },
      { time: 15, text: "Cuanto más Te conozco" },
      { time: 22, text: "Quiero saber más de Ti" },
      { time: 27, text: "Mi Dios, cuán buen alfarero" },
      { time: 38, text: "Quebrántame, transfórmame" },
      { time: 41, text: "Moldéame a Tu imagen, Señor" },
      { time: 49.5, text: "Quiero ser más como Tú, Señor" },
      { time: 61, text: "Quiero ser más como Tú" },
      { time: 67.5, text: "Ver la vida como Tú" },
      { time: 74, text: "Saturarme de Tu espíritu" },
      { time: 81.5, text: "Y reflejar al mundo Tu amor" },
      { time: 91, text: "Quiero ser más como Tú" },
      { time: 97.5, text: "Ver la vida como Tú" },
      { time: 104, text: "Saturarme de Tu espíritu" },
      { time: 111.5, text: "Y reflejar al mundo Tu amor" },
      { time: 125, text: "De gloria en gloria, Te veo (cuanto más Te conozco, Señor)" },
      { time: 131.5, text: "Cuanto más Te conozco" },
      { time: 138, text: "Quiero saber más de Ti" },
      { time: 145.5, text: "(Mi Dios)" },
      { time: 149, text: "Mi Dios, cuán buen alfarero (quebrántame, Señor)" },
      { time: 157, text: "Quebrántame, transfórmame" },
      { time: 165, text: "Moldéame a Tu imagen, Señor" },
      { time: 173, text: "(Quiero ser)" },
      { time: 176, text: "Quiero ser más como Tú" },
      { time: 182.5, text: "Ver la vida como Tú" },
      { time: 189, text: "Saturarme de Tu espíritu" },
      { time: 196.5, text: "Y reflejar al mundo Tu amor" },
      { time: 206, text: "Quiero ser más como Tú" },
      { time: 212.5, text: "Ver la vida como Tú" },
      { time: 219, text: "Saturarme de Tu espíritu" },
      { time: 226.5, text: "Y reflejar al mundo Tu amor" },
      { time: 233.5, text: "Y reflejar al mundo Tu amor (reflejar al mundo)" },
      { time: 237, text: "Y reflejar al mundo Tu amor" },
    ],
  },
];
