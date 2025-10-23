// Versionierter Cache-Name – bei Änderungen erhöhen, damit alte Assets invalidiert werden.
const CACHE_NAME = "logorama-cache-v1";
const scopeUrl =
  self.registration && self.registration.scope ? new URL(self.registration.scope) : new URL(self.location.href);
const BASE_PATH = scopeUrl.pathname.replace(/\/$/, "");
const withBase = (path) => `${BASE_PATH}${path}`;
// Fallback-Dokument für Offline-Anfragen (Client-Shell).
const OFFLINE_FALLBACK = withBase("/index.html");
// Liste von Assets, die bereits während der Installation offline verfügbar sein sollen.
const PRECACHE_URLS = [
  withBase("/"),
  OFFLINE_FALLBACK,
  withBase("/manifest.webmanifest"),
  withBase("/icons/icon-192.png"),
  withBase("/icons/icon-512.png"),
  withBase("/icons/icon-maskable-512.png")
];

self.addEventListener("install", (event) => {
  // Blockiert die Installation, bis alle kritischen Assets gecached wurden.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Neue Worker-Instanz übernimmt sofort, ohne auf alte Tabs zu warten.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Löscht veraltete Cache-Versionen, um Speicher freizugeben.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  // Aktiviert den Worker sofort für alle offenen Clients.
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    // Nicht-GET-Requests (z. B. POST) werden ungefiltert an das Netzwerk durchgereicht.
    return;
  }

  const isSameOrigin = new URL(request.url).origin === self.location.origin;

  if (isSameOrigin) {
    // Für eigene Ressourcen: versuche zuerst das Netzwerk, falle bei Fehlern auf Cache zurück.
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Erfolgreiche Antworten werden im Hintergrund aktualisiert (stale-while-revalidate).
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return caches.match(OFFLINE_FALLBACK);
        })
    );
    return;
  }

  event.respondWith(
    // Für fremde Domains: Cache-first, Netzwerk nur zur Auffüllung.
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).catch(() => {
          // Bei Bildfehlern ein Icon anzeigen, sonst auf Shell verweisen.
          if (request.destination === "image") {
            return caches.match(withBase("/icons/icon-192.png"));
          }
          return caches.match(OFFLINE_FALLBACK);
        })
    )
  );
});
