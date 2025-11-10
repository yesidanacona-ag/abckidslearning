// ================================
// GAME CONTROLLER
// Orquestación del flujo principal del juego
// ================================

class GameController {
    constructor(store, eventBus, services) {
        this.store = store;
        this.eventBus = eventBus;

        // Services
        this.playerService = services.playerService;
        this.questionService = services.questionService;
        this.achievementService = services.achievementService;
        this.adaptiveService = services.adaptiveService;

        // Estado del juego actual
        this.currentQuestion = null;
        this.questionStartTime = null;
    }

    /**
     * Inicia un nuevo juego
     * @param {string} mode - Modo de juego
     * @param {Object} config - Configuración del modo
     */
    startGame(mode, config = {}) {
        // Resetear estado del juego
        this.store.setState(state => ({
            ...state,
            game: {
                mode: mode,
                currentQuestion: null,
                questions: [],
                currentIndex: 0,
                score: 0,
                correct: 0,
                incorrect: 0,
                streak: 0,
                startTime: Date.now(),
                endTime: null
            }
        }), 'startGame');

        // Generar preguntas
        let questions = [];

        if (config.tables && config.count) {
            questions = this.questionService.generateQuestions(config.tables, config.count);
        } else if (config.questions) {
            questions = config.questions;
        }

        // Actualizar en store
        this.store.setState(state => ({
            ...state,
            game: {
                ...state.game,
                questions: questions
            }
        }), 'setQuestions');

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('game:started', {
                mode,
                questionsCount: questions.length,
                config
            });
        }

