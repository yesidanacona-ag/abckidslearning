// ================================
// SERVICE WORKER
// PWA offline support & caching
// Performance Optimization - Fase 3
// ================================

const CACHE_VERSION = 'mm-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache strategies
const CACHE_FIRST = 'cache-first';
const NETWORK_FIRST = 'network-first';
const STALE_WHILE_REVALIDATE = 'stale-while-revalidate';

// Detect base URL for GitHub Pages
const BASE_URL = self.location.pathname.includes('/abckidslearning/') ? '/abckidslearning' : '';

// Static assets to cache immediately
const STATIC_ASSETS = [
    `${BASE_URL}/`,
    `${BASE_URL}/index.html`,
    `${BASE_URL}/styles.css`,
    `${BASE_URL}/app.js`,
    `${BASE_URL}/manifest.json`,

    // Core modules
    `${BASE_URL}/src/core/StorageManager.js`,
    `${BASE_URL}/src/core/EventBus.js`,
    `${BASE_URL}/src/core/GameStore.js`,

    // Services
    `${BASE_URL}/src/services/PlayerService.js`,
    `${BASE_URL}/src/services/QuestionService.js`,
    `${BASE_URL}/src/services/AdaptiveService.js`,
    `${BASE_URL}/src/services/AchievementService.js`,

    // Controllers
    `${BASE_URL}/src/controllers/GameController.js`,
    `${BASE_URL}/src/controllers/ScreenController.js`,
    `${BASE_URL}/src/controllers/ModeController.js`,

    // Bootstrap
    `${BASE_URL}/src/Bootstrap.js`,

    // Performance modules
    `${BASE_URL}/src/performance/ModuleLoader.js`,
    `${BASE_URL}/src/performance/PerformanceMonitor.js`,
    `${BASE_URL}/src/performance/ResourceHints.js`,
    `${BASE_URL}/src/performance/AssetOptimizer.js`,

    // Legacy systems
    '/mateo.js',
    '/sounds.js',
    '/mnemonicTricks.js',
    '/pauseMenu.js',
    '/coinSystem.js',
    '/feedbackSystem.js',

    // Critical images (add your actual paths)
    '/assets/characters/mateo-neutral.png'
];

// Routes and their strategies
const ROUTE_STRATEGIES = {
    '/assets/images/': IMAGE_CACHE,
    '/assets/backgrounds/': IMAGE_CACHE,
    '/assets/characters/': IMAGE_CACHE,
    '.js': STALE_WHILE_REVALIDATE,
    '.css': STALE_WHILE_REVALIDATE,
    '.html': NETWORK_FIRST
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches
                        if (cacheName.startsWith('mm-') && !cacheName.startsWith(CACHE_VERSION)) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests (different origin)
    if (!request.url.startsWith(self.location.origin)) return;

    // Determine strategy based on request URL
    const strategy = determineStrategy(request.url);

    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Determine caching strategy for a URL
 */
function determineStrategy(url) {
    // Check route-specific strategies
    for (const [pattern, cacheName] of Object.entries(ROUTE_STRATEGIES)) {
        if (url.includes(pattern)) {
            if (cacheName === IMAGE_CACHE) {
                return { type: CACHE_FIRST, cacheName: IMAGE_CACHE };
            }
            return { type: cacheName, cacheName: DYNAMIC_CACHE };
        }
    }

    // Default: network first for HTML, cache first for assets
    if (url.endsWith('.html') || url.endsWith('/')) {
        return { type: NETWORK_FIRST, cacheName: DYNAMIC_CACHE };
    }

    return { type: CACHE_FIRST, cacheName: STATIC_CACHE };
}

/**
 * Handle request with appropriate strategy
 */
async function handleRequest(request, strategy) {
    const { type, cacheName } = strategy;

    switch (type) {
        case CACHE_FIRST:
            return cacheFirst(request, cacheName);

        case NETWORK_FIRST:
            return networkFirst(request, cacheName);

        case STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request, cacheName);

        default:
            return fetch(request);
    }
}

/**
 * Cache First strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);

        // Return offline page if available
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
}

/**
 * Network First strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[SW] Network first failed, trying cache:', error);

        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }

        // Return offline page
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
}

/**
 * Stale While Revalidate strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Fetch in background to update cache
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    });

    // Return cached immediately if available
    return cached || fetchPromise;
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

/**
 * Sync event - background sync (for future use)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-player-data') {
        event.waitUntil(syncPlayerData());
    }
});

/**
 * Sync player data to server (placeholder)
 */
async function syncPlayerData() {
    // TODO: Implement when backend is available
    console.log('[SW] Syncing player data...');
}

console.log('[SW] Service worker script loaded');
