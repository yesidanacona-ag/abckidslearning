// ================================
// MULTIPLICAR MÁGICO - APP PRINCIPAL
// Sistema Adaptativo Inteligente
// ================================

class MultiplicationGame {
    constructor() {
        this.player = this.loadPlayer() || this.createNewPlayer();
        this.currentMode = null;
        this.currentQuestion = null;
        this.gameState = {};
        this.adaptiveSystem = new AdaptiveSystem(this.player);

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initParticles();
        this.setupSoundToggle();

        if (this.player.name) {
            this.showMainScreen();
        } else {
            this.showWelcomeScreen();
        }
    }

    setupSoundToggle() {
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            // Actualizar estado inicial
            if (!window.soundSystem || !window.soundSystem.enabled) {
                soundBtn.classList.add('muted');
            }

            soundBtn.addEventListener('click', () => {
                if (window.soundSystem) {
                    const enabled = window.soundSystem.toggle();
                    if (enabled) {
                        soundBtn.classList.remove('muted');
                        soundBtn.classList.add('playing');
                        setTimeout(() => soundBtn.classList.remove('playing'), 300);
                    } else {
                        soundBtn.classList.add('muted');
                    }
                }
            });
        }
    }

    setupAvatarTabs() {
        const tabs = document.querySelectorAll('.avatar-tab');
        const avatarOptions = document.querySelectorAll('.avatar-option');

        // Mostrar solo primera categoría inicialmente
        avatarOptions.forEach(avatar => {
            if (avatar.dataset.category !== 'personajes') {
                avatar.style.display = 'none';
            }
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;

                if (window.soundSystem) {
                    window.soundSystem.playClick();
                }

                // Actualizar tabs activas
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Filtrar avatares
                avatarOptions.forEach(avatar => {
                    if (avatar.dataset.category === category) {
                        avatar.style.display = 'flex';
                    } else {
                        avatar.style.display = 'none';
                    }
                });
            });
        });
    }

    createNewPlayer() {
        return {
            name: '',
            avatar: '🦸',
            level: 1,
            xp: 0,
            totalStars: 0,
            totalMedals: 0,
            streak: 0,
            bestStreak: 0,
            stats: {
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                timeSpent: 0
            },
            tableMastery: {}, // Maestría de cada tabla (1-10)
            achievements: [],
            medals: { gold: 0, silver: 0, bronze: 0 },
            powerups: { shield: 2, hint: 3, skip: 1 }, // Power-ups iniciales
            activePowerups: [], // Power-ups activos en la partida actual
            lastPlayed: Date.now()
        };
    }

    loadPlayer() {
        const saved = localStorage.getItem('multiplicationPlayer');
        return saved ? JSON.parse(saved) : null;
    }

    savePlayer() {
        this.player.lastPlayed = Date.now();
        localStorage.setItem('multiplicationPlayer', JSON.stringify(this.player));
    }

    // ================================
    // NAVEGACIÓN DE PANTALLAS
    // ================================

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showWelcomeScreen() {
        this.showScreen('welcomeScreen');
    }

    showMainScreen() {
        this.updateHeader();
        this.showScreen('mainScreen');
    }

    updateHeader() {
        document.getElementById('headerPlayerName').textContent = this.player.name;
        document.getElementById('playerAvatar').textContent = this.player.avatar;
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('totalStars').textContent = this.player.totalStars;
        document.getElementById('totalMedals').textContent = this.player.totalMedals;
        document.getElementById('streak').textContent = this.player.streak;

        const xpNeeded = this.player.level * 100;
        const xpProgress = (this.player.xp / xpNeeded) * 100;
        document.getElementById('xpBar').style.width = xpProgress + '%';
    }

    // ================================
    // SISTEMA DE EXPERIENCIA Y NIVELES
    // ================================

    addXP(amount) {
        this.player.xp += amount;
        const xpNeeded = this.player.level * 100;

        if (this.player.xp >= xpNeeded) {
            this.player.xp -= xpNeeded;
            this.player.level++;
            this.showLevelUpAnimation();
            this.checkAchievements();
        }

        this.updateHeader();
        this.savePlayer();
    }

    showLevelUpAnimation() {
        // Sonido épico de nivel up
        if (window.soundSystem) {
            window.soundSystem.playLevelUp();
            setTimeout(() => window.soundSystem.playConfetti(), 300);
        }

        this.createConfetti();
        this.showNotification(`¡Nivel ${this.player.level}! 🎉`, 'success');

        // Mostrar Mateo celebrando nivel up
        if (window.mateoMascot) {
            window.mateoMascot.onLevelUp(this.player.level);
        }
    }

    // ================================
    // EVENT LISTENERS
    // ================================

    setupEventListeners() {
        // Bienvenida
        const startBtn = document.getElementById('startAdventure');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.handleWelcomeComplete());
        }

        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.player.avatar = e.target.dataset.avatar;
            });
        });

        // Seleccionar primer avatar por defecto
        const firstAvatar = document.querySelector('.avatar-option[data-category="personajes"]');
        if (firstAvatar) {
            firstAvatar.classList.add('selected');
            this.player.avatar = firstAvatar.dataset.avatar;
        }

        // Sistema de tabs para filtrar avatares
        this.setupAvatarTabs();

        // Modos de juego
        document.getElementById('practiceMode')?.addEventListener('click', () => this.startPracticeMode());
        document.getElementById('challengeMode')?.addEventListener('click', () => this.startChallengeMode());
        document.getElementById('adventureMode')?.addEventListener('click', () => this.startAdventureMode());
        document.getElementById('raceMode')?.addEventListener('click', () => this.startRaceMode());
        document.getElementById('bossMode')?.addEventListener('click', () => this.startBossMode());
        document.getElementById('progressMode')?.addEventListener('click', () => this.showProgressScreen());

        // Botones de vuelta
        document.getElementById('backFromPractice')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromChallenge')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromAdventure')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromRace')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromBoss')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromProgress')?.addEventListener('click', () => this.showMainScreen());

        // Modo Práctica
        document.querySelectorAll('.table-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('selected');
            });
        });

        document.getElementById('startPractice')?.addEventListener('click', () => this.handleStartPractice());

        // Desafío Rápido
        document.getElementById('startChallenge')?.addEventListener('click', () => this.handleStartChallenge());

        // Modal de resultados
        document.getElementById('returnToMain')?.addEventListener('click', () => {
            this.hideModal();
            this.showMainScreen();
        });

        document.getElementById('playAgain')?.addEventListener('click', () => {
            this.hideModal();
            if (this.currentMode === 'practice') {
                this.startPracticeMode();
            } else if (this.currentMode === 'challenge') {
                this.startChallengeMode();
            }
        });

        // Modal de trucos mnemotécnicos
        document.getElementById('showTricksBtn')?.addEventListener('click', () => this.showTricksModal());
        document.getElementById('closeTrickModal')?.addEventListener('click', () => this.hideTricksModal());
        document.getElementById('trickModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'trickModal') {
                this.hideTricksModal();
            }
        });
    }

    handleWelcomeComplete() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();

        if (!name) {
            this.showNotification('¡Por favor escribe tu nombre!', 'warning');
            if (window.soundSystem) window.soundSystem.playNotification();
            return;
        }

        this.player.name = name;
        this.savePlayer();
        this.showMainScreen();
        this.createConfetti();
        this.showNotification(`¡Bienvenido ${name}! 🎉`, 'success');

        // Sonidos de bienvenida
        if (window.soundSystem) {
            window.soundSystem.playVictory();
            setTimeout(() => window.soundSystem.playConfetti(), 500);
        }
    }

    // ================================
    // MODO PRÁCTICA
    // ================================

    startPracticeMode() {
        this.currentMode = 'practice';
        this.showScreen('practiceScreen');

        // Resetear selección
        document.querySelector('.practice-setup').classList.remove('hidden');
        document.querySelector('.practice-game').classList.add('hidden');

        // Sugerir tablas basado en sistema adaptativo
        const suggested = this.adaptiveSystem.getSuggestedTables();
        document.querySelectorAll('.table-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (suggested.includes(parseInt(btn.dataset.table))) {
                btn.classList.add('selected');
            }
        });
    }

    handleStartPractice() {
        const selectedTables = Array.from(document.querySelectorAll('.table-btn.selected'))
            .map(btn => parseInt(btn.dataset.table));

        if (selectedTables.length === 0) {
            this.showNotification('¡Selecciona al menos una tabla!', 'warning');
            return;
        }

        this.gameState = {
            mode: 'practice',
            tables: selectedTables,
            questions: this.generateQuestions(selectedTables, 10),
            currentQuestionIndex: 0,
            score: 0,
            correct: 0,
            incorrect: 0,
            streak: 0
        };

        // Inicializar power-ups
        this.initializePowerups();

        document.querySelector('.practice-setup').classList.add('hidden');
        document.querySelector('.practice-game').classList.remove('hidden');

        this.showNextQuestion();
    }

    generateQuestions(tables, count) {
        const questions = [];
        const weights = this.adaptiveSystem.getTableWeights(tables);

        for (let i = 0; i < count; i++) {
            const table = this.weightedRandomTable(tables, weights);
            const multiplier = Math.floor(Math.random() * 10) + 1;

            questions.push({
                table: table,
                multiplier: multiplier,
                answer: table * multiplier
            });
        }

        return questions;
    }

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

    showNextQuestion() {
        if (this.gameState.currentQuestionIndex >= this.gameState.questions.length) {
            this.endPracticeMode();
            return;
        }

        const question = this.gameState.questions[this.gameState.currentQuestionIndex];
        this.currentQuestion = question;

        // Actualizar UI
        document.getElementById('questionNumber').textContent = this.gameState.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.gameState.questions.length;
        document.getElementById('questionText').textContent = `${question.table} × ${question.multiplier} = ?`;
        document.getElementById('practiceScore').textContent = this.gameState.score;
        document.getElementById('correctCount').textContent = this.gameState.correct;
        document.getElementById('incorrectCount').textContent = this.gameState.incorrect;
        document.getElementById('currentStreak').textContent = this.gameState.streak;

        // Limpiar feedback
        document.getElementById('feedbackContainer').innerHTML = '';

        // Generar opciones
        this.generateAnswerOptions(question.answer);
    }

    generateAnswerOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        // Generar opciones incorrectas inteligentes
        while (options.size < 4) {
            const variation = Math.floor(Math.random() * 3);
            let wrongAnswer;

            switch (variation) {
                case 0: // Cercano
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
                    break;
                case 1: // Error común (suma en vez de multiplicar)
                    wrongAnswer = this.currentQuestion.table + this.currentQuestion.multiplier;
                    break;
                case 2: // Tabla vecina
                    wrongAnswer = (this.currentQuestion.table + (Math.random() < 0.5 ? 1 : -1)) * this.currentQuestion.multiplier;
                    break;
            }

            if (wrongAnswer > 0 && wrongAnswer <= 200) {
                options.add(wrongAnswer);
            }
        }

        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        const container = document.getElementById('answerOptions');
        container.innerHTML = '';

        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleAnswer(option, btn));
            container.appendChild(btn);
        });
    }

    handleAnswer(selectedAnswer, btnElement) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;

        // Deshabilitar todos los botones
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (parseInt(btn.textContent) === this.currentQuestion.answer) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            btnElement.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            btnElement.classList.add('incorrect');
            this.handleIncorrectAnswer(selectedAnswer);
        }

        // Registrar respuesta en sistema adaptativo
        this.adaptiveSystem.recordAnswer(
            this.currentQuestion.table,
            isCorrect,
            Date.now() - this.gameState.questionStartTime
        );

        // Siguiente pregunta después de un delay
        setTimeout(() => {
            this.gameState.currentQuestionIndex++;
            this.showNextQuestion();
        }, 1500);
    }

    handleCorrectAnswer() {
        this.gameState.correct++;
        this.gameState.streak++;
        this.player.streak++;

        if (this.player.streak > this.player.bestStreak) {
            this.player.bestStreak = this.player.streak;
        }

        const points = 10 + (this.gameState.streak * 2);
        this.gameState.score += points;

        this.addXP(5);
        this.player.stats.correctAnswers++;
        this.player.totalStars += 1;

        // Sonidos
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
            window.soundSystem.playStar();

            // Sonido de racha si tiene 3+
            if (this.gameState.streak >= 3) {
                setTimeout(() => {
                    window.soundSystem.playStreak(this.gameState.streak);
                }, 200);
            }
        }

        const feedback = document.getElementById('feedbackContainer');
        const messages = ['¡Excelente! ⭐', '¡Perfecto! 🌟', '¡Increíble! ✨', '¡Genial! 🎉', '¡WOW! 🤩', '¡BOOM! 💥', '¡SÚPER! 🦸'];
        feedback.innerHTML = `<div style="color: #10b981; font-size: 1.5rem;">${messages[Math.floor(Math.random() * messages.length)]}</div>`;

        this.createMiniConfetti();

        // Mostrar Mateo celebrando
        if (window.mateoMascot) {
            window.mateoMascot.onCorrectAnswer(this.gameState.streak);
        }
    }

    handleIncorrectAnswer(selectedAnswer) {
        // Verificar si tiene escudo activo
        if (this.player.activePowerups.includes('shield')) {
            this.showNotification('¡El escudo te protegió! 🛡️', 'success');
            if (window.soundSystem) {
                window.soundSystem.playPowerup();
            }

            // Remover escudo
            this.player.activePowerups = this.player.activePowerups.filter(p => p !== 'shield');
            document.querySelector('.question-display')?.classList.remove('shielded');

            const feedback = document.getElementById('feedbackContainer');
            feedback.innerHTML = `<div style="color: #10b981; font-size: 1.5rem;">🛡️ ¡Escudo activado! No perdiste la racha.</div>`;

            // No contar como error
            return;
        }

        this.gameState.incorrect++;
        this.gameState.streak = 0;
        this.player.streak = 0;

        this.player.stats.incorrectAnswers++;

        // Sonido suave de error
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        // Análisis pedagógico del error
        const explanation = this.analyzeError(selectedAnswer);

        const feedback = document.getElementById('feedbackContainer');
        feedback.innerHTML = `
            <div style="color: #f59e0b; text-align: left; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 12px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">
                    ${explanation.icon} ${explanation.title}
                </div>
                <div style="font-size: 1rem; margin-bottom: 8px;">
                    ${explanation.message}
                </div>
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); font-style: italic;">
                    💡 ${explanation.tip}
                </div>
            </div>
        `;

        // Mostrar Mateo dando apoyo
        if (window.mateoMascot) {
            window.mateoMascot.onIncorrectAnswer(true);
        }
    }

    analyzeError(selectedAnswer) {
        const { table, multiplier, answer } = this.currentQuestion;
        const question = `${table} × ${multiplier}`;

        // Tipo 1: Confundió con suma
        if (selectedAnswer === table + multiplier) {
            return {
                icon: '➕',
                title: '¡Casi! Pero es multiplicación, no suma',
                message: `Respondiste ${selectedAnswer}, que es ${table} + ${multiplier}. Pero ${question} = ${answer}`,
                tip: `Multiplicar es sumar ${multiplier} veces: ${table} + ${table}${multiplier > 2 ? ` + ${table}...` : ''} = ${answer}`
            };
        }

        // Tipo 2: Tabla vecina (confundió con tabla anterior/siguiente)
        if (selectedAnswer === (table - 1) * multiplier) {
            return {
                icon: '🔢',
                title: 'Usaste la tabla equivocada',
                message: `Respondiste ${selectedAnswer}, que es ${table-1} × ${multiplier}. Pero buscamos ${question} = ${answer}`,
                tip: this.getMnemonicTip(table, multiplier) || `Recuerda: tabla del ${table}, no del ${table-1}`
            };
        }

        if (selectedAnswer === (table + 1) * multiplier) {
            return {
                icon: '🔢',
                title: 'Usaste la tabla equivocada',
                message: `Respondiste ${selectedAnswer}, que es ${table+1} × ${multiplier}. Pero buscamos ${question} = ${answer}`,
                tip: this.getMnemonicTip(table, multiplier) || `Recuerda: tabla del ${table}, no del ${table+1}`
            };
        }

        // Tipo 3: Error de cálculo cercano (±1, ±2)
        const difference = Math.abs(selectedAnswer - answer);
        if (difference <= 2) {
            return {
                icon: '🎯',
                title: '¡Muy cerca!',
                message: `Respondiste ${selectedAnswer}, pero ${question} = ${answer}. Solo te faltaron/sobraron ${difference}`,
                tip: this.getMnemonicTip(table, multiplier) || `¡Casi lo logras! Sigue practicando la tabla del ${table}`
            };
        }

        // Tipo 4: Puede ser tabla invertida (6×7 vs 7×6)
        if (selectedAnswer === multiplier * table && multiplier !== table) {
            return {
                icon: '🔄',
                title: 'Invertiste los números',
                message: `Respondiste ${selectedAnswer}, que puede ser correcto para otra multiplicación. ${question} = ${answer}`,
                tip: 'Recuerda: el orden no cambia el resultado, pero asegúrate de usar los números correctos'
            };
        }

        // Tipo 5: Error general - buscar patrón
        const possibleTables = [];
        for (let i = 2; i <= 10; i++) {
            for (let j = 1; j <= 10; j++) {
                if (i * j === selectedAnswer) {
                    possibleTables.push(`${i}×${j}`);
                }
            }
        }

        if (possibleTables.length > 0) {
            return {
                icon: '🤔',
                title: 'Te confundiste con otra multiplicación',
                message: `Respondiste ${selectedAnswer}, que es ${possibleTables[0]}. Pero ${question} = ${answer}`,
                tip: this.getMnemonicTip(table, multiplier) || `Enfócate en la tabla del ${table}`
            };
        }

        // Error general sin patrón claro
        return {
            icon: '💭',
            title: 'La respuesta correcta es diferente',
            message: `${question} = ${answer}. ¡No te preocupes, todos cometemos errores!`,
            tip: this.getMnemonicTip(table, multiplier) || `Presiona el botón "📚 Trucos" para ver consejos de la tabla del ${table}`
        };
    }

    getMnemonicTip(table, multiplier) {
        // Obtener un truco específico para esta combinación si existe
        if (window.mnemonicSystem) {
            const trick = window.mnemonicSystem.getTrickForQuestion(table, multiplier);
            if (trick) {
                return trick.tip;
            }

            // Si no hay truco específico, dar un tip general de la tabla
            const tableInfo = window.mnemonicSystem.getTableInfo(table);
            if (tableInfo && tableInfo.tips && tableInfo.tips.length > 0) {
                return tableInfo.tips[0];
            }
        }

        return null;
    }

    // ================================
    // SISTEMA DE POWER-UPS
    // ================================

    initializePowerups() {
        // Asegurar que el jugador tenga los power-ups
        if (!this.player.powerups) {
            this.player.powerups = { shield: 2, hint: 3, skip: 1 };
        }
        if (!this.player.activePowerups) {
            this.player.activePowerups = [];
        }

        // Actualizar contadores visuales
        this.updatePowerupCounts();

        // Agregar event listeners
        document.getElementById('powerupShield')?.addEventListener('click', () => this.activatePowerup('shield'));
        document.getElementById('powerupHint')?.addEventListener('click', () => this.activatePowerup('hint'));
        document.getElementById('powerupSkip')?.addEventListener('click', () => this.activatePowerup('skip'));

        // Mostrar tooltips contextuales las primeras 3 veces
        this.showContextualTooltips();
    }

    showContextualTooltips() {
        // Verificar cuántas veces ha jugado
        let sessionCount = parseInt(localStorage.getItem('practiceSessionCount') || '0');
        sessionCount++;
        localStorage.setItem('practiceSessionCount', sessionCount.toString());

        // Mostrar tooltips solo primeras 3 sesiones
        if (sessionCount <= 3) {
            setTimeout(() => {
                // Tooltip para power-ups
                this.createTooltip(
                    '#powerupsBar',
                    '💡 Usa los power-ups para ayudarte cuando lo necesites',
                    'bottom',
                    7000
                );
            }, 2000);

            setTimeout(() => {
                // Tooltip para botón de trucos
                const tricksBtn = document.getElementById('showTricksBtn');
                if (tricksBtn) {
                    this.createTooltip(
                        '#showTricksBtn',
                        '📚 ¿Atascado? ¡Presiona aquí para ver trucos!',
                        'left',
                        7000
                    );
                }
            }, 4000);
        }
    }

    createTooltip(targetSelector, message, position = 'top', duration = 5000) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        // Crear tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip-hint ${position} dismissable`;
        tooltip.textContent = message;
        document.body.appendChild(tooltip);

        // Posicionar según el target
        const rect = targetElement.getBoundingClientRect();

        switch(position) {
            case 'top':
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 15) + 'px';
                break;
            case 'bottom':
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = (rect.bottom + 15) + 'px';
                break;
            case 'left':
                tooltip.style.left = (rect.left - tooltip.offsetWidth - 15) + 'px';
                tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';
                break;
            case 'right':
                tooltip.style.left = (rect.right + 15) + 'px';
                tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';
                break;
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playNotification();
        }

        // Remover al hacer click
        tooltip.addEventListener('click', () => {
            tooltip.remove();
        });

        // Auto-remover después de duration
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                tooltip.style.animation = 'tooltipFadeOut 0.3s ease-out forwards';
                setTimeout(() => tooltip.remove(), 300);
            }
        }, duration);
    }

    updatePowerupCounts() {
        document.getElementById('shieldCount').textContent = this.player.powerups.shield || 0;
        document.getElementById('hintCount').textContent = this.player.powerups.hint || 0;
        document.getElementById('skipCount').textContent = this.player.powerups.skip || 0;

        // Actualizar estado disabled
        this.updatePowerupStates();
    }

    updatePowerupStates() {
        const shieldBtn = document.getElementById('powerupShield');
        const hintBtn = document.getElementById('powerupHint');
        const skipBtn = document.getElementById('powerupSkip');

        if (shieldBtn) {
            if (this.player.powerups.shield <= 0 || this.player.activePowerups.includes('shield')) {
                shieldBtn.classList.add('disabled');
            } else {
                shieldBtn.classList.remove('disabled');
            }

            if (this.player.activePowerups.includes('shield')) {
                shieldBtn.classList.add('active');
            } else {
                shieldBtn.classList.remove('active');
            }
        }

        if (hintBtn) {
            hintBtn.classList.toggle('disabled', this.player.powerups.hint <= 0);
        }

        if (skipBtn) {
            skipBtn.classList.toggle('disabled', this.player.powerups.skip <= 0);
        }
    }

    activatePowerup(type) {
        // Verificar si tiene disponibles
        if (!this.player.powerups[type] || this.player.powerups[type] <= 0) {
            this.showNotification('¡No tienes más de este power-up!', 'warning');
            if (window.soundSystem) window.soundSystem.playNotification();
            return;
        }

        // No permitir activar escudo si ya está activo
        if (type === 'shield' && this.player.activePowerups.includes('shield')) {
            this.showNotification('¡El escudo ya está activo!', 'warning');
            if (window.soundSystem) window.soundSystem.playNotification();
            return;
        }

        // Consumir power-up
        this.player.powerups[type]--;
        this.savePlayer();

        // Efecto visual
        this.showPowerupEffect(type);

        // Ejecutar power-up
        switch(type) {
            case 'shield':
                this.activateShield();
                break;
            case 'hint':
                this.activateHint();
                break;
            case 'skip':
                this.activateSkip();
                break;
        }

        // Actualizar contadores
        this.updatePowerupCounts();
    }

    showPowerupEffect(type) {
        const icons = { shield: '🛡️', hint: '💡', skip: '⏭️' };
        const effect = document.createElement('div');
        effect.className = 'powerup-effect';
        effect.textContent = icons[type];
        document.body.appendChild(effect);

        if (window.soundSystem) {
            window.soundSystem.playPowerup();
        }

        // Mostrar Mateo explicando el power-up
        if (window.mateoMascot) {
            window.mateoMascot.onPowerUpUsed(type);
        }

        setTimeout(() => effect.remove(), 1000);
    }

    activateShield() {
        this.player.activePowerups.push('shield');
        document.querySelector('.question-display')?.classList.add('shielded');
        this.showNotification('¡Escudo activado! Te protegerá del próximo error 🛡️', 'success');
    }

    activateHint() {
        // Encontrar la respuesta correcta
        const correctAnswer = this.currentQuestion.answer;
        const options = document.querySelectorAll('.answer-option');

        let correctOption = null;
        options.forEach(opt => {
            if (parseInt(opt.dataset.answer) === correctAnswer) {
                correctOption = opt;
            }
        });

        if (correctOption) {
            correctOption.classList.add('hint-highlight');
            this.showNotification('¡Pista activada! La respuesta correcta brilla 💡', 'success');

            setTimeout(() => {
                correctOption?.classList.remove('hint-highlight');
            }, 3000);
        }
    }

    activateSkip() {
        this.showNotification('¡Pregunta saltada! ⏭️', 'success');

        // Contar como correcta para no romper la racha
        this.gameState.correct++;
        this.gameState.score += 5;

        // Avanzar a siguiente pregunta
        setTimeout(() => {
            this.gameState.currentQuestionIndex++;
            this.showNextQuestion();
        }, 500);
    }

    // ================================
    // TRUCOS MNEMOTÉCNICOS
    // ================================

    showTricksModal() {
        if (!window.mnemonicSystem) {
            this.showNotification('Sistema de trucos no disponible', 'warning');
            return;
        }

        // Detectar qué tablas está practicando
        const currentTables = this.gameState.tables || [2, 3, 4, 5, 6, 7, 8, 9, 10];

        // Crear selector de tablas
        let selectorHTML = '<div class="table-selector-grid">';
        currentTables.forEach(table => {
            selectorHTML += `
                <button class="table-selector-btn" data-table="${table}">
                    Tabla del ${table}
                </button>
            `;
        });
        selectorHTML += '</div>';

        // Mostrar primera tabla por defecto
        const firstTable = currentTables[0];
        const tableInfo = window.mnemonicSystem.getTableInfo(firstTable);

        if (!tableInfo) {
            this.showNotification('No hay trucos disponibles', 'warning');
            return;
        }

        // Actualizar modal
        document.getElementById('trickEmoji').textContent = tableInfo.emoji;
        document.getElementById('trickTitle').textContent = tableInfo.title;

        let bodyHTML = selectorHTML + this.generateTrickContent(tableInfo);
        document.getElementById('trickBody').innerHTML = bodyHTML;

        // Agregar event listeners a los botones de tabla
        document.querySelectorAll('.table-selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const table = parseInt(e.target.dataset.table);
                this.showTableTricks(table);

                // Actualizar botón activo
                document.querySelectorAll('.table-selector-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Marcar primer botón como activo
        document.querySelector('.table-selector-btn')?.classList.add('active');

        // Mostrar modal
        document.getElementById('trickModal').style.display = 'flex';

        if (window.soundSystem) {
            window.soundSystem.playClick();
        }
    }

    showTableTricks(table) {
        const tableInfo = window.mnemonicSystem.getTableInfo(table);
        if (!tableInfo) return;

        document.getElementById('trickEmoji').textContent = tableInfo.emoji;
        document.getElementById('trickTitle').textContent = tableInfo.title;

        // Mantener el selector pero actualizar el contenido
        const currentSelector = document.querySelector('.table-selector-grid');
        const newContent = this.generateTrickContent(tableInfo);

        // Reemplazar solo el contenido después del selector
        const trickBody = document.getElementById('trickBody');
        trickBody.innerHTML = '';
        if (currentSelector) {
            trickBody.appendChild(currentSelector);
        }
        trickBody.innerHTML += newContent;

        if (window.soundSystem) {
            window.soundSystem.playClick();
        }
    }

    generateTrickContent(tableInfo) {
        let html = `
            <div class="trick-section" style="border-left-color: ${tableInfo.color}">
                <h3>💡 Consejos para Recordar</h3>
                <ul class="trick-tips-list">
        `;

        tableInfo.tips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });

        html += `
                </ul>
            </div>

            <div class="trick-section" style="border-left-color: ${tableInfo.color}">
                <h3>✨ Ejemplos Prácticos</h3>
                <div class="trick-examples">
        `;

        tableInfo.tricks.forEach(trick => {
            html += `
                <div class="trick-example">
                    <div class="trick-example-question">${trick.question} = ?</div>
                    <div class="trick-example-tip">${trick.tip}</div>
                    <div class="trick-example-visual">${trick.visual}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    hideTricksModal() {
        document.getElementById('trickModal').style.display = 'none';

        if (window.soundSystem) {
            window.soundSystem.playClick();
        }
    }

    endPracticeMode() {
        this.player.stats.totalQuestions += this.gameState.questions.length;
        this.savePlayer();
        this.checkAchievements();
        this.checkMedals();
        this.showResultsModal();
    }

    // ================================
    // MODO DESAFÍO RÁPIDO
    // ================================

    startChallengeMode() {
        this.currentMode = 'challenge';
        this.showScreen('challengeScreen');

        // Ocultar el botón de inicio y mostrar el juego directamente
        document.getElementById('startChallenge').classList.add('hidden');

        this.gameState = {
            mode: 'challenge',
            timeLeft: 60,
            score: 0,
            correct: 0,
            streak: 0,
            isActive: false
        };

        // Iniciar después de un countdown
        this.startChallengeCountdown();
    }

    startChallengeCountdown() {
        let count = 3;
        const questionEl = document.getElementById('challengeQuestion');

        const countdown = setInterval(() => {
            questionEl.textContent = count > 0 ? count : '¡YA!';

            // Sonido de countdown
            if (window.soundSystem) {
                window.soundSystem.playCountdown(count);
            }

            if (count === 0) {
                clearInterval(countdown);
                setTimeout(() => {
                    this.gameState.isActive = true;
                    this.showChallengeQuestion();
                    this.startChallengeTimer();
                }, 500);
            }
            count--;
        }, 1000);
    }

    startChallengeTimer() {
        const timerEl = document.getElementById('challengeTimer');

        this.gameState.timerInterval = setInterval(() => {
            this.gameState.timeLeft--;
            timerEl.textContent = this.gameState.timeLeft;

            if (this.gameState.timeLeft <= 10) {
                timerEl.parentElement.style.color = '#ef4444';
                timerEl.parentElement.style.animation = 'pulse 0.5s ease-in-out infinite';
            }

            if (this.gameState.timeLeft <= 0) {
                this.endChallengeMode();
            }
        }, 1000);
    }

    showChallengeQuestion() {
        if (!this.gameState.isActive) return;

        // Generar pregunta adaptativa
        const tables = this.adaptiveSystem.getSuggestedTables();
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;

        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier
        };

        document.getElementById('challengeQuestion').textContent = `${table} × ${multiplier} = ?`;
        document.getElementById('challengeScoreBig').textContent = this.gameState.score;
        document.getElementById('challengeCorrect').textContent = this.gameState.correct;
        document.getElementById('challengeStreak').textContent = this.gameState.streak;

        this.generateChallengeOptions(this.currentQuestion.answer);
    }

    generateChallengeOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        while (options.size < 4) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const wrongAnswer = correctAnswer + offset;
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                options.add(wrongAnswer);
            }
        }

        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        const container = document.getElementById('challengeOptions');
        container.innerHTML = '';

        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleChallengeAnswer(option));
            container.appendChild(btn);
        });
    }

    handleChallengeAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;

        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, isCorrect, 0);

        if (isCorrect) {
            this.gameState.correct++;
            this.gameState.streak++;
            const points = 10 + (this.gameState.streak * 5);
            this.gameState.score += points;
            this.player.stats.correctAnswers++;
            this.addXP(3);
            this.createMiniConfetti();

            // Actualizar combo visual
            this.updateComboDisplay();

            // Mostrar mensaje especial en combos altos
            if (this.gameState.streak === 5) {
                this.showComboText('¡COMBO! 🔥');
            } else if (this.gameState.streak === 10) {
                this.showComboText('¡MEGA COMBO! ⚡');
            } else if (this.gameState.streak === 20) {
                this.showComboText('¡ULTRA COMBO! 💫');
            } else if (this.gameState.streak >= 30 && this.gameState.streak % 10 === 0) {
                this.showComboText('¡IMBATIBLE! 👑');
            }
        } else {
            this.gameState.streak = 0;
            this.player.stats.incorrectAnswers++;

            // Ocultar combo
            this.updateComboDisplay();
        }

        this.player.stats.totalQuestions++;
        this.showChallengeQuestion();
    }

    updateComboDisplay() {
        const comboCounter = document.getElementById('comboCounter');
        const comboNumber = document.getElementById('comboNumber');
        const comboMultiplier = document.getElementById('comboMultiplier');

        if (this.gameState.streak >= 3) {
            comboCounter.classList.remove('hidden');
            comboNumber.textContent = this.gameState.streak;

            // Calcular multiplicador
            const multiplier = 1 + Math.floor(this.gameState.streak / 5);
            comboMultiplier.textContent = `×${multiplier}`;

            // Animación de pulso
            comboNumber.style.animation = 'none';
            setTimeout(() => {
                comboNumber.style.animation = 'comboPulse 0.5s ease-in-out';
            }, 10);

            // Cambiar estilo según el combo
            comboCounter.classList.remove('combo-fire', 'combo-mega', 'combo-ultra');
            if (this.gameState.streak >= 20) {
                comboCounter.classList.add('combo-ultra');
            } else if (this.gameState.streak >= 10) {
                comboCounter.classList.add('combo-mega');
            } else if (this.gameState.streak >= 5) {
                comboCounter.classList.add('combo-fire');
            }
        } else {
            comboCounter.classList.add('hidden');
        }
    }

    showComboText(text) {
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        comboText.textContent = text;
        document.body.appendChild(comboText);

        if (window.soundSystem) {
            window.soundSystem.playVictory();
        }

        setTimeout(() => comboText.remove(), 1500);
    }

    endChallengeMode() {
        clearInterval(this.gameState.timerInterval);
        this.gameState.isActive = false;
        this.savePlayer();
        this.checkAchievements();
        this.checkMedals();
        this.showResultsModal();
    }

    // ================================
    // MODO AVENTURA ESPACIAL
    // ================================

    startAdventureMode() {
        this.currentMode = 'adventure';
        this.showScreen('adventureScreen');

        this.gameState = {
            mode: 'adventure',
            lives: 3,
            planet: 1,
            score: 0,
            enemies: []
        };

        this.initSpaceGame();
    }

    initSpaceGame() {
        const canvas = document.getElementById('spaceCanvas');
        const ctx = canvas.getContext('2d');

        // Animación de fondo espacial con estrellas
        this.spaceAnimation = {
            stars: [],
            rocket: { x: canvas.width / 2, y: canvas.height - 100 }
        };

        // Generar estrellas
        for (let i = 0; i < 100; i++) {
            this.spaceAnimation.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2
            });
        }

        this.animateSpace(ctx, canvas);
        this.showSpaceQuestion();
    }

    animateSpace(ctx, canvas) {
        ctx.fillStyle = '#000428';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar estrellas
        this.spaceAnimation.stars.forEach(star => {
            ctx.fillStyle = 'white';
            ctx.fillRect(star.x, star.y, star.size, star.size);
            star.y += 0.5;
            if (star.y > canvas.height) star.y = 0;
        });

        // Dibujar cohete
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚀', this.spaceAnimation.rocket.x, this.spaceAnimation.rocket.y);

        if (this.gameState.mode === 'adventure') {
            requestAnimationFrame(() => this.animateSpace(ctx, canvas));
        }
    }

    showSpaceQuestion() {
        const tables = this.adaptiveSystem.getSuggestedTables();
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;

        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier
        };

        document.getElementById('spaceQuestion').textContent = `${table} × ${multiplier} = ?`;
        document.getElementById('planetLevel').textContent = this.gameState.planet;
        document.getElementById('spaceScore').textContent = this.gameState.score;

        this.updateLivesDisplay();
        this.generateSpaceOptions(this.currentQuestion.answer);
    }

    generateSpaceOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        while (options.size < 4) {
            const wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
            if (wrongAnswer > 0) options.add(wrongAnswer);
        }

        const container = document.getElementById('spaceOptions');
        container.innerHTML = '';

        Array.from(options).sort(() => Math.random() - 0.5).forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'space-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleSpaceAnswer(option));
            container.appendChild(btn);
        });
    }

    handleSpaceAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;

        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, isCorrect, 0);
        this.player.stats.totalQuestions++;

        if (isCorrect) {
            this.gameState.score += 20;
            this.gameState.planet++;
            this.player.stats.correctAnswers++;
            this.addXP(5);
            this.createMiniConfetti();

            if (this.gameState.planet > 10) {
                this.showNotification('¡Has completado la aventura espacial! 🚀', 'success');
                setTimeout(() => {
                    this.savePlayer();
                    this.checkAchievements();
                    this.showResultsModal();
                }, 1500);
                return;
            }
        } else {
            this.gameState.lives--;
            this.player.stats.incorrectAnswers++;
            this.updateLivesDisplay();

            if (this.gameState.lives <= 0) {
                this.showNotification('¡Se acabaron las vidas! 😔', 'danger');
                setTimeout(() => {
                    this.savePlayer();
                    this.showResultsModal();
                }, 1500);
                return;
            }
        }

        setTimeout(() => this.showSpaceQuestion(), 1000);
    }

    updateLivesDisplay() {
        const hearts = '❤️'.repeat(this.gameState.lives);
        document.getElementById('livesContainer').textContent = hearts;
    }

    // ================================
    // MODO CARRERA MATEMÁTICA
    // ================================

    startRaceMode() {
        this.currentMode = 'race';
        this.showScreen('raceScreen');

        // Configurar avatar del jugador
        document.getElementById('playerRaceAvatar').textContent = this.player.avatar;
        document.getElementById('playerRaceName').textContent = this.player.name;

        this.gameState = {
            mode: 'race',
            totalQuestions: 10,
            currentQuestion: 0,
            playerProgress: 0,
            opponent1Progress: 0,
            opponent2Progress: 0,
            opponent3Progress: 0,
            score: 0,
            correct: 0,
            opponents: [
                { name: 'Conejo Rápido', speed: 0.8, progress: 0 },
                { name: 'Tortuga Sabia', speed: 0.5, progress: 0 },
                { name: 'Zorro Astuto', speed: 0.7, progress: 0 }
            ]
        };

        this.showRaceQuestion();
    }

    showRaceQuestion() {
        if (this.gameState.currentQuestion >= this.gameState.totalQuestions) {
            this.endRaceMode();
            return;
        }

        this.gameState.currentQuestion++;
        document.getElementById('raceQuestionNum').textContent = this.gameState.currentQuestion;

        // Generar pregunta adaptativa
        const tables = this.adaptiveSystem.getSuggestedTables();
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;

        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier,
            startTime: Date.now()
        };

        document.getElementById('raceQuestion').textContent = `${table} × ${multiplier} = ?`;
        document.getElementById('raceFeedback').innerHTML = '';

        this.generateRaceOptions(this.currentQuestion.answer);
    }

    generateRaceOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        while (options.size < 4) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const wrongAnswer = correctAnswer + offset;
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                options.add(wrongAnswer);
            }
        }

        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        const container = document.getElementById('raceAnswerOptions');
        container.innerHTML = '';

        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleRaceAnswer(option, btn));
            container.appendChild(btn);
        });
    }

    handleRaceAnswer(selectedAnswer, btnElement) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;
        const responseTime = Date.now() - this.currentQuestion.startTime;

        // Deshabilitar botones
        document.querySelectorAll('#raceAnswerOptions .answer-option').forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (parseInt(btn.textContent) === this.currentQuestion.answer) {
                btn.classList.add('correct');
            }
        });

        // Registrar respuesta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, isCorrect, responseTime);
        this.player.stats.totalQuestions++;

        if (isCorrect) {
            btnElement.classList.add('correct');
            this.gameState.correct++;
            this.player.stats.correctAnswers++;
            this.addXP(5);

            // Sonidos
            if (window.soundSystem) {
                window.soundSystem.playSuccess();
            }

            // Avance del jugador (más rápido si respondes rápido)
            const speedBonus = responseTime < 3000 ? 1.5 : 1;
            const advance = (10 * speedBonus);
            this.gameState.playerProgress = Math.min(100, this.gameState.playerProgress + advance);

            document.getElementById('raceFeedback').innerHTML = '<span style="color: #10b981;">¡Correcto! ⚡</span>';
        } else {
            btnElement.classList.add('incorrect');
            this.player.stats.incorrectAnswers++;

            if (window.soundSystem) {
                window.soundSystem.playError();
            }

            // Solo avanzas un poco si fallas
            this.gameState.playerProgress = Math.min(100, this.gameState.playerProgress + 2);

            document.getElementById('raceFeedback').innerHTML = `<span style="color: #f59e0b;">Era ${this.currentQuestion.answer} 💡</span>`;
        }

        // Avance de oponentes (automático)
        this.gameState.opponents.forEach((opp, index) => {
            const advance = (10 * opp.speed) + (Math.random() * 3);
            opp.progress = Math.min(100, opp.progress + advance);
            document.getElementById(`opponent${index + 1}Position`).style.left = opp.progress + '%';
        });

        // Actualizar posición del jugador
        document.getElementById('playerRacePosition').style.left = this.gameState.playerProgress + '%';

        // Siguiente pregunta o fin
        setTimeout(() => {
            if (this.gameState.playerProgress >= 100) {
                // Victoria anticipada!
                this.endRaceMode(true);
            } else {
                this.showRaceQuestion();
            }
        }, 1500);
    }

    endRaceMode(earlyVictory = false) {
        this.savePlayer();

        // Determinar posición final
        const positions = [
            { name: this.player.name, progress: this.gameState.playerProgress, isPlayer: true },
            ...this.gameState.opponents.map(opp => ({ name: opp.name, progress: opp.progress, isPlayer: false }))
        ].sort((a, b) => b.progress - a.progress);

        const playerPosition = positions.findIndex(p => p.isPlayer) + 1;

        // Mostrar resultados
        const modal = document.getElementById('resultsModal');
        modal.classList.remove('hidden');

        const resultsIcon = document.getElementById('resultsIcon');
        const resultsTitle = document.getElementById('resultsTitle');

        if (playerPosition === 1) {
            resultsIcon.textContent = '🏆';
            resultsTitle.textContent = '¡GANASTE LA CARRERA!';
            this.player.medals.gold++;
            if (window.soundSystem) window.soundSystem.playVictory();
        } else if (playerPosition === 2) {
            resultsIcon.textContent = '🥈';
            resultsTitle.textContent = '¡2do Lugar!';
            this.player.medals.silver++;
        } else if (playerPosition === 3) {
            resultsIcon.textContent = '🥉';
            resultsTitle.textContent = '¡3er Lugar!';
            this.player.medals.bronze++;
        } else {
            resultsIcon.textContent = '💪';
            resultsTitle.textContent = '¡Sigue Practicando!';
        }

        document.getElementById('finalScore').textContent = this.gameState.playerProgress.toFixed(0) + '%';
        document.getElementById('finalCorrect').textContent = this.gameState.correct;
        document.getElementById('finalAccuracy').textContent = Math.round((this.gameState.correct / this.gameState.totalQuestions) * 100) + '%';

        const rewards = document.getElementById('rewardsEarned');
        rewards.innerHTML = `
            <h3>Resultados:</h3>
            <div class="reward-item">🏁 Posición: ${playerPosition}° lugar</div>
            <div class="reward-item">📏 Distancia: ${this.gameState.playerProgress.toFixed(0)}%</div>
        `;

        if (playerPosition === 1) {
            this.player.totalMedals++;
            this.createConfetti();
        }

        this.savePlayer();
    }

    // ================================
    // MODO BATALLA DE JEFES
    // ================================

    startBossMode() {
        this.currentMode = 'boss';
        this.showScreen('bossScreen');

        // Configurar avatar del jugador
        document.getElementById('playerBattleAvatar').textContent = this.player.avatar;
        document.getElementById('playerBattleName').textContent = this.player.name;

        this.gameState = {
            mode: 'boss',
            currentBoss: 1,
            bossHealth: 100,
            playerHealth: 100,
            score: 0,
            bossesDefeated: 0,
            bosses: [
                { table: 2, name: 'Jefe del 2', avatar: '👹', health: 100 },
                { table: 3, name: 'Jefe del 3', avatar: '👺', health: 100 },
                { table: 4, name: 'Jefe del 4', avatar: '🧟', health: 100 },
                { table: 5, name: 'Jefe del 5', avatar: '👻', health: 100 },
                { table: 6, name: 'Jefe del 6', avatar: '🤡', health: 100 },
                { table: 7, name: 'Jefe del 7', avatar: '🧛', health: 100 },
                { table: 8, name: 'Jefe del 8', avatar: '🧌', health: 100 },
                { table: 9, name: 'Jefe del 9', avatar: '👽', health: 100 },
                { table: 10, name: 'Jefe del 10', avatar: '🤖', health: 100 },
                { table: 0, name: 'Jefe Final', avatar: '🐉', health: 150 } // Boss final: mix de todas
            ]
        };

        this.startBossBattle();
    }

    startBossBattle() {
        const boss = this.gameState.bosses[this.gameState.currentBoss - 1];

        document.getElementById('currentBossNum').textContent = this.gameState.currentBoss;
        document.getElementById('bossName').textContent = boss.name;
        document.getElementById('bossAvatar').textContent = boss.avatar;
        document.getElementById('bossHealthBar').style.width = '100%';
        document.getElementById('bossHealthText').textContent = '100%';
        document.getElementById('playerHealthBar').style.width = '100%';
        document.getElementById('playerHealthText').textContent = '100%';

        this.gameState.bossHealth = boss.health;
        this.gameState.playerHealth = 100;

        this.addBattleLog(`¡${boss.name} apareció!`, 'boss-attack');

        if (window.soundSystem) {
            window.soundSystem.playNotification();
        }

        this.showBossQuestion();
    }

    showBossQuestion() {
        if (this.gameState.bossHealth <= 0) {
            this.bossDefeated();
            return;
        }

        if (this.gameState.playerHealth <= 0) {
            this.playerDefeated();
            return;
        }

        const boss = this.gameState.bosses[this.gameState.currentBoss - 1];
        let table, multiplier;

        if (boss.table === 0) {
            // Jefe final: cualquier tabla
            table = Math.floor(Math.random() * 10) + 1;
        } else {
            table = boss.table;
        }

        multiplier = Math.floor(Math.random() * 10) + 1;

        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier,
            startTime: Date.now()
        };

        document.getElementById('bossQuestion').textContent = `${table} × ${multiplier} = ?`;

        this.generateBossOptions(this.currentQuestion.answer);
    }

    generateBossOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        while (options.size < 4) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const wrongAnswer = correctAnswer + offset;
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                options.add(wrongAnswer);
            }
        }

        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        const container = document.getElementById('bossAnswerOptions');
        container.innerHTML = '';

        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleBossAnswer(option, btn));
            container.appendChild(btn);
        });
    }

    handleBossAnswer(selectedAnswer, btnElement) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;
        const responseTime = Date.now() - this.currentQuestion.startTime;

        // Deshabilitar botones
        document.querySelectorAll('#bossAnswerOptions .answer-option').forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (parseInt(btn.textContent) === this.currentQuestion.answer) {
                btn.classList.add('correct');
            }
        });

        // Registrar respuesta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, isCorrect, responseTime);
        this.player.stats.totalQuestions++;

        if (isCorrect) {
            btnElement.classList.add('correct');
            this.player.stats.correctAnswers++;
            this.addXP(7);

            // Ataque al jefe
            const damage = 20;
            this.gameState.bossHealth = Math.max(0, this.gameState.bossHealth - damage);

            const bossHealthPercent = (this.gameState.bossHealth / this.gameState.bosses[this.gameState.currentBoss - 1].health) * 100;
            document.getElementById('bossHealthBar').style.width = bossHealthPercent + '%';
            document.getElementById('bossHealthText').textContent = Math.round(bossHealthPercent) + '%';

            this.addBattleLog(`⚔️ ¡Atacaste al jefe! (-${damage} HP)`, 'player-attack');

            if (window.soundSystem) {
                window.soundSystem.playSuccess();
                window.soundSystem.playStar();
            }

            // Animación de golpe
            const bossAvatar = document.getElementById('bossAvatar');
            bossAvatar.style.animation = 'none';
            setTimeout(() => {
                bossAvatar.style.animation = 'characterFloat 2s ease-in-out infinite';
            }, 100);
        } else {
            btnElement.classList.add('incorrect');
            this.player.stats.incorrectAnswers++;

            // Contraataque del jefe
            const damage = 15;
            this.gameState.playerHealth = Math.max(0, this.gameState.playerHealth - damage);

            const playerHealthPercent = this.gameState.playerHealth;
            document.getElementById('playerHealthBar').style.width = playerHealthPercent + '%';
            document.getElementById('playerHealthText').textContent = Math.round(playerHealthPercent) + '%';

            this.addBattleLog(`💥 ¡El jefe contraatacó! (-${damage} HP)`, 'boss-attack');

            if (window.soundSystem) {
                window.soundSystem.playError();
            }

            // Animación de golpe al jugador
            const playerAvatar = document.getElementById('playerBattleAvatar');
            playerAvatar.style.animation = 'none';
            setTimeout(() => {
                playerAvatar.style.animation = 'characterFloat 2s ease-in-out infinite';
            }, 100);
        }

        // Siguiente pregunta
        setTimeout(() => {
            this.showBossQuestion();
        }, 1500);
    }

    addBattleLog(message, type = '') {
        const log = document.getElementById('battleLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        log.prepend(entry);

        // Mantener solo últimas 10 entradas
        while (log.children.length > 10) {
            log.removeChild(log.lastChild);
        }
    }

    bossDefeated() {
        this.gameState.bossesDefeated++;
        this.addBattleLog(`🎉 ¡Derrotaste a ${this.gameState.bosses[this.gameState.currentBoss - 1].name}!`, 'victory');

        if (window.soundSystem) {
            window.soundSystem.playVictory();
        }

        // Siguiente jefe o victoria final
        if (this.gameState.currentBoss < 10) {
            setTimeout(() => {
                this.gameState.currentBoss++;
                this.startBossBattle();
            }, 2000);
        } else {
            // Victoria final!
            setTimeout(() => {
                this.endBossMode(true);
            }, 2000);
        }
    }

    playerDefeated() {
        this.addBattleLog('💔 ¡Has sido derrotado!', 'boss-attack');

        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        setTimeout(() => {
            this.endBossMode(false);
        }, 2000);
    }

    endBossMode(victory) {
        this.savePlayer();

        const modal = document.getElementById('resultsModal');
        modal.classList.remove('hidden');

        const resultsIcon = document.getElementById('resultsIcon');
        const resultsTitle = document.getElementById('resultsTitle');

        if (victory) {
            resultsIcon.textContent = '👑';
            resultsTitle.textContent = '¡VICTORIA ÉPICA!';
            this.player.medals.gold += 3;
            this.player.totalMedals += 3;
            this.createConfetti();
        } else {
            resultsIcon.textContent = '⚔️';
            resultsTitle.textContent = '¡Buen intento!';
            if (this.gameState.bossesDefeated > 0) {
                this.player.medals.bronze += this.gameState.bossesDefeated;
                this.player.totalMedals += this.gameState.bossesDefeated;
            }
        }

        document.getElementById('finalScore').textContent = this.gameState.bossesDefeated + '/10';
        document.getElementById('finalCorrect').textContent = this.player.stats.correctAnswers;
        document.getElementById('finalAccuracy').textContent = '-';

        const rewards = document.getElementById('rewardsEarned');
        rewards.innerHTML = `
            <h3>Resultados:</h3>
            <div class="reward-item">👾 Jefes Derrotados: ${this.gameState.bossesDefeated}/10</div>
            ${victory ? '<div class="reward-item">👑 ¡Eres el Campeón Supremo!</div>' : ''}
        `;

        this.savePlayer();
    }

    // ================================
    // PANTALLA DE PROGRESO
    // ================================

    showProgressScreen() {
        this.showScreen('progressScreen');
        this.updateProgressStats();
    }

    updateProgressStats() {
        // Estadísticas generales
        document.getElementById('totalQuestionsAnswered').textContent = this.player.stats.totalQuestions;
        document.getElementById('totalCorrectAnswers').textContent = this.player.stats.correctAnswers;

        const accuracy = this.player.stats.totalQuestions > 0
            ? Math.round((this.player.stats.correctAnswers / this.player.stats.totalQuestions) * 100)
            : 0;
        document.getElementById('accuracyRate').textContent = accuracy + '%';
        document.getElementById('bestStreak').textContent = this.player.bestStreak;

        // Maestría de tablas
        this.displayTableMastery();

        // Logros
        this.displayAchievements();

        // Medallas
        this.displayMedals();
    }

    displayTableMastery() {
        const container = document.querySelector('.tables-mastery');
        container.innerHTML = '';

        for (let i = 1; i <= 10; i++) {
            const mastery = this.adaptiveSystem.getTableMastery(i);
            const percentage = Math.round(mastery * 100);

            const item = document.createElement('div');
            item.className = 'table-mastery-item';
            item.innerHTML = `
                <div class="table-mastery-label">Tabla del ${i}</div>
                <div class="table-mastery-bar">
                    <div class="table-mastery-fill" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
            `;
            container.appendChild(item);
        }
    }

    displayAchievements() {
        const achievements = [
            { id: 'first_step', icon: '👣', name: 'Primeros Pasos', desc: 'Responde tu primera pregunta', condition: () => this.player.stats.totalQuestions >= 1 },
            { id: 'ten_streak', icon: '🔥', name: 'En Racha', desc: 'Consigue una racha de 10', condition: () => this.player.bestStreak >= 10 },
            { id: 'hundred_questions', icon: '💯', name: 'Centenario', desc: 'Responde 100 preguntas', condition: () => this.player.stats.totalQuestions >= 100 },
            { id: 'level_5', icon: '⭐', name: 'Estrella Brillante', desc: 'Alcanza el nivel 5', condition: () => this.player.level >= 5 },
            { id: 'level_10', icon: '🌟', name: 'Superestrella', desc: 'Alcanza el nivel 10', condition: () => this.player.level >= 10 },
            { id: 'master_table', icon: '🏆', name: 'Maestro de Tabla', desc: 'Domina completamente una tabla', condition: () => Object.values(this.player.tableMastery).some(m => m.mastery >= 0.95) },
            { id: 'perfect_game', icon: '💎', name: 'Perfección', desc: 'Completa un juego sin errores', condition: () => false }, // Se verifica en tiempo real
            { id: 'speed_demon', icon: '⚡', name: 'Rayo Veloz', desc: 'Responde 20 preguntas en desafío', condition: () => false }
        ];

        const container = document.getElementById('achievementsGrid');
        container.innerHTML = '';

        achievements.forEach(achievement => {
            const unlocked = this.player.achievements.includes(achievement.id) || achievement.condition();

            if (unlocked && !this.player.achievements.includes(achievement.id)) {
                this.player.achievements.push(achievement.id);
                this.savePlayer();
            }

            const item = document.createElement('div');
            item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.desc}</div>
            `;
            container.appendChild(item);
        });
    }

    displayMedals() {
        const container = document.getElementById('medalsDisplay');
        container.innerHTML = `
            <div class="medal-item">
                <span class="medal-icon">🥇</span>
                <div class="medal-count">${this.player.medals.gold}</div>
                <div class="medal-label">Oro</div>
            </div>
            <div class="medal-item">
                <span class="medal-icon">🥈</span>
                <div class="medal-count">${this.player.medals.silver}</div>
                <div class="medal-label">Plata</div>
            </div>
            <div class="medal-item">
                <span class="medal-icon">🥉</span>
                <div class="medal-count">${this.player.medals.bronze}</div>
                <div class="medal-label">Bronce</div>
            </div>
        `;
    }

    // ================================
    // SISTEMA DE LOGROS Y MEDALLAS
    // ================================

    checkAchievements() {
        const achievements = [
            // Logros básicos
            {
                id: 'first_steps',
                name: 'Primeros Pasos',
                desc: 'Responde 10 preguntas',
                icon: '👶',
                check: () => this.player.stats.totalQuestions >= 10
            },
            {
                id: 'apprentice',
                name: 'Aprendiz',
                desc: 'Responde 50 preguntas',
                icon: '📚',
                check: () => this.player.stats.totalQuestions >= 50
            },
            {
                id: 'scholar',
                name: 'Estudiante',
                desc: 'Responde 100 preguntas',
                icon: '🎓',
                check: () => this.player.stats.totalQuestions >= 100
            },
            {
                id: 'master',
                name: 'Maestro',
                desc: 'Responde 500 preguntas',
                icon: '🧙‍♂️',
                check: () => this.player.stats.totalQuestions >= 500
            },
            {
                id: 'legend',
                name: 'Leyenda',
                desc: 'Responde 1000 preguntas',
                icon: '👑',
                check: () => this.player.stats.totalQuestions >= 1000
            },

            // Logros de precisión
            {
                id: 'perfect_game',
                name: 'Perfección',
                desc: 'Responde 10 preguntas sin errores',
                icon: '💎',
                check: () => this.gameState.incorrect === 0 && this.gameState.correct >= 10
            },
            {
                id: 'sniper',
                name: 'Francotirador',
                desc: 'Logra 95% de precisión en 20 preguntas',
                icon: '🎯',
                check: () => {
                    const total = this.player.stats.correctAnswers + this.player.stats.incorrectAnswers;
                    return total >= 20 && (this.player.stats.correctAnswers / total) >= 0.95;
                }
            },
            {
                id: 'sharp_mind',
                name: 'Mente Aguda',
                desc: 'Responde 100 preguntas con 90% precisión',
                icon: '🧠',
                check: () => {
                    const total = this.player.stats.correctAnswers + this.player.stats.incorrectAnswers;
                    return total >= 100 && (this.player.stats.correctAnswers / total) >= 0.90;
                }
            },

            // Logros de racha
            {
                id: 'streak_5',
                name: 'Racha Ardiente',
                desc: 'Logra racha de 5',
                icon: '🔥',
                check: () => this.player.streak >= 5
            },
            {
                id: 'streak_10',
                name: 'Imparable',
                desc: 'Logra racha de 10',
                icon: '⚡',
                check: () => this.player.streak >= 10
            },
            {
                id: 'streak_20',
                name: 'Fenómeno',
                desc: 'Logra racha de 20',
                icon: '💫',
                check: () => this.player.streak >= 20
            },
            {
                id: 'streak_50',
                name: 'Imbatible',
                desc: 'Logra racha de 50',
                icon: '🌟',
                check: () => this.player.streak >= 50
            },

            // Logros de nivel
            {
                id: 'level_5',
                name: 'Ascenso',
                desc: 'Alcanza nivel 5',
                icon: '⬆️',
                check: () => this.player.level >= 5
            },
            {
                id: 'level_10',
                name: 'Veterano',
                desc: 'Alcanza nivel 10',
                icon: '🏆',
                check: () => this.player.level >= 10
            },
            {
                id: 'level_20',
                name: 'Élite',
                desc: 'Alcanza nivel 20',
                icon: '💪',
                check: () => this.player.level >= 20
            },
            {
                id: 'level_50',
                name: 'Dios de las Matemáticas',
                desc: 'Alcanza nivel 50',
                icon: '⚡👑',
                check: () => this.player.level >= 50
            },

            // Logros de maestría
            {
                id: 'table_master_1',
                name: 'Maestro de una Tabla',
                desc: 'Domina 100% una tabla',
                icon: '🎖️',
                check: () => Object.values(this.player.tableMastery).some(m => m >= 100)
            },
            {
                id: 'table_master_5',
                name: 'Experto',
                desc: 'Domina 5 tablas al 100%',
                icon: '🏅',
                check: () => Object.values(this.player.tableMastery).filter(m => m >= 100).length >= 5
            },
            {
                id: 'table_master_all',
                name: 'Gran Maestro',
                desc: 'Domina todas las tablas',
                icon: '👑✨',
                check: () => {
                    for (let i = 2; i <= 10; i++) {
                        if (!this.player.tableMastery[i] || this.player.tableMastery[i] < 100) {
                            return false;
                        }
                    }
                    return true;
                }
            },

            // Logros de medallas
            {
                id: 'gold_collector',
                name: 'Coleccionista Dorado',
                desc: 'Consigue 10 medallas de oro',
                icon: '🥇',
                check: () => this.player.medals.gold >= 10
            },
            {
                id: 'medal_hoarder',
                name: 'Acaparador',
                desc: 'Consigue 50 medallas en total',
                icon: '🏆',
                check: () => this.player.totalMedals >= 50
            },

            // Logros especiales
            {
                id: 'speed_demon',
                name: 'Demonio de Velocidad',
                desc: 'Responde 50 preguntas en el Desafío Rápido',
                icon: '💨',
                check: () => this.currentMode === 'challenge' && this.gameState.correct >= 50
            },
            {
                id: 'space_explorer',
                name: 'Explorador Espacial',
                desc: 'Completa la Aventura Espacial',
                icon: '🚀',
                check: () => this.currentMode === 'adventure' && this.gameState.planet > 10
            },
            {
                id: 'racer',
                name: 'Piloto Campeón',
                desc: 'Gana 10 carreras',
                icon: '🏁',
                check: () => (this.player.achievements.filter(a => a === 'racer_win').length >= 10)
            },
            {
                id: 'boss_slayer',
                name: 'Cazador de Jefes',
                desc: 'Derrota a todos los jefes',
                icon: '⚔️',
                check: () => this.player.achievements.includes('all_bosses_defeated')
            },
            {
                id: 'power_user',
                name: 'Estratega',
                desc: 'Usa 20 power-ups',
                icon: '🎮',
                check: () => {
                    const used = (2 - (this.player.powerups?.shield || 0)) +
                                 (3 - (this.player.powerups?.hint || 0)) +
                                 (1 - (this.player.powerups?.skip || 0));
                    return used >= 20;
                }
            },
            {
                id: 'dedicated',
                name: 'Dedicado',
                desc: 'Juega 7 días seguidos',
                icon: '📅',
                check: () => false // Requeriría tracking de días
            },
            {
                id: 'night_owl',
                name: 'Búho Nocturno',
                desc: 'Juega después de las 10 PM',
                icon: '🦉',
                check: () => new Date().getHours() >= 22 || new Date().getHours() < 6
            },
            {
                id: 'early_bird',
                name: 'Madrugador',
                desc: 'Juega antes de las 7 AM',
                icon: '🌅',
                check: () => new Date().getHours() < 7
            }
        ];

        let newAchievements = 0;
        achievements.forEach(achievement => {
            if (!this.player.achievements.includes(achievement.id) && achievement.check()) {
                this.player.achievements.push(achievement.id);
                this.showNotification(`¡Logro desbloqueado: ${achievement.name} ${achievement.icon}!`, 'success');
                if (window.soundSystem) {
                    window.soundSystem.playVictory();
                }
                newAchievements++;
            }
        });

        if (newAchievements > 0) {
            this.savePlayer();
        }

        return newAchievements;
    }

    checkMedals() {
        if (!this.gameState.correct) return;

        const accuracy = this.gameState.correct / (this.gameState.correct + this.gameState.incorrect);

        if (accuracy >= 0.95) {
            this.player.medals.gold++;
            this.player.totalMedals++;
        } else if (accuracy >= 0.80) {
            this.player.medals.silver++;
            this.player.totalMedals++;
        } else if (accuracy >= 0.60) {
            this.player.medals.bronze++;
            this.player.totalMedals++;
        }

        this.savePlayer();
    }

    // ================================
    // MODAL DE RESULTADOS
    // ================================

    showResultsModal() {
        const modal = document.getElementById('resultsModal');
        modal.classList.remove('hidden');

        const accuracy = this.gameState.correct
            ? Math.round((this.gameState.correct / (this.gameState.correct + this.gameState.incorrect)) * 100)
            : 0;

        document.getElementById('resultsIcon').textContent = accuracy >= 80 ? '🎉' : accuracy >= 60 ? '😊' : '💪';
        document.getElementById('resultsTitle').textContent = accuracy >= 80 ? '¡Increíble!' : accuracy >= 60 ? '¡Bien hecho!' : '¡Sigue practicando!';
        document.getElementById('finalScore').textContent = this.gameState.score || 0;
        document.getElementById('finalCorrect').textContent = this.gameState.correct || 0;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';

        // Mostrar recompensas
        const rewards = document.getElementById('rewardsEarned');
        rewards.innerHTML = '<h3>Recompensas:</h3>';

        if (accuracy >= 95) {
            rewards.innerHTML += '<div class="reward-item">🥇 Medalla de Oro</div>';
        } else if (accuracy >= 80) {
            rewards.innerHTML += '<div class="reward-item">🥈 Medalla de Plata</div>';
        } else if (accuracy >= 60) {
            rewards.innerHTML += '<div class="reward-item">🥉 Medalla de Bronce</div>';
        }

        if (this.gameState.streak >= 5) {
            rewards.innerHTML += `<div class="reward-item">🔥 Racha de ${this.gameState.streak}</div>`;
        }

        this.createConfetti();
    }

    hideModal() {
        document.getElementById('resultsModal').classList.add('hidden');
    }

    // ================================
    // EFECTOS VISUALES
    // ================================

    initParticles() {
        const canvas = document.getElementById('particlesCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd700', '#ff6347'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = (Math.random() * 0.5) + 's';
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }

    createMiniConfetti() {
        const colors = ['#ffd700', '#ff6347', '#4ecdc4'];

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = (window.innerWidth / 2 - 50 + Math.random() * 100) + 'px';
                confetti.style.top = (window.innerHeight / 2) + 'px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = '8px';
                confetti.style.height = '8px';
                confetti.style.animationDuration = '1s';
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 1000);
            }, i * 20);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'danger' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ================================
