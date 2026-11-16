/* JDD Fitness — minimal service worker (offline cache, network-first). */
const CACHE = "jdd-fit-v1";
const ASSETS = [
  "./", "./index.html",
  "./css/styles.css",
  "./js/foods.js", "./js/exercises.js", "./js/store.js",
  "./js/calories.js", "./js/app.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png", "./assets/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;
  // Network-first for HTML/JS/CSS; cache fallback.
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
