/* Mesa Dos — offline support. No build step, no versions to bump.

   Network first: every request goes to the server (revalidated, so an edit on disk is
   live on the next request) and the answer is copied into the cache. The cache is only
   served when the network fails or takes longer than WAIT ms — a supermarket basement.
   Once one request has timed out, the rest of that page load is answered from the cache
   straight away (still refreshed in the background) instead of each waiting in turn.

   CORE is what gets stored on the first visit. Add new asset files here;
   test/offline.test.js fails if index.html references something that is missing. */
var CACHE = "mesa2-offline";
var WAIT = 3000;
var SLOW_FOR = 10000;
var slowUntil = 0;
var CORE = [
  "./",
  "index.html",
  "manifest.json",
  "assets/styles.css?v=2",
  "assets/i18n.js?v=2",
  "assets/recipes.js?v=2",
  "assets/plan.js?v=2",
  "assets/household.js?v=2",
  "assets/shopping.js?v=2",
  "assets/core.js?v=2",
  "assets/app.js?v=2",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(networkFirst(req, e));
});

function networkFirst(req, e) {
  return caches.open(CACHE).then(function (cache) {
    /* ignoreSearch: a link shared with ?query still opens offline */
    var cached = cache.match(req, { ignoreSearch: true });

    var fresh = fetch(req, { cache: "no-cache" }).then(function (res) {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });

    /* let a slow answer finish and reach the cache even after a cached copy was served */
    e.waitUntil(fresh.then(function () {}, function () {}));

    var alreadySlow = Date.now() < slowUntil;
    var slow = new Promise(function (resolve) {
      setTimeout(function () {
        cached.then(function (hit) {
          /* only a real timeout starts the window, so it ends SLOW_FOR ms later and the
             next request tries the server properly again */
          if (hit && !alreadySlow) slowUntil = Date.now() + SLOW_FOR;
          resolve(hit);
        });
      }, alreadySlow ? 0 : WAIT);
    });

    /* whichever comes first: the server, or (after WAIT) a cached copy if there is one */
    return Promise.race([
      fresh.catch(function () { return cached; }),
      slow.then(function (hit) { return hit || fresh; })
    ]).then(function (res) {
      return res || fresh;
    });
  });
}
