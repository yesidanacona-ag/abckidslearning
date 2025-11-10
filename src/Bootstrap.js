// ================================
// BOOTSTRAP
// Inicialización del sistema modular de Multiplicar Mágico
// ================================

class ApplicationBootstrap {
    constructor() {
        console.log('🚀 Inicializando Multiplicar Mágico...');

        // Referencias a instancias
        this.storage = null;
        this.eventBus = null;
        this.store = null;

        // Services
        this.services = {
            player: null,
            achievement: null,
            question: null,
            adaptive: null
        };

        // Controllers
        this.controllers = {
            game: null,
            screen: null,
            mode: null
        };

        // Performance modules
        this.performance = {
            monitor: null,
            moduleLoader: null,
            resourceHints: null,
            assetOptimizer: null,
            serviceWorkerManager: null
        };

        // Error handling modules
        this.errorHandling = {
            globalHandler: null,
            logger: null,
            reporter: null,
            recoveryManager: null,
            boundaries: new Map() // ErrorBoundary instances per module
        };

        // Accessibility modules
        this.accessibility = {
            manager: null,
            aria: null,
            keyboard: null,
            screenReader: null,
            visual: null,
            audio: null
        };

        // UX Research modules
        this.uxResearch = {
            userResearch: null,
            analytics: null,
            abTesting: null,
            feedback: null
        };

        // Estado de inicialización
        this.initialized = false;
    }

    /**
     * Inicializa todo el sistema
     * @returns {Object} Referencias a todos los módulos
     */
    initialize() {
        if (this.initialized) {
            console.warn('⚠️ Sistema ya inicializado');
            return this.getContext();
        }

        console.log('🛡️ Fase 0: Inicializando Error Handling...');
        this.initializeErrorHandling();

        console.log('⚡ Fase 1: Inicializando Performance Modules...');
        this.initializePerformance();

        console.log('📦 Fase 2: Inicializando Core Modules...');
        this.initializeCore();

        console.log('🔧 Fase 3: Inicializando Services...');
        this.initializeServices();

        console.log('🎮 Fase 4: Inicializando Controllers...');
        this.initializeControllers();

        console.log('🔗 Fase 5: Wire Up Event Listeners...');
        this.wireUpEventListeners();

        console.log('♿ Fase 6: Inicializando Accessibility...');
        this.initializeAccessibility();

        console.log('📊 Fase 7: Inicializando UX Research...');
        this.initializeUXResearch();

        console.log('⚡ Fase 8: Finalizando Performance Setup...');
        this.finalizePerformance();

        console.log('✅ Sistema inicializado correctamente');
        this.initialized = true;

        return this.getContext();
    }

