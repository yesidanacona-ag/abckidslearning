// ================================
// TABLE DISCOVERY ENGINE
// Sistema de aprendizaje secuencial guiado para tablas de multiplicar
// Fase 1: MVP - Modo Descubrimiento
// ================================

class TableDiscoveryEngine {
    constructor(table, context) {
        this.table = table;
        this.context = context; // { eventBus, store, services, mateo, soundSystem }

        // Estado del descubrimiento
        this.phase = 'intro'; // intro, training, reward
        this.currentQuestionIndex = 0;
        this.questions = [];

        // Tracking de intentos
        this.attempts = {}; // { multiplier: { correct: boolean, timeMs: number, attempts: number } }
        this.sessionStartTime = Date.now();

        // Configuración
        this.totalQuestions = 10;
        this.helpThreshold = 7; // Primeras 7 tienen ayuda disponible
        this.autoHelpThreshold = 3; // Primeras 3 muestran ayuda automáticamente

        // Referencias a sistemas existentes
        this.eventBus = context.eventBus;
        this.store = context.store;
        this.playerService = context.services.player;
        this.mateo = window.mateoMascot;
        this.soundSystem = window.soundSystem;
        this.mnemonicSystem = window.mnemonicSystem;
        this.feedbackSystem = window.feedbackSystem;

        // Referencias a módulos de accesibilidad
        this.accessibility = window.bootstrap?.accessibility || {};

        // UI Elements (se configurarán al iniciar)
        this.introScreen = null;
        this.trainingScreen = null;
        this.rewardScreen = null;
    }

    /**
     * Inicia el flujo de descubrimiento
     */
    start() {
        console.log(`🎓 Iniciando descubrimiento de Tabla del ${this.table}`);

        // Track inicio en analytics
        if (window.bootstrap?.uxResearch?.analytics) {
            window.bootstrap.uxResearch.analytics.trackEvent('discovery_started', {
                table: this.table,
                timestamp: Date.now()
            });
        }

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('discovery:started', { table: this.table });
        }

        // Configurar UI
        this.setupUI();