        // Mostrar primera pregunta
        if (questions.length > 0) {
            this.showNextQuestion();
        }
    }

    /**
     * Muestra la siguiente pregunta
     * @returns {Object|null} Question object o null si terminó
     */
    showNextQuestion() {
        const gameState = this.store.getState().game;

        // Verificar si terminó el juego
        if (gameState.currentIndex >= gameState.questions.length) {
            this.endGame();
            return null;
        }

        // Obtener pregunta actual
        const question = gameState.questions[gameState.currentIndex];
        this.currentQuestion = question;
        this.questionStartTime = Date.now();

        // Actualizar store
        this.store.setCurrentQuestion(question);

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('game:question:shown', {
                question,
                index: gameState.currentIndex,
                total: gameState.questions.length
            });
        }

        return question;
    }

    /**
     * Maneja la respuesta del usuario
     * @param {number} answer - Respuesta del usuario
     * @returns {Object} Resultado {isCorrect, points, feedback}
     */
    handleAnswer(answer) {
        if (!this.currentQuestion) {
            console.error('❌ No hay pregunta actual');
            return { isCorrect: false, points: 0 };
        }

        const responseTime = Date.now() - this.questionStartTime;
        const isCorrect = this.questionService.validateAnswer(this.currentQuestion, answer);

        // Actualizar contadores en game state
        const gameState = this.store.getState().game;
        this.store.setState(state => ({
            ...state,
            game: {
                ...state.game,
                correct: isCorrect ? gameState.correct + 1 : gameState.correct,
                incorrect: isCorrect ? gameState.incorrect : gameState.incorrect + 1,
                currentIndex: gameState.currentIndex + 1
            }
        }), 'handleAnswer');

        // Calcular puntos
        const points = this.questionService.calculatePoints(
            this.currentQuestion,
            isCorrect,
            responseTime
        );

        if (isCorrect) {
            // Actualizar score
            this.store.setState(state => ({
                ...state,
                game: {
                    ...state.game,
                    score: state.game.score + points,
                    streak: state.game.streak + 1
                }
            }), 'addPoints');

            // Emitir evento de respuesta correcta
            if (this.eventBus) {
                this.eventBus.emit('game:answer:correct', {
                    question: this.currentQuestion,
                    answer,
                    responseTime,
                    points
                });
            }
        } else {
            // Resetear racha en game state
            this.store.setState(state => ({
                ...state,
                game: {
                    ...state.game,
                    streak: 0
                }
            }), 'resetGameStreak');

            // Emitir evento de respuesta incorrecta
            if (this.eventBus) {
                this.eventBus.emit('game:answer:wrong', {
                    question: this.currentQuestion,
                    answer,
                    correctAnswer: this.currentQuestion.answer,
                    responseTime
                });
            }
        }

        // Feedback para UI
        const feedback = this.generateFeedback(isCorrect, responseTime);

        return {
            isCorrect,
            points,
            feedback,
            correctAnswer: this.currentQuestion.answer,
            responseTime
        };
    }

    /**
     * Genera feedback basado en rendimiento
     * @param {boolean} isCorrect - Si fue correcta
     * @param {number} responseTime - Tiempo de respuesta
     * @returns {Object} Feedback object
     */
    generateFeedback(isCorrect, responseTime) {
        const gameState = this.store.getState().game;
        const streak = gameState.streak;

        let message = '';
        let type = 'success';
        let icon = '✅';

        if (isCorrect) {
            // Mensajes basados en racha
            if (streak >= 10) {
                message = '¡IMPARABLE! 🔥';
                icon = '🔥';
            } else if (streak >= 5) {
                message = '¡Racha Ardiente! ⚡';
                icon = '⚡';
            } else if (streak >= 3) {
                message = '¡Excelente! ⭐';
                icon = '⭐';
            } else if (responseTime < 2000) {
                message = '¡Muy rápido! 💨';
                icon = '💨';
            } else {
                const messages = ['¡Correcto! 👍', '¡Bien hecho! 🎉', '¡Excelente! ✨', '¡Genial! 🌟'];
                message = messages[Math.floor(Math.random() * messages.length)];
            }
        } else {
            type = 'error';
            const messages = [
                '¡Casi! Inténtalo de nuevo 💪',
                'No te rindas, ¡tú puedes! 💫',
                'Aprende del error y sigue 📚',
                '¡La próxima será! 🌟'
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
            icon = '❌';
        }

        return { message, type, icon, streak };
    }

    /**
     * Finaliza el juego actual
     */
    endGame() {
        const gameState = this.store.getState().game;

        // Marcar fin del juego
        this.store.setState(state => ({
            ...state,
            game: {
                ...state.game,
                endTime: Date.now()
            }
        }), 'endGame');

        // Calcular estadísticas finales
        const stats = this.calculateGameStats();

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('game:mode:ended', {
                mode: gameState.mode,
                stats,
                startTime: gameState.startTime,
                endTime: Date.now()
            });
        }

        // Verificar logros
        if (this.achievementService) {
            this.achievementService.checkAchievements();
        }

        // Verificar medallas
        this.checkMedals(stats);

        return stats;
    }

    /**
     * Calcula estadísticas del juego
     * @returns {Object} Stats object
     */
    calculateGameStats() {
        const gameState = this.store.getState().game;
        const total = gameState.correct + gameState.incorrect;
        const accuracy = total > 0 ? Math.round((gameState.correct / total) * 100) : 0;
        const duration = gameState.endTime ? gameState.endTime - gameState.startTime : 0;

        return {
            mode: gameState.mode,
            score: gameState.score,
            correct: gameState.correct,
            incorrect: gameState.incorrect,
            total: total,
            accuracy: accuracy,
            bestStreak: gameState.streak,
            duration: Math.round(duration / 1000), // segundos
            questionsAnswered: gameState.questions.length
        };
    }

    /**
     * Verifica y otorga medallas basadas en precisión
     * @param {Object} stats - Estadísticas del juego
     */
    checkMedals(stats) {
        if (stats.total === 0) return;

        const accuracy = stats.accuracy;

        if (accuracy >= 95) {
            this.playerService.addMedal('gold');
        } else if (accuracy >= 80) {
            this.playerService.addMedal('silver');
        } else if (accuracy >= 60) {
            this.playerService.addMedal('bronze');
        }
    }

    /**
     * Pausa el juego actual
     */
    pauseGame() {
        if (this.eventBus) {
            this.eventBus.emit('game:paused', {
                timestamp: Date.now()
            });
        }
    }

    /**
     * Reanuda el juego pausado
     */
    resumeGame() {
        if (this.eventBus) {
            this.eventBus.emit('game:resumed', {
                timestamp: Date.now()
            });
        }
    }

    /**
     * Obtiene el estado actual del juego
     * @returns {Object} Game state
     */
    getGameState() {
        return this.store.getState().game;
    }

    /**
     * Obtiene la pregunta actual
     * @returns {Object|null} Current question
     */
    getCurrentQuestion() {
        return this.currentQuestion;
    }

    /**
     * Genera opciones para la pregunta actual
     * @param {number} count - Número de opciones
     * @returns {Array} Array de opciones
     */
    getCurrentQuestionOptions(count = 4) {
        if (!this.currentQuestion) return [];
        return this.questionService.generateOptions(this.currentQuestion, count);
    }

    /**
     * Usa un power-up
     * @param {string} type - Tipo de power-up (hint, shield, skip)
     * @returns {boolean|Object} false si no se pudo usar, o datos del power-up
     */
    usePowerup(type) {
        const success = this.playerService.usePowerup(type);

        if (!success) {
            return false;
        }

        let result = { type, used: true };

        // Ejecutar efecto del power-up
        switch (type) {
            case 'hint':
                result.hint = this.currentQuestion ? this.currentQuestion.answer : null;
                break;

            case 'skip':
                result.skipped = true;
                // Avanzar a siguiente pregunta sin penalización
                const gameState = this.store.getState().game;
                this.store.setState(state => ({
                    ...state,
                    game: {
                        ...state.game,
                        currentIndex: gameState.currentIndex + 1
                    }
                }), 'skipQuestion');
                this.showNextQuestion();
                break;

            case 'shield':
                result.protected = true;
                // El shield se maneja en handleAnswer
                break;
        }

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('game:powerup:used', { type, result });
        }

        return result;
    }

    /**
     * Reinicia el juego actual (mismo modo y config)
     */
    restartGame() {
        const gameState = this.store.getState().game;
        const mode = gameState.mode;

        // Obtener config original (simplificado)
        const config = {
            questions: gameState.questions
        };

        this.startGame(mode, config);
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.GameController = GameController;
}
