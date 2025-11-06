// ================================
// EVENT BUS - Observer Pattern
// Desacopla componentes mediante pub/sub
// ================================

/**
 * EventBus implementa el patrón Observer para comunicación desacoplada
 * entre componentes.
 *
 * @class EventBus
 * @example
 * const eventBus = new EventBus();
 *
 * // Suscribirse a un evento
 * eventBus.on('score:updated', (score) => {
 *   console.log('Nuevo score:', score);
 * });
 *
 * // Emitir un evento
 * eventBus.emit('score:updated', 100);
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this.events = new Map();

        /** @type {Map<string, Array<{event: string, handler: Function}>>} */
        this.history = new Map();

        this.maxHistorySize = 100;
    }

    /**
     * Suscribe un manejador a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     * @returns {Function} Función para desuscribirse
     */
    on(event, handler) {
        if (typeof handler !== 'function') {
            throw new TypeError('Handler must be a function');
        }

        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event).add(handler);

        // Retornar función de cleanup
        return () => this.off(event, handler);
    }

    /**
     * Suscribe un manejador que se ejecuta solo una vez
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     * @returns {Function} Función para desuscribirse
     */
    once(event, handler) {
        const wrappedHandler = (...args) => {
            handler(...args);
            this.off(event, wrappedHandler);
        };

        return this.on(event, wrappedHandler);
    }

    /**
     * Desuscribe un manejador de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     */
    off(event, handler) {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * Emite un evento a todos los suscriptores
     * @param {string} event - Nombre del evento
     * @param {...any} args - Argumentos para los manejadores
     */
    emit(event, ...args) {
        const handlers = this.events.get(event);

        if (handlers) {
            // Usar Array.from para evitar problemas si un handler se desuscribe
            Array.from(handlers).forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            });
        }

        // Guardar en historial para debugging
        this.addToHistory(event, args);
    }

    /**
     * Emite un evento de forma asíncrona
     * @param {string} event - Nombre del evento
     * @param {...any} args - Argumentos para los manejadores
     * @returns {Promise<void>}
     */
    async emitAsync(event, ...args) {
        const handlers = this.events.get(event);

        if (handlers) {
            const promises = Array.from(handlers).map(handler =>
                Promise.resolve(handler(...args))
                    .catch(error => {
                        console.error(`Error in async event handler for "${event}":`, error);
                    })
            );
            await Promise.all(promises);
        }

        this.addToHistory(event, args);
    }

    /**
     * Elimina todos los manejadores de un evento
     * @param {string} event - Nombre del evento (opcional)
     */
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    /**
     * Obtiene el número de suscriptores de un evento
     * @param {string} event - Nombre del evento
     * @returns {number}
     */
    listenerCount(event) {
        const handlers = this.events.get(event);
        return handlers ? handlers.size : 0;
    }

    /**
     * Obtiene todos los nombres de eventos activos
     * @returns {string[]}
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Agrega evento al historial para debugging
     * @private
     */
    addToHistory(event, args) {
        if (!this.history.has(event)) {
            this.history.set(event, []);
        }

        const eventHistory = this.history.get(event);
        eventHistory.push({
            timestamp: Date.now(),
            args: args
        });

        // Limitar tamaño del historial
        if (eventHistory.length > this.maxHistorySize) {
            eventHistory.shift();
        }
    }

    /**
     * Obtiene el historial de un evento
     * @param {string} event - Nombre del evento
     * @param {number} limit - Límite de resultados
     * @returns {Array}
     */
    getHistory(event, limit = 10) {
        const history = this.history.get(event) || [];
        return history.slice(-limit);
    }

    /**
     * Imprime estadísticas del EventBus
     */
    debug() {
        console.group('🔔 EventBus Debug');
        console.log('Total events:', this.events.size);
        console.log('Events:', this.eventNames());

        this.events.forEach((handlers, event) => {
            console.log(`  "${event}": ${handlers.size} listener(s)`);
        });

        console.groupEnd();
    }
}

// ================================
// EVENTOS PREDEFINIDOS
// ================================

/**
 * Eventos estándar del juego
 * @enum {string}
 */
const GameEvents = {
    // Player
    PLAYER_CREATED: 'player:created',
    PLAYER_UPDATED: 'player:updated',
    LEVEL_UP: 'player:levelUp',
    XP_GAINED: 'player:xpGained',

    // Game
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_ENDED: 'game:ended',
    SCREEN_CHANGED: 'game:screenChanged',

    // Questions
    QUESTION_GENERATED: 'question:generated',
    ANSWER_CORRECT: 'answer:correct',
    ANSWER_INCORRECT: 'answer:incorrect',
    STREAK_UPDATED: 'streak:updated',

    // Coins & Rewards
    STARS_EARNED: 'coins:starsEarned',
    TROPHIES_EARNED: 'coins:trophiesEarned',
    ITEM_PURCHASED: 'shop:itemPurchased',
    ITEM_EQUIPPED: 'shop:itemEquipped',

    // Missions
    MISSION_COMPLETED: 'mission:completed',
    MISSION_PROGRESS: 'mission:progress',

    // Fire Mode
    FIRE_MODE_ACTIVATED: 'fire:activated',
    FIRE_MODE_DEACTIVATED: 'fire:deactivated',
    MULTIPLIER_CHANGED: 'fire:multiplierChanged',

    // Boss
    BOSS_DEFEATED: 'boss:defeated',
    BOSS_DAMAGED: 'boss:damaged',
    PLAYER_DAMAGED: 'boss:playerDamaged',

    // Notifications
    NOTIFICATION_SHOW: 'notification:show',
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked'
};

// ================================
// SINGLETON INSTANCE
// ================================

const eventBus = new EventBus();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, GameEvents, eventBus };
} else {
    window.EventBus = EventBus;
    window.GameEvents = GameEvents;
    window.eventBus = eventBus;
}