    /**
     * Inicializa módulos de error handling
     */
    initializeErrorHandling() {
        // Logger (debe ser lo primero para capturar todos los logs)
        if (typeof Logger !== 'undefined') {
            this.errorHandling.logger = new Logger({
                level: 'info',
                persistToStorage: true
            });
            window.logger = this.errorHandling.logger; // Global access
            console.log('  ✓ Logger');
        }

        // GlobalErrorHandler
        if (typeof GlobalErrorHandler !== 'undefined') {
            this.errorHandling.globalHandler = new GlobalErrorHandler();

            // Set custom handlers
            this.errorHandling.globalHandler.onError((errorInfo) => {
                // Log error
                if (this.errorHandling.logger) {
                    this.errorHandling.logger.error(errorInfo.message, errorInfo, 'GlobalErrorHandler');
                }

                // Report error
                if (this.errorHandling.reporter) {
                    this.errorHandling.reporter.report(errorInfo.error || new Error(errorInfo.message), {
                        component: 'Global',
                        operation: 'uncaught',
                        severity: 'high'
                    });
                }
            });

            this.errorHandling.globalHandler.onPromiseRejection((rejectionInfo) => {
                // Log rejection
                if (this.errorHandling.logger) {
                    this.errorHandling.logger.error('Unhandled promise rejection', rejectionInfo, 'GlobalErrorHandler');
                }

                // Report rejection
                if (this.errorHandling.reporter) {
                    this.errorHandling.reporter.report(rejectionInfo.reason || new Error('Promise rejection'), {
                        component: 'Global',
                        operation: 'promise_rejection',
                        severity: 'high'
                    });
                }
            });

            console.log('  ✓ GlobalErrorHandler');
        }

        // RecoveryManager
        if (typeof RecoveryManager !== 'undefined') {
            this.errorHandling.recoveryManager = new RecoveryManager();
            console.log('  ✓ RecoveryManager');
        }

        // ErrorReporter
        if (typeof ErrorReporter !== 'undefined') {
            this.errorHandling.reporter = new ErrorReporter({
                reportToConsole: true,
                reportToStorage: true,
                reportToRemote: false // Enable when backend available
            });

            // Set user context when available
            window.addEventListener('DOMContentLoaded', () => {
                if (this.store) {
                    const player = this.store.getState().player;
                    this.errorHandling.reporter.setUserContext({
                        userId: player.name,
                        userName: player.name
                    });
                }
            });

            console.log('  ✓ ErrorReporter');
        }

        // Create ErrorBoundaries for each module
        const modules = ['PlayerService', 'AdaptiveService', 'QuestionService', 'AchievementService', 'GameController', 'ScreenController', 'ModeController'];

        if (typeof ErrorBoundary !== 'undefined') {
            modules.forEach(moduleName => {
                const boundary = new ErrorBoundary(moduleName, {
                    errorThreshold: 5,
                    onError: (errorInfo) => {
                        if (this.errorHandling.logger) {
                            this.errorHandling.logger.error(errorInfo.error.message, errorInfo, moduleName);
                        }
                    },
                    onCritical: (errorInfo, recentErrors) => {
                        if (this.errorHandling.reporter) {
                            this.errorHandling.reporter.report(new Error(errorInfo.error.message), {
                                component: moduleName,
                                operation: errorInfo.operation,
                                severity: 'critical',
                                recentErrors
                            });
                        }
                    },
                    recoveryStrategy: (error, operation, args) => {
                        if (this.errorHandling.recoveryManager) {
                            return this.errorHandling.recoveryManager.recover(error, {
                                operation,
                                args
                            });
                        }
                        return null;
                    }
                });

                this.errorHandling.boundaries.set(moduleName, boundary);
            });

            console.log(`  ✓ ErrorBoundaries (${modules.length} modules)`);
        }
    }

    /**
     * Inicializa módulos core (Storage, EventBus, Store)
     */
    initializeCore() {
        // StorageManager
        if (typeof StorageManager !== 'undefined') {
            this.storage = new StorageManager('mm_');
            console.log('  ✓ StorageManager');
        } else {
            console.error('  ❌ StorageManager no disponible');
        }

        // EventBus
        if (typeof EventBus !== 'undefined') {
            this.eventBus = new EventBus();
            // this.eventBus.setDebug(true); // Habilitar para debugging
            console.log('  ✓ EventBus');
        } else {
            console.error('  ❌ EventBus no disponible');
        }

        // GameStore
        if (typeof GameStore !== 'undefined') {
            this.store = new GameStore(this.storage, this.eventBus);
            console.log('  ✓ GameStore');
        } else {
            console.error('  ❌ GameStore no disponible');
        }
    }

