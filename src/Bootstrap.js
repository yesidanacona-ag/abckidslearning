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

        console.log('📦 Fase 1: Inicializando Core Modules...');
        this.initializeCore();

        console.log('🔧 Fase 2: Inicializando Services...');
        this.initializeServices();

        console.log('🎮 Fase 3: Inicializando Controllers...');
        this.initializeControllers();

        console.log('🔗 Fase 4: Wire Up Event Listeners...');
        this.wireUpEventListeners();

        console.log('✅ Sistema inicializado correctamente');
        this.initialized = true;

        return this.getContext();
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
            this.controllers.mode = new ModeController(
                this.store,
                this.eventBus,
                this.controllers.screen,
                this.controllers.game
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
     * Obtiene el contexto completo de la aplicación
     * @returns {Object} Contexto con todos los módulos
     */
    getContext() {
        return {
            storage: this.storage,
            eventBus: this.eventBus,
            store: this.store,
            services: this.services,
            controllers: this.controllers
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
            eventBusStats: this.eventBus ? {
                eventsRegistered: this.eventBus.getEvents().length,
                historySize: this.eventBus.getHistory().length
            } : null,
            storeStats: this.store ? {
                playerName: this.store.getState().player.name,
                coins: this.store.getState().player.coins,
                currentScreen: this.store.getState().ui.currentScreen
            } : null
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
