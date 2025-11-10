// ================================
// STATE MANAGER - Singleton Pattern
// Gestión centralizada de estado con persistencia
// ================================

/**
 * StateManager implementa el patrón Singleton para gestión centralizada
 * del estado de la aplicación.
 *
 * Features:
 * - Single source of truth
 * - Reactive updates via EventBus
 * - Automatic localStorage persistence
 * - State history para debugging
 * - Path-based getters/setters (lodash-style)
 *
 * @class StateManager
 * @example
 * const state = StateManager.getInstance();
 * state.set('player.level', 5);
 * const level = state.get('player.level');
 * state.subscribe('player.score', (newScore) => console.log(newScore));
 */
class StateManager {
    constructor() {
        // Singleton enforcement
        if (StateManager.instance) {
            return StateManager.instance;
        }

        /** @type {Object} Estado completo de la aplicación */
        this.state = this.loadState();

        /** @type {Map<string, Set<Function>>} Subscriptores reactivos */
        this.subscribers = new Map();

        /** @type {Array<{state: Object, timestamp: number}>} Historial de estados */
        this.history = [];
        this.maxHistorySize = 50;

        /** @type {boolean} Flag para evitar loops infinitos en persist */
        this.isPersisting = false;

        StateManager.instance = this;
    }

    /**
     * Obtiene la instancia Singleton
     * @static
     * @returns {StateManager}
     */
    static getInstance() {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }

    /**
     * Obtiene un valor del estado usando path notation
     * @param {string} path - Path al valor (ej: 'player.level')
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*}
     */
    get(path, defaultValue = undefined) {
        if (!path) return this.state;

        const keys = path.split('.');
        let current = this.state;

        for (const key of keys) {
            if (current === null || current === undefined) {
                return defaultValue;
            }
            current = current[key];
        }

        return current !== undefined ? current : defaultValue;
    }

    /**
     * Establece un valor en el estado usando path notation
     * @param {string} path - Path al valor (ej: 'player.level')
     * @param {*} value - Nuevo valor
     * @param {boolean} persist - Si debe persistir automáticamente
     * @returns {StateManager} - Para chaining
     */
    set(path, value, persist = true) {
        if (!path) {
            throw new Error('Path is required for set()');
        }

        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;

        // Navegar hasta el penúltimo nivel
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        // Guardar valor anterior para el evento
        const oldValue = current[lastKey];

        // Establecer nuevo valor
        current[lastKey] = value;

        // Notificar a subscriptores
        this.notifySubscribers(path, value, oldValue);

        // Persistir si está habilitado
        if (persist && !this.isPersisting) {
            this.persist();
        }

        // Agregar a historial
        this.addToHistory();

        return this; // Chaining
    }

