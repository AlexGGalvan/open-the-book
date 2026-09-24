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
      { time: 46, text: "Moldéame a Tu imagen, Señor" },
      { time: 54.5, text: "Quiero ser más como Tú, Señor" },
      { time: 66, text: "Quiero ser más como Tú" },
      { time: 72.5, text: "Ver la vida como Tú" },
      { time: 79, text: "Saturarme de Tu espíritu" },
      { time: 86.5, text: "Y reflejar al mundo Tu amor" },
      { time: 96, text: "Quiero ser más como Tú" },
      { time: 102.5, text: "Ver la vida como Tú" },
      { time: 109, text: "Saturarme de Tu espíritu" },
      { time: 116.5, text: "Y reflejar al mundo Tu amor" },
      { time: 130, text: "De gloria en gloria, Te veo (cuanto más Te conozco, Señor)" },
      { time: 136.5, text: "Cuanto más Te conozco" },
      { time: 143, text: "Quiero saber más de Ti" },
      { time: 150.5, text: "(Mi Dios)" },
      { time: 154, text: "Mi Dios, cuán buen alfarero (quebrántame, Señor)" },
      { time: 162, text: "Quebrántame, transfórmame" },
      { time: 170, text: "Moldéame a Tu imagen, Señor" },
      { time: 178, text: "(Quiero ser)" },
      { time: 181, text: "Quiero ser más como Tú" },
      { time: 187.5, text: "Ver la vida como Tú" },
      { time: 194, text: "Saturarme de Tu espíritu" },
      { time: 201.5, text: "Y reflejar al mundo Tu amor" },
      { time: 211, text: "Quiero ser más como Tú" },
      { time: 217.5, text: "Ver la vida como Tú" },
      { time: 224, text: "Saturarme de Tu espíritu" },
      { time: 231.5, text: "Y reflejar al mundo Tu amor" },
      { time: 238.5, text: "Y reflejar al mundo Tu amor (reflejar al mundo)" },
      { time: 242, text: "Y reflejar al mundo Tu amor" },
    ],
  },
];
