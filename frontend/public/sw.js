const CACHE_NAME = 'studyquest-cache-v2';

// Install Event (Immediate Activation)
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate Event (Clear old caches instantly)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network First, Cache Fallback)
self.addEventListener('fetch', (e) => {
  // Only intercept HTTP/HTTPS GET requests (prevent file:// errors in Electron)
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache successful responses dynamically
        if (response && response.status === 200 && response.type === 'basic') {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline) -> Look in cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached index.html for navigation when offline
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