// SISTEMA ADAPTATIVO INTELIGENTE
// ================================

class AdaptiveSystem {
    constructor(player) {
        this.player = player;
        this.initTableMastery();
    }

    initTableMastery() {
        if (!this.player.tableMastery || Object.keys(this.player.tableMastery).length === 0) {
            this.player.tableMastery = {};
            for (let i = 1; i <= 10; i++) {
                this.player.tableMastery[i] = {
                    attempts: 0,
                    correct: 0,
                    incorrect: 0,
                    mastery: 0,
                    lastPracticed: Date.now()
                };
            }
        }
    }

    recordAnswer(table, isCorrect, responseTime) {
        if (!this.player.tableMastery[table]) {
            this.player.tableMastery[table] = {
                attempts: 0,
                correct: 0,
                incorrect: 0,
                mastery: 0,
                lastPracticed: Date.now()
            };
        }

        const tableData = this.player.tableMastery[table];
        tableData.attempts++;
        tableData.lastPracticed = Date.now();

        if (isCorrect) {
            tableData.correct++;
            tableData.mastery = Math.min(1, tableData.mastery + 0.05);
        } else {
            tableData.incorrect++;
            tableData.mastery = Math.max(0, tableData.mastery - 0.1);
        }

        // Ajustar maestría basada en tasa de éxito
        if (tableData.attempts >= 5) {
            const successRate = tableData.correct / tableData.attempts;
            tableData.mastery = (tableData.mastery * 0.7) + (successRate * 0.3);
        }
    }

