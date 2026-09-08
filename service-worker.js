const MOVOHRAY_REVISION = "0.6.7-20260908-c4";
const MOVOHRAY_CACHE_NAME = "movohray-cache-v0.6.7-b20260908-c4";
const MOVOHRAY_OFFLINE_DOCUMENT = `./index.html?rev=${MOVOHRAY_REVISION}`;
const MOVOHRAY_CRITICAL_ASSETS = [
  MOVOHRAY_OFFLINE_DOCUMENT,
  `./svitlohray-engine.js?rev=${MOVOHRAY_REVISION}`,
  `./svitlohray.js?rev=${MOVOHRAY_REVISION}`,
  `./svitlohray.css?rev=${MOVOHRAY_REVISION}`,
  `./slovesnyi-engine.js?rev=${MOVOHRAY_REVISION}`,
  `./slovesnyi.js?rev=${MOVOHRAY_REVISION}`,
  `./slovesnyi.css?rev=${MOVOHRAY_REVISION}`,
  `./debates.json?rev=${MOVOHRAY_REVISION}`,
  `./assets/game-icons/slovesnyi.svg?rev=${MOVOHRAY_REVISION}`,
  `./styles.css?rev=${MOVOHRAY_REVISION}`,
  `./wordguess-session.js?rev=${MOVOHRAY_REVISION}`,
  `./app.js?rev=${MOVOHRAY_REVISION}`,
  `./wordguess.json?rev=${MOVOHRAY_REVISION}`,
  `./wordguess-ru.json?rev=${MOVOHRAY_REVISION}`,
  `./wordguess-en.json?rev=${MOVOHRAY_REVISION}`,
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
  `./assets/easter-eggs/nixa-1.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/nixa-2.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/nixa-3.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/nixa-4.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/sherik-1.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/sherik-2.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/sherik-3.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/sherik-4.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/easter-eggs/capybara.png?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/ui-click.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/ui-open.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/ui-close.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/positive-tick.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/correct.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/skipped.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/wrong.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/turn-change.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/round-start.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/countdown.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/round-complete.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/reveal.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-win.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-loss.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/game-tie.mp3?rev=${MOVOHRAY_REVISION}`,
  `./assets/sounds/medal.mp3?rev=${MOVOHRAY_REVISION}`
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
