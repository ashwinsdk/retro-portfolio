/**
 * ASHWIN SDK — Service Worker
 * Cache-first for static assets, network-first for API.
 * Provides offline fallback for key pages.
 */

const CACHE_NAME = 'ashwinsdk-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/tokens.css',
    '/src/css/main.css',
    '/src/js/motion.js',
    '/src/js/app.js',
    '/src/js/carousel.js',
    '/manifest.json',
];

// Assets loaded lazily (not cached on install)
const LAZY_ASSETS = [
    '/src/js/game.js',
];

// ── Install: pre-cache static shell ─────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ── Fetch: cache-first for static, network-first for dynamic
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // For navigation requests, serve index.html (SPA fallback)
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then((cached) => {
                return cached || fetch(request);
            })
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Cache successful responses for future use
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clone);
                    });
                }
                return response;
            }).catch(() => {
                // Offline fallback for HTML pages
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
