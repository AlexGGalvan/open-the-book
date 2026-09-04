const APP_CACHE_MARKERS = ["daily-manna", "open-the-book"];

function shouldDeleteCache(key) {
  return APP_CACHE_MARKERS.some((marker) => key.includes(marker));
}

async function clearAppCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter(shouldDeleteCache).map((key) => caches.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(clearAppCaches().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clearAppCaches()
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister()),
  );
});