    getTableMastery(table) {
        return this.player.tableMastery[table]?.mastery || 0;
    }

    getSuggestedTables() {
        // Priorizar tablas con menor maestría
        const tables = [];

        for (let i = 1; i <= 10; i++) {
            const mastery = this.getTableMastery(i);
            const daysSinceLastPractice = (Date.now() - (this.player.tableMastery[i]?.lastPracticed || 0)) / (1000 * 60 * 60 * 24);

            // Peso basado en maestría y tiempo sin practicar
            const weight = (1 - mastery) + (daysSinceLastPractice * 0.1);

            // Tablas más necesitadas tienen mayor probabilidad
            if (mastery < 0.8 || daysSinceLastPractice > 1) {
                tables.push(i);
            }
        }

        // Si no hay tablas débiles, devolver algunas aleatorias para mantener práctica
        if (tables.length < 3) {
            tables.push(Math.floor(Math.random() * 10) + 1);
            tables.push(Math.floor(Math.random() * 10) + 1);
            tables.push(Math.floor(Math.random() * 10) + 1);
        }

        return [...new Set(tables)];
    }

    getTableWeights(tables) {
        // Dar más peso a tablas con menor maestría
        return tables.map(table => {
            const mastery = this.getTableMastery(table);
            return Math.max(0.1, 1 - mastery);
        });
    }
}

