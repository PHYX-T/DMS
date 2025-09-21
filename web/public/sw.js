const CACHE = 'app-shell-v1'
const ASSETS = [
  '/',
  '/index.html',
]
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone()
      caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{})
      return res
    }).catch(() => caches.match(req))
  )
})