        // Comenzar con fase intro
        this.showIntroPhase();
    }

    /**
     * Configura referencias a elementos UI
     */
    setupUI() {
        this.introScreen = document.getElementById('discoveryIntroScreen');
        this.trainingScreen = document.getElementById('discoveryTrainingScreen');
        this.rewardScreen = document.getElementById('discoveryRewardScreen');

        if (!this.introScreen || !this.trainingScreen || !this.rewardScreen) {
            console.error('❌ Discovery screens not found in DOM');
            return;
        }
    }

    /**
     * FASE 1: Muestra el truco mnemónico
     */
    showIntroPhase() {
        this.phase = 'intro';

        console.log('📖 Fase Intro: Mostrando truco mnemónico');

        // Obtener truco mnemónico del sistema existente
        const mnemonic = this.mnemonicSystem ?
            this.mnemonicSystem.getTrick(this.table) :
            this.getDefaultMnemonic();

        // Ocultar otras pantallas
        this.hideAllScreens();

        // Mostrar pantalla intro
        this.introScreen.classList.add('active');

        // Actualizar contenido
        this.updateIntroContent(mnemonic);

        // Mostrar Mateo con expresión teaching
        if (this.mateo) {
            this.mateo.show('teaching', mnemonic.tip || mnemonic.explanation, 0); // 0 = no auto-hide
        }

        // Audio caption
        if (this.accessibility.audio) {
            this.accessibility.audio.showCaption(
                `Mateo te enseña la Tabla del ${this.table}`,
                5000
            );
        }

        // ARIA announcement
        if (this.accessibility.aria) {
            this.accessibility.aria.announce(
                `Aprendiendo la tabla del ${this.table}. Escucha el truco secreto de Mateo.`
            );
        }

        // Reproducir sonido de inicio
        if (this.soundSystem) {
            this.soundSystem.playTransition();
        }

        // Configurar botón de continuar
        const continueBtn = document.getElementById('discoveryIntroContinue');
        if (continueBtn) {
            continueBtn.onclick = () => this.startTrainingPhase();
        }
    }

    /**
     * Actualiza contenido de la pantalla intro
     */
    updateIntroContent(mnemonic) {
        // Título
        const title = this.introScreen.querySelector('.discovery-title');
        if (title) {
            title.textContent = `🧙‍♂️ El Truco Secreto de la Tabla del ${this.table}`;
        }

        // Explicación
        const explanation = this.introScreen.querySelector('.discovery-explanation');
        if (explanation) {
            explanation.textContent = mnemonic.explanation || mnemonic.tip;
        }

        // Ejemplos visuales (primeros 4 productos)
        const examplesList = this.introScreen.querySelector('.discovery-examples');
        if (examplesList) {
            examplesList.innerHTML = '';
            for (let i = 1; i <= 4; i++) {
                const product = this.table * i;
                const li = document.createElement('li');
                li.className = 'discovery-example-item';

                // Mostrar suma repetida para ilustrar el patrón
                const repeated = Array(i).fill(this.table).join(' + ');
                li.innerHTML = `
                    <span class="example-equation">${this.table} × ${i} = <strong>${product}</strong></span>
                    <span class="example-help">(${repeated} = ${product})</span>
                `;
                examplesList.appendChild(li);
            }
        }

        // Visual del patrón (secuencia de productos)
        const patternDiv = this.introScreen.querySelector('.discovery-pattern');
        if (patternDiv) {
            const products = Array.from({length: 10}, (_, i) => this.table * (i + 1));
            patternDiv.innerHTML = `
                <div class="pattern-label">🪜 El patrón completo:</div>
                <div class="pattern-sequence">${products.join(' → ')}</div>
            `;
        }
    }

    /**
     * Obtiene truco mnemónico por defecto si MnemonicSystem no está disponible
     */
    getDefaultMnemonic() {
        const defaultMnemonics = {
            2: { explanation: "La tabla del 2 es muy fácil: ¡Solo sumas 2 cada vez! Es como subir escaleras de 2 en 2.", tip: "Suma de 2 en 2" },
            3: { explanation: "Para la tabla del 3, suma 3 cada vez. ¡Cuenta de 3 en 3 como saltando!", tip: "Salta de 3 en 3" },
            4: { explanation: "La tabla del 4 es el DOBLE de la del 2. Si sabes 2×5=10, entonces 4×5=20.", tip: "Doble de la tabla del 2" },
            5: { explanation: "¡Súper fácil! La tabla del 5 siempre termina en 0 o 5. ¡Nunca falla!", tip: "Termina en 0 o 5" },
            6: { explanation: "La tabla del 6 es como la del 3, pero duplicada. 3×4=12, entonces 6×4=24.", tip: "Doble de la tabla del 3" },
            7: { explanation: "La tabla del 7 necesita práctica, pero tiene un patrón: 7, 14, 21, 28, 35...", tip: "Practica el ritmo" },
            8: { explanation: "La tabla del 8 es el DOBLE de la del 4. Si sabes 4×6=24, entonces 8×6=48.", tip: "Doble de la tabla del 4" },
            9: { explanation: "¡Truco mágico del 9! La suma de los dígitos siempre da 9: 18→1+8=9, 27→2+7=9", tip: "Suma de dígitos = 9" },
            10: { explanation: "¡La más fácil! Solo agrega un 0 al final. 10×7 = 7 con un 0 = 70", tip: "Agrega un 0" }
        };

        return defaultMnemonics[this.table] || {
            explanation: `La tabla del ${this.table} tiene un patrón especial. ¡Vamos a descubrirlo!`,
            tip: "Encuentra el patrón"
        };
    }

    /**
     * FASE 2: Entrenamiento con preguntas secuenciales
     */
    startTrainingPhase() {
        this.phase = 'training';
        this.currentQuestionIndex = 0;

        console.log('🎯 Fase Training: Comenzando entrenamiento guiado');

        // Generar preguntas secuenciales
        this.questions = this.generateSequentialQuestions();

        // Inicializar tracking de intentos
        this.initializeAttempts();

        // Ocultar intro, mostrar training
        this.hideAllScreens();
        this.trainingScreen.classList.add('active');

        // Ocultar Mateo del centro (se moverá a esquina)
        if (this.mateo) {
            this.mateo.hide();
        }

        // Mostrar primera pregunta
        this.showQuestion(0);

        // Track inicio de training
        if (window.bootstrap?.uxResearch?.analytics) {
            window.bootstrap.uxResearch.analytics.trackEvent('discovery_training_started', {
                table: this.table,
                totalQuestions: this.totalQuestions
            });
        }
    }

    /**
     * Genera preguntas secuenciales (tabla × 1, tabla × 2... tabla × 10)
     */
    generateSequentialQuestions() {
        const questions = [];

        for (let multiplier = 1; multiplier <= this.totalQuestions; multiplier++) {
            const answer = this.table * multiplier;

            // Generar opciones incorrectas plausibles
            const wrongOptions = this.generateWrongOptions(answer);

            // Mezclar opciones
            const options = this.shuffleArray([answer, ...wrongOptions]);

            questions.push({
                table: this.table,
                multiplier,
                answer,
                options,
                helpAvailable: multiplier <= this.helpThreshold,
                showHelpAuto: multiplier <= this.autoHelpThreshold,
                helpText: this.generateHelpText(multiplier)
            });
        }

        return questions;
    }

    /**
     * Genera opciones incorrectas plausibles
     */
    generateWrongOptions(correctAnswer) {
        const options = new Set();

        // Opción 1: Respuesta + tabla (error común: suma en lugar de multiplicar)
        options.add(correctAnswer + this.table);

        // Opción 2: Respuesta - tabla
        const opt2 = correctAnswer - this.table;
        if (opt2 > 0) options.add(opt2);

        // Opción 3: Tabla anterior o siguiente
        options.add(correctAnswer + Math.floor(Math.random() * 5) + 1);

        // Asegurar 3 opciones incorrectas únicas
        while (options.size < 3) {
            const random = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
            if (random > 0 && random !== correctAnswer) {
                options.add(random);
            }
        }

        return Array.from(options).slice(0, 3);
    }

    /**
     * Genera texto de ayuda para un multiplicador
     */
    generateHelpText(multiplier) {
        const repeated = Array(multiplier).fill(this.table).join(' + ');
        return `💡 Ayuda: ${repeated} = ?`;
    }

    /**
     * Mezcla array (Fisher-Yates shuffle)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Inicializa tracking de intentos
     */
    initializeAttempts() {
        for (let i = 1; i <= this.totalQuestions; i++) {
            this.attempts[i] = {
                correct: false,
                timeMs: 0,
                attempts: 0,
                startTime: null
            };
        }
    }

    /**
     * Muestra una pregunta específica
     */
    showQuestion(index) {
        if (index >= this.questions.length) {
            // Todas las preguntas completadas
            this.showRewardPhase();
            return;
        }

        this.currentQuestionIndex = index;
        const question = this.questions[index];

        // Registrar inicio de pregunta
        this.attempts[question.multiplier].startTime = Date.now();
        this.attempts[question.multiplier].attempts++;

        // Actualizar barra de progreso
        this.updateProgressBar(index);

        // Actualizar pregunta
        this.updateQuestionContent(question);

        // Configurar opciones de respuesta
        this.setupAnswerOptions(question);

        // Mostrar/ocultar ayuda según configuración
        this.setupHelpButton(question);

        // Mateo mini en esquina (solo si no está en intro)
        this.updateMateoMini(question);

        // ARIA announcement
        if (this.accessibility.aria) {
            this.accessibility.aria.announce(
                `Pregunta ${index + 1} de ${this.totalQuestions}. ${this.table} por ${question.multiplier}.`
            );
        }

        // Track pregunta mostrada
        if (window.bootstrap?.uxResearch?.analytics) {
            window.bootstrap.uxResearch.analytics.trackEvent('discovery_question_shown', {
                table: this.table,
                multiplier: question.multiplier,
                questionNumber: index + 1
            });
        }
    }

    /**
     * Actualiza barra de progreso
     */
    updateProgressBar(currentIndex) {
        const progressBar = this.trainingScreen.querySelector('.discovery-progress-bar');
        if (!progressBar) return;

        progressBar.innerHTML = '';

        for (let i = 0; i < this.totalQuestions; i++) {
            const star = document.createElement('span');
            star.className = 'progress-star';

            if (i < currentIndex) {
                star.classList.add('completed');
                star.textContent = '⭐';
            } else if (i === currentIndex) {
                star.classList.add('current');
                star.textContent = '⚪';
            } else {
                star.textContent = '⚪';
            }

            progressBar.appendChild(star);
        }

        // Texto de progreso
        const progressText = this.trainingScreen.querySelector('.discovery-progress-text');
        if (progressText) {
            progressText.textContent = `${currentIndex}/${this.totalQuestions}`;
        }
    }

    /**
     * Actualiza contenido de la pregunta
     */
    updateQuestionContent(question) {
        const questionEl = this.trainingScreen.querySelector('.discovery-question');
        if (questionEl) {
            questionEl.innerHTML = `
                <span class="question-number">${this.table}</span>
                <span class="question-operator">×</span>
                <span class="question-number">${question.multiplier}</span>
                <span class="question-operator">=</span>
                <span class="question-mark">?</span>
            `;
        }
    }

    /**
     * Configura opciones de respuesta
     */
    setupAnswerOptions(question) {
        const optionsContainer = this.trainingScreen.querySelector('.discovery-options');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'discovery-option-btn';
            button.textContent = option;
            button.onclick = () => this.handleAnswer(question, option);

            optionsContainer.appendChild(button);
        });
    }

    /**
     * Configura botón de ayuda
     */
    setupHelpButton(question) {
        const helpContainer = this.trainingScreen.querySelector('.discovery-help-container');
        const helpButton = this.trainingScreen.querySelector('.discovery-help-btn');
        const helpText = this.trainingScreen.querySelector('.discovery-help-text');

        if (!helpContainer || !helpButton || !helpText) return;

        if (question.helpAvailable) {
            helpContainer.style.display = 'block';
            helpText.textContent = question.helpText;

            if (question.showHelpAuto) {
                // Mostrar ayuda automáticamente
                helpText.style.display = 'block';
                helpButton.style.display = 'none';
            } else {
                // Ayuda disponible con botón
                helpText.style.display = 'none';
                helpButton.style.display = 'inline-block';
                helpButton.onclick = () => {
                    helpText.style.display = 'block';
                    helpButton.style.display = 'none';

                    // Track uso de ayuda
                    if (window.bootstrap?.uxResearch?.analytics) {
                        window.bootstrap.uxResearch.analytics.trackEvent('discovery_help_used', {
                            table: this.table,
                            multiplier: question.multiplier
                        });
                    }
                };
            }
        } else {
            // Sin ayuda disponible
            helpContainer.style.display = 'none';
        }
    }

    /**
     * Actualiza Mateo mini en esquina
     */
    updateMateoMini(question) {
        const mateoMini = this.trainingScreen.querySelector('.discovery-mateo-mini');
        if (!mateoMini) return;

        // Mensaje de ánimo contextual
        const encouragements = [
            "¡Tú puedes!",
            "¡Muy bien!",
            "¡Sigue así!",
            "¡Excelente!",
            "¡Lo estás haciendo genial!"
        ];

        const message = question.showHelpAuto ?
            "Recuerda el truco..." :
            encouragements[Math.floor(Math.random() * encouragements.length)];

        mateoMini.textContent = `🧙‍♂️ ${message}`;
    }

    /**
     * Maneja respuesta del usuario
     */
    handleAnswer(question, selectedAnswer) {
        const isCorrect = selectedAnswer === question.answer;
        const timeMs = Date.now() - this.attempts[question.multiplier].startTime;

        // Registrar intento
        this.attempts[question.multiplier].correct = isCorrect;
        this.attempts[question.multiplier].timeMs = timeMs;

        // Track respuesta
        if (window.bootstrap?.uxResearch?.analytics) {
            window.bootstrap.uxResearch.analytics.trackEvent('discovery_question_answered', {
                table: this.table,
                multiplier: question.multiplier,
                correct: isCorrect,
                timeMs,
                attempts: this.attempts[question.multiplier].attempts
            });
        }

        // Mostrar feedback
        this.showAnswerFeedback(question, isCorrect, selectedAnswer);
    }

    /**
     * Muestra feedback de respuesta
     */
    showAnswerFeedback(question, isCorrect, selectedAnswer) {
        if (isCorrect) {
            this.showCorrectFeedback(question);
        } else {
            this.showIncorrectFeedback(question, selectedAnswer);
        }
    }

    /**
     * Feedback para respuesta correcta
     */
    showCorrectFeedback(question) {
        // Feedback visual
        if (this.feedbackSystem) {
            this.feedbackSystem.showSuccess('¡PERFECTO!');
        }

        // Sonido de éxito
        if (this.soundSystem) {
            this.soundSystem.playCorrect();
        }

        // Mateo celebra
        if (this.mateo) {
            const messages = [
                '¡Excelente!',
                '¡Lo lograste!',
                '¡Genial!',
                '¡Perfecto!',
                '¡Eres un genio!'
            ];
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.mateo.show('celebrating', message, 1500);
        }

        // Caption
        if (this.accessibility.audio) {
            this.accessibility.audio.showCaption('✨ ¡Correcto!', 1500);
        }

        // Avanzar a siguiente pregunta después de breve pausa
        setTimeout(() => {
            this.showQuestion(this.currentQuestionIndex + 1);
        }, 1500);
    }

    /**
     * Feedback para respuesta incorrecta
     */
    showIncorrectFeedback(question, selectedAnswer) {
        // Feedback visual suave (no agresivo)
        if (this.feedbackSystem) {
            this.feedbackSystem.showWarning('¡Casi! Intenta de nuevo');
        }

        // Sonido suave
        if (this.soundSystem) {
            this.soundSystem.playWrong();
        }

        // Mateo ayuda
        if (this.mateo) {
            const helpMessage = `Elegiste ${selectedAnswer}, pero recuerda: ${this.table} × ${question.multiplier} = ${question.answer}`;
            this.mateo.show('thinking', helpMessage, 3000);
        }

        // Caption
        if (this.accessibility.audio) {
            this.accessibility.audio.showCaption('🤔 Intenta de nuevo', 2000);
        }

        // Permitir reintentar (no avanzar automáticamente)
        // El usuario puede intentar de nuevo eligiendo otra opción
    }

    /**
     * FASE 3: Pantalla de recompensas
     */
    showRewardPhase() {
        this.phase = 'reward';

        console.log('🎊 Fase Reward: Mostrando recompensas');

        // Calcular estadísticas
        const stats = this.calculateStats();

        // Ocultar training, mostrar reward
        this.hideAllScreens();
        this.rewardScreen.classList.add('active');

        // Actualizar contenido de recompensas
        this.updateRewardContent(stats);

        // Marcar tabla como descubierta
        this.markTableAsDiscovered(stats);

        // Mateo celebra
        if (this.mateo) {
            this.mateo.show('celebrating', `¡IMPRESIONANTE! Ahora la Tabla del ${this.table} es tuya para siempre.`, 0);
        }

        // Sonido de victoria
        if (this.soundSystem) {
            this.soundSystem.playSuccess();
        }

        // Confetti
        if (window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Caption
        if (this.accessibility.audio) {
            this.accessibility.audio.showCaption('🎊 ¡Misión completada!', 4000);
        }

        // Track completado
        if (window.bootstrap?.uxResearch?.analytics) {
            window.bootstrap.uxResearch.analytics.trackEvent('discovery_completed', {
                table: this.table,
                accuracy: stats.accuracy,
                totalTime: stats.totalTime,
                avgResponseTime: stats.avgResponseTime
            });
        }

        // Configurar botones
        this.setupRewardButtons();
    }

    /**
     * Calcula estadísticas de la sesión
     */
    calculateStats() {
        let correctCount = 0;
        let totalTime = 0;
        let totalAttempts = 0;

        Object.values(this.attempts).forEach(attempt => {
            if (attempt.correct) correctCount++;
            totalTime += attempt.timeMs;
            totalAttempts += attempt.attempts;
        });

        return {
            correctCount,
            totalQuestions: this.totalQuestions,
            accuracy: correctCount / this.totalQuestions,
            totalTime: Date.now() - this.sessionStartTime,
            avgResponseTime: totalTime / this.totalQuestions,
            totalAttempts
        };
    }

    /**
     * Actualiza contenido de pantalla de recompensas
     */
    updateRewardContent(stats) {
        // Título
        const title = this.rewardScreen.querySelector('.reward-title');
        if (title) {
            title.textContent = `🏆 TABLA DEL ${this.table} DESBLOQUEADA`;
        }

        // Estadísticas
        const statsEl = this.rewardScreen.querySelector('.reward-stats');
        if (statsEl) {
            const minutes = Math.floor(stats.totalTime / 60000);
            const seconds = Math.floor((stats.totalTime % 60000) / 1000);

            statsEl.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Precisión:</span>
                    <span class="stat-value">${Math.round(stats.accuracy * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Tiempo total:</span>
                    <span class="stat-value">${minutes}m ${seconds}s</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Correctas:</span>
                    <span class="stat-value">${stats.correctCount}/${stats.totalQuestions}</span>
                </div>
            `;
        }

        // Recompensas
        const rewardsEl = this.rewardScreen.querySelector('.reward-items');
        if (rewardsEl) {
            const coins = 100;
            const xp = 50;

            rewardsEl.innerHTML = `
                <div class="reward-item">
                    <span class="reward-icon">🥈</span>
                    <span class="reward-text">Medalla "Maestro del ${this.table}"</span>
                </div>
                <div class="reward-item">
                    <span class="reward-icon">💰</span>
                    <span class="reward-text">+${coins} Monedas</span>
                </div>
                <div class="reward-item">
                    <span class="reward-icon">⚡</span>
                    <span class="reward-text">+${xp} XP</span>
                </div>
            `;

            // Otorgar recompensas
            if (this.playerService) {
                this.playerService.addCoins(coins);
                this.playerService.addXP(xp);
            }
        }
    }

    /**
     * Marca tabla como descubierta en PlayerService
     */
    markTableAsDiscovered(stats) {
        if (!this.playerService) return;

        // Actualizar tracking granular
        const tableMastery = {
            overall: Math.round(stats.accuracy * 100),
            discoveryCompleted: true,
            discoveryDate: Date.now(),
            lastPracticed: Date.now(),
            practiceSessionsCount: 1,
            avgResponseTime: stats.avgResponseTime,
            currentStreak: 0,
            bestStreak: 0,
            multipliers: {}
        };

        // Guardar mastery por multiplicador
        for (let multiplier = 1; multiplier <= this.totalQuestions; multiplier++) {
            const attempt = this.attempts[multiplier];
            tableMastery.multipliers[multiplier] = {
                correct: attempt.correct ? 1 : 0,
                total: attempt.attempts,
                mastery: attempt.correct ? 100 : 0
            };
        }

        // Guardar en player data
        this.playerService.updateTableMastery(this.table, tableMastery);

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('discovery:completed', {
                table: this.table,
                stats,
                mastery: tableMastery
            });
        }
    }

    /**
     * Configura botones de la pantalla de recompensas
     */
    setupRewardButtons() {
        const practiceBtn = this.rewardScreen.querySelector('.reward-practice-btn');
        const mapBtn = this.rewardScreen.querySelector('.reward-map-btn');

        if (practiceBtn) {
            practiceBtn.onclick = () => {
                this.exitToMode('practice');
            };
        }

        if (mapBtn) {
            mapBtn.onclick = () => {
                this.exitToMode('map');
            };
        }
    }

    /**
     * Sale del descubrimiento a otro modo
     */
    exitToMode(mode) {
        // Ocultar pantallas de descubrimiento
        this.hideAllScreens();

        // Emitir evento de salida
        if (this.eventBus) {
            this.eventBus.emit('discovery:exited', {
                table: this.table,
                nextMode: mode
            });
        }

        // Navegar según modo
        if (mode === 'practice') {
            // Iniciar modo práctica para esta tabla
            if (this.context.controllers?.mode) {
                this.context.controllers.mode.startPracticeMode([this.table]);
            }
        } else if (mode === 'map') {
            // Volver al mapa principal
            if (this.context.controllers?.screen) {
                this.context.controllers.screen.showScreen('main');
            }
        }
    }

    /**
     * Oculta todas las pantallas de descubrimiento
     */
    hideAllScreens() {
        if (this.introScreen) this.introScreen.classList.remove('active');
        if (this.trainingScreen) this.trainingScreen.classList.remove('active');
        if (this.rewardScreen) this.rewardScreen.classList.remove('active');
    }

    /**
     * Limpia y destruye la instancia
     */
    destroy() {
        this.hideAllScreens();

        if (this.mateo) {
            this.mateo.hide();
        }

        // Emitir evento de destrucción
        if (this.eventBus) {
            this.eventBus.emit('discovery:destroyed', { table: this.table });
        }
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.TableDiscoveryEngine = TableDiscoveryEngine;
}
