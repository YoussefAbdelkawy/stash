// Keeps the app's own files on the phone so Stash opens offline. Your items are already offline in IndexedDB.
const CACHE = 'stash-shell'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return // YouTube and fonts go straight to the network
  if (request.mode === 'navigate') {
    // Pages (including a share, which arrives as ./?text=…): try the network for the newest version, else the saved copy.
    event.respondWith(fetch(request).then((reply) => keep('./', reply)).catch(() => caches.match('./')))
    return
  }
  // Built files have unique names, so a saved copy never goes stale.
  event.respondWith(caches.match(request).then((saved) => saved || fetch(request).then((reply) => keep(request, reply))))
})

async function keep(key, reply) {
  if (reply.ok) (await caches.open(CACHE)).put(key, reply.clone())
  return reply
}
