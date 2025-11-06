// ================================
// STORAGE SERVICE
// Abstrae localStorage con seguridad y utilidades
// ================================

/**
 * StorageService proporciona una capa de abstracción sobre localStorage
 * con manejo de errores, versionado y compresión opcional.
 *
 * @class StorageService
 * @example
 * const storage = new StorageService('myApp');
 * storage.set('user', { name: 'Alice', age: 25 });
 * const user = storage.get('user');
 */
class StorageService {
    constructor(namespace = 'multiplicationGame', options = {}) {
        this.namespace = namespace;
        this.version = options.version || '1.0';
        this.compress = options.compress || false;
        this.encrypt = options.encrypt || false;

        /** @type {Storage} Backend de almacenamiento (localStorage por defecto) */
        this.storage = options.storage || localStorage;

        // Verificar disponibilidad de localStorage
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Verifica si localStorage está disponible
     * @private
     * @returns {boolean}
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            this.storage.setItem(test, test);
            this.storage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    /**
     * Genera la clave completa con namespace
     * @private
     */
    getKey(key) {
        return `${this.namespace}_${key}`;
    }

    /**
     * Guarda un valor en localStorage
     * @param {string} key - Clave
     * @param {*} value - Valor a guardar
     * @param {Object} options - Opciones adicionales
     * @returns {boolean} - true si tuvo éxito
     */
    set(key, value, options = {}) {
        if (!this.isAvailable) {
            console.warn('Storage not available');
            return false;
        }

        try {
            const data = {
                value: value,
                timestamp: Date.now(),
                version: this.version,
                ...(options.ttl && { expiresAt: Date.now() + options.ttl })
            };

            const serialized = JSON.stringify(data);
            const finalValue = this.compress ? this.compressData(serialized) : serialized;

            this.storage.setItem(this.getKey(key), finalValue);
            return true;
        } catch (error) {
            console.error(`Error saving to storage [${key}]:`, error);

            // Si es error de cuota, intentar limpiar
            if (error.name === 'QuotaExceededError') {
                this.clearExpired();
                // Reintentar una vez
                try {
                    const data = { value, timestamp: Date.now(), version: this.version };
                    this.storage.setItem(this.getKey(key), JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Retry failed:', retryError);
                }
            }

            return false;
        }
    }

    /**
     * Obtiene un valor de localStorage
     * @param {string} key - Clave
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const item = this.storage.getItem(this.getKey(key));

            if (!item) {
                return defaultValue;
            }

            const decompressed = this.compress ? this.decompressData(item) : item;
            const data = JSON.parse(decompressed);

            // Verificar expiración
            if (data.expiresAt && Date.now() > data.expiresAt) {
                this.remove(key);
                return defaultValue;
            }

            // Verificar versión
            if (data.version !== this.version) {
                console.warn(`Version mismatch for ${key}: ${data.version} vs ${this.version}`);
                // Podría ejecutar migración aquí
            }

            return data.value;
        } catch (error) {
            console.error(`Error reading from storage [${key}]:`, error);
            return defaultValue;
        }
    }

    /**
     * Elimina un valor de localStorage
     * @param {string} key
     * @returns {boolean}
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            this.storage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error(`Error removing from storage [${key}]:`, error);
            return false;
        }
    }

    /**
     * Verifica si existe una clave
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Limpia todos los datos del namespace
     */
    clear() {
        if (!this.isAvailable) return;

        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.storage.removeItem(key));
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Obtiene todas las claves del namespace
     * @returns {string[]}
     */
    getAllKeys() {
        if (!this.isAvailable) return [];

        const keys = [];
        const prefix = `${this.namespace}_`;

        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }

        return keys;
    }

    /**
     * Obtiene todos los pares clave-valor del namespace
     * @returns {Object}
     */
    getAll() {
        if (!this.isAvailable) return {};

        const data = {};
        const keys = this.getAllKeys();

        keys.forEach(fullKey => {
            const key = fullKey.replace(`${this.namespace}_`, '');
            data[key] = this.get(key);
        });

        return data;
    }

    /**
     * Limpia entradas expiradas
     * @returns {number} - Cantidad de items eliminados
     */
    clearExpired() {
        if (!this.isAvailable) return 0;

        let count = 0;
        const keys = this.getAllKeys();

        keys.forEach(fullKey => {
            try {
                const item = this.storage.getItem(fullKey);
                if (item) {
                    const data = JSON.parse(item);
                    if (data.expiresAt && Date.now() > data.expiresAt) {
                        this.storage.removeItem(fullKey);
                        count++;
                    }
                }
            } catch (error) {
                // Si no se puede parsear, probablemente está corrupto - eliminar
                this.storage.removeItem(fullKey);
                count++;
            }
        });

        return count;
    }

    /**
     * Obtiene el tamaño usado en bytes (aproximado)
     * @returns {number}
     */
    getSize() {
        if (!this.isAvailable) return 0;

        let size = 0;
        const keys = this.getAllKeys();

        keys.forEach(key => {
            const item = this.storage.getItem(key);
            if (item) {
                size += item.length + key.length;
            }
        });

        return size;
    }

    /**
     * Exporta todos los datos a JSON
     * @returns {string}
     */
    export() {
        const data = this.getAll();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa datos desde JSON
     * @param {string} json
     * @returns {boolean}
     */
    import(json) {
        try {
            const data = JSON.parse(json);
            Object.entries(data).forEach(([key, value]) => {
                this.set(key, value);
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Migra datos de una versión anterior
     * @param {Function} migrationFn - Función de migración
     */
    migrate(migrationFn) {
        const data = this.getAll();
        const migrated = migrationFn(data);

        Object.entries(migrated).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * Comprime datos (implementación básica)
     * En producción usar LZ-string o similar
     * @private
     */
    compressData(data) {
        // Implementación básica - en producción usar librería
        return btoa(data);
    }

    /**
     * Descomprime datos
     * @private
     */
    decompressData(data) {
        // Implementación básica - en producción usar librería
        return atob(data);
    }

    /**
     * Debug info
     */
    debug() {
        console.group('💾 StorageService Debug');
        console.log('Namespace:', this.namespace);
        console.log('Version:', this.version);
        console.log('Available:', this.isAvailable);
        console.log('Keys:', this.getAllKeys().length);
        console.log('Size:', `${(this.getSize() / 1024).toFixed(2)} KB`);
        console.log('Data:', this.getAll());
        console.groupEnd();
    }
}

// ================================
// SPECIALIZED STORAGE SERVICES
// ================================

/**
 * Servicio especializado para guardar jugador
 */
class PlayerStorageService extends StorageService {
    constructor() {
        super('multiplicationGame', { version: '2.0' });
    }

    savePlayer(player) {
        return this.set('player', player);
    }

    loadPlayer() {
        return this.get('player', null);
    }

    updatePlayerField(field, value) {
        const player = this.loadPlayer();
        if (player) {
            player[field] = value;
            return this.savePlayer(player);
        }
        return false;
    }
}

/**
 * Servicio especializado para settings
 */
class SettingsStorageService extends StorageService {
    constructor() {
        super('multiplicationGame', { version: '1.0' });
    }

    saveSettings(settings) {
        return this.set('settings', settings);
    }

    loadSettings() {
        return this.get('settings', {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'medium',
            theme: 'default'
        });
    }

    updateSetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }
}

/**
 * Cache con TTL para datos temporales
 */
class CacheStorageService extends StorageService {
    constructor(ttl = 3600000) { // 1 hora por defecto
        super('multiplicationGame_cache', { version: '1.0' });
        this.defaultTTL = ttl;
    }

    setCache(key, value, ttl = this.defaultTTL) {
        return this.set(key, value, { ttl });
    }

    getCache(key, defaultValue = null) {
        return this.get(key, defaultValue);
    }

    clearCache() {
        this.clear();
    }
}

// ================================
// SINGLETON INSTANCES
// ================================

const storageService = new StorageService();
const playerStorage = new PlayerStorageService();
const settingsStorage = new SettingsStorageService();
const cacheStorage = new CacheStorageService();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageService,
        PlayerStorageService,
        SettingsStorageService,
        CacheStorageService,
        storageService,
        playerStorage,
        settingsStorage,
        cacheStorage
    };
} else {
    window.StorageService = StorageService;
    window.PlayerStorageService = PlayerStorageService;
    window.SettingsStorageService = SettingsStorageService;
    window.CacheStorageService = CacheStorageService;
    window.storageService = storageService;
    window.playerStorage = playerStorage;
    window.settingsStorage = settingsStorage;
    window.cacheStorage = cacheStorage;
}
