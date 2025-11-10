// ================================
// GAME STORE
// State Management centralizado estilo Zustand
// ================================

class GameStore {
    constructor(storage, eventBus) {
        this.storage = storage;
        this.eventBus = eventBus;

        // Estado centralizado
        this.state = this.getInitialState();

        // Subscribers: Set de funciones que se ejecutan cuando cambia el estado
        this.subscribers = new Set();

        // Middlewares: funciones que interceptan cambios de estado
        this.middlewares = [];

        // History (útil para debugging y undo/redo)
        this.history = [];
        this.maxHistorySize = 20;

        // Auto-save debounced
        this.autoSaveTimeout = null;
        this.autoSaveDelay = 1000; // 1 segundo

        // Cargar estado desde storage
        this.loadFromStorage();
    }

    /**
     * Estado inicial
     */
    getInitialState() {
        return {
            // Estado del jugador
            player: {
                name: '',
                avatar: '👦',
                coins: 100,
                correct: 0,
                wrong: 0,
                streak: 0,
                bestStreak: 0,
                purchasedItems: [],
                equippedItems: {
                    avatars: null,
                    ships: null,
                    weapons: null,
                    cars: null
                },
                achievements: [],
                settings: {
                    soundEnabled: true,
                    tutorialCompleted: false
                }
            },

            // Estado del juego actual
            game: {
                mode: null,
                currentQuestion: null,
                questions: [],
                currentIndex: 0,
                score: 0,
                streak: 0,
                startTime: null,
                endTime: null
            },

            // Estado de la UI
            ui: {
                currentScreen: 'welcomeScreen',
                previousScreen: null,
                isLoading: false,
                notification: null,
                modal: null
            },

            // Estadísticas por tabla
            tableMastery: this.getInitialTableMastery()
        };
    }

    /**
     * Maestría inicial de tablas (2-10)
     */
    getInitialTableMastery() {
        const mastery = {};
        for (let i = 2; i <= 10; i++) {
            mastery[i] = {
                mastery: 0,
                lastPracticed: null,
                correctCount: 0,
                wrongCount: 0,
                streak: 0
            };
        }
        return mastery;
    }

    /**
     * Obtiene el estado completo
     * @returns {Object} Estado completo
     */
    getState() {
        return this.state;
    }

    /**
     * Obtiene una parte del estado usando un selector
     * @param {Function} selector - Función (state) => value
     * @returns {*} Valor seleccionado
     */
    select(selector) {
        return selector(this.state);
    }

