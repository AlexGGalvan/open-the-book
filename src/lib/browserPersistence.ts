const APP_STORAGE_KEYS = [
  "daily-manna:memorized-verses",
  "open-the-book:preferences",
  "open-the-book:last-reading",
  "open-the-book:reflections",
  "open-the-book:saved-verses",
  "open-the-book:history",
  "open-the-book:memorize",
  "open-the-book:meeting-summaries",
] as const;

const APP_CACHE_MARKERS = ["daily-manna", "open-the-book"] as const;

function isAppCacheKey(key: string) {
  return APP_CACHE_MARKERS.some((marker) => key.includes(marker));
}

function clearAppLocalStorage() {
  try {
    APP_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Browsers can block storage access in private or hardened modes.
  }
}

async function clearAppCaches() {
  if (!("caches" in window)) {
    return;
  }

  try {
    const keys = await window.caches.keys();
    await Promise.all(keys.filter(isAppCacheKey).map((key) => window.caches.delete(key)));
  } catch {
    // Cache cleanup is best-effort; network loading still works without it.
  }
}

async function unregisterAppServiceWorkers() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => registration.scope.includes("/open-the-book/"))
        .map(async (registration) => {
          await registration.update().catch(() => undefined);
          await registration.unregister();
        }),
    );
  } catch {
    // Older mobile browsers may throw here; the cleanup service worker handles them.
  }
}

export async function clearAppBrowserPersistence() {
  if (typeof window === "undefined") {
    return;
  }

  clearAppLocalStorage();
  await clearAppCaches();
  await unregisterAppServiceWorkers();
}