    /**
     * Inicializa módulos de performance
     */
    initializePerformance() {
        // Performance Monitor
        if (typeof PerformanceMonitor !== 'undefined') {
            this.performance.monitor = new PerformanceMonitor();
            this.performance.monitor.mark('bootstrap:start');
            console.log('  ✓ PerformanceMonitor');
        }

        // Resource Hints
        if (typeof ResourceHints !== 'undefined') {
            this.performance.resourceHints = new ResourceHints();
            this.performance.resourceHints.applyAppHints();
            console.log('  ✓ ResourceHints');
        }

        // Asset Optimizer
        if (typeof AssetOptimizer !== 'undefined') {
            this.performance.assetOptimizer = new AssetOptimizer();
            console.log('  ✓ AssetOptimizer');
        }

        // Service Worker Manager
        if (typeof ServiceWorkerManager !== 'undefined') {
            this.performance.serviceWorkerManager = new ServiceWorkerManager();

            // Register service worker
            this.performance.serviceWorkerManager.register().then(registered => {
                if (registered) {
                    console.log('  ✓ ServiceWorkerManager (registered)');

                    // Show update notification when available
                    this.performance.serviceWorkerManager.onUpdateAvailable(() => {
                        console.log('🔄 Nueva versión disponible');
                        this.performance.serviceWorkerManager.showUpdateNotification();
                    });

                    // Log when offline-ready
                    this.performance.serviceWorkerManager.onOfflineReady(() => {
                        console.log('📱 App lista para uso offline');
                    });
                } else {
                    console.log('  ⚠️ ServiceWorkerManager (not registered)');
                }
            });
        }

        // Module Loader (for future lazy loading implementation)
        if (typeof ModuleLoader !== 'undefined') {
            this.performance.moduleLoader = new ModuleLoader();
            console.log('  ✓ ModuleLoader');
        }
    }

    /**
     * Finaliza configuración de performance
     */
    finalizePerformance() {
        if (this.performance.monitor) {
            this.performance.monitor.mark('bootstrap:end');
            this.performance.monitor.measure('bootstrap:duration', 'bootstrap:start', 'bootstrap:end');

            // Log performance report after 2 seconds (allow paint metrics to be captured)
            setTimeout(() => {
                this.performance.monitor.logReport();
            }, 2000);
        }

        // Preload critical images
        if (this.performance.assetOptimizer) {
            const criticalImages = [
                'assets/characters/mateo-neutral.png'
                // Add more critical images here
            ];
            this.performance.assetOptimizer.preloadCriticalImages(criticalImages);
        }
    }

    /**
     * Inicializa servicios de negocio
     */
    initializeServices() {
        // PlayerService
        if (typeof PlayerService !== 'undefined') {
            this.services.player = new PlayerService(this.store, this.eventBus);
            console.log('  ✓ PlayerService');
        } else {
            console.error('  ❌ PlayerService no disponible');
        }

        // AdaptiveService (necesario para QuestionService)
        if (typeof AdaptiveService !== 'undefined') {
            this.services.adaptive = new AdaptiveService(this.store, this.eventBus);
            console.log('  ✓ AdaptiveService');
        } else {
            console.error('  ❌ AdaptiveService no disponible');
        }

        // QuestionService
        if (typeof QuestionService !== 'undefined') {
            this.services.question = new QuestionService(this.services.adaptive);
            console.log('  ✓ QuestionService');
        } else {
            console.error('  ❌ QuestionService no disponible');
        }

        // AchievementService
        if (typeof AchievementService !== 'undefined') {
            this.services.achievement = new AchievementService(
                this.store,
                this.eventBus,
                this.services.player
            );
            console.log('  ✓ AchievementService');
        } else {
            console.error('  ❌ AchievementService no disponible');
        }

        // Verificar que servicios críticos se inicializaron correctamente
        if (!this.services.player) {
            console.error('🚨 CRÍTICO: PlayerService no se inicializó correctamente');
            console.error('   El sistema de descubrimiento puede no funcionar');
        }
    }

