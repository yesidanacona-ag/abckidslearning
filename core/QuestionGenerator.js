// ================================
// QUESTION GENERATOR - Factory Pattern
// Genera preguntas de multiplicación con opciones
// ================================

/**
 * QuestionGenerator usa el patrón Factory para crear preguntas
 * de multiplicación con diferentes estrategias.
 *
 * @class QuestionGenerator
 */
class QuestionGenerator {
    constructor(config = {}) {
        this.config = {
            optionsCount: config.optionsCount || 4,
            difficultyLevel: config.difficultyLevel || 'medium',
            avoidRepeats: config.avoidRepeats !== false,
            ...config
        };

        /** @type {Set<string>} Cache de preguntas recientes para evitar repetición */
        this.recentQuestions = new Set();
        this.maxRecentQuestions = 20;
    }

    /**
     * Genera una pregunta de multiplicación
     * @param {Object} options - Opciones de generación
     * @param {number|number[]} options.tables - Tabla(s) a usar
     * @param {number} [options.multiplierMin=1] - Multiplicador mínimo
     * @param {number} [options.multiplierMax=10] - Multiplicador máximo
     * @param {string} [options.difficulty] - Dificultad: easy, medium, hard
     * @returns {Question}
     */
    generate(options = {}) {
        const {
            tables,
            multiplierMin = 1,
            multiplierMax = 10,
            difficulty = this.config.difficultyLevel
        } = options;

        // Validar entrada
        if (!tables) {
            throw new Error('Tables parameter is required');
        }

        // Normalizar tables a array
        const tablesArray = Array.isArray(tables) ? tables : [tables];

        // Seleccionar tabla aleatoria
        const table = this.randomChoice(tablesArray);

        // Seleccionar multiplicador basado en dificultad
        const multiplier = this.selectMultiplier(
            multiplierMin,
            multiplierMax,
            difficulty,
            table
        );

        // Calcular respuesta
        const answer = table * multiplier;

        // Generar opciones incorrectas
        const options_array = this.generateOptions(table, multiplier, answer);

        // Crear objeto de pregunta
        const question = {
            id: `${table}x${multiplier}`,
            table: table,
            multiplier: multiplier,
            answer: answer,
            options: options_array,
            difficulty: difficulty,
            timestamp: Date.now()
        };

        // Agregar a recientes si está habilitado
        if (this.config.avoidRepeats) {
            this.addToRecent(question.id);
        }

        return question;
    }

    /**
     * Selecciona un multiplicador basado en la dificultad
     * @private
     */
    selectMultiplier(min, max, difficulty, table) {
        // Multiplicadores difíciles según investigación pedagógica
        const hardMultipliers = [6, 7, 8, 9];
        const mediumMultipliers = [3, 4, 5, 6, 8];
        const easyMultipliers = [2, 3, 4, 5, 10];

        let multiplier;

        switch (difficulty) {
            case 'easy':
                // Priorizar multiplicadores fáciles
                if (Math.random() < 0.7) {
                    multiplier = this.randomChoice(easyMultipliers.filter(m => m >= min && m <= max));
                }
                break;

            case 'hard':
                // Priorizar multiplicadores difíciles
                if (Math.random() < 0.7) {
                    multiplier = this.randomChoice(hardMultipliers.filter(m => m >= min && m <= max));
                }
                break;

            case 'medium':
            default:
                // Balance
                if (Math.random() < 0.5) {
                    multiplier = this.randomChoice(mediumMultipliers.filter(m => m >= min && m <= max));
                }
                break;
        }

        // Fallback: random entre min y max
        if (!multiplier) {
            multiplier = this.randomInt(min, max);
        }

        return multiplier;
    }

    /**
     * Genera opciones de respuesta (correctas e incorrectas)
     * @private
     */
    generateOptions(table, multiplier, correctAnswer) {
        const options = new Set([correctAnswer]);

        // Estrategias para generar opciones incorrectas realistas
        const strategies = [
            // ±1 en multiplicador
            () => table * (multiplier + 1),
            () => table * (multiplier - 1),

            // ±1 en tabla
            () => (table + 1) * multiplier,
            () => (table - 1) * multiplier,

            // Errores comunes
            () => correctAnswer + table,
            () => correctAnswer - table,
            () => correctAnswer + 10,
            () => correctAnswer - 10,

            // Confusión con suma
            () => table + multiplier,

            // Random cercano
            () => correctAnswer + this.randomInt(-15, 15)
        ];

        // Generar opciones únicas hasta tener suficientes
        let attempts = 0;
        const maxAttempts = 50;

        while (options.size < this.config.optionsCount && attempts < maxAttempts) {
            const strategy = this.randomChoice(strategies);
            const option = strategy();

            // Validar que sea positivo y diferente de la respuesta
            if (option > 0 && option !== correctAnswer) {
                options.add(option);
            }

            attempts++;
        }

        // Si no logramos generar suficientes, rellenar con random
        while (options.size < this.config.optionsCount) {
            const random = correctAnswer + this.randomInt(-20, 20);
            if (random > 0 && random !== correctAnswer) {
                options.add(random);
            }
        }

        // Convertir a array y mezclar
        return this.shuffle(Array.from(options));
    }

