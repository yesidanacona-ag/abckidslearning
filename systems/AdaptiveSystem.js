// ================================
// ADAPTIVE LEARNING SYSTEM
// Sistema de aprendizaje adaptativo con seguimiento de maestría
// ================================

/**
 * AdaptiveSystem ajusta la dificultad y selección de preguntas basado
 * en el rendimiento del estudiante usando algoritmos de espaciado repetido.
 *
 * Features:
 * - Tracking de maestría por tabla (0-1)
 * - Algoritmo de espaciado repetido (Spaced Repetition)
 * - Sugerencias inteligentes de tablas a practicar
 * - Análisis de patrones de error
 * - Integración con EventBus para eventos
 *
 * @class AdaptiveSystem
 * @example
 * const adaptive = new AdaptiveSystem(player);
 * adaptive.recordAnswer(7, true, 2500); // tabla 7, correcto, 2.5s
 * const suggested = adaptive.getSuggestedTables(); // [7, 8, 9]
 */
class AdaptiveSystem {
    constructor(player, options = {}) {
        this.player = player;

        /** @type {Object} Configuración del sistema adaptativo */
        this.config = {
            masteryIncrement: options.masteryIncrement || 0.05,
            masteryDecrement: options.masteryDecrement || 0.1,
            minAttemptsForAnalysis: options.minAttemptsForAnalysis || 5,
            spacedRepetitionDays: options.spacedRepetitionDays || 1,
            masteryThreshold: options.masteryThreshold || 0.8,
            ...options
        };

        this.initTableMastery();
    }

    /**
     * Inicializa el tracking de maestría para todas las tablas
     */
    initTableMastery() {
        if (!this.player.tableMastery || Object.keys(this.player.tableMastery).length === 0) {
            this.player.tableMastery = {};

            for (let i = 1; i <= 10; i++) {
                this.player.tableMastery[i] = this.createTableData();
            }
        } else {
            // Migrar datos antiguos si es necesario
            this.migrateOldData();
        }
    }

    /**
     * Crea estructura de datos para una tabla
     * @private
     */
    createTableData() {
        return {
            attempts: 0,
            correct: 0,
            incorrect: 0,
            mastery: 0,
            lastPracticed: Date.now(),
            averageResponseTime: 0,
            fastestResponseTime: null,
            slowestResponseTime: null,
            errorPatterns: {}, // Multipliers donde más se equivoca
            streak: 0
        };
    }

    /**
     * Migra datos de versiones antiguas
     * @private
     */
    migrateOldData() {
        Object.keys(this.player.tableMastery).forEach(table => {
            const data = this.player.tableMastery[table];

            // Si es el formato antiguo (solo número), convertir
            if (typeof data === 'number') {
                this.player.tableMastery[table] = {
                    ...this.createTableData(),
                    mastery: data
                };
            }

            // Agregar campos faltantes
            const defaultData = this.createTableData();
            Object.keys(defaultData).forEach(key => {
                if (!(key in data)) {
                    data[key] = defaultData[key];
                }
            });
        });
    }

