// ================================
// RESOURCE HINTS
// Preload, Prefetch, Preconnect optimization
// Performance Optimization - Fase 5
// ================================

class ResourceHints {
    constructor() {
        this.hints = {
            preload: [],
            prefetch: [],
            preconnect: [],
            dnsPrefetch: []
        };

        this.applied = new Set();
    }

    /**
     * Preload a critical resource (highest priority)
     * Use for resources needed for initial render
     *
     * @param {string} href - Resource URL
     * @param {string} as - Resource type: 'script', 'style', 'image', 'font', etc.
     * @param {Object} options - Additional options (crossorigin, type, etc.)
     */
    preload(href, as, options = {}) {
        const key = `preload:${href}`;
        if (this.applied.has(key)) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;

        // Optional attributes
        if (options.crossorigin) link.crossOrigin = options.crossorigin;
        if (options.type) link.type = options.type;
        if (options.media) link.media = options.media;

        document.head.appendChild(link);
        this.hints.preload.push({ href, as, options });
        this.applied.add(key);

        console.log(`🔗 Preload: ${href} (as ${as})`);
    }

    /**
     * Prefetch a resource for next navigation
     * Use for resources likely needed soon (lower priority)
     *
     * @param {string} href - Resource URL
     */
    prefetch(href) {
        const key = `prefetch:${href}`;
        if (this.applied.has(key)) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;

        document.head.appendChild(link);
        this.hints.prefetch.push(href);
        this.applied.add(key);

        console.log(`🔮 Prefetch: ${href}`);
    }

    /**
     * Preconnect to an origin (DNS + TCP + TLS)
     * Use for third-party origins you'll connect to
     *
     * @param {string} href - Origin URL (e.g., 'https://fonts.googleapis.com')
     * @param {boolean} crossorigin - Whether connection is CORS
     */
    preconnect(href, crossorigin = false) {
        const key = `preconnect:${href}`;
        if (this.applied.has(key)) return;

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        if (crossorigin) link.crossOrigin = 'anonymous';

        document.head.appendChild(link);
        this.hints.preconnect.push(href);
        this.applied.add(key);

        console.log(`🔌 Preconnect: ${href}`);
    }

    /**
     * DNS prefetch for an origin (DNS resolution only)
     * Lighter than preconnect, use when you may connect later
     *
     * @param {string} href - Origin URL
     */
    dnsPrefetch(href) {
        const key = `dns-prefetch:${href}`;
        if (this.applied.has(key)) return;

        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = href;

        document.head.appendChild(link);
        this.hints.dnsPrefetch.push(href);
        this.applied.add(key);

        console.log(`🌐 DNS Prefetch: ${href}`);
    }

    /**
     * Preload critical fonts
     */
    preloadFonts(fonts) {
        fonts.forEach(font => {
            this.preload(font.href, 'font', {
                type: font.type || 'font/woff2',
                crossorigin: 'anonymous'
            });
        });
    }

    /**
     * Preload critical images
     */
    preloadImages(images) {
        images.forEach(img => {
            this.preload(img.href, 'image', {
                type: img.type
            });
        });
    }

    /**
     * Preload critical CSS
     */
    preloadStyles(styles) {
        styles.forEach(style => {
            this.preload(style, 'style');
        });
    }

    /**
     * Apply resource hints for the app
     * Call this early in app initialization
     */
    applyAppHints() {
        // Preload critical CSS
        this.preload('styles.css', 'style');

        // Preload critical scripts (if not already loaded via script tags)
        // These are loaded via ModuleLoader, so we just prefetch for next visit
        this.prefetch('src/core/StorageManager.js');
        this.prefetch('src/core/EventBus.js');
        this.prefetch('src/core/GameStore.js');

        // Preload critical images (mascot, backgrounds)
        this.preloadImages([
            { href: 'assets/characters/mateo-neutral.png', type: 'image/png' },
            { href: 'assets/backgrounds/main-bg.jpg', type: 'image/jpeg' }
        ]);

        // If using CDN for libraries
        // this.preconnect('https://cdn.example.com', true);
        // this.dnsPrefetch('https://fonts.googleapis.com');

        console.log('✅ Resource hints applied');
    }

    /**
     * Prefetch game mode assets on-demand
     */
    prefetchGameMode(mode) {
        const modePrefetchMap = {
            'practice': [
                'practiceSystemEngine.js'
            ],
            'space': [
                'spaceGameEngine.js',
                'assets/backgrounds/space-bg.jpg'
            ],
            'boss': [
                'bossGameEngine.js',
                'assets/backgrounds/boss-bg.jpg'
            ],
            'galaxy': [
                'galaxySystemEngine.js'
            ],
            'fire': [
                'fireModeSystem.js'
            ],
            'shop': [
                'shopSystem.js'
            ],
            'missions': [
                'dailyMissionsSystem.js'
            ]
        };

        const resources = modePrefetchMap[mode] || [];
        resources.forEach(resource => {
            this.prefetch(resource);
        });

        console.log(`🔮 Prefetched assets for ${mode} mode`);
    }

    /**
     * Get all applied hints
     */
    getHints() {
        return this.hints;
    }

    /**
     * Clear all hints (for testing)
     */
    clear() {
        this.hints = {
            preload: [],
            prefetch: [],
            preconnect: [],
            dnsPrefetch: []
        };
        this.applied.clear();
    }
}

// Global instance
window.ResourceHints = ResourceHints;
