// ================================
// STORAGE MANAGER
// Abstracción de localStorage con manejo de errores robusto
// ================================

class StorageManager {
    constructor(prefix = 'mm_') {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
        this.cache = new Map(); // In-memory cache como fallback
    }

    /**
     * Verifica si localStorage está disponible
     */
    checkAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage no disponible, usando cache en memoria');
            return false;
        }
    }

    /**
     * Obtiene un valor del storage
     * @param {string} key - Clave a recuperar
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} Valor parseado o defaultValue
     */
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;

        try {
            if (this.isAvailable) {
                const item = localStorage.getItem(fullKey);
                if (item === null) return defaultValue;
                return JSON.parse(item);
            } else {
                // Fallback a cache en memoria
                return this.cache.has(fullKey) ? this.cache.get(fullKey) : defaultValue;
            }
        } catch (error) {
            console.error(`❌ Error al leer '${key}':`, error);
            return defaultValue;
        }
    }

    /**
     * Guarda un valor en el storage
     * @param {string} key - Clave
     * @param {*} value - Valor a guardar (será serializado a JSON)
     * @returns {boolean} true si se guardó correctamente
     */
    set(key, value) {
        const fullKey = this.prefix + key;

        try {
            const serialized = JSON.stringify(value);

            if (this.isAvailable) {
                localStorage.setItem(fullKey, serialized);
            } else {
                // Fallback a cache en memoria
                this.cache.set(fullKey, value);
            }

            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ Cuota de storage excedida');
                this.handleQuotaExceeded();
            } else {
                console.error(`❌ Error al guardar '${key}':`, error);
            }
            return false;
        }
    }

    /**
     * Elimina un valor del storage
     * @param {string} key - Clave a eliminar
     */
    remove(key) {
        const fullKey = this.prefix + key;

        try {
            if (this.isAvailable) {
                localStorage.removeItem(fullKey);
            } else {
                this.cache.delete(fullKey);
            }
        } catch (error) {
            console.error(`❌ Error al eliminar '${key}':`, error);
        }
    }

    /**
     * Limpia todas las claves con el prefijo actual
     */
    clear() {
        try {
            if (this.isAvailable) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            } else {
                // Limpiar cache en memoria
                for (const key of this.cache.keys()) {
                    if (key.startsWith(this.prefix)) {
                        this.cache.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al limpiar storage:', error);
        }
    }

    /**
     * Obtiene todas las claves con el prefijo actual
     * @returns {string[]} Array de claves (sin prefijo)
     */
    keys() {
        const keys = [];

        try {
            if (this.isAvailable) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key.substring(this.prefix.length));
                    }
                }
            } else {
                for (const key of this.cache.keys()) {
                    if (key.startsWith(this.prefix)) {
                        keys.push(key.substring(this.prefix.length));
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al obtener claves:', error);
        }

        return keys;
    }

    /**
     * Verifica si existe una clave
     * @param {string} key - Clave a verificar
     * @returns {boolean}
     */
    has(key) {
        const fullKey = this.prefix + key;

        try {
            if (this.isAvailable) {
                return localStorage.getItem(fullKey) !== null;
            } else {
                return this.cache.has(fullKey);
            }
        } catch (error) {
            console.error(`❌ Error al verificar '${key}':`, error);
            return false;
        }
    }

    /**
     * Obtiene el tamaño aproximado en bytes del storage
     * @returns {number} Tamaño en bytes
     */
    getSize() {
        let size = 0;

        try {
            if (this.isAvailable) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const value = localStorage.getItem(key);
                        size += key.length + (value ? value.length : 0);
                    }
                }
            } else {
                for (const [key, value] of this.cache) {
                    if (key.startsWith(this.prefix)) {
                        size += key.length + JSON.stringify(value).length;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al calcular tamaño:', error);
        }

        return size;
    }

    /**
     * Maneja el error de cuota excedida
     * Intenta liberar espacio eliminando datos antiguos
     */
    handleQuotaExceeded() {
        console.warn('⚠️ Intentando liberar espacio en storage...');

        // Estrategia: eliminar datos de caché que no sean críticos
        // En este caso, podríamos eliminar datos de analytics, logs, etc.
        // Por ahora solo alertamos al usuario

        if (typeof window !== 'undefined' && window.app) {
            window.app.showNotification('Espacio de almacenamiento limitado. Considera limpiar datos antiguos.', 'warning');
        }
    }

    /**
     * Exporta todos los datos con el prefijo actual
     * @returns {Object} Objeto con todas las claves y valores
     */
    export() {
        const data = {};
        const keys = this.keys();

        keys.forEach(key => {
            data[key] = this.get(key);
        });

        return data;
    }

    /**
     * Importa datos desde un objeto
     * @param {Object} data - Objeto con claves y valores
     * @param {boolean} overwrite - Si debe sobrescribir datos existentes
     */
    import(data, overwrite = false) {
        Object.entries(data).forEach(([key, value]) => {
            if (overwrite || !this.has(key)) {
                this.set(key, value);
            }
        });
    }
}

// Exportar como global para compatibilidad con arquitectura actual
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