    /**
     * Inicializa controllers
     */
    initializeControllers() {
        // GameController
        if (typeof GameController !== 'undefined') {
            this.controllers.game = new GameController(
                this.store,
                this.eventBus,
                {
                    playerService: this.services.player,
                    questionService: this.services.question,
                    achievementService: this.services.achievement,
                    adaptiveService: this.services.adaptive
                }
            );
            console.log('  ✓ GameController');
        } else {
            console.error('  ❌ GameController no disponible');
        }

        // ScreenController
        if (typeof ScreenController !== 'undefined') {
            this.controllers.screen = new ScreenController(
                this.store,
                this.eventBus,
                this.services.player
            );
            console.log('  ✓ ScreenController');
        } else {
            console.error('  ❌ ScreenController no disponible');
        }

        // ModeController
        if (typeof ModeController !== 'undefined') {
            console.log('🔧 Inicializando ModeController con:', {
                store: !!this.store,
                eventBus: !!this.eventBus,
                screen: !!this.controllers.screen,
                game: !!this.controllers.game,
                services: !!this.services,
                player: !!this.services?.player
            });

            this.controllers.mode = new ModeController(
                this.store,
                this.eventBus,
                this.controllers.screen,
                this.controllers.game,
                this.services
            );
            console.log('  ✓ ModeController');
        } else {
            console.error('  ❌ ModeController no disponible');
        }
    }

    /**
     * Configura event listeners globales
     */
    wireUpEventListeners() {
        // Listener: Cuando cambian monedas, actualizar CoinSystem
        this.eventBus.on('player:coins:added', (data) => {
            if (typeof window !== 'undefined' && window.coinSystem) {
                window.coinSystem.updateDisplay(data.total);
            }
        });

        // Listener: Cuando se desbloquea achievement, mostrar celebración
        this.eventBus.on('player:achievement:unlocked', (data) => {
            const achievement = this.services.achievement.getAchievementById(data.achievementId);
            if (achievement && typeof window !== 'undefined' && window.mateoMascot) {
                window.mateoMascot.speak(`¡Logro desbloqueado: ${achievement.name}!`, 3000);
            }
        });

        // Listener: Respuesta correcta - feedback de Mateo
        this.eventBus.on('game:answer:correct', (data) => {
            if (typeof window !== 'undefined' && window.mateoMascot) {
                const messages = ['¡Excelente!', '¡Muy bien!', '¡Correcto!', '¡Genial!'];
                const msg = messages[Math.floor(Math.random() * messages.length)];
                window.mateoMascot.show('happy');
                window.mateoMascot.speak(msg, 2000);
            }

            // Sonido
            if (typeof window !== 'undefined' && window.soundSystem) {
                const player = this.services.player.getPlayer();
                if (player.streak >= 3) {
                    window.soundSystem.playSuccess();
                } else {
                    window.soundSystem.playCorrect();
                }
            }
        });

        // Listener: Respuesta incorrecta - feedback de Mateo
        this.eventBus.on('game:answer:wrong', (data) => {
            if (typeof window !== 'undefined' && window.mateoMascot) {
                const messages = ['¡Casi!', '¡Inténtalo de nuevo!', '¡No te rindas!'];
                const msg = messages[Math.floor(Math.random() * messages.length)];
                window.mateoMascot.show('sad');
                window.mateoMascot.speak(msg, 2000);
            }

            // Sonido
            if (typeof window !== 'undefined' && window.soundSystem) {
                window.soundSystem.playWrong();
            }
        });

        // Listener: Fin del juego
        this.eventBus.on('game:mode:ended', (data) => {
            console.log('🏁 Juego terminado:', data);
        });

        console.log('  ✓ Event Listeners configurados');
    }

