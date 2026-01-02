const CACHE_NAME = 'momentum-tracker-v1';
const urlsToCache = [
  '/vigilant-palm-tree/_next/static/css/',
  '/vigilant-palm-tree/_next/static/js/',
  '/vigilant-palm-tree/assets/',
  '/vigilant-palm-tree/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Check if this is an HTML request (text/html)
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          // For HTML requests, always fetch from network to get the latest version
          return fetch(event.request);
        }
        
        // Return cached version if available for non-HTML requests, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache non-HTML requests that start with our app's path
              if (event.request.url.includes('/vigilant-palm-tree/') && 
                  !event.request.url.includes('.html') &&
                  !event.request.headers.get('accept')?.includes('text/html')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});