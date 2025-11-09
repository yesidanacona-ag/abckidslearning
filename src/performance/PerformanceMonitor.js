// ================================
// PERFORMANCE MONITOR
// Real-time performance tracking
// Performance Optimization - Fase 4
// ================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigation: {},
            paint: {},
            resources: [],
            memory: {},
            fps: [],
            customMarks: new Map()
        };

        this.observers = {
            paint: null,
            navigation: null,
            resource: null
        };

        this.config = {
            enableFPSMonitoring: true,
            enableMemoryMonitoring: true,
            enableResourceTiming: true,
            sampleInterval: 1000, // 1 second
            fpsSampleSize: 60
        };

        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        // Wait for page load
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => this.startMonitoring());
        } else {
            this.startMonitoring();
        }
    }

    /**
     * Start all monitoring
     */
    startMonitoring() {
        this.captureNavigationTiming();
        this.capturePaintTiming();
        this.observePerformanceEntries();

        if (this.config.enableFPSMonitoring) {
            this.startFPSMonitoring();
        }

        if (this.config.enableMemoryMonitoring) {
            this.startMemoryMonitoring();
        }

        console.log('📊 Performance monitoring started');
    }

    /**
     * Capture navigation timing (page load metrics)
     */
    captureNavigationTiming() {
        if (!performance.timing) return;

        const timing = performance.timing;
        const navigation = performance.navigation;

        this.metrics.navigation = {
            // Page load times
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,

            // Network times
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,

            // Navigation type
            type: navigation.type === 0 ? 'navigate' : navigation.type === 1 ? 'reload' : 'back_forward',
            redirectCount: navigation.redirectCount
        };
    }

    /**
     * Capture paint timing (FCP, LCP)
     */
    capturePaintTiming() {
        if (!performance.getEntriesByType) return;

        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            this.metrics.paint[entry.name] = entry.startTime;
        });

        // Observe LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.paint['largest-contentful-paint'] = lastEntry.renderTime || lastEntry.loadTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.paint = lcpObserver;
            } catch (e) {
                // LCP not supported in this browser
            }
        }
    }

    /**
     * Observe performance entries (resources, marks, measures)
     */
    observePerformanceEntries() {
        if (!('PerformanceObserver' in window)) return;

        // Resource timing
        if (this.config.enableResourceTiming) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'resource') {
                            this.metrics.resources.push({
                                name: entry.name,
                                type: entry.initiatorType,
                                duration: entry.duration,
                                size: entry.transferSize || 0,
                                cached: entry.transferSize === 0
                            });
                        }
                    });
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.resource = resourceObserver;
            } catch (e) {
                // Resource timing not supported
            }
        }
    }

    /**
     * Start FPS (Frames Per Second) monitoring
     */
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + this.config.sampleInterval) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));

                this.metrics.fps.push({
                    timestamp: currentTime,
                    fps: fps
                });

                // Keep only recent samples
                if (this.metrics.fps.length > this.config.fpsSampleSize) {
                    this.metrics.fps.shift();
                }

                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        if (!performance.memory) {
            console.warn('Memory API not available');
            return;
        }

        const sampleMemory = () => {
            this.metrics.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        };

        // Sample every 5 seconds
        sampleMemory();
        setInterval(sampleMemory, 5000);
    }

    /**
     * Create custom performance mark
     */
    mark(name) {
        if (!performance.mark) return;

        performance.mark(name);
        this.metrics.customMarks.set(name, performance.now());

        console.log(`⏱️  Mark: ${name}`);
    }

    /**
     * Measure time between two marks
     */
    measure(name, startMark, endMark) {
        if (!performance.measure) return;

        try {
            performance.measure(name, startMark, endMark);

            const measure = performance.getEntriesByName(name, 'measure')[0];
            if (measure) {
                console.log(`⏱️  Measure: ${name} = ${measure.duration.toFixed(2)}ms`);
                return measure.duration;
            }
        } catch (e) {
            console.error(`Failed to measure ${name}:`, e);
        }
    }

    /**
     * Get current FPS average
     */
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;

        const sum = this.metrics.fps.reduce((acc, sample) => acc + sample.fps, 0);
        return Math.round(sum / this.metrics.fps.length);
    }

    /**
     * Get performance score (0-100)
     * Based on Web Vitals thresholds
     */
    getPerformanceScore() {
        const scores = [];

        // LCP score (< 2.5s = good, < 4s = needs improvement, >= 4s = poor)
        const lcp = this.metrics.paint['largest-contentful-paint'] || 0;
        if (lcp > 0) {
            const lcpScore = lcp < 2500 ? 100 : lcp < 4000 ? 50 : 0;
            scores.push(lcpScore);
        }

        // FCP score (< 1.8s = good, < 3s = needs improvement, >= 3s = poor)
        const fcp = this.metrics.paint['first-contentful-paint'] || 0;
        if (fcp > 0) {
            const fcpScore = fcp < 1800 ? 100 : fcp < 3000 ? 50 : 0;
            scores.push(fcpScore);
        }

        // FPS score (>= 55 = good, >= 30 = ok, < 30 = poor)
        const avgFPS = this.getAverageFPS();
        if (avgFPS > 0) {
            const fpsScore = avgFPS >= 55 ? 100 : avgFPS >= 30 ? 60 : 20;
            scores.push(fpsScore);
        }

        // Memory score (< 50% = good, < 75% = ok, >= 75% = poor)
        if (this.metrics.memory.usagePercentage) {
            const memScore = this.metrics.memory.usagePercentage < 50 ? 100
                : this.metrics.memory.usagePercentage < 75 ? 60 : 20;
            scores.push(memScore);
        }

        // Overall score (average)
        return scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
    }

    /**
     * Get comprehensive performance report
     */
    getReport() {
        return {
            score: this.getPerformanceScore(),
            navigation: this.metrics.navigation,
            paint: {
                fcp: this.metrics.paint['first-contentful-paint'],
                lcp: this.metrics.paint['largest-contentful-paint']
            },
            fps: {
                current: this.metrics.fps.length > 0 ? this.metrics.fps[this.metrics.fps.length - 1].fps : 0,
                average: this.getAverageFPS(),
                samples: this.metrics.fps.length
            },
            memory: this.metrics.memory,
            resources: {
                total: this.metrics.resources.length,
                totalSize: this.metrics.resources.reduce((sum, r) => sum + r.size, 0),
                cached: this.metrics.resources.filter(r => r.cached).length,
                byType: this._groupResourcesByType()
            }
        };
    }

    /**
     * Log performance report to console
     */
    logReport() {
        const report = this.getReport();

        console.group('📊 Performance Report');
        console.log(`Overall Score: ${report.score}/100`);

        if (report.paint.fcp) {
            console.log(`First Contentful Paint: ${report.paint.fcp.toFixed(2)}ms`);
        }
        if (report.paint.lcp) {
            console.log(`Largest Contentful Paint: ${report.paint.lcp.toFixed(2)}ms`);
        }

        console.log(`FPS: ${report.fps.current} (avg: ${report.fps.average})`);

        if (report.memory.usagePercentage) {
            console.log(`Memory: ${(report.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB (${report.memory.usagePercentage.toFixed(1)}%)`);
        }

        console.log(`Resources: ${report.resources.total} loaded (${(report.resources.totalSize / 1024).toFixed(2)}KB)`);
        console.log(`Cached: ${report.resources.cached}/${report.resources.total}`);

        console.groupEnd();
    }

    /**
     * Group resources by type
     * @private
     */
    _groupResourcesByType() {
        const grouped = {};
        this.metrics.resources.forEach(resource => {
            if (!grouped[resource.type]) {
                grouped[resource.type] = {
                    count: 0,
                    size: 0,
                    duration: 0
                };
            }
            grouped[resource.type].count++;
            grouped[resource.type].size += resource.size;
            grouped[resource.type].duration += resource.duration;
        });
        return grouped;
    }

    /**
     * Cleanup and stop monitoring
     */
    destroy() {
        Object.values(this.observers).forEach(observer => {
            if (observer) observer.disconnect();
        });

        console.log('📊 Performance monitoring stopped');
    }
}

// Global instance
window.PerformanceMonitor = PerformanceMonitor;
