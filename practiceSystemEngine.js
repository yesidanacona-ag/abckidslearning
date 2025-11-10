// ================================
// SISTEMA DE PRÁCTICA ADAPTATIVO
// Evaluación diagnóstica + Mapa de dominio + Aprendizaje multi-modal
// ================================

class PracticeSystemEngine {
    constructor() {
        try {
            // Estado del sistema
            this.hasDiagnostic = false;
            this.diagnosticResults = null;
            this.tableMastery = {}; // Dominio por tabla (0-100%)
            this.hasError = false;

            // Cargar datos guardados
            this.loadProgress();

            // Si no hay diagnóstico, marcar para hacerlo
            if (!this.hasDiagnostic) {
                this.needsDiagnostic = true;
            }
        } catch (error) {
            console.error('❌ Error al inicializar PracticeSystemEngine:', error);
            this.hasError = true;
        }
    }

    // =============================
    // PERSISTENCIA
    // =============================

    loadProgress() {
        try {
            const saved = localStorage.getItem('practiceSystemProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.hasDiagnostic = data.hasDiagnostic || false;
                this.diagnosticResults = data.diagnosticResults || null;
                this.tableMastery = data.tableMastery || {};
            }
        } catch (e) {
            console.error('Error loading practice progress:', e);
        }
    }

    saveProgress() {
        try {
            const data = {
                hasDiagnostic: this.hasDiagnostic,
                diagnosticResults: this.diagnosticResults,
                tableMastery: this.tableMastery
            };
            localStorage.setItem('practiceSystemProgress', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving practice progress:', e);
        }
    }

    // =============================
    // EVALUACIÓN DIAGNÓSTICA
    // =============================

    generateDiagnosticQuestions() {
        const questions = [];
        const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10];

        // 15 preguntas distribuidas entre todas las tablas
        for (let i = 0; i < 15; i++) {
            const table = tables[i % tables.length];
            const multiplier = Math.floor(Math.random() * 10) + 1;

            questions.push({
                table: table,
                multiplier: multiplier,
                answer: table * multiplier,
                timeLimit: 10000 // 10 segundos por pregunta
            });
        }

        // Mezclar preguntas
        return this.shuffleArray(questions);
    }

    processDiagnosticResults(answers) {
        try {
            // answers = [{ table, correct, time }]
            if (!answers || !Array.isArray(answers)) {
                console.error('❌ Respuestas inválidas para diagnóstico');
                return { mastery: {}, weakTables: [], strongTables: [] };
            }

            const tableStats = {};

            // Inicializar estadísticas
            for (let table = 2; table <= 10; table++) {
                tableStats[table] = {
                    correct: 0,
                    total: 0,
                    avgTime: 0,
                    times: []
                };
            }

            // Procesar respuestas
            answers.forEach(answer => {
                const stats = tableStats[answer.table];
                if (stats) {
                    stats.total++;
                    if (answer.correct) {
                        stats.correct++;
                        stats.times.push(answer.time);
                    }
                }
            });

            // Calcular mastery por tabla
            const mastery = {};
            for (let table = 2; table <= 10; table++) {
                const stats = tableStats[table];
                if (stats.total === 0) {
                    mastery[table] = 0;
                } else {
                    // Mastery basado en aciertos y velocidad
                    const accuracy = (stats.correct / stats.total) * 100;
                    const avgTime = stats.times.length > 0
                        ? stats.times.reduce((a, b) => a + b, 0) / stats.times.length
                        : 10000;

                    // Penalizar por lentitud (óptimo = 3s, máximo = 10s)
                    const speedFactor = Math.max(0, Math.min(1, (10000 - avgTime) / 7000));
                    const finalMastery = accuracy * (0.7 + speedFactor * 0.3);

                    mastery[table] = Math.round(finalMastery);
                }
            }

            // Guardar resultados
            this.diagnosticResults = {
                timestamp: Date.now(),
                tableStats: tableStats,
                answers: answers
            };
            this.tableMastery = mastery;
            this.hasDiagnostic = true;

            this.saveProgress();

            return {
                mastery: mastery,
                weakTables: this.getWeakTables(),
                strongTables: this.getStrongTables()
            };
        } catch (error) {
            console.error('❌ Error procesando resultados de diagnóstico:', error);
            return { mastery: {}, weakTables: [], strongTables: [] };
        }
    }

    // =============================
    // MAPA DE DOMINIO
    // =============================

    getTableStatus(table) {
        const mastery = this.tableMastery[table] || 0;

        if (mastery >= 80) {
            return { level: 'mastered', color: '#10B981', emoji: '🟢', label: 'DOMINADA' };
        } else if (mastery >= 50) {
            return { level: 'learning', color: '#F59E0B', emoji: '🟡', label: 'EN PROGRESO' };
        } else {
            return { level: 'weak', color: '#EF4444', emoji: '🔴', label: 'NECESITA PRÁCTICA' };
        }
    }

    getTablesByLevel() {
        const tables = { mastered: [], learning: [], weak: [] };

        for (let table = 2; table <= 10; table++) {
            const status = this.getTableStatus(table);
            tables[status.level].push({
                table: table,
                mastery: this.tableMastery[table] || 0,
                status: status
            });
        }

        return tables;
    }

