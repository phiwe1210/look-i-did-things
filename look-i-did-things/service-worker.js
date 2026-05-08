/* ================================================================
   Look, I Did Things — Service Worker
   ----------------------------------------------------------------
   What is a service worker?
     A small JavaScript file the browser keeps running in the
     background, separate from any page. It can intercept network
     requests, which lets us:
       - Cache the app on install, so it loads instantly next time.
       - Serve from cache when the user is offline.

   Update strategy:
     We bump CACHE_VERSION whenever we deploy new code. The new
     service worker installs side-by-side, then activates and
     deletes the old cache. Users get the new version on the
     next page reload.
   ================================================================ */

const CACHE_VERSION = "lidt-v2.0.0-dev.10";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ---------- INSTALL: pre-cache the app shell --------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate this new worker immediately, don't wait for old tabs to close.
  self.skipWaiting();
});

// ---------- ACTIVATE: clean up old caches -----------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  // Take control of any open pages immediately.
  self.clients.claim();
});

// ---------- FETCH: network-first for HTML, cache-first for assets ----
// Why two strategies?
//   - HTML must be fresh-ish so users see new releases.
//   - CSS/JS/images rarely change once cached, so cache-first is faster.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests; skip POST, etc.
  if (req.method !== "GET") return;

  // Skip cross-origin (e.g. Google Fonts) — let the browser handle them.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // For navigations / HTML: try the network first, fall back to cache.
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Stash a fresh copy in the cache for offline use.
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/index.html")))
    );
    return;
  }

  // For other same-origin assets: cache-first.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