    /**
     * Registra una respuesta del usuario
     * @param {number} table - Número de tabla (1-10)
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo de respuesta en ms
     * @param {number} [multiplier] - Multiplicador usado (opcional)
     */
    recordAnswer(table, isCorrect, responseTime = 0, multiplier = null) {
        if (!this.player.tableMastery[table]) {
            this.player.tableMastery[table] = this.createTableData();
        }

        const tableData = this.player.tableMastery[table];

        // Incrementar intentos
        tableData.attempts++;
        tableData.lastPracticed = Date.now();

        // Actualizar tiempos de respuesta
        this.updateResponseTimes(tableData, responseTime);

        // Procesar respuesta
        if (isCorrect) {
            tableData.correct++;
            tableData.streak++;
            tableData.mastery = Math.min(1, tableData.mastery + this.config.masteryIncrement);

            // Bonus por racha
            if (tableData.streak >= 5) {
                tableData.mastery = Math.min(1, tableData.mastery + 0.02);
            }
        } else {
            tableData.incorrect++;
            tableData.streak = 0;
            tableData.mastery = Math.max(0, tableData.mastery - this.config.masteryDecrement);

            // Registrar patrón de error si se proporciona multiplier
            if (multiplier !== null) {
                this.recordErrorPattern(tableData, multiplier);
            }
        }

        // Ajustar maestría basada en tasa de éxito (algoritmo ponderado)
        if (tableData.attempts >= this.config.minAttemptsForAnalysis) {
            const successRate = tableData.correct / tableData.attempts;
            const timeBonus = this.getTimeBonus(tableData.averageResponseTime);

            // 70% peso maestría actual + 30% tasa de éxito + bonus de tiempo
            tableData.mastery = (tableData.mastery * 0.7) + (successRate * 0.3) + timeBonus;
            tableData.mastery = Math.max(0, Math.min(1, tableData.mastery));
        }

        // Emitir evento
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('adaptive:answerRecorded', {
                table,
                isCorrect,
                mastery: tableData.mastery,
                streak: tableData.streak
            });

            // Evento de milestone
            if (tableData.mastery >= this.config.masteryThreshold && tableData.mastery - this.config.masteryIncrement < this.config.masteryThreshold) {
                eventBus.emit('adaptive:tableMastered', { table, mastery: tableData.mastery });
            }
        }
    }

    /**
     * Actualiza estadísticas de tiempo de respuesta
     * @private
     */
    updateResponseTimes(tableData, responseTime) {
        if (responseTime <= 0) return;

        // Calcular promedio ponderado
        const totalTime = tableData.averageResponseTime * (tableData.attempts - 1);
        tableData.averageResponseTime = (totalTime + responseTime) / tableData.attempts;

        // Actualizar fastest/slowest
        if (!tableData.fastestResponseTime || responseTime < tableData.fastestResponseTime) {
            tableData.fastestResponseTime = responseTime;
        }
        if (!tableData.slowestResponseTime || responseTime > tableData.slowestResponseTime) {
            tableData.slowestResponseTime = responseTime;
        }
    }

    /**
     * Registra patrón de error para análisis
     * @private
     */
    recordErrorPattern(tableData, multiplier) {
        if (!tableData.errorPatterns) {
            tableData.errorPatterns = {};
        }

        if (!tableData.errorPatterns[multiplier]) {
            tableData.errorPatterns[multiplier] = 0;
        }

        tableData.errorPatterns[multiplier]++;
    }

    /**
     * Calcula bonus de tiempo de respuesta
     * @private
     */
    getTimeBonus(avgTime) {
        // Respuestas rápidas (<3s) dan bonus, lentas (>10s) penalizan
        if (avgTime === 0) return 0;
        if (avgTime < 3000) return 0.02;
        if (avgTime < 5000) return 0.01;
        if (avgTime > 10000) return -0.01;
        return 0;
    }

    /**
     * Obtiene la maestría de una tabla específica
     * @param {number} table - Número de tabla
     * @returns {number} - Valor entre 0 y 1
     */
    getTableMastery(table) {
        return this.player.tableMastery[table]?.mastery || 0;
    }

    /**
     * Obtiene datos completos de una tabla
     * @param {number} table
     * @returns {Object}
     */
    getTableData(table) {
        return this.player.tableMastery[table] || this.createTableData();
    }

    /**
     * Obtiene tablas sugeridas basadas en espaciado repetido y maestría
     * @param {number} count - Cantidad de tablas a devolver
     * @returns {number[]}
     */
    getSuggestedTables(count = 3) {
        const scored = [];

        for (let table = 1; table <= 10; table++) {
            const data = this.getTableData(table);
            const mastery = data.mastery;
            const daysSinceLastPractice = (Date.now() - data.lastPracticed) / (1000 * 60 * 60 * 24);

            // Algoritmo de scoring ponderado
            let score = 0;

            // Factor 1: Baja maestría (0-1 invertido)
            score += (1 - mastery) * 40;

            // Factor 2: Tiempo sin practicar (espaciado repetido)
            if (daysSinceLastPractice > this.config.spacedRepetitionDays) {
                score += Math.min(daysSinceLastPractice * 10, 30);
            }

            // Factor 3: Racha perdida (tablas con racha anterior que se rompió)
            if (data.streak === 0 && data.attempts > 0) {
                score += 10;
            }

            // Factor 4: Errores recientes
            const errorRate = data.attempts > 0 ? data.incorrect / data.attempts : 0;
            score += errorRate * 20;

            scored.push({ table, score, mastery });
        }

        // Ordenar por score descendente
        scored.sort((a, b) => b.score - a.score);

        // Devolver top 'count' tablas
        return scored.slice(0, count).map(item => item.table);
    }

    /**
     * Obtiene pesos relativos para tablas (para generación de preguntas)
     * @param {number[]} tables - Array de tablas
     * @returns {number[]} - Array de pesos
     */
    getTableWeights(tables) {
        return tables.map(table => {
            const mastery = this.getTableMastery(table);
            // Peso inversamente proporcional a maestría (min 0.1)
            return Math.max(0.1, 1 - mastery);
        });
    }

    /**
     * Obtiene multiplicadores problemáticos para una tabla
     * @param {number} table
     * @param {number} limit
     * @returns {number[]}
     */
    getProblematicMultipliers(table, limit = 3) {
        const data = this.getTableData(table);

        if (!data.errorPatterns || Object.keys(data.errorPatterns).length === 0) {
            return [];
        }

        // Ordenar por cantidad de errores
        const sorted = Object.entries(data.errorPatterns)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([multiplier]) => parseInt(multiplier));

        return sorted;
    }

    /**
     * Genera reporte de progreso del estudiante
     * @returns {Object}
     */
    generateProgressReport() {
        const report = {
            overallMastery: 0,
            totalAttempts: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            masteredTables: [],
            weakTables: [],
            needsPractice: [],
            averageResponseTime: 0,
            tableDetails: {}
        };

        let totalMastery = 0;
        let totalAvgTime = 0;
        let tablesWithTime = 0;

        for (let table = 1; table <= 10; table++) {
            const data = this.getTableData(table);

            totalMastery += data.mastery;
            report.totalAttempts += data.attempts;
            report.totalCorrect += data.correct;
            report.totalIncorrect += data.incorrect;

            if (data.averageResponseTime > 0) {
                totalAvgTime += data.averageResponseTime;
                tablesWithTime++;
            }

            // Clasificar tabla
            if (data.mastery >= this.config.masteryThreshold) {
                report.masteredTables.push(table);
            } else if (data.mastery < 0.5) {
                report.weakTables.push(table);
            }

            const daysSince = (Date.now() - data.lastPracticed) / (1000 * 60 * 60 * 24);
            if (daysSince > this.config.spacedRepetitionDays) {
                report.needsPractice.push(table);
            }

            // Detalles por tabla
            report.tableDetails[table] = {
                mastery: data.mastery,
                attempts: data.attempts,
                successRate: data.attempts > 0 ? (data.correct / data.attempts) : 0,
                averageTime: data.averageResponseTime,
                streak: data.streak,
                problematicMultipliers: this.getProblematicMultipliers(table)
            };
        }

        report.overallMastery = totalMastery / 10;
        report.averageResponseTime = tablesWithTime > 0 ? totalAvgTime / tablesWithTime : 0;

        return report;
    }

    /**
     * Resetea datos de una tabla específica
     * @param {number} table
     */
    resetTable(table) {
        if (this.player.tableMastery[table]) {
            this.player.tableMastery[table] = this.createTableData();
        }
    }

    /**
     * Resetea todos los datos de maestría
     */
    resetAll() {
        this.player.tableMastery = {};
        this.initTableMastery();
    }

    /**
     * Debug info
     */
    debug() {
        console.group('🧠 AdaptiveSystem Debug');
        console.log('Player:', this.player.name);

        const report = this.generateProgressReport();
        console.log('Overall Mastery:', `${(report.overallMastery * 100).toFixed(1)}%`);
        console.log('Mastered Tables:', report.masteredTables);
        console.log('Weak Tables:', report.weakTables);
        console.log('Suggested Next:', this.getSuggestedTables(3));

        console.table(report.tableDetails);
        console.groupEnd();
    }
}

