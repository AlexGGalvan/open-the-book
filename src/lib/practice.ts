export type PracticeLevel = 1 | 2 | 3 | 4;

export const practiceLevels: Array<{
  level: PracticeLevel;
  label: string;
  description: string;
}> = [
  { level: 1, label: "1", description: "Texto completo" },
  { level: 2, label: "2", description: "Oculta cerca del 25%" },
  { level: 3, label: "3", description: "Oculta cerca del 50%" },
  { level: 4, label: "4", description: "Muestra iniciales" },
];

const wordPattern = /\p{L}[\p{L}\p{M}'’]*/gu;

export function createPracticeText(text: string, level: PracticeLevel) {
  if (level === 1) {
    return text;
  }

  let wordIndex = -1;

  return text.replace(wordPattern, (word) => {
    wordIndex += 1;

    if (!shouldMask(wordIndex, level)) {
      return word;
    }

    return maskWord(word, level);
  });
}

function shouldMask(wordIndex: number, level: PracticeLevel) {
  if (level === 2) {
    return wordIndex % 4 === 1;
  }

  if (level === 3) {
    return wordIndex % 2 === 0;
  }

  return true;
}

function maskWord(word: string, level: PracticeLevel) {
  if (level === 4) {
    return `${word[0]}${"_".repeat(Math.min(Math.max(word.length - 1, 2), 10))}`;
  }

  return "_".repeat(Math.min(Math.max(word.length, 4), 10));
}
