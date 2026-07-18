const MOVOHRAY_CACHE_NAME = "movohray-cache-v0.5.4";
const MOVOHRAY_CORE_ASSETS = [
  "./styles.css?v=0.5.4",
  "./app.js?v=0.5.4",
  "./wordguess.json?v=0.5.4",
  "./whoami.json?v=0.5.4",
  "./words.json?v=0.5.4",
  "./crocodile.json?v=0.5.4",
  "./manifest.webmanifest?v=0.5.4",
  "./assets/game-icons/alias.png?v=0.5.4",
  "./assets/game-icons/charades.png?v=0.5.4",
  "./assets/game-icons/wordguess.png?v=0.5.4",
  "./assets/game-icons/whoami.png?v=0.5.4"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(MOVOHRAY_CACHE_NAME)
      .then((cache) => cache.addAll(MOVOHRAY_CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("movohray-cache-") && cacheName !== MOVOHRAY_CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function fetchNoStore(request) {
  return fetch(request, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.endsWith("/version.json")) {
    event.respondWith(fetchNoStore(request));
    return;
  }

  // HTML must stay network-first. If we cache the document, iOS PWA may reopen
  // an old app shell and show the update screen again after every restart.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetchNoStore(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Versioned static assets can stay cache-first, because their URLs include ?v=...
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(MOVOHRAY_CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
