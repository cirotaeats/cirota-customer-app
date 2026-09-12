/**
 * Cirota Service Worker (§6 & §7.2)
 * App Shell offline caching + Web Push handler
 */

const CACHE_NAME = 'cirota-app-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest-admin.json',
  '/src/styles/tokens.css',
  '/src/styles/base.css',
  '/src/styles/components.css',
  '/src/styles/print.css',
  '/src/js/app.js',
  '/src/js/config.js',
  '/src/js/api.js',
  '/src/js/auth.js',
  '/src/js/push.js',
  '/src/js/router.js',
  '/src/js/customer/dashboard.js',
  '/src/js/customer/meal-carousel.js',
  '/src/js/customer/validity-ring.js',
  '/src/js/customer/pause.js',
  '/src/js/customer/modify-order.js',
  '/src/js/customer/plan.js',
  '/src/js/customer/payment.js',
  '/src/js/customer/subscribe.js',
  '/src/js/customer/tracking.js',
  '/src/js/mocks/mock-data.js',
  '/src/js/mocks/mock-delay.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Event: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching App Shell assets');
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('Some assets could not be pre-cached:', err));
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First for static assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for API requests
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-first for static shell assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      if (event.request.headers.get('accept')?.includes('text/html')) {
        return caches.match('/index.html');
      }
    })
  );
});

// Web Push Event Handler (§7.2)
self.addEventListener('push', (event) => {
  let data = { title: 'Cirota Tiffin Update', body: 'Your fresh meal is getting prepared!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler (§7.2)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
