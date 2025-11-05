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
        document.getElementById('progressMode')?.addEventListener('click', () => this.showProgressScreen());

        // Botones de vuelta
        document.getElementById('backFromPractice')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromChallenge')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromAdventure')?.addEventListener('click', () => this.showMainScreen());
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
            this.handleIncorrectAnswer();
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
    }

    handleIncorrectAnswer() {
        this.gameState.incorrect++;
        this.gameState.streak = 0;
        this.player.streak = 0;

        this.player.stats.incorrectAnswers++;

        // Sonido suave de error
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        const feedback = document.getElementById('feedbackContainer');
        const messages = [
            `La respuesta correcta es ${this.currentQuestion.answer} 💡`,
            `Era ${this.currentQuestion.answer}. ¡Casi! 🤔`,
            `¡Inténtalo de nuevo! La respuesta es ${this.currentQuestion.answer} 💪`
        ];
        feedback.innerHTML = `<div style="color: #f59e0b;">${messages[Math.floor(Math.random() * messages.length)]}</div>`;
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
        } else {
            this.gameState.streak = 0;
            this.player.stats.incorrectAnswers++;
        }

        this.player.stats.totalQuestions++;
        this.showChallengeQuestion();
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
        // Verificar logros especiales aquí
        if (this.gameState.incorrect === 0 && this.gameState.correct >= 10) {
            if (!this.player.achievements.includes('perfect_game')) {
                this.player.achievements.push('perfect_game');
                this.showNotification('¡Logro desbloqueado: Perfección! 💎', 'success');
            }
        }
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
// INICIALIZAR APLICACIÓN
// ================================

document.addEventListener('DOMContentLoaded', () => {
    window.game = new MultiplicationGame();
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