    /**
     * Genera múltiples preguntas en batch
     * @param {number} count - Cantidad de preguntas
     * @param {Object} options - Opciones de generación
     * @returns {Question[]}
     */
    generateBatch(count, options = {}) {
        const questions = [];

        for (let i = 0; i < count; i++) {
            questions.push(this.generate(options));
        }

        return questions;
    }

    /**
     * Verifica si una respuesta es correcta
     * @param {Question} question - La pregunta
     * @param {number} userAnswer - Respuesta del usuario
     * @returns {boolean}
     */
    validate(question, userAnswer) {
        return question.answer === userAnswer;
    }

    /**
     * Obtiene estadísticas de dificultad de una pregunta
     * @param {Question} question - La pregunta
     * @returns {Object}
     */
    getDifficultyStats(question) {
        const { table, multiplier } = question;

        // Multiplicadores difíciles según investigación
        const isHardMultiplier = [6, 7, 8, 9].includes(multiplier);
        const isHardTable = [7, 8, 9].includes(table);

        let difficultyScore = 0;

        if (isHardTable) difficultyScore += 2;
        if (isHardMultiplier) difficultyScore += 2;
        if (table > 5) difficultyScore += 1;
        if (multiplier > 5) difficultyScore += 1;

        return {
            score: difficultyScore,
            level: difficultyScore >= 5 ? 'hard' : difficultyScore >= 3 ? 'medium' : 'easy',
            isHardMultiplier,
            isHardTable
        };
    }

    /**
     * Resetea el cache de preguntas recientes
     */
    resetRecent() {
        this.recentQuestions.clear();
    }

    /**
     * Agrega una pregunta al cache de recientes
     * @private
     */
    addToRecent(questionId) {
        this.recentQuestions.add(questionId);

        // Limitar tamaño
        if (this.recentQuestions.size > this.maxRecentQuestions) {
            const first = this.recentQuestions.values().next().value;
            this.recentQuestions.delete(first);
        }
    }

    // =============================
    // UTILITIES
    // =============================

    /**
     * Genera un número entero aleatorio entre min y max (inclusivo)
     * @private
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Selecciona un elemento aleatorio de un array
     * @private
     */
    randomChoice(array) {
        if (!array || array.length === 0) {
            return undefined;
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Mezcla un array (Fisher-Yates shuffle)
     * @private
     */
    shuffle(array) {
        const shuffled = [...array];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }
}

// ================================
// QUESTION STRATEGIES (Factory Methods)
// ================================

/**
 * Estrategias especializadas de generación
 */
class QuestionStrategies {
    /**
     * Genera pregunta adaptada al nivel del estudiante
     * @static
     */
    static adaptive(tableMastery, generator) {
        // Seleccionar tabla débil (menor mastery)
        const weakTables = Object.entries(tableMastery)
            .filter(([_, mastery]) => mastery < 0.8)
            .map(([table]) => parseInt(table));

        const tables = weakTables.length > 0 ? weakTables : [2, 3, 4, 5, 6, 7, 8, 9, 10];

        return generator.generate({
            tables: tables,
            difficulty: 'medium'
        });
    }

    /**
     * Genera pregunta progresiva (empieza fácil, sube dificultad)
     * @static
     */
    static progressive(questionCount, generator) {
        let difficulty = 'easy';

        if (questionCount > 10) difficulty = 'medium';
        if (questionCount > 20) difficulty = 'hard';

        return generator.generate({
            tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            difficulty: difficulty
        });
    }

    /**
     * Genera pregunta de repaso (mezcla de todas las tablas)
     * @static
     */
    static review(generator) {
        return generator.generate({
            tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            difficulty: 'medium'
        });
    }
}

// ================================
// EXPORTS
// ================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuestionGenerator, QuestionStrategies };
} else {
    window.QuestionGenerator = QuestionGenerator;
    window.QuestionStrategies = QuestionStrategies;
}