    getWeakTables() {
        return Object.entries(this.tableMastery)
            .filter(([_, mastery]) => mastery < 50)
            .map(([table, _]) => parseInt(table))
            .sort((a, b) => (this.tableMastery[a] || 0) - (this.tableMastery[b] || 0));
    }

    getStrongTables() {
        return Object.entries(this.tableMastery)
            .filter(([_, mastery]) => mastery >= 80)
            .map(([table, _]) => parseInt(table));
    }

    getSuggestedTables() {
        const weak = this.getWeakTables();
        const learning = Object.entries(this.tableMastery)
            .filter(([_, mastery]) => mastery >= 50 && mastery < 80)
            .map(([table, _]) => parseInt(table));

        // Priorizar tablas débiles, luego en progreso
        return [...weak.slice(0, 2), ...learning.slice(0, 1)];
    }

    // =============================
    // ACTUALIZACIÓN DE DOMINIO
    // =============================

    updateMastery(table, correct, time) {
        const currentMastery = this.tableMastery[table] || 0;

        if (correct) {
            // Incrementar mastery basado en velocidad
            const speedBonus = time < 3000 ? 3 : time < 5000 ? 2 : 1;
            const increment = speedBonus;
            this.tableMastery[table] = Math.min(100, currentMastery + increment);
        } else {
            // Decrementar mastery
            const decrement = 2;
            this.tableMastery[table] = Math.max(0, currentMastery - decrement);
        }

        this.saveProgress();
    }

    // =============================
    // APRENDIZAJE MULTI-MODAL
    // =============================

    generateLearningContent(table, multiplier) {
        const answer = table * multiplier;

        return {
            visualization: this.generateVisualization(table, multiplier),
            explanation: this.generateExplanation(table, multiplier, answer),
            exercises: this.generateExercises(table, multiplier, answer),
            trick: this.getMnemonicTrick(table, multiplier)
        };
    }

    generateVisualization(table, multiplier) {
        // Generar representación visual con grupos
        const emoji = this.getEmojiForTable(table);
        const groups = [];

        for (let i = 0; i < multiplier; i++) {
            const group = emoji.repeat(table);
            groups.push(group);
        }

        return {
            type: 'groups',
            emoji: emoji,
            groups: groups,
            description: `${multiplier} grupos de ${table} ${emoji}`
        };
    }

    getEmojiForTable(table) {
        const emojis = {
            2: '🍎',
            3: '🍌',
            4: '🍊',
            5: '🍇',
            6: '🍓',
            7: '🍉',
            8: '🍒',
            9: '🥝',
            10: '🍑'
        };
        return emojis[table] || '⭐';
    }

    generateExplanation(table, multiplier, answer) {
        const methods = [];

        // Método 1: Suma repetida
        const additions = [];
        for (let i = 0; i < multiplier; i++) {
            additions.push(table);
        }
        methods.push({
            type: 'addition',
            title: 'Suma repetida',
            formula: additions.join(' + ') + ' = ' + answer,
            description: `Sumamos ${table} un total de ${multiplier} veces`
        });

        // Método 2: Conmutatividad
        if (table !== multiplier) {
            methods.push({
                type: 'commutative',
                title: 'Cambiar el orden',
                formula: `${table} × ${multiplier} = ${multiplier} × ${table} = ${answer}`,
                description: 'El orden no cambia el resultado'
            });
        }

        // Método 3: Descomposición (si multiplier > 5)
        if (multiplier > 5 && multiplier <= 10) {
            const half = Math.floor(multiplier / 2);
            const halfResult = table * half;
            methods.push({
                type: 'decomposition',
                title: 'Dividir y conquistar',
                formula: `${table} × ${half} = ${halfResult}, entonces ${halfResult} × 2 ≈ ${answer}`,
                description: 'Dividimos el problema en partes más pequeñas'
            });
        }

        return methods;
    }

    generateExercises(table, multiplier, answer) {
        return [
            {
                type: 'multiple_choice',
                question: `${table} × ${multiplier} = ?`,
                options: this.generateOptions(answer),
                correctAnswer: answer
            },
            {
                type: 'fill_blank',
                question: `${table} × __ = ${answer}`,
                correctAnswer: multiplier
            },
            {
                type: 'fill_blank',
                question: `__ × ${multiplier} = ${answer}`,
                correctAnswer: table
            },
            {
                type: 'write',
                question: `${table} × ${multiplier} = ____`,
                correctAnswer: answer
            }
        ];
    }

    generateOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        while (options.size < 4) {
            const variation = Math.floor(Math.random() * 3);
            let wrong;

            switch (variation) {
                case 0: // Cercano
                    wrong = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
                    break;
                case 1: // +10 o -10
                    wrong = correctAnswer + (Math.random() < 0.5 ? 10 : -10);
                    break;
                case 2: // Mitad o doble
                    wrong = Math.random() < 0.5 ? Math.floor(correctAnswer / 2) : correctAnswer * 2;
                    break;
            }

            if (wrong > 0 && wrong !== correctAnswer) {
                options.add(wrong);
            }
        }

