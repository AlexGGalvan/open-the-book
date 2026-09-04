const MEMORIZED_VERSES_KEY = "daily-manna:memorized-verses";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function getMemorizedVerses() {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const value = window.localStorage.getItem(MEMORIZED_VERSES_KEY);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

export function isVerseMemorized(id: string) {
  return getMemorizedVerses().includes(id);
}

export function setVerseMemorized(id: string, memorized: boolean) {
  const current = new Set(getMemorizedVerses());

  if (memorized) {
    current.add(id);
  } else {
    current.delete(id);
  }

  const next = Array.from(current);

  if (canUseLocalStorage()) {
    window.localStorage.setItem(MEMORIZED_VERSES_KEY, JSON.stringify(next));
  }

  return next;
}
