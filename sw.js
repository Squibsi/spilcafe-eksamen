// Service worker - caches everything (precache + runtime cache)

const CACHE_VERSION = 'v1';
const CACHE_NAME = `spilcafe-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
    '/', '/index.html',
    '/css/style.css', '/css/maps.css',
    '/js/app.js', '/js/maps.js',
    '/manifest.json',
    '/assets/img/logo.webp', '/assets/img/favicon.ico'
    // tilføj flere kendte assets her hvis ønsket
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // præcache kendte filer
        try { await cache.addAll(PRECACHE_URLS); } catch(e){ /* ignore individual failures */ }

        // prøv at hente index.html og auto-opdage src/href/url(...) for yderligere præcache
        try {
            const res = await fetch('/index.html', { cache: 'no-store' });
            if (res && res.ok) {
                const text = await res.text();
                const urls = extractUrlsFromHtml(text);
                await Promise.all(urls.map(u => {
                    // ignore failures per resource
                    return cache.add(u).catch(() => {});
                }));
            }
        } catch (e) {
            // ignored
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        // slet gamle caches
        const keys = await caches.keys();
        await Promise.all(keys.map(k => {
            if (k !== CACHE_NAME) return caches.delete(k);
            return Promise.resolve();
        }));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const req = event.request;

    // Don't try to handle chrome-extension, data:, about: osv.
    if (!req.url.startsWith('http')) return;

    // Navigation requests -> network-first (so SPA opdateres), fallback to cached index.html
    if (req.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(req);
                const cache = await caches.open(CACHE_NAME);
                cache.put(req, networkResponse.clone()).catch(()=>{});
                return networkResponse;
            } catch (err) {
                const cached = await caches.match('/index.html');
                if (cached) return cached;
                return new Response('Offline', { status: 503, statusText: 'Offline' });
            }
        })());
        return;
    }

    // For other resources: cache-first, fall back to network and cache result.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
            const response = await fetch(req);
            // Only cache successful responses or opaque ones
            if (response && (response.ok || response.type === 'opaque')) {
                // put in cache but ignore errors (some responses cannot be cached)
                cache.put(req, response.clone()).catch(()=>{});
            }
            return response;
        } catch (err) {
            // Last resort: return cached fallback for images / fonts etc. if exists
            const fallback = await cache.match(req);
            if (fallback) return fallback;
            return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
    })());
});

// Hjælpefunktion: ekstrakt URL'er fra HTML-tekst (enkelt regex, ikke 100% men brugbar)
function extractUrlsFromHtml(htmlText) {
    const urls = new Set();
    const attrRegex = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
    const cssUrlRegex = /url\(\s*['"]?([^'"\)]+)['"]?\s*\)/gi;
    let m;
    while ((m = attrRegex.exec(htmlText)) !== null) {
        let u = m[1].trim();
        if (!u) continue;
        try { u = new URL(u, self.location.origin).href; } catch(e){ continue; }
        urls.add(u);
    }
    while ((m = cssUrlRegex.exec(htmlText)) !== null) {
        let u = m[1].trim();
        if (!u) continue;
        try { u = new URL(u, self.location.origin).href; } catch(e){ continue; }
        urls.add(u);
    }
    // også prøv at fange <link rel="manifest"> etc.
    return Array.from(urls);
}

// Support til manuel opgradering via postMessage
self.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});