        return this.shuffleArray(Array.from(options));
    }

    getMnemonicTrick(table, multiplier) {
        // Integración con sistema de trucos mnemotécnicos
        if (window.mnemonicTricksSystem) {
            return window.mnemonicTricksSystem.getTrick(table, multiplier);
        }
        return null;
    }

    // =============================
    // GENERACIÓN DE SESIONES
    // =============================

    generatePracticeSession(table, duration = 10) {
        // Generar sesión de práctica progresiva
        const session = {
            table: table,
            currentMastery: this.tableMastery[table] || 0,
            phases: []
        };

        // Fase 1: Calentamiento (fáciles)
        session.phases.push({
            name: 'Calentamiento',
            emoji: '🔥',
            questions: this.generateQuestionsForPhase(table, [1, 2, 3, 4, 5], 3)
        });

        // Fase 2: Práctica (medias)
        session.phases.push({
            name: 'Práctica',
            emoji: '💪',
            questions: this.generateQuestionsForPhase(table, [3, 4, 5, 6, 7], 4)
        });

        // Fase 3: Desafío (difíciles)
        session.phases.push({
            name: 'Desafío',
            emoji: '⚡',
            questions: this.generateQuestionsForPhase(table, [6, 7, 8, 9, 10], 3)
        });

        return session;
    }

    generateQuestionsForPhase(table, multipliers, count) {
        const questions = [];

        for (let i = 0; i < count; i++) {
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            questions.push({
                table: table,
                multiplier: multiplier,
                answer: table * multiplier
            });
        }

        return questions;
    }

    generateMixedSession(tables, count = 15) {
        // Generar sesión con múltiples tablas
        const questions = [];
        const weights = tables.map(table => {
            const mastery = this.tableMastery[table] || 0;
            // Más peso a tablas más débiles
            return 100 - mastery + 20;
        });

        for (let i = 0; i < count; i++) {
            const table = this.weightedRandom(tables, weights);
            const multiplier = Math.floor(Math.random() * 10) + 1;

            questions.push({
                table: table,
                multiplier: multiplier,
                answer: table * multiplier
            });
        }

        return this.shuffleArray(questions);
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    // =============================
    // GAMIFICACIÓN
    // =============================

    calculateStars(mastery) {
        if (mastery >= 90) return 3;
        if (mastery >= 70) return 2;
        if (mastery >= 40) return 1;
        return 0;
    }

    getNextMilestone(table) {
        const mastery = this.tableMastery[table] || 0;

        const milestones = [
            { threshold: 25, reward: '🎯 Aprendiz', stars: 25 },
            { threshold: 50, reward: '⭐ Intermedio', stars: 50 },
            { threshold: 75, reward: '💫 Avanzado', stars: 75 },
            { threshold: 90, reward: '🌟 Experto', stars: 100 },
            { threshold: 100, reward: '👑 Maestro', stars: 200 }
        ];

        for (const milestone of milestones) {
            if (mastery < milestone.threshold) {
                return {
                    ...milestone,
                    progress: (mastery / milestone.threshold) * 100,
                    remaining: milestone.threshold - mastery
                };
            }
        }

        return null;
    }

    // =============================
    // REPORTE DE PROGRESO
    // =============================

    generateProgressReport() {
        const tablesByLevel = this.getTablesByLevel();

        const totalMastery = Object.values(this.tableMastery).reduce((sum, m) => sum + m, 0);
        const avgMastery = totalMastery / Object.keys(this.tableMastery).length || 0;

        return {
            overallMastery: Math.round(avgMastery),
            tablesByLevel: tablesByLevel,
            totalTables: Object.keys(this.tableMastery).length,
            masteredCount: tablesByLevel.mastered.length,
            learningCount: tablesByLevel.learning.length,
            weakCount: tablesByLevel.weak.length,
            suggestedFocus: this.getSuggestedTables(),
            hasDiagnostic: this.hasDiagnostic,
            diagnosticDate: this.diagnosticResults ? new Date(this.diagnosticResults.timestamp) : null
        };
    }

    // =============================
    // RESET Y UTILIDADES
    // =============================

    resetDiagnostic() {
        this.hasDiagnostic = false;
        this.diagnosticResults = null;
        this.needsDiagnostic = true;
        this.saveProgress();
    }

    resetMastery() {
        this.tableMastery = {};
        this.saveProgress();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // =============================
    // ESTADÍSTICAS
    // =============================

    getTableStats(table) {
        const mastery = this.tableMastery[table] || 0;
        const status = this.getTableStatus(table);
        const milestone = this.getNextMilestone(table);
        const stars = this.calculateStars(mastery);

        return {
            table: table,
            mastery: mastery,
            status: status,
            stars: stars,
            nextMilestone: milestone,
            emoji: this.getEmojiForTable(table)
        };
    }

    getAllTableStats() {
        const stats = [];
        for (let table = 2; table <= 10; table++) {
            stats.push(this.getTableStats(table));
        }
        return stats;
    }
}

// Exportar para uso global
window.PracticeSystemEngine = PracticeSystemEngine;
