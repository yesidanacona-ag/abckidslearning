// ================================
// PLAYER SERVICE
// Gestión de jugador: CRUD, coins, stats, items
// ================================

class PlayerService {
    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;

        // Escuchar eventos relevantes
        if (this.eventBus) {
            this.eventBus.on('game:answer:correct', this.onCorrectAnswer.bind(this));
            this.eventBus.on('game:answer:wrong', this.onWrongAnswer.bind(this));
            this.eventBus.on('game:mode:ended', this.onGameEnded.bind(this));
        }
    }

    /**
     * Crea un nuevo jugador con valores iniciales
     * @param {string} name - Nombre del jugador
     * @param {string} avatar - Avatar seleccionado
     * @returns {Object} Jugador nuevo
     */
    createNewPlayer(name, avatar = '🦸') {
        return {
            name: name || '',
            avatar: avatar,
            totalStars: 0,
            totalMedals: 0,
            streak: 0,
            bestStreak: 0,
            coins: 0,
            stats: {
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                timeSpent: 0
            },
            tableMastery: {},
            achievements: [],
            medals: { gold: 0, silver: 0, bronze: 0 },
            powerups: { shield: 2, hint: 3, skip: 1 },
            activePowerups: [],
            purchasedItems: [],
            equippedItems: {},
            lastPlayed: Date.now()
        };
    }

    /**
     * Carga jugador desde el store
     * @returns {Object} Player object
     */
    getPlayer() {
        return this.store.getState().player;
    }

    /**
     * Actualiza jugador en el store
     * @param {Object} updates - Campos a actualizar
     */
    updatePlayer(updates) {
        this.store.setPlayer(updates);
    }

    /**
     * Añade monedas al jugador
     * @param {number} amount - Cantidad a añadir
     * @param {string} reason - Razón (para analytics)
     */
    addCoins(amount, reason = 'game_reward') {
        if (amount <= 0) return;

        this.store.addCoins(amount);

        // El event se emite desde GameStore
        // Aquí podríamos agregar analytics
    }

    /**
     * Gasta monedas del jugador
     * @param {number} amount - Cantidad a gastar
     * @returns {boolean} true si se pudo gastar
     */
    spendCoins(amount) {
        const player = this.getPlayer();

        if (player.coins < amount) {
            return false;
        }

        this.store.addCoins(-amount);
        return true;
    }

    /**
     * Incrementa racha del jugador
     */
    incrementStreak() {
        this.store.incrementStreak();
    }

    /**
     * Resetea racha del jugador
     */
    resetStreak() {
        this.store.resetStreak();
    }

    /**
     * Actualiza estadísticas del jugador
     * @param {Object} stats - Stats a actualizar
     */
    updateStats(stats) {
        this.store.updateStats(stats);
    }

    /**
     * Compra un item
     * @param {string} itemId - ID del item
     * @param {number} price - Precio del item
     * @returns {boolean} true si se pudo comprar
     */
    purchaseItem(itemId, price) {
        const player = this.getPlayer();

        // Verificar si ya lo tiene
        if (player.purchasedItems.includes(itemId)) {
            return false;
        }

        // Verificar monedas
        if (!this.spendCoins(price)) {
            return false;
        }

        // Agregar a items comprados
        this.store.purchaseItem(itemId);

        if (this.eventBus) {
            this.eventBus.emit('player:item:purchased', { itemId, price });
        }

        return true;
    }

    /**
     * Equipa un item
     * @param {string} type - Tipo de item (avatars, ships, weapons, cars)
     * @param {string} itemId - ID del item
     * @returns {boolean} true si se pudo equipar
     */
    equipItem(type, itemId) {
        const player = this.getPlayer();

        // Verificar que lo ha comprado (o es default)
        if (itemId && !player.purchasedItems.includes(itemId) && !this.isDefaultItem(itemId)) {
            return false;
        }

        this.store.equipItem(type, itemId);

        if (this.eventBus) {
            this.eventBus.emit('player:item:equipped', { type, itemId });
        }

        return true;
    }

    /**
     * Verifica si un item es default (disponible sin comprar)
     * @param {string} itemId - ID del item
     * @returns {boolean}
     */
    isDefaultItem(itemId) {
        // Items default gratuitos
        const defaultItems = ['🦸', '👦', '👧', '🚀', '⚔️', '🏎️'];
        return defaultItems.includes(itemId);
    }

    /**
     * Calcula la maestría global del jugador
     * @returns {number} Porcentaje de maestría (0-100)
     */
    calculateGlobalMastery() {
        const tableMastery = this.store.getState().tableMastery;
        let totalMastery = 0;
        let count = 0;

        for (let i = 2; i <= 10; i++) {
            if (tableMastery[i]) {
                totalMastery += tableMastery[i].mastery || 0;
                count++;
            }
        }

        if (count === 0) return 0;

        return Math.round(totalMastery / count);
    }

    /**
     * Obtiene items equipados
     * @returns {Object} Items equipados por tipo
     */
    getEquippedItems() {
        return this.getPlayer().equippedItems;
    }

    /**
     * Obtiene item equipado de un tipo específico
     * @param {string} type - Tipo de item
     * @returns {string|null} ID del item equipado
     */
    getEquippedItem(type) {
        return this.getPlayer().equippedItems[type] || null;
    }

    /**
     * Agrega medalla al jugador
     * @param {string} type - gold, silver, bronze
     */
    addMedal(type) {
        const player = this.getPlayer();
        const medals = { ...player.medals };

        medals[type] = (medals[type] || 0) + 1;

        this.updatePlayer({
            medals,
            totalMedals: player.totalMedals + 1
        });

        if (this.eventBus) {
            this.eventBus.emit('player:medal:earned', { type });
        }
    }

    /**
     * Usa un power-up
     * @param {string} type - shield, hint, skip
     * @returns {boolean} true si se pudo usar
     */
    usePowerup(type) {
        const player = this.getPlayer();

        if (!player.powerups[type] || player.powerups[type] <= 0) {
            return false;
        }

        const powerups = { ...player.powerups };
        powerups[type]--;

        this.updatePlayer({ powerups });

        if (this.eventBus) {
            this.eventBus.emit('player:powerup:used', { type });
        }

        return true;
    }

    /**
     * Añade power-ups al jugador
     * @param {string} type - shield, hint, skip
     * @param {number} amount - Cantidad
     */
    addPowerup(type, amount) {
        const player = this.getPlayer();
        const powerups = { ...player.powerups };

        powerups[type] = (powerups[type] || 0) + amount;

        this.updatePlayer({ powerups });
    }

    // ========================================
    // Event Handlers
    // ========================================

    onCorrectAnswer(data) {
        const player = this.getPlayer();

        // Incrementar stats
        this.updateStats({
            totalQuestions: player.stats.totalQuestions + 1,
            correctAnswers: player.stats.correctAnswers + 1
        });

        // Incrementar racha
        this.incrementStreak();

        // Calcular recompensa de monedas basada en racha
        const baseReward = 5;
        const streakBonus = Math.floor(player.streak / 3) * 2;
        const coinReward = baseReward + streakBonus;

        this.addCoins(coinReward, 'correct_answer');
    }

    onWrongAnswer(data) {
        const player = this.getPlayer();

        // Incrementar stats
        this.updateStats({
            totalQuestions: player.stats.totalQuestions + 1,
            incorrectAnswers: player.stats.incorrectAnswers + 1
        });

        // Resetear racha
        this.resetStreak();
    }

    onGameEnded(data) {
        // Actualizar tiempo jugado
        const player = this.getPlayer();
        const timeSpent = (data.endTime - data.startTime) / 1000; // segundos

        this.updateStats({
            timeSpent: player.stats.timeSpent + timeSpent
        });
    }

    /**
     * Obtiene estadísticas formateadas
     * @returns {Object} Stats legibles
     */
    getFormattedStats() {
        const player = this.getPlayer();
        const total = player.stats.correctAnswers + player.stats.incorrectAnswers;
        const accuracy = total > 0 ? Math.round((player.stats.correctAnswers / total) * 100) : 0;

        return {
            totalQuestions: player.stats.totalQuestions,
            correctAnswers: player.stats.correctAnswers,
            incorrectAnswers: player.stats.incorrectAnswers,
            accuracy: accuracy,
            bestStreak: player.bestStreak,
            timeSpent: Math.round(player.stats.timeSpent / 60), // minutos
            globalMastery: this.calculateGlobalMastery()
        };
    }

    /**
     * Actualiza el tracking granular de una tabla de multiplicar
     * @param {number} table - Número de tabla (2-10)
     * @param {Object} mastery - Objeto con datos de maestría granular
     */
    updateTableMastery(table, mastery) {
        const player = this.getPlayer();

        // Inicializar tableMastery si no existe
        if (!player.tableMastery) {
            player.tableMastery = {};
        }

        // Guardar o actualizar mastery de la tabla
        player.tableMastery[table] = mastery;

        // Actualizar player en store
        this.updatePlayer({ tableMastery: player.tableMastery });

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('player:table:mastery:updated', {
                table,
                mastery,
                timestamp: Date.now()
            });
        }

        console.log(`✓ Tabla ${table} mastery actualizada:`, mastery);
    }

    /**
     * Obtiene el tracking granular de una tabla
     * @param {number} table - Número de tabla (2-10)
     * @returns {Object|null} Datos de maestría o null si no existe
     */
    getTableMastery(table) {
        const player = this.getPlayer();
        return player.tableMastery?.[table] || null;
    }

    /**
     * Verifica si una tabla ha sido descubierta (completó modo descubrimiento)
     * @param {number} table - Número de tabla (2-10)
     * @returns {boolean} true si completó descubrimiento
     */
    isTableDiscovered(table) {
        const mastery = this.getTableMastery(table);
        return mastery?.discoveryCompleted === true;
    }

    /**
     * Añade XP (puntos de experiencia) al jugador
     * @param {number} amount - Cantidad de XP a añadir
     * @param {string} reason - Razón (para analytics)
     */
    addXP(amount, reason = 'game_reward') {
        if (amount <= 0) return;

        const player = this.getPlayer();
        const newXP = (player.xp || 0) + amount;

        this.updatePlayer({ xp: newXP });

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('player:xp:added', {
                amount,
                total: newXP,
                reason,
                timestamp: Date.now()
            });
        }

        console.log(`✓ +${amount} XP (Total: ${newXP})`);
    }

    /**
     * Obtiene multiplicadores débiles de una tabla
     * @param {number} table - Número de tabla (2-10)
     * @param {number} threshold - Threshold de maestría (default: 50%)
     * @returns {Array} Array de multiplicadores débiles
     */
    getWeakMultipliers(table, threshold = 50) {
        const mastery = this.getTableMastery(table);

        if (!mastery || !mastery.multipliers) {
            return [];
        }

        const weakMultipliers = [];

        for (let multiplier = 1; multiplier <= 10; multiplier++) {
            const data = mastery.multipliers[multiplier];
            if (data && data.mastery < threshold) {
                weakMultipliers.push({
                    multiplier,
                    mastery: data.mastery,
                    correct: data.correct,
                    total: data.total
                });
            }
        }

        // Ordenar por maestría (más débil primero)
        return weakMultipliers.sort((a, b) => a.mastery - b.mastery);
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.PlayerService = PlayerService;
}
