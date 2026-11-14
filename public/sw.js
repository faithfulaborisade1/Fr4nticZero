// Decision Window service worker: makes the app load and run with the network off.
// On install it reads the built index.html and caches every file the page uses.
// There are no runtime network calls in the app itself, so the cache is all it needs.
const CACHE = "decision-window-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch("./", { cache: "reload" });
      const html = await res.clone().text();
      await cache.put("./", res);
      const urls = new Set(["./manifest.webmanifest", "./icon.svg"]);
      for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        const u = m[1];
        if (u.startsWith("/") || u.startsWith("./")) urls.add(u);
      }
      await Promise.all(
        [...urls].map((u) => cache.add(u).catch(() => undefined)),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: try the network for fresh code, fall back to the cached copy.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./", copy));
          return res;
        })
        .catch(() => caches.match("./", { ignoreVary: true }).then((r) => r || Response.error())),
    );
    return;
  }

  // Everything else: cached copy first, then the network (and remember it).
  // ignoreVary: module scripts send an Origin header the cached copy was stored without.
  event.respondWith(
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