    /**
     * Inicializa módulos de accesibilidad
     */
    initializeAccessibility() {
        // AccessibilityManager (central manager)
        if (typeof AccessibilityManager !== 'undefined') {
            this.accessibility.manager = new AccessibilityManager();
            console.log('  ✓ AccessibilityManager');
        }

        // AriaManager
        if (typeof AriaManager !== 'undefined') {
            this.accessibility.aria = new AriaManager();
            console.log('  ✓ AriaManager');
        }

        // KeyboardNavigationManager
        if (typeof KeyboardNavigationManager !== 'undefined') {
            this.accessibility.keyboard = new KeyboardNavigationManager();
            console.log('  ✓ KeyboardNavigationManager');
        }

        // ScreenReaderManager
        if (typeof ScreenReaderManager !== 'undefined') {
            this.accessibility.screenReader = new ScreenReaderManager();
            console.log('  ✓ ScreenReaderManager');
        }

        // VisualAccessibilityManager
        if (typeof VisualAccessibilityManager !== 'undefined') {
            this.accessibility.visual = new VisualAccessibilityManager();
            console.log('  ✓ VisualAccessibilityManager');
        }

        // AudioAccessibilityManager
        if (typeof AudioAccessibilityManager !== 'undefined') {
            this.accessibility.audio = new AudioAccessibilityManager();
            console.log('  ✓ AudioAccessibilityManager');
        }

        // Load saved preferences
        if (this.accessibility.manager) {
            this.accessibility.manager.loadPreferences();
            console.log('  ✓ Accessibility preferences loaded');
        }
    }

    /**
     * Inicializa módulos de UX Research
     */
    initializeUXResearch() {
        // UserResearchManager
        if (typeof UserResearchManager !== 'undefined') {
            this.uxResearch.userResearch = new UserResearchManager({
                trackClicks: true,
                trackScrolls: true,
                trackHovers: false, // Disabled to reduce data
                trackKeys: false // Disabled for privacy
            });
            console.log('  ✓ UserResearchManager');
        }

        // AnalyticsManager
        if (typeof AnalyticsManager !== 'undefined') {
            this.uxResearch.analytics = new AnalyticsManager({
                debugMode: false, // Set to true for development
                batchSize: 20,
                flushInterval: 30000
            });

            // Set user properties from player data
            if (this.store) {
                const player = this.store.getState().player;
                this.uxResearch.analytics.setUserProperties({
                    playerName: player.name,
                    playerLevel: player.level,
                    totalPlayTime: 0 // Will be tracked during gameplay
                });
            }

            console.log('  ✓ AnalyticsManager');
        }

        // ABTestingManager
        if (typeof ABTestingManager !== 'undefined') {
            this.uxResearch.abTesting = new ABTestingManager({
                debugMode: false
            });

            // Example: Create a feature flag for new tutorial
            // this.uxResearch.abTesting.setFeatureFlag('new_tutorial', true, 50); // 50% of users

            console.log('  ✓ ABTestingManager');
        }

        // FeedbackManager
        if (typeof FeedbackManager !== 'undefined') {
            this.uxResearch.feedback = new FeedbackManager({
                enabled: true
            });
            console.log('  ✓ FeedbackManager');
        }
    }

    /**
     * Obtiene el contexto completo de la aplicación
     * @returns {Object} Contexto con todos los módulos
     */
    getContext() {
        return {
            storage: this.storage,
            eventBus: this.eventBus,
            store: this.store,
            services: this.services,
            controllers: this.controllers,
            performance: this.performance,
            errorHandling: this.errorHandling,
            accessibility: this.accessibility,
            uxResearch: this.uxResearch
        };
    }

    /**
     * Obtiene una referencia rápida al store
     * @returns {GameStore} Store
     */
    getStore() {
        return this.store;
    }

    /**
     * Obtiene una referencia rápida al eventBus
     * @returns {EventBus} EventBus
     */
    getEventBus() {
        return this.eventBus;
    }

    /**
     * Obtiene un service específico
     * @param {string} name - Nombre del service
     * @returns {Object|null} Service
     */
    getService(name) {
        return this.services[name] || null;
    }

    /**
     * Obtiene un controller específico
     * @param {string} name - Nombre del controller
     * @returns {Object|null} Controller
     */
    getController(name) {
        return this.controllers[name] || null;
    }

    /**
     * Reinicia el sistema completo
     */
    reset() {
        console.log('🔄 Reiniciando sistema...');

        // Limpiar storage
        if (this.storage) {
            this.storage.clear();
        }

        // Limpiar eventBus
        if (this.eventBus) {
            this.eventBus.clear();
        }

        // Reinicializar
        this.initialized = false;
        this.initialize();
    }

