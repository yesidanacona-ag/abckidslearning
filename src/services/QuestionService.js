// ================================
// QUESTION SERVICE
// Generación inteligente de preguntas y opciones
// ================================

class QuestionService {
    constructor(adaptiveService) {
        this.adaptiveService = adaptiveService;
    }

    /**
     * Genera una pregunta para una tabla específica
     * @param {number} table - Tabla de multiplicar (1-10)
     * @param {number} difficulty - Nivel de dificultad (0-1)
     * @returns {Object} Question object
     */
    generateQuestion(table, difficulty = 0.5) {
        // Seleccionar multiplicador basado en dificultad
        let multiplier;

        if (difficulty < 0.3) {
            // Fácil: multiplicadores bajos
            multiplier = Math.floor(Math.random() * 5) + 1; // 1-5
        } else if (difficulty < 0.7) {
            // Medio: multiplicadores medios
            multiplier = Math.floor(Math.random() * 7) + 3; // 3-9
        } else {
            // Difícil: todo el rango
            multiplier = Math.floor(Math.random() * 10) + 1; // 1-10
        }

        return {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier,
            difficulty: difficulty,
            timestamp: Date.now()
        };
    }

    /**
     * Genera múltiples preguntas usando el sistema adaptativo
     * @param {Array} tables - Array de tablas a practicar
     * @param {number} count - Número de preguntas
     * @returns {Array} Array de questions
     */
    generateQuestions(tables, count) {
        if (!this.adaptiveService) {
            // Fallback sin sistema adaptativo
            return this.generateQuestionsRandom(tables, count);
        }

        const questions = [];
        const weights = this.adaptiveService.getTableWeights(tables);

        for (let i = 0; i < count; i++) {
            const table = this.weightedRandomTable(tables, weights);
            const mastery = this.adaptiveService.getTableMastery(table);
            const difficulty = 1 - mastery; // Más difícil si tiene menos maestría

            const question = this.generateQuestion(table, difficulty);
            questions.push(question);
        }

        return questions;
    }

    /**
     * Genera preguntas aleatorias sin adaptación
     * @param {Array} tables - Tablas a practicar
     * @param {number} count - Número de preguntas
     * @returns {Array} Array de questions
     */
    generateQuestionsRandom(tables, count) {
        const questions = [];

        for (let i = 0; i < count; i++) {
            const table = tables[Math.floor(Math.random() * tables.length)];
            const question = this.generateQuestion(table, 0.5);
            questions.push(question);
        }

        return questions;
    }

    /**
     * Selecciona una tabla aleatoria con pesos
     * @param {Array} tables - Array de tablas
     * @param {Array} weights - Array de pesos
     * @returns {number} Tabla seleccionada
     */
    weightedRandomTable(tables, weights) {
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
     * Genera opciones de respuesta para una pregunta
     * @param {Object} question - Question object
     * @param {number} optionsCount - Número de opciones (default 4)
     * @returns {Array} Array de opciones mezcladas
     */
    generateOptions(question, optionsCount = 4) {
        const correctAnswer = question.answer;
        const options = new Set([correctAnswer]);

        // Generar opciones incorrectas inteligentes
        while (options.size < optionsCount) {
            const variation = Math.floor(Math.random() * 5);
            let wrongAnswer;

            switch (variation) {
                case 0: // Cercano (+/- pequeño)
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
                    break;

                case 1: // Error común (suma en vez de multiplicar)
                    wrongAnswer = question.table + question.multiplier;
                    break;

                case 2: // Tabla vecina
                    const neighborTable = question.table + (Math.random() < 0.5 ? 1 : -1);
                    wrongAnswer = neighborTable * question.multiplier;
                    break;

                case 3: // Multiplicador vecino
                    const neighborMultiplier = question.multiplier + (Math.random() < 0.5 ? 1 : -1);
                    wrongAnswer = question.table * neighborMultiplier;
                    break;

                case 4: // Error de orden de magnitud
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 10 : -10);
                    break;
            }

            // Validar que sea positivo y razonable
            if (wrongAnswer > 0 && wrongAnswer <= 200 && wrongAnswer !== correctAnswer) {
                options.add(wrongAnswer);
            }
        }

        // Mezclar opciones
        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        return optionsArray;
    }

    /**
     * Valida si una respuesta es correcta
     * @param {Object} question - Question object
     * @param {number} answer - Respuesta del usuario
     * @returns {boolean} true si es correcta
     */
    validateAnswer(question, answer) {
        return question.answer === answer;
    }