    /**
     * Actualiza múltiples valores a la vez
     * @param {Object} updates - Objeto con paths y valores
     * @example
     * state.update({
     *   'player.level': 5,
     *   'player.xp': 100,
     *   'gameState.screen': 'play'
     * });
     */
    update(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value, false); // No persistir aún
        });

        this.persist(); // Persistir una sola vez al final
        return this;
    }

    /**
     * Elimina una propiedad del estado
     * @param {string} path - Path a eliminar
     */
    delete(path) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;

        for (const key of keys) {
            if (!(key in current)) return;
            current = current[key];
        }

        delete current[lastKey];
        this.notifySubscribers(path, undefined, current[lastKey]);
        this.persist();
    }

    /**
     * Verifica si existe un path en el estado
     * @param {string} path
     * @returns {boolean}
     */
    has(path) {
        return this.get(path) !== undefined;
    }

    /**
     * Suscribe un callback a cambios en un path específico
     * @param {string} path - Path a observar
     * @param {Function} callback - Función a ejecutar
     * @returns {Function} - Función para desuscribirse
     */
    subscribe(path, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }

        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }

        this.subscribers.get(path).add(callback);

        // Retornar función de cleanup
        return () => this.unsubscribe(path, callback);
    }

    /**
     * Desuscribe un callback
     * @param {string} path
     * @param {Function} callback
     */
    unsubscribe(path, callback) {
        const callbacks = this.subscribers.get(path);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.subscribers.delete(path);
            }
        }
    }

    /**
     * Notifica a los subscriptores de un cambio
     * @private
     */
    notifySubscribers(path, newValue, oldValue) {
        // Notificar subscriptores exactos
        const exactSubscribers = this.subscribers.get(path);
        if (exactSubscribers) {
            exactSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`Error in state subscriber for "${path}":`, error);
                }
            });
        }

        // Notificar subscriptores de paths padres
        // Ej: Si cambia 'player.level', notificar a 'player'
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            const parentSubscribers = this.subscribers.get(parentPath);

            if (parentSubscribers) {
                const parentValue = this.get(parentPath);
                parentSubscribers.forEach(callback => {
                    try {
                        callback(parentValue, undefined, parentPath);
                    } catch (error) {
                        console.error(`Error in parent state subscriber for "${parentPath}":`, error);
                    }
                });
            }
        }

        // Emitir evento global via EventBus si está disponible
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('state:changed', { path, newValue, oldValue });
        }
    }

    /**
     * Persiste el estado completo a localStorage
     */
    persist() {
        if (this.isPersisting) return;

        this.isPersisting = true;

        try {
            const serialized = JSON.stringify(this.state);
            localStorage.setItem('multiplicationGame_state', serialized);
        } catch (error) {
            console.error('Error persisting state:', error);
        } finally {
            this.isPersisting = false;
        }
    }

    /**
     * Carga el estado desde localStorage
     * @private
     * @returns {Object}
     */
    loadState() {
        try {
            const saved = localStorage.getItem('multiplicationGame_state');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }

        // Estado por defecto
        return this.getDefaultState();
    }

    /**
     * Obtiene el estado inicial por defecto
     * @private
     * @returns {Object}
     */
    getDefaultState() {
        return {
            player: {
                name: '',
                level: 1,
                xp: 0,
                score: 0,
                stars: 0,
                trophies: 0,
                totalAnswered: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                tableMastery: {
                    2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
                    7: 0, 8: 0, 9: 0, 10: 0
                },
                statistics: {
                    gamesPlayed: 0,
                    totalTime: 0,
                    averageAccuracy: 0,
                    fastestAnswer: null
                }
            },
            gameState: {
                screen: 'welcome',
                currentMode: null,
                isPaused: false,
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'medium'
            },
            shop: {
                inventory: [],
                equipped: {
                    avatars: '🦸',
                    ships: '🚀',
                    cars: '🏎️',
                    weapons: '⚔️'
                }
            },
            missions: {
                daily: [],
                completed: [],
                lastReset: Date.now()
            },
            achievements: {
                unlocked: [],
                progress: {}
            },
            galaxy: {
                unlockedTables: [],
                completedTables: [],
                currentTable: null
            },
            tutorial: {
                completed: false,
                currentStep: 0,
                skipped: false
            }
        };
    }

    /**
     * Resetea el estado a valores por defecto
     * @param {boolean} keepPlayer - Si debe mantener datos del jugador
     */
    reset(keepPlayer = false) {
        const defaultState = this.getDefaultState();

        if (keepPlayer && this.state.player) {
            defaultState.player = { ...this.state.player };
        }

        this.state = defaultState;
        this.persist();
        this.notifySubscribers('*', this.state, null);
    }

    /**
     * Agrega el estado actual al historial
     * @private
     */
    addToHistory() {
        const snapshot = {
            state: JSON.parse(JSON.stringify(this.state)),
            timestamp: Date.now()
        };

        this.history.push(snapshot);

        // Limitar tamaño del historial
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Restaura un estado anterior del historial
     * @param {number} index - Índice en el historial (-1 = último)
     */
    restore(index = -1) {
        const actualIndex = index < 0 ? this.history.length + index : index;
        const snapshot = this.history[actualIndex];

        if (!snapshot) {
            console.warn('No snapshot found at index:', index);
            return false;
        }

        this.state = JSON.parse(JSON.stringify(snapshot.state));
        this.persist();
        this.notifySubscribers('*', this.state, null);
        return true;
    }

    /**
     * Obtiene el historial de estados
     * @param {number} limit - Límite de resultados
     * @returns {Array}
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * Exporta el estado completo a JSON
     * @returns {string}
     */
    export() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Importa un estado desde JSON
     * @param {string} json - Estado serializado
     */
    import(json) {
        try {
            const imported = JSON.parse(json);
            this.state = imported;
            this.persist();
            this.notifySubscribers('*', this.state, null);
            return true;
        } catch (error) {
            console.error('Error importing state:', error);
            return false;
        }
    }

    /**
     * Imprime estadísticas del StateManager
     */
    debug() {
        console.group('🗄️ StateManager Debug');
        console.log('Current State:', this.state);
        console.log('Subscribers:', this.subscribers.size);
        console.log('History Length:', this.history.length);

        this.subscribers.forEach((callbacks, path) => {
            console.log(`  "${path}": ${callbacks.size} subscriber(s)`);
        });

        console.groupEnd();
    }

    /**
     * Valida la integridad del estado
     * @returns {Object} - Resultado de validación
     */
    validate() {
        const errors = [];

        // Validar estructura player
        if (!this.state.player) {
            errors.push('Missing player object');
        } else {
            if (typeof this.state.player.level !== 'number') {
                errors.push('player.level must be a number');
            }
            if (typeof this.state.player.xp !== 'number') {
                errors.push('player.xp must be a number');
            }
            if (!this.state.player.tableMastery) {
                errors.push('Missing player.tableMastery');
            }
        }

        // Validar gameState
        if (!this.state.gameState) {
            errors.push('Missing gameState object');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Crea un middleware para sincronizar valores antiguos con StateManager
 * Útil para migración gradual desde window.* globals
 */
class StateMigrationHelper {
    /**
     * Sincroniza un objeto legacy con StateManager
     * @param {Object} legacyObject - Objeto a sincronizar
     * @param {string} statePath - Path en StateManager
     * @param {StateManager} stateManager - Instancia de StateManager
     */
    static syncObject(legacyObject, statePath, stateManager) {
        // Copiar valores iniciales
        Object.keys(legacyObject).forEach(key => {
            const value = legacyObject[key];
            stateManager.set(`${statePath}.${key}`, value, false);
        });

        // Crear proxy para sincronización bidireccional
        return new Proxy(legacyObject, {
            set(target, property, value) {
                target[property] = value;
                stateManager.set(`${statePath}.${property}`, value);
                return true;
            },
            get(target, property) {
                // Obtener del StateManager como fuente de verdad
                const stateValue = stateManager.get(`${statePath}.${property}`);
                return stateValue !== undefined ? stateValue : target[property];
            }
        });
    }
}

// ================================
// SINGLETON INSTANCE
// ================================

const stateManager = StateManager.getInstance();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StateManager, StateMigrationHelper, stateManager };
} else {
    window.StateManager = StateManager;
    window.StateMigrationHelper = StateMigrationHelper;
    window.stateManager = stateManager;
}