    /**
     * Actualiza el estado
     * @param {Function|Object} updater - Función (state) => newState o objeto parcial
     * @param {string} action - Nombre de la acción (para debugging)
     */
    setState(updater, action = 'setState') {
        const previousState = { ...this.state };

        // Aplicar updater
        if (typeof updater === 'function') {
            this.state = updater(this.state);
        } else {
            this.state = { ...this.state, ...updater };
        }

        // Aplicar middlewares
        this.middlewares.forEach(middleware => {
            middleware(previousState, this.state, action);
        });

        // Agregar a historial
        this.addToHistory(action, previousState, this.state);

        // Notificar a subscribers
        this.notify();

        // Auto-save debounced
        this.scheduleSave();

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('store:state:changed', {
                action,
                previous: previousState,
                current: this.state
            });
        }
    }

    /**
     * Suscribe un listener a cambios de estado
     * @param {Function} listener - Función (state) => void
     * @returns {Function} Función para desuscribirse
     */
    subscribe(listener) {
        this.subscribers.add(listener);
        return () => this.subscribers.delete(listener);
    }

    /**
     * Notifica a todos los subscribers
     */
    notify() {
        this.subscribers.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('❌ Error en subscriber:', error);
            }
        });
    }

    /**
     * Agrega un middleware
     * @param {Function} middleware - Función (prevState, nextState, action) => void
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }

    // ========================================
    // ACTIONS: Player
    // ========================================

    setPlayer(player) {
        this.setState(state => ({
            ...state,
            player: { ...state.player, ...player }
        }), 'setPlayer');
    }

    addCoins(amount) {
        this.setState(state => ({
            ...state,
            player: {
                ...state.player,
                coins: state.player.coins + amount
            }
        }), 'addCoins');

        if (this.eventBus) {
            this.eventBus.emit('player:coins:added', { amount, total: this.state.player.coins });
        }
    }

    updateStats(stats) {
        this.setState(state => ({
            ...state,
            player: {
                ...state.player,
                ...stats
            }
        }), 'updateStats');
    }

    incrementStreak() {
        this.setState(state => {
            const newStreak = state.player.streak + 1;
            return {
                ...state,
                player: {
                    ...state.player,
                    streak: newStreak,
                    bestStreak: Math.max(newStreak, state.player.bestStreak)
                }
            };
        }, 'incrementStreak');
    }

    resetStreak() {
        this.setState(state => ({
            ...state,
            player: {
                ...state.player,
                streak: 0
            }
        }), 'resetStreak');
    }

    unlockAchievement(achievementId) {
        this.setState(state => {
            if (state.player.achievements.includes(achievementId)) {
                return state; // Ya desbloqueado
            }

            return {
                ...state,
                player: {
                    ...state.player,
                    achievements: [...state.player.achievements, achievementId]
                }
            };
        }, 'unlockAchievement');

        if (this.eventBus) {
            this.eventBus.emit('player:achievement:unlocked', { achievementId });
        }
    }

    purchaseItem(itemId) {
        this.setState(state => ({
            ...state,
            player: {
                ...state.player,
                purchasedItems: [...state.player.purchasedItems, itemId]
            }
        }), 'purchaseItem');
    }

    equipItem(type, itemId) {
        this.setState(state => ({
            ...state,
            player: {
                ...state.player,
                equippedItems: {
                    ...state.player.equippedItems,
                    [type]: itemId
                }
            }
        }), 'equipItem');
    }

    // ========================================
    // ACTIONS: Game
    // ========================================

    setGameMode(mode) {
        this.setState(state => ({
            ...state,
            game: {
                ...state.game,
                mode,
                startTime: Date.now()
            }
        }), 'setGameMode');

        if (this.eventBus) {
            this.eventBus.emit('game:mode:changed', { mode });
        }
    }

    setCurrentQuestion(question) {
        this.setState(state => ({
            ...state,
            game: {
                ...state.game,
                currentQuestion: question
            }
        }), 'setCurrentQuestion');
    }

    // ========================================
    // ACTIONS: UI
    // ========================================

    setScreen(screenId) {
        this.setState(state => ({
            ...state,
            ui: {
                ...state.ui,
                previousScreen: state.ui.currentScreen,
                currentScreen: screenId
            }
        }), 'setScreen');

        if (this.eventBus) {
            this.eventBus.emit('ui:screen:changed', { screenId });
        }
    }

    // ========================================
    // ACTIONS: Table Mastery
    // ========================================

    updateTableMastery(table, updates) {
        this.setState(state => ({
            ...state,
            tableMastery: {
                ...state.tableMastery,
                [table]: {
                    ...state.tableMastery[table],
                    ...updates,
                    lastPracticed: Date.now()
                }
            }
        }), 'updateTableMastery');
    }

    // ========================================
    // Persistence
    // ========================================

    scheduleSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveToStorage();
        }, this.autoSaveDelay);
    }

    saveToStorage() {
        if (!this.storage) return;

        try {
            this.storage.set('playerData', this.state.player);
            this.storage.set('tableMastery', this.state.tableMastery);
        } catch (error) {
            console.error('❌ Error guardando en storage:', error);
        }
    }

    loadFromStorage() {
        if (!this.storage) return;

        try {
            const player = this.storage.get('playerData');
            const tableMastery = this.storage.get('tableMastery');

            if (player) {
                this.state.player = { ...this.state.player, ...player };
            }

            if (tableMastery) {
                this.state.tableMastery = { ...this.state.tableMastery, ...tableMastery };
            }
        } catch (error) {
            console.error('❌ Error cargando desde storage:', error);
        }
    }

    // ========================================
    // History (debugging / undo-redo)
    // ========================================

    addToHistory(action, previousState, nextState) {
        this.history.push({
            action,
            timestamp: Date.now(),
            previous: previousState,
            next: nextState
        });

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }
}

// Exportar como global para compatibilidad con arquitectura actual
if (typeof window !== 'undefined') {
    window.GameStore = GameStore;
}