    /**
     * Calcula tiempo de respuesta esperado basado en dificultad
     * @param {Object} question - Question object
     * @returns {number} Tiempo en milisegundos
     */
    getExpectedResponseTime(question) {
        // Tiempo base: 2 segundos
        let baseTime = 2000;

        // Ajustar por dificultad
        const difficulty = question.difficulty || 0.5;
        baseTime = baseTime * (1 + difficulty);

        // Ajustar por tamaño de los números
        if (question.answer > 50) {
            baseTime += 500;
        }
        if (question.answer > 100) {
            baseTime += 1000;
        }

        return Math.round(baseTime);
    }

    /**
     * Genera una pregunta para modo desafío (tiempo limitado)
     * @param {Array} tables - Tablas a usar
     * @returns {Object} Question object
     */
    generateChallengeQuestion(tables) {
        const table = tables[Math.floor(Math.random() * tables.length)];

        // En desafío, mezclar dificultades
        const difficulty = Math.random(); // 0-1 aleatorio

        return this.generateQuestion(table, difficulty);
    }

    /**
     * Genera pregunta especial para modo jefe
     * @param {number} bossLevel - Nivel del jefe
     * @returns {Object} Question object
     */
    generateBossQuestion(bossLevel) {
        // Jefes usan tablas más difíciles
        const difficultyTables = {
            1: [2, 3, 4], // Jefe 1: fácil
            2: [4, 5, 6], // Jefe 2: medio
            3: [6, 7, 8], // Jefe 3: difícil
            4: [7, 8, 9], // Jefe 4: muy difícil
            5: [8, 9, 10] // Jefe 5: extremo
        };

        const tables = difficultyTables[Math.min(bossLevel, 5)] || [7, 8, 9];
        const table = tables[Math.floor(Math.random() * tables.length)];

        return this.generateQuestion(table, 0.7 + (bossLevel * 0.05));
    }

    /**
     * Genera secuencia de preguntas progresivas
     * @param {number} startTable - Tabla inicial
     * @param {number} endTable - Tabla final
     * @param {number} questionsPerTable - Preguntas por tabla
     * @returns {Array} Array de questions
     */
    generateProgressiveSequence(startTable, endTable, questionsPerTable = 5) {
        const questions = [];

        for (let table = startTable; table <= endTable; table++) {
            for (let i = 0; i < questionsPerTable; i++) {
                const difficulty = i / questionsPerTable; // Progresivo dentro de cada tabla
                questions.push(this.generateQuestion(table, difficulty));
            }
        }

        return questions;
    }

    /**
     * Genera pregunta de repaso (tablas que necesitan refuerzo)
     * @param {number} count - Número de preguntas
     * @returns {Array} Array de questions
     */
    generateReviewQuestions(count) {
        if (!this.adaptiveService) {
            return this.generateQuestionsRandom([2, 3, 4, 5], count);
        }

        const weakTables = this.adaptiveService.getSuggestedTables();

        if (weakTables.length === 0) {
            // Si no hay tablas débiles, practicar todas
            return this.generateQuestions([2, 3, 4, 5, 6, 7, 8, 9, 10], count);
        }

        return this.generateQuestions(weakTables, count);
    }

    /**
     * Obtiene estadísticas de una pregunta respondida
     * @param {Object} question - Question object
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo en ms
     * @returns {Object} Stats object
     */
    getQuestionStats(question, isCorrect, responseTime) {
        const expectedTime = this.getExpectedResponseTime(question);
        const timeRatio = responseTime / expectedTime;

        let speed = 'normal';
        if (timeRatio < 0.7) speed = 'fast';
        else if (timeRatio > 1.5) speed = 'slow';

        return {
            question,
            isCorrect,
            responseTime,
            expectedTime,
            speed,
            points: this.calculatePoints(question, isCorrect, responseTime)
        };
    }

    /**
     * Calcula puntos por respuesta
     * @param {Object} question - Question object
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo en ms
     * @returns {number} Puntos
     */
    calculatePoints(question, isCorrect, responseTime) {
        if (!isCorrect) return 0;

        let points = 10; // Base

        // Bonus por dificultad
        points += Math.round(question.difficulty * 10);

        // Bonus por velocidad
        const expectedTime = this.getExpectedResponseTime(question);
        if (responseTime < expectedTime * 0.7) {
            points += 5; // Rápido
        }

        return points;
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.QuestionService = QuestionService;
}