// ================================
// SISTEMA DE TUTORIAL INTERACTIVO
// ================================

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.listenersAdded = false;
        this.steps = [
            {
                emoji: '👋',
                title: '¡Bienvenido a Multiplicar Mágico!',
                text: 'Te mostraré cómo usar la app en solo 30 segundos. ¿Listo?',
                target: null,
                position: 'center'
            },
            {
                emoji: '🎮',
                title: 'Elige tu Modo de Juego',
                text: '¡Tenemos 5 modos diferentes! Práctica, Desafío, Aventura, Carrera y Batalla. Cada uno es único y divertido.',
                target: '#practiceMode',
                position: 'bottom'
            },
            {
                emoji: '🛡️',
                title: 'Power-ups Mágicos',
                text: 'Usa Escudo 🛡️ para protegerte de errores, Pista 💡 para ver la respuesta, y Saltar ⏭️ para omitir preguntas difíciles.',
                target: '#powerupsBar',
                position: 'bottom'
            },
            {
                emoji: '📚',
                title: 'Trucos para Recordar',
                text: 'Si te atoras, presiona el botón "📚 Trucos" para ver consejos que te ayudarán a memorizar cada tabla.',
                target: '#showTricksBtn',
                position: 'left'
            },
            {
                emoji: '🎉',
                title: '¡Listo para Comenzar!',
                text: 'Ahora sabes todo lo necesario. ¡Diviértete aprendiendo y desbloqueando logros! 🏆',
                target: null,
                position: 'center'
            }
        ];
    }

    shouldShow() {
        // Mostrar solo si es primera vez (no hay player guardado o nunca vió tutorial)
        const hasSeenTutorial = localStorage.getItem('tutorialCompleted');
        return !hasSeenTutorial;
    }

    start() {
        if (!this.shouldShow()) return;

        this.currentStep = 0;
        document.getElementById('tutorialOverlay').style.display = 'block';

        if (window.soundSystem) {
            window.soundSystem.playClick();
        }

        this.showStep(0);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Solo agregar listeners una vez para evitar duplicados
        if (this.listenersAdded) return;

        const nextBtn = document.getElementById('tutorialNext');
        const skipBtn = document.getElementById('tutorialSkip');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skip());
        }

        this.listenersAdded = true;
    }

    showStep(stepIndex) {
        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        // Actualizar contenido
        document.getElementById('tutorialEmoji').textContent = step.emoji;
        document.getElementById('tutorialTitle').textContent = step.title;
        document.getElementById('tutorialText').textContent = step.text;
        document.getElementById('tutorialStep').textContent = stepIndex + 1;
        document.getElementById('tutorialTotal').textContent = this.steps.length;

        // Actualizar botón siguiente
        const nextBtn = document.getElementById('tutorialNext');
        if (stepIndex === this.steps.length - 1) {
            nextBtn.textContent = '¡Entendido!';
        } else {
            nextBtn.textContent = 'Siguiente';
        }

        // Posicionar spotlight y tutorial box
        this.positionTutorial(step);

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playClick();
        }
    }

    positionTutorial(step) {
        const spotlight = document.getElementById('tutorialSpotlight');
        const content = document.getElementById('tutorialContent');
        const box = content.querySelector('.tutorial-box');

        // Limpiar clases de flecha anteriores
        box.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');

        if (step.target) {
            const targetElement = document.querySelector(step.target);

            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();

                // Posicionar spotlight
                spotlight.style.top = (rect.top - 10) + 'px';
                spotlight.style.left = (rect.left - 10) + 'px';
                spotlight.style.width = (rect.width + 20) + 'px';
                spotlight.style.height = (rect.height + 20) + 'px';
                spotlight.classList.add('active');

                // Posicionar tutorial box según posición deseada
                switch(step.position) {
                    case 'bottom':
                        content.style.top = (rect.bottom + 30) + 'px';
                        content.style.left = (rect.left + rect.width / 2 - 200) + 'px';
                        box.classList.add('arrow-top');
                        break;
                    case 'top':
                        content.style.top = (rect.top - 250) + 'px';
                        content.style.left = (rect.left + rect.width / 2 - 200) + 'px';
                        box.classList.add('arrow-bottom');
                        break;
                    case 'left':
                        content.style.top = (rect.top + rect.height / 2 - 150) + 'px';
                        content.style.left = (rect.left - 430) + 'px';
                        box.classList.add('arrow-right');
                        break;
                    case 'right':
                        content.style.top = (rect.top + rect.height / 2 - 150) + 'px';
                        content.style.left = (rect.right + 30) + 'px';
                        box.classList.add('arrow-left');
                        break;
                }
            }
        } else {
            // Centro de pantalla para pasos sin target
            spotlight.classList.remove('active');
            spotlight.style.width = '0';
            spotlight.style.height = '0';

            content.style.top = '50%';
            content.style.left = '50%';
            content.style.transform = 'translate(-50%, -50%)';
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }

    skip() {
        this.complete();
    }

    complete() {
        // Ocultar y limpiar todo el tutorial
        const overlay = document.getElementById('tutorialOverlay');
        const spotlight = document.getElementById('tutorialSpotlight');
        const content = document.getElementById('tutorialContent');

        if (overlay) {
            overlay.style.display = 'none';
        }

        if (spotlight) {
            spotlight.classList.remove('active');
            spotlight.style.width = '0';
            spotlight.style.height = '0';
        }

        if (content) {
            content.style.top = '';
            content.style.left = '';
            content.style.transform = '';
        }

        // Marcar como completado
        localStorage.setItem('tutorialCompleted', 'true');

        // Sonido de éxito
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }

        // Asegurar que la pantalla principal sea interactuable
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.pointerEvents = 'auto';
        }
    }
}

// ================================
// INICIALIZAR APLICACIÓN
// ================================

document.addEventListener('DOMContentLoaded', () => {
    window.game = new MultiplicationGame();

    // Iniciar tutorial si es primera vez y usuario está en pantalla principal
    setTimeout(() => {
        const tutorial = new TutorialSystem();

        // Esperar a que el usuario complete el onboarding
        const checkMainScreen = setInterval(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.classList.contains('active')) {
                clearInterval(checkMainScreen);
                tutorial.start();
            }
        }, 500);
    }, 1000);
});

// Agregar estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
