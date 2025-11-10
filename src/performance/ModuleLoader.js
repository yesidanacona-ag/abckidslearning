// ================================
// MODULE LOADER
// Lazy loading system for modules
// Performance Optimization - Fase 1
// ================================

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.moduleManifest = this.defineModuleManifest();
        this.performanceMetrics = {
            totalLoadTime: 0,
            modulesLoaded: 0,
            cacheHits: 0
        };
    }

    /**
     * Define module manifest with priorities
     * Priority levels:
     *   - critical: Load immediately (blocking)
     *   - high: Load after critical (non-blocking)
     *   - medium: Load on-demand or after idle
     *   - low: Load only when explicitly requested
     */
    defineModuleManifest() {
        return {
            // CRITICAL: Core infrastructure (must load first)
            'StorageManager': {
                path: 'src/core/StorageManager.js',
                priority: 'critical',
                dependencies: []
            },
            'EventBus': {
                path: 'src/core/EventBus.js',
                priority: 'critical',
                dependencies: []
            },
            'GameStore': {
                path: 'src/core/GameStore.js',
                priority: 'critical',
                dependencies: ['StorageManager', 'EventBus']
            },

            // HIGH: Essential services
            'PlayerService': {
                path: 'src/services/PlayerService.js',
                priority: 'high',
                dependencies: ['GameStore', 'EventBus']
            },
            'QuestionService': {
                path: 'src/services/QuestionService.js',
                priority: 'high',
                dependencies: ['GameStore', 'EventBus']
            },

            // MEDIUM: Important but can be deferred
            'AdaptiveService': {
                path: 'src/services/AdaptiveService.js',
                priority: 'medium',
                dependencies: ['GameStore', 'EventBus']
            },
            'AchievementService': {
                path: 'src/services/AchievementService.js',
                priority: 'medium',
                dependencies: ['GameStore', 'EventBus', 'PlayerService']
            },
            'GameController': {
                path: 'src/controllers/GameController.js',
                priority: 'medium',
                dependencies: ['GameStore', 'EventBus', 'PlayerService', 'QuestionService']
            },
            'ScreenController': {
                path: 'src/controllers/ScreenController.js',
                priority: 'high',
                dependencies: ['GameStore', 'EventBus']
            },
            'ModeController': {
                path: 'src/controllers/ModeController.js',
                priority: 'medium',
                dependencies: ['GameStore', 'EventBus', 'GameController']
            },

            // LOW: Load on-demand (when user accesses feature)
            'ShopSystem': {
                path: 'shopSystem.js',
                priority: 'low',
                dependencies: []
            },
            'DailyMissionsSystem': {
                path: 'dailyMissionsSystem.js',
                priority: 'low',
                dependencies: []
            },
            'SpaceGameEngine': {
                path: 'spaceGameEngine.js',
                priority: 'low',
                dependencies: []
            },
            'BossGameEngine': {
                path: 'bossGameEngine.js',
                priority: 'low',
                dependencies: []
            },
            'PracticeSystemEngine': {
                path: 'practiceSystemEngine.js',
                priority: 'low',
                dependencies: []
            },
            'GalaxySystemEngine': {
                path: 'galaxySystemEngine.js',
                priority: 'low',
                dependencies: []
            },
            'FireModeSystem': {
                path: 'fireModeSystem.js',
                priority: 'low',
                dependencies: []
            }
        };
    }

    /**
     * Load a single module dynamically
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<void>}
     */
    async loadModule(moduleName) {
        // Check if already loaded
        if (this.loadedModules.has(moduleName)) {
            this.performanceMetrics.cacheHits++;
            return this.loadedModules.get(moduleName);
        }

        // Check if currently loading (avoid duplicate requests)
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const manifest = this.moduleManifest[moduleName];
        if (!manifest) {
            throw new Error(`Module "${moduleName}" not found in manifest`);
        }

        // Load dependencies first
        if (manifest.dependencies && manifest.dependencies.length > 0) {
            await this.loadModules(manifest.dependencies);
        }

        // Start loading
        const startTime = performance.now();
        const loadPromise = this._loadScript(manifest.path, moduleName);

        this.loadingPromises.set(moduleName, loadPromise);

        try {
            await loadPromise;

            const loadTime = performance.now() - startTime;
            this.performanceMetrics.totalLoadTime += loadTime;
            this.performanceMetrics.modulesLoaded++;

            this.loadedModules.set(moduleName, true);
            this.loadingPromises.delete(moduleName);

            console.log(`📦 Module loaded: ${moduleName} (${loadTime.toFixed(2)}ms)`);

            return true;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Failed to load module: ${moduleName}`, error);
            throw error;
        }
    }

    /**
     * Load multiple modules in parallel
     * @param {string[]} moduleNames - Array of module names
     * @returns {Promise<void>}
     */
    async loadModules(moduleNames) {
        const promises = moduleNames.map(name => this.loadModule(name));
        await Promise.all(promises);
    }

    /**
     * Load modules by priority level
     * @param {string} priority - Priority level: 'critical', 'high', 'medium', 'low'
     * @returns {Promise<void>}
     */
    async loadByPriority(priority) {
        const modulesToLoad = Object.entries(this.moduleManifest)
            .filter(([name, config]) => config.priority === priority)
            .map(([name]) => name);

        if (modulesToLoad.length > 0) {
            console.log(`📦 Loading ${priority} priority modules (${modulesToLoad.length})...`);
            await this.loadModules(modulesToLoad);
        }
    }

    /**
     * Progressive loading strategy
     * Load modules in priority order: critical → high → medium
     * (low priority modules load on-demand)
     */
    async progressiveLoad() {
        const startTime = performance.now();

        try {
            // Phase 1: Critical (blocking)
            await this.loadByPriority('critical');

            // Phase 2: High (non-blocking, but important)
            await this.loadByPriority('high');

            // Phase 3: Medium (deferred)
            // Use requestIdleCallback to load during browser idle time
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    this.loadByPriority('medium');
                });
            } else {
                // Fallback: load after a short delay
                setTimeout(() => this.loadByPriority('medium'), 100);
            }

            const totalTime = performance.now() - startTime;
            console.log(`✅ Progressive load completed (${totalTime.toFixed(2)}ms)`);

            return this.getMetrics();
        } catch (error) {
            console.error('❌ Progressive load failed:', error);
            throw error;
        }
    }

    /**
     * Preload a module (fetch but don't execute)
     * Useful for modules that will be needed soon
     */
    preloadModule(moduleName) {
        const manifest = this.moduleManifest[moduleName];
        if (!manifest) return;

        // Create link element for preload
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = manifest.path;
        document.head.appendChild(link);

        console.log(`🔮 Preloading module: ${moduleName}`);
    }

    /**
     * Load script dynamically
     * @private
     */
    _loadScript(src, moduleName) {
        return new Promise((resolve, reject) => {
            // Check if script already exists in DOM
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.module = moduleName;

            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

            document.head.appendChild(script);
        });
    }

    /**
     * Check if a module is loaded
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this.performanceMetrics,
            averageLoadTime: this.performanceMetrics.modulesLoaded > 0
                ? this.performanceMetrics.totalLoadTime / this.performanceMetrics.modulesLoaded
                : 0,
            cacheHitRate: this.performanceMetrics.modulesLoaded > 0
                ? (this.performanceMetrics.cacheHits / this.performanceMetrics.modulesLoaded) * 100
                : 0
        };
    }

    /**
     * Clear all loaded modules (for testing/reset)
     */
    reset() {
        this.loadedModules.clear();
        this.loadingPromises.clear();
        this.performanceMetrics = {
            totalLoadTime: 0,
            modulesLoaded: 0,
            cacheHits: 0
        };
    }
}

// Global instance
window.ModuleLoader = ModuleLoader;
