// Network-first: हमेशा नया index.html लाओ, इंटरनेट न हो तभी पुराना (cache वाला) दिखाओ।
// कुछ भी बदलो तो नीचे वाला नंबर बढ़ा दो (v2 → v3) ताकि फ़ोन पुराना cache हटा दे।
const CACHE = "crave-kitchen-v2";

self.addEventListener("install", () => { self.skipWaiting(); });

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Apps Script (दूसरी साइट) की कॉल को कभी मत छुओ
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
