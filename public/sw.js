const CACHE_NAME = "fieldnex-v1";

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/jobs",
  "/inventory",
  "/profile",
];

// ── Install: precache shell ───────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for assets ─────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always bypass cache for API calls
  if (url.port === "3000" || url.pathname.startsWith("/auth")) {
    return;
  }

  // Network-first for navigation requests (HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((cached) => cached ?? Response.error())
      )
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Only cache successful same-origin or CDN responses
        if (
          response.ok &&
          (url.origin === self.location.origin ||
            url.hostname === "fonts.googleapis.com" ||
            url.hostname === "fonts.gstatic.com")
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
