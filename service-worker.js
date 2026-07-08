const MOVOHRAY_CACHE_NAME = "movohray-cache-v0.4.26";
const MOVOHRAY_CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=0.4.26",
  "./app.js?v=0.4.26",
  "./wordguess.json?v=0.4.26",
  "./words.json?v=0.4.26",
  "./crocodile.json?v=0.4.26",
  "./manifest.webmanifest?v=0.4.26",
  "./version.json?v=0.4.26"
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
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const responseClone = response.clone();
          caches.open(MOVOHRAY_CACHE_NAME).then((cache) => cache.put("./version.json", responseClone));
          return response;
        })
        .catch(() => caches.match("./version.json"))
    );
    return;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(MOVOHRAY_CACHE_NAME).then((cache) => cache.put("./index.html", responseClone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(MOVOHRAY_CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
