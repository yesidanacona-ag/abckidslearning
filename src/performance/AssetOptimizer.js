// ================================
// ASSET OPTIMIZER
// Image lazy loading, responsive images, WebP support
// Performance Optimization - Fase 2
// ================================

class AssetOptimizer {
    constructor() {
        this.lazyLoadObserver = null;
        this.config = {
            rootMargin: '50px', // Start loading 50px before viewport
            threshold: 0.01,
            enableWebP: true,
            enableResponsive: true
        };

        this.stats = {
            imagesLazyLoaded: 0,
            imagesPreloaded: 0,
            bytesLoaded: 0,
            webPUsed: 0
        };

        this.init();
    }

    /**
     * Initialize asset optimization
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup lazy loading and image optimization
     */
    setup() {
        this.initLazyLoading();
        this.detectWebPSupport();
        this.optimizeExistingImages();

        console.log('🖼️  Asset optimizer initialized');
    }

    /**
     * Initialize Intersection Observer for lazy loading
     */
    initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, loading all images immediately');
            this.loadAllImages();
            return;
        }

        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.lazyLoadObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });

        // Observe all images with data-src attribute
        this.observeLazyImages();
    }

    /**
     * Observe images for lazy loading
     */
    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        lazyImages.forEach(img => {
            this.lazyLoadObserver.observe(img);
        });

        console.log(`🔍 Observing ${lazyImages.length} lazy images`);
    }

    /**
     * Load a lazy image
     */
    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (srcset) {
            img.srcset = srcset;
        }

        if (src) {
            // Use WebP if supported
            if (this.webPSupported && this.config.enableWebP) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                // Try WebP first, fallback to original
                this.loadWithFallback(img, webpSrc, src);
            } else {
                img.src = src;
            }
        }

        // Add loaded class for CSS transitions
        img.addEventListener('load', () => {
            img.classList.add('loaded');
            this.stats.imagesLazyLoaded++;
        }, { once: true });

        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
    }

    /**
     * Load image with fallback
     */
    loadWithFallback(img, primarySrc, fallbackSrc) {
        const tempImg = new Image();

        tempImg.onload = () => {
            img.src = primarySrc;
            this.stats.webPUsed++;
        };

        tempImg.onerror = () => {
            img.src = fallbackSrc;
        };

        tempImg.src = primarySrc;
    }

    /**
     * Detect WebP support
     */
    detectWebPSupport() {
        const webpTestImage = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

        const img = new Image();
        img.onload = img.onerror = () => {
            this.webPSupported = img.width === 1;
            if (this.webPSupported) {
                console.log('✅ WebP support detected');
            }
        };
        img.src = webpTestImage;
    }

    /**
     * Load all images immediately (fallback)
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
        });
    }

    /**
     * Optimize existing images (add lazy loading)
     */
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src]):not([loading])');

        images.forEach(img => {
            // Add native lazy loading for modern browsers
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // Add decoding=async for better performance
            img.decoding = 'async';
        });
    }

    /**
     * Preload critical images (above the fold)
     */
    preloadCriticalImages(imageUrls) {
        imageUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);

            this.stats.imagesPreloaded++;
        });

        console.log(`⚡ Preloaded ${imageUrls.length} critical images`);
    }

    /**
     * Convert image to responsive srcset
     * Assumes you have multiple sizes available
     */
    createResponsiveSrcset(basePath, sizes = [320, 640, 1024, 1920]) {
        const ext = basePath.match(/\.[^.]+$/)[0];
        const basePathWithoutExt = basePath.replace(ext, '');

        const srcset = sizes.map(size => {
            return `${basePathWithoutExt}-${size}w${ext} ${size}w`;
        }).join(', ');

        return srcset;
    }

    /**
     * Apply responsive images to an img element
     */
    makeResponsive(img, basePath, sizes = [320, 640, 1024, 1920]) {
        if (!this.config.enableResponsive) return;

        img.srcset = this.createResponsiveSrcset(basePath, sizes);
        img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

        console.log(`📐 Made responsive: ${basePath}`);
    }

    /**
     * Compress image quality dynamically (for Canvas-rendered images)
     */
    compressCanvasImage(canvas, quality = 0.8, format = 'image/jpeg') {
        return canvas.toDataURL(format, quality);
    }

    /**
     * Get optimizer stats
     */
    getStats() {
        return {
            ...this.stats,
            webPSupported: this.webPSupported
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
    }
}

// Global instance
window.AssetOptimizer = AssetOptimizer;