// ================================
// ADAPTIVE STRATEGIES
// ================================

/**
 * Estrategias adaptativas especializadas
 */
class AdaptiveStrategies {
    /**
     * Estrategia para principiantes (primeros 100 intentos)
     * @static
     */
    static beginner(adaptiveSystem) {
        const report = adaptiveSystem.generateProgressReport();

        if (report.totalAttempts < 100) {
            // Enfocarse en tablas fáciles (2, 3, 5, 10)
            return [2, 3, 5, 10];
        }

        return adaptiveSystem.getSuggestedTables();
    }

    /**
     * Estrategia de revisión rápida
     * @static
     */
    static quickReview(adaptiveSystem) {
        // Priorizar tablas con >70% maestría pero sin practicar recientemente
        const tables = [];

        for (let i = 1; i <= 10; i++) {
            const data = adaptiveSystem.getTableData(i);
            const daysSince = (Date.now() - data.lastPracticed) / (1000 * 60 * 60 * 24);

            if (data.mastery > 0.7 && daysSince > 2) {
                tables.push(i);
            }
        }

        return tables.length > 0 ? tables : adaptiveSystem.getSuggestedTables();
    }

    /**
     * Estrategia de enfoque intensivo
     * @static
     */
    static intensiveFocus(adaptiveSystem) {
        // Solo la tabla más débil
        const suggested = adaptiveSystem.getSuggestedTables(1);
        return suggested;
    }
}

// ================================
// EXPORTS
// ================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdaptiveSystem, AdaptiveStrategies };
} else {
    window.AdaptiveSystem = AdaptiveSystem;
    window.AdaptiveStrategies = AdaptiveStrategies;
}
