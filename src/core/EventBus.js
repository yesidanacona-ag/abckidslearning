// ================================
// EVENT BUS
// Sistema Pub/Sub para comunicación desacoplada entre módulos
// ================================

class EventBus {
    constructor() {
        // Map de evento → Set de handlers
        this.events = new Map();

        // Logging de eventos (útil para debugging)
        this.debug = false;

        // Historial de eventos (últimos 50)
        this.history = [];
        this.maxHistorySize = 50;
    }

    /**
     * Suscribe un handler a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función a ejecutar
     * @param {Object} options - Opciones { once: boolean, priority: number }
     * @returns {Function} Función para desuscribirse
     */
    on(event, handler, options = {}) {
        if (typeof handler !== 'function') {
            console.error('❌ Handler debe ser una función');
            return () => {};
        }

        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        // Wrapper del handler con opciones
        const wrappedHandler = {
            fn: handler,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null
        };

        this.events.get(event).add(wrappedHandler);

        if (this.debug) {
            console.log(`📡 Suscrito a '${event}'`, { handler: handler.name, options });
        }

        // Retornar función de desuscripción
        return () => this.off(event, handler);
    }

    /**
     * Suscribe un handler que se ejecuta solo una vez
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función a ejecutar
     * @returns {Function} Función para desuscribirse
     */
    once(event, handler) {
        return this.on(event, handler, { once: true });
    }

    /**
     * Desuscribe un handler de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función a desuscribir
     */
    off(event, handler) {
        if (!this.events.has(event)) {
            return;
        }

        const handlers = this.events.get(event);

        // Buscar y eliminar el handler
        for (const wrappedHandler of handlers) {
            if (wrappedHandler.fn === handler) {
                handlers.delete(wrappedHandler);

                if (this.debug) {
                    console.log(`📡 Desuscrito de '${event}'`, { handler: handler.name });
                }

                break;
            }
        }

        // Limpiar si no quedan handlers
        if (handlers.size === 0) {
            this.events.delete(event);
        }
    }

    /**
     * Desuscribe todos los handlers de un evento
     * @param {string} event - Nombre del evento
     */
    offAll(event) {
        if (this.events.has(event)) {
            this.events.delete(event);

            if (this.debug) {
                console.log(`📡 Eliminados todos los handlers de '${event}'`);
            }
        }
    }

    /**
     * Emite un evento con datos
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a pasar a los handlers
     * @returns {boolean} true si se ejecutó al menos un handler
     */
    emit(event, data = null) {
        if (!this.events.has(event)) {
            if (this.debug) {
                console.log(`📡 Sin handlers para '${event}'`);
            }
            return false;
        }

        const handlers = Array.from(this.events.get(event));

        // Ordenar por prioridad (mayor primero)
        handlers.sort((a, b) => b.priority - a.priority);

        // Registrar en historial
        this.addToHistory(event, data);

        if (this.debug) {
            console.log(`📡 Emitiendo '${event}'`, { handlers: handlers.length, data });
        }

        let executed = 0;

        handlers.forEach(wrappedHandler => {
            try {
                // Ejecutar handler con contexto si existe
                if (wrappedHandler.context) {
                    wrappedHandler.fn.call(wrappedHandler.context, data);
                } else {
                    wrappedHandler.fn(data);
                }

                executed++;

                // Si es 'once', desuscribir después de ejecutar
                if (wrappedHandler.once) {
                    this.off(event, wrappedHandler.fn);
                }
            } catch (error) {
                console.error(`❌ Error en handler de '${event}':`, error);
            }
        });

        return executed > 0;
    }

    /**
     * Emite un evento de forma asíncrona
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a pasar a los handlers
     * @returns {Promise<boolean>}
     */
    async emitAsync(event, data = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.emit(event, data);
                resolve(result);
            }, 0);
        });
    }

    /**
     * Espera a que un evento ocurra
     * @param {string} event - Nombre del evento
     * @param {number} timeout - Timeout en ms (0 = sin timeout)
     * @returns {Promise} Promesa que se resuelve con los datos del evento
     */
    waitFor(event, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId;

            const handler = (data) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(data);
            };

            this.once(event, handler);

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    this.off(event, handler);
                    reject(new Error(`Timeout esperando evento '${event}'`));
                }, timeout);
            }
        });
    }

    /**
     * Agrega un evento al historial
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos del evento
     */
    addToHistory(event, data) {
        this.history.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Mantener solo los últimos N eventos
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Obtiene el historial de eventos
     * @param {string} event - Filtrar por nombre de evento (opcional)
     * @returns {Array} Array de eventos
     */
    getHistory(event = null) {
        if (event) {
            return this.history.filter(item => item.event === event);
        }
        return [...this.history];
    }

    /**
     * Limpia el historial de eventos
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Obtiene todos los eventos registrados
     * @returns {string[]} Array de nombres de eventos
     */
    getEvents() {
        return Array.from(this.events.keys());
    }

    /**
     * Obtiene el número de handlers para un evento
     * @param {string} event - Nombre del evento
     * @returns {number} Número de handlers
     */
    getHandlerCount(event) {
        return this.events.has(event) ? this.events.get(event).size : 0;
    }

    /**
     * Habilita/deshabilita modo debug
     * @param {boolean} enabled - true para habilitar
     */
    setDebug(enabled) {
        this.debug = enabled;
        console.log(`📡 EventBus debug: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Limpia todos los eventos y handlers
     */
    clear() {
        this.events.clear();
        this.history = [];

        if (this.debug) {
            console.log('📡 EventBus limpiado');
        }
    }
}

// Exportar como global para compatibilidad con arquitectura actual
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
}
