const APP_CACHE_MARKERS = ["daily-manna", "open-the-book"];

function shouldDeleteCache(key) {
  return APP_CACHE_MARKERS.some((marker) => key.includes(marker));
}

async function clearAppCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter(shouldDeleteCache).map((key) => caches.delete(key)));
}

async function reloadWindowClients() {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  await Promise.all(
    clients.map((client) => {
      if ("navigate" in client) {
        return client.navigate(client.url);
      }

      return undefined;
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(clearAppCaches().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clearAppCaches()
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
      .then(() => reloadWindowClients()),
  );
});
