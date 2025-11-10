// ================================
// ADAPTIVE SERVICE
// Sistema adaptativo de aprendizaje con espaciado repetitivo
// ================================

class AdaptiveService {
    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;

        // Inicializar maestría de tablas si no existe
        this.initTableMastery();

        // Escuchar respuestas para actualizar maestría
        if (this.eventBus) {
            this.eventBus.on('game:answer:correct', (data) => {
                if (data.question && data.question.table) {
                    this.recordAnswer(data.question.table, true, data.responseTime);
                }
            });

            this.eventBus.on('game:answer:wrong', (data) => {
                if (data.question && data.question.table) {
                    this.recordAnswer(data.question.table, false, data.responseTime);
                }
            });
        }
    }

    /**
     * Inicializa maestría de tablas si no existe
     */
    initTableMastery() {
        const tableMastery = this.store.getState().tableMastery;

        // Verificar si ya están inicializadas
        if (Object.keys(tableMastery).length > 0) {
            return;
        }

        // Inicializar tablas 2-10
        for (let i = 2; i <= 10; i++) {
            this.store.updateTableMastery(i, {
                mastery: 0,
                attempts: 0,
                correct: 0,
                incorrect: 0,
                lastPracticed: null,
                streak: 0
            });
        }
    }

    /**
     * Registra una respuesta y actualiza maestría
     * @param {number} table - Tabla (1-10)
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo de respuesta en ms
     */
    recordAnswer(table, isCorrect, responseTime = 0) {
        const tableMastery = this.store.getState().tableMastery;
        const tableData = tableMastery[table] || {
            mastery: 0,
            attempts: 0,
            correct: 0,
            incorrect: 0,
            lastPracticed: null,
            streak: 0
        };

        // Actualizar contadores
        const updates = {
            attempts: tableData.attempts + 1,
            correct: tableData.correct + (isCorrect ? 1 : 0),
            incorrect: tableData.incorrect + (isCorrect ? 0 : 1),
            streak: isCorrect ? (tableData.streak || 0) + 1 : 0
        };

        // Calcular nueva maestría
        updates.mastery = this.calculateMastery(tableData, isCorrect, responseTime);

        // Actualizar en el store
        this.store.updateTableMastery(table, updates);

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('adaptive:mastery:updated', {
                table,
                mastery: updates.mastery,
                isCorrect
            });
        }
    }

    /**
     * Calcula nueva maestría basada en rendimiento
     * @param {Object} tableData - Datos actuales de la tabla
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo de respuesta
     * @returns {number} Nueva maestría (0-100)
     */
    calculateMastery(tableData, isCorrect, responseTime) {
        let mastery = tableData.mastery || 0;

        if (isCorrect) {
            // Incremento basado en racha
            const streakBonus = Math.min(tableData.streak || 0, 5) * 0.5;
            mastery += 5 + streakBonus;

            // Bonus por velocidad (si responde en menos de 3 segundos)
            if (responseTime > 0 && responseTime < 3000) {
                mastery += 2;
            }
        } else {
            // Penalización por error
            mastery -= 10;
        }

        // Ajustar basado en tasa de éxito global
        if (tableData.attempts >= 5) {
            const successRate = tableData.correct / tableData.attempts;
            // Combinar maestría actual con tasa de éxito
            mastery = (mastery * 0.7) + (successRate * 100 * 0.3);
        }

        // Limitar entre 0-100
        return Math.max(0, Math.min(100, mastery));
    }

    /**
     * Obtiene maestría de una tabla
     * @param {number} table - Tabla (1-10)
     * @returns {number} Maestría (0-100)
     */
    getTableMastery(table) {
        const tableMastery = this.store.getState().tableMastery;
        return tableMastery[table]?.mastery || 0;
    }

    /**
     * Obtiene tablas sugeridas para practicar (algoritmo de espaciado)
     * @param {number} count - Número de tablas a sugerir
     * @returns {Array} Array de tablas sugeridas
     */
    getSuggestedTables(count = 3) {
        const tableMastery = this.store.getState().tableMastery;
        const now = Date.now();
        const suggestions = [];

        for (let i = 2; i <= 10; i++) {
            const data = tableMastery[i] || { mastery: 0, lastPracticed: null };

            // Calcular prioridad basada en:
            // 1. Maestría baja = más prioridad
            // 2. Tiempo sin practicar = más prioridad
            const masteryFactor = 1 - (data.mastery / 100);

            let timeFactor = 0;
            if (data.lastPracticed) {
                const daysSince = (now - data.lastPracticed) / (1000 * 60 * 60 * 24);
                timeFactor = Math.min(daysSince / 7, 1); // Max 1 semana
            } else {
                timeFactor = 1; // Nunca practicado = máxima prioridad
            }

            const priority = (masteryFactor * 0.7) + (timeFactor * 0.3);

            suggestions.push({ table: i, priority });
        }

        // Ordenar por prioridad y tomar las top N
        suggestions.sort((a, b) => b.priority - a.priority);

        return suggestions.slice(0, count).map(s => s.table);
    }

    /**
     * Obtiene pesos para selección aleatoria ponderada
     * @param {Array} tables - Array de tablas
     * @returns {Array} Array de pesos
     */
    getTableWeights(tables) {
        return tables.map(table => {
            const mastery = this.getTableMastery(table);
            // Más peso a tablas con menos maestría
            return Math.max(0.1, 1 - (mastery / 100));
        });
    }

    /**
     * Obtiene siguiente pregunta adaptativa
     * @param {Array} tables - Tablas disponibles
     * @returns {number} Tabla seleccionada
     */
    getNextTable(tables) {
        if (!tables || tables.length === 0) {
            return 2; // Default
        }

        const weights = this.getTableWeights(tables);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < tables.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return tables[i];
            }
        }

        return tables[tables.length - 1];
    }

    /**
     * Obtiene nivel de dificultad recomendado para una tabla
     * @param {number} table - Tabla
     * @returns {number} Dificultad (0-1)
     */
    getRecommendedDifficulty(table) {
        const mastery = this.getTableMastery(table);

        // Dificultad inversamente proporcional a maestría
        if (mastery < 20) return 0.2; // Muy fácil
        if (mastery < 40) return 0.4; // Fácil
        if (mastery < 60) return 0.6; // Medio
        if (mastery < 80) return 0.8; // Difícil
        return 1.0; // Muy difícil
    }

    /**
     * Determina si una tabla necesita repaso urgente
     * @param {number} table - Tabla
     * @returns {boolean} true si necesita repaso urgente
     */
    needsUrgentReview(table) {
        const tableMastery = this.store.getState().tableMastery;
        const data = tableMastery[table];

        if (!data) return true; // Nunca practicada

        // Maestría baja
        if (data.mastery < 30) return true;

        // Mucho tiempo sin practicar
        if (data.lastPracticed) {
            const daysSince = (Date.now() - data.lastPracticed) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) return true; // Más de una semana
        }

        return false;
    }

    /**
     * Obtiene tablas que necesitan repaso urgente
     * @returns {Array} Array de tablas
     */
    getTablesNeedingReview() {
        const tables = [];
        for (let i = 2; i <= 10; i++) {
            if (this.needsUrgentReview(i)) {
                tables.push(i);
            }
        }
        return tables;
    }

    /**
     * Obtiene estadísticas generales del sistema adaptativo
     * @returns {Object} Stats object
     */
    getStats() {
        const tableMastery = this.store.getState().tableMastery;

        let totalMastery = 0;
        let totalAttempts = 0;
        let totalCorrect = 0;
        let masteredTables = 0;

        for (let i = 2; i <= 10; i++) {
            const data = tableMastery[i] || {};
            totalMastery += data.mastery || 0;
            totalAttempts += data.attempts || 0;
            totalCorrect += data.correct || 0;

            if ((data.mastery || 0) >= 90) {
                masteredTables++;
            }
        }

        const avgMastery = totalMastery / 9; // 9 tablas (2-10)
        const globalAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        return {
            averageMastery: Math.round(avgMastery),
            globalAccuracy: Math.round(globalAccuracy),
            masteredTables,
            totalAttempts,
            tablesNeedingReview: this.getTablesNeedingReview().length
        };
    }

    /**
     * Obtiene detalles de una tabla específica
     * @param {number} table - Tabla
     * @returns {Object} Detalles completos
     */
    getTableDetails(table) {
        const tableMastery = this.store.getState().tableMastery;
        const data = tableMastery[table] || {};

        const accuracy = data.attempts > 0 ? (data.correct / data.attempts) * 100 : 0;
        const difficulty = this.getRecommendedDifficulty(table);
        const needsReview = this.needsUrgentReview(table);

        let daysSinceLastPractice = null;
        if (data.lastPracticed) {
            daysSinceLastPractice = Math.floor(
                (Date.now() - data.lastPracticed) / (1000 * 60 * 60 * 24)
            );
        }

        return {
            table,
            mastery: Math.round(data.mastery || 0),
            attempts: data.attempts || 0,
            correct: data.correct || 0,
            incorrect: data.incorrect || 0,
            accuracy: Math.round(accuracy),
            streak: data.streak || 0,
            difficulty,
            needsReview,
            daysSinceLastPractice,
            lastPracticed: data.lastPracticed
        };
    }

    /**
     * Resetea maestría de una tabla (para debugging/testing)
     * @param {number} table - Tabla a resetear
     */
    resetTableMastery(table) {
        this.store.updateTableMastery(table, {
            mastery: 0,
            attempts: 0,
            correct: 0,
            incorrect: 0,
            lastPracticed: null,
            streak: 0
        });
    }

    /**
     * Resetea todas las maestrías (para testing)
     */
    resetAllMastery() {
        for (let i = 2; i <= 10; i++) {
            this.resetTableMastery(i);
        }
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.AdaptiveService = AdaptiveService;
}