    /**
     * Obtiene estado de diagnóstico del sistema
     * @returns {Object} Estado del sistema
     */
    getDiagnostics() {
        return {
            initialized: this.initialized,
            coreModules: {
                storage: !!this.storage,
                eventBus: !!this.eventBus,
                store: !!this.store
            },
            services: {
                player: !!this.services.player,
                achievement: !!this.services.achievement,
                question: !!this.services.question,
                adaptive: !!this.services.adaptive
            },
            controllers: {
                game: !!this.controllers.game,
                screen: !!this.controllers.screen,
                mode: !!this.controllers.mode
            },
            performance: {
                monitor: !!this.performance.monitor,
                moduleLoader: !!this.performance.moduleLoader,
                resourceHints: !!this.performance.resourceHints,
                assetOptimizer: !!this.performance.assetOptimizer,
                serviceWorkerManager: !!this.performance.serviceWorkerManager,
                report: this.performance.monitor ? this.performance.monitor.getReport() : null
            },
            errorHandling: {
                globalHandler: !!this.errorHandling.globalHandler,
                logger: !!this.errorHandling.logger,
                reporter: !!this.errorHandling.reporter,
                recoveryManager: !!this.errorHandling.recoveryManager,
                boundaries: this.errorHandling.boundaries.size,
                stats: {
                    globalErrors: this.errorHandling.globalHandler ? this.errorHandling.globalHandler.getStats() : null,
                    logStats: this.errorHandling.logger ? this.errorHandling.logger.getStats() : null,
                    reportSummary: this.errorHandling.reporter ? this.errorHandling.reporter.createSummaryReport() : null,
                    recoveryStats: this.errorHandling.recoveryManager ? this.errorHandling.recoveryManager.getStats() : null
                }
            },
            eventBusStats: this.eventBus ? {
                eventsRegistered: this.eventBus.getEvents().length,
                historySize: this.eventBus.getHistory().length
            } : null,
            storeStats: this.store ? {
                playerName: this.store.getState().player.name,
                coins: this.store.getState().player.coins,
                currentScreen: this.store.getState().ui.currentScreen
            } : null,
            accessibility: {
                manager: !!this.accessibility.manager,
                aria: !!this.accessibility.aria,
                keyboard: !!this.accessibility.keyboard,
                screenReader: !!this.accessibility.screenReader,
                visual: !!this.accessibility.visual,
                audio: !!this.accessibility.audio,
                features: this.accessibility.manager ? this.accessibility.manager.getFeatures() : null,
                wcagLevel: this.accessibility.manager ? this.accessibility.manager.getWCAGLevel() : null
            },
            uxResearch: {
                userResearch: !!this.uxResearch.userResearch,
                analytics: !!this.uxResearch.analytics,
                abTesting: !!this.uxResearch.abTesting,
                feedback: !!this.uxResearch.feedback,
                stats: {
                    sessions: this.uxResearch.userResearch ? this.uxResearch.userResearch.getSessionStats() : null,
                    events: this.uxResearch.analytics ? this.uxResearch.analytics.getEventStats() : null,
                    experiments: this.uxResearch.abTesting ? this.uxResearch.abTesting.getActiveExperiments().length : 0,
                    npsScore: this.uxResearch.feedback ? this.uxResearch.feedback.getNPSScore() : null
                }
            }
        };
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.ApplicationBootstrap = ApplicationBootstrap;

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📱 DOM Cargado, inicializando Bootstrap...');
            window.bootstrap = new ApplicationBootstrap();
            window.bootstrap.initialize();
        });
    } else {
        // DOM ya está cargado
        console.log('📱 DOM ya cargado, inicializando Bootstrap...');
        window.bootstrap = new ApplicationBootstrap();
        window.bootstrap.initialize();
    }
}
