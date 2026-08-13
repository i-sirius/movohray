const MOVOHRAY_REVISION = "0.6.1-20260813";
const MOVOHRAY_CACHE_NAME = "movohray-cache-v0.6.1-b20260813";
const MOVOHRAY_OFFLINE_DOCUMENT = `./index.html?rev=${MOVOHRAY_REVISION}`;
const MOVOHRAY_CRITICAL_ASSETS = [
  MOVOHRAY_OFFLINE_DOCUMENT,
  `./styles.css?rev=${MOVOHRAY_REVISION}`,
  `./app.js?rev=${MOVOHRAY_REVISION}`,
  `./wordguess.json?rev=${MOVOHRAY_REVISION}`,
  `./whoami.json?rev=${MOVOHRAY_REVISION}`,
  `./words.json?rev=${MOVOHRAY_REVISION}`,
  `./crocodile.json?rev=${MOVOHRAY_REVISION}`
];
const MOVOHRAY_OPTIONAL_ASSETS = [
  `./manifest.webmanifest?rev=${MOVOHRAY_REVISION}`,
  `./assets/game-icons/alias.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/game-icons/charades.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/game-icons/wordguess.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/game-icons/whoami.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/correct.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/skipped.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/wrong.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/turn-change.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/round-start.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/countdown.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/round-complete.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/reveal.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-win.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-loss.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-tie.ogg?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/medal.ogg?rev=${MOVOHRAY_REVISION}`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(MOVOHRAY_CACHE_NAME)
      .then((cache) => cache.addAll(MOVOHRAY_CRITICAL_ASSETS)
        .then(() => Promise.all(
          MOVOHRAY_OPTIONAL_ASSETS.map((assetUrl) => cache.add(assetUrl).catch((error) => {
            console.warn("Optional PWA asset was not cached", assetUrl, error);
          }))
        )))
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
    event.waitUntil(self.skipWaiting());
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
      fetchNoStore(request).catch(() => caches.match(MOVOHRAY_OFFLINE_DOCUMENT))
    );
    return;
  }

  // Only the current revision is written to the current runtime cache. An old
  // tab may still request its own revision while a new worker is activating.
  const shouldCacheResponse = requestUrl.searchParams.get("rev") === MOVOHRAY_REVISION;
  const responseAndCachePromise = caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return {
        response: cachedResponse,
        cacheWrite: Promise.resolve(),
      };
    }

    return fetch(request).then((response) => {
      let cacheWrite = Promise.resolve();

      if (shouldCacheResponse && response && response.ok) {
        const responseClone = response.clone();
        cacheWrite = caches.open(MOVOHRAY_CACHE_NAME)
          .then((cache) => cache.put(request, responseClone));
      }

      return {
        response,
        cacheWrite,
      };
    });
  });

  event.respondWith(
    responseAndCachePromise.then((result) => result.response)
  );

  event.waitUntil(
    responseAndCachePromise
      .then((result) => result.cacheWrite)
      .catch((error) => {
        console.warn("Runtime PWA cache write failed", error);
      })
  );
});
