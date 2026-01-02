const CACHE_NAME = 'momentum-tracker-v1';
const urlsToCache = [
  '/vigilant-palm-tree/',
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
  // Skip caching for RSC files and API routes
  const url = new URL(event.request.url);
  const isRscRequest = url.searchParams.has('_rsc') || url.pathname.includes('_next/static/chunks');
  const isApiRoute = url.pathname.startsWith('/api/') || url.pathname.includes('_next/static/chunks');
  
  if (isRscRequest || isApiRoute) {
    // For RSC files and API routes, always fetch from network
    event.respondWith(fetch(event.request));
    return;
  }

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
              // Only cache static assets that start with our app's path
              // Skip caching RSC files and other dynamic content
              const isStaticAsset = event.request.url.includes('/vigilant-palm-tree/') &&
                  !event.request.url.includes('_rsc') &&
                  (event.request.url.includes('/_next/static/') ||
                   event.request.url.includes('/assets/') ||
                   event.request.url.includes('/manifest.json'));
              
              if (isStaticAsset) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch((error) => {
          // If fetch fails, try to return cached response
          if (response) {
            return response;
          }
          // Otherwise return an error response
          console.error('Fetch failed:', error);
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
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