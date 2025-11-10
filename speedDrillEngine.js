// ================================
// TALADRO RÁPIDO - Engine
// Modo de recordación pura sin opciones múltiples
// ================================

class SpeedDrillEngine {
    constructor() {
        // Estado del juego
        this.isPlaying = false;
        this.currentQuestion = null;
        this.totalQuestions = 20;
        this.currentQuestionNumber = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.startTime = null;
        this.questionTimes = []; // Tiempo por pregunta

        // Referencias DOM
        this.screen = document.getElementById('speedDrillScreen');
        this.questionText = document.getElementById('drillQuestion');
        this.answerDisplay = document.getElementById('drillAnswer');
        this.questionNumberEl = document.getElementById('drillQuestionNumber');
        this.totalQuestionsEl = document.getElementById('drillTotalQuestions');
        this.correctCountEl = document.getElementById('drillCorrectCount');
        this.incorrectCountEl = document.getElementById('drillIncorrectCount');
        this.streakEl = document.getElementById('drillStreak');
        this.feedbackEl = document.getElementById('drillFeedback');

        console.log('⚡ Speed Drill Engine inicializado');
    }

    // =============================
    // INICIAR JUEGO
    // =============================

    start(tableNumber = null) {
        console.log('⚡ Iniciando Taladro Rápido...');

        // Reset estado
        this.isPlaying = true;
        this.currentQuestionNumber = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.startTime = Date.now();
        this.questionTimes = [];
        this.selectedTable = tableNumber; // null = todas las tablas

        // Setup UI
        if (this.totalQuestionsEl) {
            this.totalQuestionsEl.textContent = this.totalQuestions;
        }

        this.updateStats();
        this.hideFeedback();

        // Setup teclado
        if (window.numericKeyboard) {
            window.numericKeyboard.clear();
            window.numericKeyboard.show();
            window.numericKeyboard.enable();

            // Vincular callback de submit
            window.numericKeyboard.setOnSubmit((answer) => {
                this.checkAnswer(answer);
            });

            // Actualizar display visual cuando cambia el valor
            window.numericKeyboard.setOnChange((value) => {
                if (this.answerDisplay) {
                    this.answerDisplay.textContent = value || '_';
                }
            });
        }

        // Primera pregunta
        this.nextQuestion();

        // Sonido de inicio
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }
    }

    // =============================
    // GENERAR PREGUNTA
    // =============================

    nextQuestion() {
        if (this.currentQuestionNumber >= this.totalQuestions) {
            this.endGame();
            return;
        }

        this.currentQuestionNumber++;

        // Generar pregunta usando el sistema adaptativo
        if (window.game && window.game.adaptiveSystem) {
            if (this.selectedTable) {
                // Tabla específica
                this.currentQuestion = window.game.adaptiveSystem.getQuestionForTable(this.selectedTable);
            } else {
                // Todas las tablas
                this.currentQuestion = window.game.adaptiveSystem.getNextQuestion();
            }
        } else {
            // Fallback: pregunta random
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            this.currentQuestion = {
                num1,
                num2,
                answer: num1 * num2
            };
        }

        // Mostrar pregunta
        if (this.questionText) {
            this.questionText.textContent = `${this.currentQuestion.num1} × ${this.currentQuestion.num2} = `;
        }

        if (this.answerDisplay) {
            this.answerDisplay.textContent = '_';
            this.answerDisplay.className = 'drill-answer-value'; // Reset clases
        }

        if (this.questionNumberEl) {
            this.questionNumberEl.textContent = this.currentQuestionNumber;
        }

        // Limpiar teclado
        if (window.numericKeyboard) {
            window.numericKeyboard.clear();
        }

        // Ocultar feedback
        this.hideFeedback();

        // Marcar tiempo de inicio de pregunta
        this.questionStartTime = Date.now();
    }

    // =============================
    // VALIDAR RESPUESTA
    // =============================

    checkAnswer(userAnswer) {
        if (!this.isPlaying || !this.currentQuestion) return;

        const correctAnswer = this.currentQuestion.answer;
        const isCorrect = userAnswer === correctAnswer;

        // Calcular tiempo de respuesta
        const responseTime = Date.now() - this.questionStartTime;
        this.questionTimes.push(responseTime);

        if (isCorrect) {
            this.handleCorrectAnswer(responseTime);
        } else {
            this.handleIncorrectAnswer(correctAnswer);
        }
    }

    // =============================
    // RESPUESTA CORRECTA
    // =============================

    handleCorrectAnswer(responseTime) {
        this.correctAnswers++;
        this.streak++;

        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }

        // Feedback visual
        if (this.answerDisplay) {
            this.answerDisplay.classList.add('correct');
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        // Mostrar feedback positivo
        this.showFeedback('¡Correcto!', 'correct');

        // Flash verde en teclado
        if (window.numericKeyboard) {
            window.numericKeyboard.flash('correct');
        }

        // Actualizar stats
        this.updateStats();

        // Transición rápida a siguiente pregunta (200ms)
        setTimeout(() => {
            this.nextQuestion();
        }, 200);
    }

    // =============================
    // RESPUESTA INCORRECTA
    // =============================

    handleIncorrectAnswer(correctAnswer) {
        this.incorrectAnswers++;
        this.streak = 0;

        // Feedback visual
        if (this.answerDisplay) {
            this.answerDisplay.classList.add('incorrect');
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playIncorrect();
        }

        // Mostrar respuesta correcta
        this.showFeedback(`Respuesta correcta: ${correctAnswer}`, 'incorrect');

        // Shake en teclado
        if (window.numericKeyboard) {
            window.numericKeyboard.shake();
            window.numericKeyboard.flash('incorrect');
        }

        // Actualizar stats
        this.updateStats();

        // IMPORTANTE: NO borrar la respuesta incorrecta
        // El niño debe presionar backspace para corregir

        // Esperar un poco más antes de siguiente pregunta (1500ms)
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }

    // =============================
    // ACTUALIZAR STATS
    // =============================

    updateStats() {
        if (this.correctCountEl) {
            this.correctCountEl.textContent = this.correctAnswers;
        }

        if (this.incorrectCountEl) {
            this.incorrectCountEl.textContent = this.incorrectAnswers;
        }

        if (this.streakEl) {
            this.streakEl.textContent = this.streak;

            // Animación de racha
            if (this.streak >= 5) {
                this.streakEl.classList.add('streak-fire');
            } else {
                this.streakEl.classList.remove('streak-fire');
            }
        }
    }

    // =============================
    // FEEDBACK
    // =============================

    showFeedback(message, type) {
        if (this.feedbackEl) {
            this.feedbackEl.textContent = message;
            this.feedbackEl.className = `drill-feedback ${type}`;
            this.feedbackEl.classList.remove('hidden');
        }
    }

    hideFeedback() {
        if (this.feedbackEl) {
            this.feedbackEl.classList.add('hidden');
        }
    }

    // =============================
    // FIN DE JUEGO
    // =============================

    endGame() {
        this.isPlaying = false;

        // Ocultar teclado
        if (window.numericKeyboard) {
            window.numericKeyboard.hide();
            window.numericKeyboard.clear();
        }

        // Calcular estadísticas
        const totalTime = Date.now() - this.startTime;
        const avgTime = this.questionTimes.reduce((a, b) => a + b, 0) / this.questionTimes.length;
        const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);

        // Calcular monedas ganadas
        const baseCoins = this.correctAnswers * 5;
        const streakBonus = this.bestStreak >= 5 ? this.bestStreak * 2 : 0;
        const accuracyBonus = accuracy >= 80 ? 20 : 0;
        const totalCoins = baseCoins + streakBonus + accuracyBonus;

        // Otorgar monedas
        if (window.game) {
            window.game.addCoins(totalCoins);
        }

        // Mostrar modal de resultados
        if (window.game) {
            window.game.showGameResultModal({
                mode: 'Taladro Rápido',
                score: this.correctAnswers,
                correctAnswers: this.correctAnswers,
                incorrectAnswers: this.incorrectAnswers,
                accuracy: accuracy,
                bestStreak: this.bestStreak,
                avgTime: Math.round(avgTime / 1000), // en segundos
                totalTime: Math.round(totalTime / 1000), // en segundos
                coins: totalCoins
            });
        }

        // Confeti si alto rendimiento
        if (accuracy >= 80 && window.game) {
            window.game.createConfetti();
        }

        console.log('⚡ Taladro Rápido finalizado:', {
            correctas: this.correctAnswers,
            incorrectas: this.incorrectAnswers,
            precisión: `${accuracy}%`,
            mejorRacha: this.bestStreak,
            monedas: totalCoins
        });
    }

    // =============================
    // DETENER JUEGO
    // =============================

    stop() {
        this.isPlaying = false;

        if (window.numericKeyboard) {
            window.numericKeyboard.hide();
            window.numericKeyboard.clear();
        }
    }
}

// Instanciar globalmente
window.speedDrillEngine = new SpeedDrillEngine();
