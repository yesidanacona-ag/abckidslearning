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

        // Sistema de práctica adaptativo
        this.practiceSystem = window.PracticeSystemEngine ? new PracticeSystemEngine() : null;

        // Sistema de galaxia (FASE 6)
        this.galaxyEngine = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initParticles();
        this.setupSoundToggle();
        this.initGalaxy();

        if (this.player.name) {
            this.showMainScreen();
        } else {
            this.showWelcomeScreen();
        }
    }

    initGalaxy() {
        // Inicializar motor de galaxia (FASE 6)
        if (window.GalaxySystemEngine) {
            this.galaxyEngine = new GalaxySystemEngine('galaxyCanvas');

            // Conectar callback de click en planetas
            this.galaxyEngine.onPlanetClick = (planet) => {
                this.openPlanetModal(planet.table);
            };

            console.log('🌌 Sistema de galaxia inicializado');
        } else {
            console.warn('⚠️ GalaxySystemEngine no disponible');
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
            totalStars: 0,
            totalMedals: 0,
            streak: 0,
            bestStreak: 0,
            coins: 0, // Monedas para la tienda
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
            purchasedItems: [], // Items comprados en la tienda
            equippedItems: {}, // Items equipados por categoría
            lastPlayed: Date.now()
        };
    }

    loadPlayer() {
        const saved = localStorage.getItem('multiplicationPlayer');
        if (!saved) return null;

        const player = JSON.parse(saved);

        // Migración de datos: Eliminar sistema XP/Nivel
        if (player.hasOwnProperty('level') || player.hasOwnProperty('xp')) {
            console.log('🔄 Migrando datos de jugador: removiendo sistema XP/Nivel');
            delete player.level;
            delete player.xp;

            // Asegurar que campos nuevos existan
            if (!player.hasOwnProperty('coins')) {
                player.coins = 0;
            }
            if (!player.hasOwnProperty('purchasedItems')) {
                player.purchasedItems = [];
            }
            if (!player.hasOwnProperty('equippedItems')) {
                player.equippedItems = {};
            }
        }

        return player;
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

        // Ocultar botón de pausa en menú principal
        if (window.pauseButton) {
            window.pauseButton.hide();
        }

        // Ocultar HUD de monedas en menú principal
        if (window.coinSystem) {
            window.coinSystem.hide();
        }

        // Resetear modo fuego si está activo
        if (window.fireModeSystem) {
            window.fireModeSystem.reset();
        }

        // Cerrar menú de pausa si estaba abierto
        if (window.pauseMenu && window.pauseMenu.isPaused) {
            window.pauseMenu.hide();
        }
    }

    updateHeader() {
        document.getElementById('headerPlayerName').textContent = this.player.name;

        // Sincronizar avatar con shopSystem
        if (window.shopSystem) {
            const equippedAvatar = window.shopSystem.getEquipped('avatars');
            if (equippedAvatar) {
                this.player.avatar = equippedAvatar;
            }
        }

        document.getElementById('playerAvatar').textContent = this.player.avatar;

        // Calcular y mostrar maestría global (promedio de todas las tablas)
        const globalMastery = this.calculateGlobalMastery();
        const masteryEl = document.getElementById('playerMastery');
        if (masteryEl) {
            masteryEl.textContent = globalMastery + '%';
        }

        document.getElementById('totalStars').textContent = this.player.totalStars;
        document.getElementById('totalMedals').textContent = this.player.totalMedals;
        document.getElementById('streak').textContent = this.player.streak;

        // Barra de progreso ahora muestra maestría global
        const masteryBar = document.getElementById('masteryBar');
        if (masteryBar) {
            masteryBar.style.width = globalMastery + '%';
        }

        // Actualizar equipamiento
        this.updateEquipmentDisplay();
    }

    // Calcular maestría global (promedio de todas las tablas 2-10)
    calculateGlobalMastery() {
        let totalMastery = 0;
        let tableCount = 0;

        // Intentar obtener datos del practiceSystem primero (más actualizado)
        if (this.practiceSystem && this.practiceSystem.tableMastery) {
            for (let i = 2; i <= 10; i++) {
                const mastery = this.practiceSystem.tableMastery[i] || 0;
                totalMastery += mastery;
                tableCount++;
            }
            return tableCount > 0 ? Math.round(totalMastery / tableCount) : 0;
        }

        // Fallback a player.tableMastery
        for (let i = 2; i <= 10; i++) {
            const tableData = this.player.tableMastery[i];
            if (tableData && tableData.mastery !== undefined) {
                // mastery está entre 0-1, convertir a 0-100
                totalMastery += tableData.mastery * 100;
                tableCount++;
            }
        }

        return tableCount > 0 ? Math.round(totalMastery / tableCount) : 0;
    }

    updateEquipmentDisplay() {
        // Validar que shopSystem existe y tiene items
        if (!window.shopSystem || !window.shopSystem.items) {
            console.warn('⚠️ ShopSystem no disponible, saltando actualización de equipamiento');
            return;
        }

        // Obtener items equipados
        const equipped = {
            avatar: window.shopSystem.getEquipped('avatars') || '🦸',
            ship: window.shopSystem.getEquipped('ships') || '🚀',
            car: window.shopSystem.getEquipped('cars') || '🏎️',
            weapon: window.shopSystem.getEquipped('weapons') || '⚔️'
        };

        // Obtener nombres de los items
        const getItemName = (category, icon) => {
            const items = window.shopSystem.items?.[category];
            if (!items) return 'Básico';
            const item = items.find(i => i.icon === icon);
            return item ? item.name : 'Básico';
        };

        // Actualizar iconos
        const avatarEl = document.getElementById('equippedAvatar');
        const shipEl = document.getElementById('equippedShip');
        const carEl = document.getElementById('equippedCar');
        const weaponEl = document.getElementById('equippedWeapon');

        if (avatarEl) avatarEl.textContent = equipped.avatar;
        if (shipEl) shipEl.textContent = equipped.ship;
        if (carEl) carEl.textContent = equipped.car;
        if (weaponEl) weaponEl.textContent = equipped.weapon;

        // Actualizar nombres
        const avatarNameEl = document.getElementById('equippedAvatarName');
        const shipNameEl = document.getElementById('equippedShipName');
        const carNameEl = document.getElementById('equippedCarName');
        const weaponNameEl = document.getElementById('equippedWeaponName');

        if (avatarNameEl) avatarNameEl.textContent = getItemName('avatars', equipped.avatar);
        if (shipNameEl) shipNameEl.textContent = getItemName('ships', equipped.ship);
        if (carNameEl) carNameEl.textContent = getItemName('cars', equipped.car);
        if (weaponNameEl) weaponNameEl.textContent = getItemName('weapons', equipped.weapon);

        console.log('🎒 Equipamiento actualizado:', equipped);
    }

    // ================================
    // SISTEMA DE RECOMPENSAS (Solo Monedas)
    // ================================
    // Nota: XP/Nivel eliminado. Progresión basada en % de Maestría

    addCoins(amount) {
        if (!this.player.coins) {
            this.player.coins = 0;
        }

        this.player.coins += amount;
        this.savePlayer();

        // Actualizar HUD de monedas si el coinSystem está disponible
        if (window.coinSystem) {
            window.coinSystem.stars = this.player.coins;
            window.coinSystem.updateHUD();
        }

        // Mostrar notificación
        if (amount > 0) {
            this.showNotification(`+${amount} monedas 💰`, 'success');
        }

        console.log(`💰 +${amount} monedas. Total: ${this.player.coins}`);
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
        // Botón CTA Principal
        document.getElementById('ctaStartLearning')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startPracticeMode();
        });

        document.getElementById('practiceMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openCastleMap(); // Abrir mapa de castillo en lugar de práctica directa
        });
        document.getElementById('challengeMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startChallengeMode();
        });
        document.getElementById('speedDrillMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startSpeedDrillMode();
        });
        document.getElementById('shipDefenseMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startShipDefenseMode();
        });
        document.getElementById('factorChainMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startFactorChainMode();
        });
        document.getElementById('adventureMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startAdventureMode();
        });
        document.getElementById('raceMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startRaceMode();
        });
        document.getElementById('bossMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.startBossMode();
        });
        document.getElementById('progressMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.showProgressScreen();
        });
        document.getElementById('shopMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openShop();
        });
        document.getElementById('missionsMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openMissions();
        });
        document.getElementById('grimorioMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openGrimorio();
        });
        document.getElementById('advancedModesBtn')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openAdvancedModes();
        });
        document.getElementById('heroShowcaseMode')?.addEventListener('click', () => {
            window.soundSystem?.playClick();
            this.openHeroShowcase();
        });

        // Botones de vuelta
        document.getElementById('backFromPractice')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromGrimorio')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromCastle')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromAdvancedModes')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromChallenge')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromSpeedDrill')?.addEventListener('click', () => {
            if (window.speedDrillEngine) {
                window.speedDrillEngine.stop();
            }
            this.showMainScreen();
        });
        document.getElementById('backFromShipDefense')?.addEventListener('click', () => {
            if (window.shipDefense) {
                window.shipDefense.stop();
            }
            this.showMainScreen();
        });
        document.getElementById('backFromAdventure')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromRace')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromBoss')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromProgress')?.addEventListener('click', () => this.showMainScreen());
        document.getElementById('backFromFactorChain')?.addEventListener('click', () => {
            if (window.factorChainEngine) {
                window.factorChainEngine.stop();
            }
            this.showMainScreen();
        });

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
            } else if (this.currentMode === 'speedDrill') {
                this.startSpeedDrillMode();
            }
        });

        // FASE 6: Planet Modal
        document.getElementById('planetModalClose')?.addEventListener('click', () => this.closePlanetModal());
        document.getElementById('practicePlanetBtn')?.addEventListener('click', () => this.practicePlanetTable());

        // Modal de trucos mnemotécnicos
        document.getElementById('showTricksBtn')?.addEventListener('click', () => this.showTricksModal());
        document.getElementById('closeTrickModal')?.addEventListener('click', () => this.hideTricksModal());
        document.getElementById('trickModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'trickModal') {
                this.hideTricksModal();
            }
        });

        // Factor Chain - Hint Button
        document.getElementById('factorHintBtn')?.addEventListener('click', () => {
            if (window.factorChainEngine) {
                window.factorChainEngine.useHint();
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

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startPracticeMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                this.showMainScreen();
            });
        }

        // Ocultar todas las pantallas de práctica
        document.getElementById('diagnosticScreen')?.classList.add('hidden');
        document.getElementById('diagnosticQuiz')?.classList.add('hidden');
        document.getElementById('diagnosticResults')?.classList.add('hidden');
        document.getElementById('domainMap')?.classList.add('hidden');
        document.getElementById('practiceSetup')?.classList.add('hidden');
        document.getElementById('practiceGame')?.classList.add('hidden');

        // Verificar si necesita diagnóstico
        if (this.practiceSystem && this.practiceSystem.needsDiagnostic) {
            this.showDiagnosticWelcome();
        } else {
            this.showDomainMap();
        }
    }

    // =============================
    // DIAGNÓSTICO
    // =============================

    showDiagnosticWelcome() {
        document.getElementById('diagnosticScreen')?.classList.remove('hidden');

        document.getElementById('startDiagnostic')?.addEventListener('click', () => {
            this.startDiagnostic();
        }, { once: true });
    }

    startDiagnostic() {
        document.getElementById('diagnosticScreen')?.classList.add('hidden');
        document.getElementById('diagnosticQuiz')?.classList.remove('hidden');

        this.diagnosticState = {
            questions: this.practiceSystem.generateDiagnosticQuestions(),
            currentIndex: 0,
            answers: [],
            timeLeft: 10,
            timerInterval: null
        };

        this.showDiagnosticQuestion();
    }

    showDiagnosticQuestion() {
        const state = this.diagnosticState;
        const question = state.questions[state.currentIndex];

        // Actualizar progreso
        document.getElementById('diagnosticQuestionNum').textContent = state.currentIndex + 1;
        const progressPercent = ((state.currentIndex + 1) / state.questions.length) * 100;
        document.getElementById('diagnosticProgressFill').style.width = progressPercent + '%';

        // Mostrar pregunta
        document.getElementById('diagnosticQuestion').textContent = `${question.table} × ${question.multiplier} = ?`;

        // Generar opciones
        const options = this.practiceSystem.generateOptions(question.answer);
        const container = document.getElementById('diagnosticOptions');
        container.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'diagnostic-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleDiagnosticAnswer(option));
            container.appendChild(btn);
        });

        // Iniciar timer
        state.timeLeft = 10;
        state.startTime = Date.now();
        this.startDiagnosticTimer();
    }

    startDiagnosticTimer() {
        const state = this.diagnosticState;
        document.getElementById('diagnosticTimeLeft').textContent = state.timeLeft;

        if (state.timerInterval) clearInterval(state.timerInterval);

        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            document.getElementById('diagnosticTimeLeft').textContent = state.timeLeft;

            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                this.handleDiagnosticAnswer(null); // Timeout
            }
        }, 1000);
    }

    handleDiagnosticAnswer(selectedAnswer) {
        if (this.diagnosticState.timerInterval) {
            clearInterval(this.diagnosticState.timerInterval);
        }

        const state = this.diagnosticState;
        const question = state.questions[state.currentIndex];
        const responseTime = Date.now() - state.startTime;
        const isCorrect = selectedAnswer === question.answer;

        // Guardar respuesta
        state.answers.push({
            table: question.table,
            correct: isCorrect,
            time: responseTime
        });

        // Siguiente pregunta o finalizar
        state.currentIndex++;

        if (state.currentIndex < state.questions.length) {
            setTimeout(() => this.showDiagnosticQuestion(), 500);
        } else {
            this.finishDiagnostic();
        }
    }

    finishDiagnostic() {
        const results = this.practiceSystem.processDiagnosticResults(this.diagnosticState.answers);

        // Mostrar resultados
        document.getElementById('diagnosticQuiz')?.classList.add('hidden');
        document.getElementById('diagnosticResults')?.classList.remove('hidden');

        const content = document.getElementById('diagnosticResultsContent');
        content.innerHTML = `
            <div class="diagnostic-summary">
                <h3>¡Evaluación Completada!</h3>
                <div class="diagnostic-stats">
                    <div class="diagnostic-stat">
                        <div class="diagnostic-stat-value">${results.strongTables.length}</div>
                        <div class="diagnostic-stat-label">🟢 Tablas Dominadas</div>
                    </div>
                    <div class="diagnostic-stat">
                        <div class="diagnostic-stat-value">${9 - results.strongTables.length - results.weakTables.length}</div>
                        <div class="diagnostic-stat-label">🟡 En Progreso</div>
                    </div>
                    <div class="diagnostic-stat">
                        <div class="diagnostic-stat-value">${results.weakTables.length}</div>
                        <div class="diagnostic-stat-label">🔴 Necesitan Práctica</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('continueToDomainMap')?.addEventListener('click', () => {
            this.showDomainMap();
        }, { once: true });
    }

    // =============================
    // MAPA DE DOMINIO
    // =============================

    showDomainMap() {
        // Ocultar otras pantallas
        document.getElementById('diagnosticResults')?.classList.add('hidden');
        document.getElementById('practiceSetup')?.classList.add('hidden');
        document.getElementById('practiceGame')?.classList.add('hidden');

        // Mostrar mapa
        document.getElementById('domainMap')?.classList.remove('hidden');

        // Actualizar mapa
        this.updateDomainMap();

        // Event listeners
        document.getElementById('practiceSuggested')?.addEventListener('click', () => {
            const suggested = this.practiceSystem.getSuggestedTables();
            this.startPracticeWithTables(suggested);
        });

        document.getElementById('chooseCustomTables')?.addEventListener('click', () => {
            this.showTableSelector();
        });
    }

    updateDomainMap() {
        const report = this.practiceSystem.generateProgressReport();

        // Actualizar círculo de dominio general
        const percent = report.overallMastery;
        document.getElementById('overallMasteryPercent').textContent = percent + '%';

        const circle = document.getElementById('masteryCircleFill');
        const circumference = 283;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Actualizar tablas por nivel
        this.updateTablesByLevel('masteredTables', report.tablesByLevel.mastered);
        this.updateTablesByLevel('learningTables', report.tablesByLevel.learning);
        this.updateTablesByLevel('weakTables', report.tablesByLevel.weak);
    }

    updateTablesByLevel(containerId, tables) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (tables.length === 0) {
            container.innerHTML = '<p class="no-tables">Ninguna todavía</p>';
            return;
        }

        container.innerHTML = '';
        tables.forEach(item => {
            const card = document.createElement('div');

            // Verificar si tabla está desbloqueada (Sistema de Bloqueo)
            const isUnlocked = window.bootstrap?.services?.player?.isTableUnlocked?.(item.table) ?? true;
            const isDiscovered = window.bootstrap?.services?.player?.isTableDiscovered?.(item.table) ?? false;

            // Determinar estado visual
            let statusIcon = '';
            let statusClass = '';

            if (!isUnlocked) {
                statusIcon = '🔒'; // Bloqueada
                statusClass = 'table-locked';
            } else if (isDiscovered) {
                statusIcon = '✅'; // Completada/Descubierta
                statusClass = 'table-discovered';
            } else {
                statusIcon = '✨'; // Disponible para aprender
                statusClass = 'table-available';
            }

            card.className = `table-mastery-card ${statusClass}`;
            card.innerHTML = `
                <div class="table-status-badge">${statusIcon}</div>
                <div class="table-mastery-number">${item.table}</div>
                <div class="table-mastery-percent">${item.mastery}%</div>
                <div class="table-mastery-bar">
                    <div class="table-mastery-bar-fill" style="width: ${item.mastery}%; background: ${item.status.color}"></div>
                </div>
            `;

            // Event listener con validación de bloqueo
            card.addEventListener('click', () => {
                if (!isUnlocked) {
                    // Tabla bloqueada - mostrar mensaje
                    console.log(`🔒 Tabla ${item.table} bloqueada`);

                    if (window.mateoMascot) {
                        window.mateoMascot.show(
                            'sad',
                            `¡Espera! La Tabla del ${item.table} está bloqueada. Primero debes completar la Tabla del ${item.table - 1}.`,
                            4000
                        );
                    }

                    if (window.soundSystem) {
                        window.soundSystem.playError();
                    }

                    // Shake animation
                    card.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 500);

                    return;
                }

                // Tabla desbloqueada - proceder normalmente
                this.startPracticeWithTables([item.table]);
            });

            container.appendChild(card);
        });
    }

    // =============================
    // SELECTOR DE TABLAS
    // =============================

    showTableSelector() {
        document.getElementById('domainMap')?.classList.add('hidden');
        document.getElementById('practiceSetup')?.classList.remove('hidden');

        // Actualizar botones con info de mastery
        document.querySelectorAll('.table-btn-select').forEach(btn => {
            const table = parseInt(btn.dataset.table);
            const stats = this.practiceSystem.getTableStats(table);

            btn.querySelector('.table-mastery-mini').textContent = stats.mastery + '%';
            btn.querySelector('.table-status-dot').style.backgroundColor = stats.status.color;

            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });

        document.getElementById('backToDomainMap')?.addEventListener('click', () => {
            this.showDomainMap();
        });

        document.getElementById('startCustomPractice')?.addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('.table-btn-select.selected'))
                .map(btn => parseInt(btn.dataset.table));

            if (selected.length === 0) {
                alert('Selecciona al menos una tabla');
                return;
            }

            this.startPracticeWithTables(selected);
        });
    }

    startPracticeWithTables(tables) {
        this.gameState = {
            mode: 'practice',
            tables: tables,
            questions: this.practiceSystem.generateMixedSession(tables, 15),
            currentQuestionIndex: 0,
            score: 0,
            correct: 0,
            incorrect: 0,
            streak: 0
        };

        document.getElementById('domainMap')?.classList.add('hidden');
        document.getElementById('practiceSetup')?.classList.add('hidden');
        document.getElementById('practiceGame')?.classList.remove('hidden');

        this.showNextQuestion();
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

        this.addCoins(5);
        this.player.stats.correctAnswers++;
        this.player.totalStars += 1;

        // Sistema de monedas: Agregar estrellas
        if (window.coinSystem) {
            const optionElement = document.querySelector('.answer-option.correct');
            window.coinSystem.addStars(10, optionElement);
        }

        // Tracking de misión
        this.trackMissionCorrectAnswer();

        // Actualizar mastery del sistema de práctica
        if (this.practiceSystem && this.currentQuestion) {
            const responseTime = Date.now() - (this.currentQuestion.startTime || Date.now());
            this.practiceSystem.updateMastery(this.currentQuestion.table, true, responseTime);
        }

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

        // Actualizar mastery del sistema de práctica
        if (this.practiceSystem && this.currentQuestion) {
            const responseTime = Date.now() - (this.currentQuestion.startTime || Date.now());
            this.practiceSystem.updateMastery(this.currentQuestion.table, false, responseTime);
        }

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

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Resetear modo fuego
        if (window.fireModeSystem) {
            window.fireModeSystem.reset();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startChallengeMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                this.showMainScreen();
            });
        }

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

    async handleChallengeAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.currentQuestion.answer;
        const clickedButton = event?.target;

        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, isCorrect, 0);

        if (isCorrect) {
            this.gameState.correct++;
            this.gameState.streak++;

            // Sistema de Modo Fuego: Incrementar racha
            if (window.fireModeSystem) {
                window.fireModeSystem.incrementStreak();
            }

            // Calcular puntos con multiplicador de fuego
            const multiplier = window.fireModeSystem ? window.fireModeSystem.getMultiplier() : 1;
            const basePoints = 10 + (this.gameState.streak * 5);
            const points = basePoints * multiplier;
            this.gameState.score += points;

            this.player.stats.correctAnswers++;
            this.addCoins(3);

            // Tracking de misión
            this.trackMissionCorrectAnswer();

            // Sistema de feedback: Confeti y animación
            if (window.feedbackSystem && clickedButton) {
                await window.feedbackSystem.showCorrectFeedback(clickedButton, points);
            } else {
                this.createMiniConfetti();
            }

            // Sistema de monedas: Agregar estrellas
            if (window.coinSystem && clickedButton) {
                window.coinSystem.addStars(points, clickedButton);
            }

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
            // Sistema de Modo Fuego: Resetear racha
            if (window.fireModeSystem) {
                window.fireModeSystem.resetStreak();
            }

            this.gameState.streak = 0;
            this.player.stats.incorrectAnswers++;

            // Sistema de feedback: Shake y mostrar correcta
            if (window.feedbackSystem && clickedButton) {
                await window.feedbackSystem.showIncorrectFeedback(clickedButton, this.currentQuestion.answer);
            }

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

        // Tracking de misión: Desafío completado
        this.trackMissionChallengePlayed();

        this.showResultsModal();
    }

    // ================================
    // MODO TALADRO RÁPIDO
    // ================================

    startSpeedDrillMode() {
        this.currentMode = 'speedDrill';
        this.showScreen('speedDrillScreen');

        // Mateo da instrucciones
        if (window.mateoMascot) {
            window.mateoMascot.show('happy');
            window.mateoMascot.speak('¡Escribe la respuesta sin opciones! ⚡', 3000);
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startSpeedDrillMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                if (window.speedDrillEngine) {
                    window.speedDrillEngine.stop();
                }
                this.showMainScreen();
            });
        }

        // Iniciar el motor del Taladro Rápido
        if (window.speedDrillEngine) {
            window.speedDrillEngine.start();
        } else {
            console.error('⚠️ speedDrillEngine no está disponible');
        }
    }

    // ================================
    // MODO DEFENSA DE LA NAVE
    // ================================

    startShipDefenseMode() {
        this.currentMode = 'shipDefense';
        this.showScreen('shipDefenseScreen');

        // Mateo da instrucciones
        if (window.mateoMascot) {
            window.mateoMascot.show('excited');
            window.mateoMascot.speak('¡Defiende tu nave! Haz clic en los múltiplos 🛸', 4000);
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startShipDefenseMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                if (window.shipDefense) {
                    window.shipDefense.stop();
                }
                this.showMainScreen();
            });
        }

        // Mostrar modal de selección de tabla
        this.showTableSelection((selectedTable) => {
            // Iniciar el motor de Defensa de la Nave
            if (window.shipDefense) {
                window.shipDefense.start(selectedTable);
            } else {
                console.error('⚠️ shipDefense no está disponible');
            }
        });
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

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startAdventureMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                this.showMainScreen();
            });
        }

        this.initSpaceGame();
    }

    initSpaceGame() {
        // Crear instancia del motor de juego espacial
        this.spaceEngine = new SpaceGameEngine(
            'spaceCanvas',
            // Callback: respuesta correcta
            (points) => this.handleSpaceCorrect(points),
            // Callback: respuesta incorrecta
            (selectedValue, correctValue) => this.handleSpaceWrong(selectedValue, correctValue),
            // Callback: game over
            (finalScore, level) => this.handleSpaceGameOver(finalScore, level)
        );

        // Iniciar el juego
        this.spaceEngine.start();

        // Generar primera pregunta
        this.generateSpaceQuestion();
    }

    generateSpaceQuestion() {
        if (!this.spaceEngine) return;

        // Obtener tablas sugeridas por el sistema adaptativo
        const tables = this.adaptiveSystem.getSuggestedTables();
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;
        const answer = table * multiplier;

        // Generar opciones incorrectas
        const options = new Set([answer]);
        while (options.size < 4) {
            const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
            if (wrongAnswer > 0 && wrongAnswer !== answer) {
                options.add(wrongAnswer);
            }
        }

        // Guardar pregunta actual
        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: answer
        };

        // Enviar pregunta al motor
        this.spaceEngine.setQuestion(table, multiplier, Array.from(options));
    }

    handleSpaceCorrect(points) {
        // Registrar respuesta correcta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, true, 0);
        this.player.stats.totalQuestions++;
        this.player.stats.correctAnswers++;

        // Agregar puntos y XP
        this.gameState.score += points;
        this.gameState.planet++;
        this.addCoins(5);

        // Agregar estrellas del sistema de monedas
        if (window.coinSystem) {
            const baseStars = 10;
            const multiplier = window.fireModeSystem ? window.fireModeSystem.getMultiplier() : 1;
            const starsToAdd = baseStars * multiplier;

            window.coinSystem.addStars(starsToAdd, {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }

        // Tracking de misiones
        this.trackMissionCorrectAnswer();

        // Incrementar racha de fuego
        if (window.fireModeSystem) {
            window.fireModeSystem.incrementStreak();
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showCorrectFeedback();
        }

        // Generar siguiente pregunta
        setTimeout(() => {
            this.generateSpaceQuestion();
        }, 500);
    }

    handleSpaceWrong(selectedValue, correctValue) {
        // Registrar respuesta incorrecta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, false, 0);
        this.player.stats.totalQuestions++;
        this.player.stats.incorrectAnswers++;

        // Resetear racha de fuego
        if (window.fireModeSystem) {
            window.fireModeSystem.resetStreak();
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showWrongFeedback();
        }

        // Mostrar truco mnemónico si está disponible
        if (window.mnemonicTricksSystem) {
            const trick = window.mnemonicTricksSystem.getTrick(
                this.currentQuestion.table,
                this.currentQuestion.multiplier
            );
            if (trick) {
                setTimeout(() => {
                    window.mnemonicTricksSystem.showTrick(trick);
                }, 1000);
            }
        }

        // Generar siguiente pregunta después de mostrar el error
        setTimeout(() => {
            this.generateSpaceQuestion();
        }, 2500);
    }

    handleSpaceGameOver(finalScore, level) {
        // Guardar progreso
        this.gameState.score = finalScore;
        this.gameState.planet = level;
        this.savePlayer();

        // Verificar logros
        this.checkAchievements();

        // Mostrar modal de resultados
        setTimeout(() => {
            this.showNotification('¡Juego Terminado! 🚀', 'info');
            setTimeout(() => {
                this.showResultsModal();
            }, 1000);
        }, 1500);
    }

    // ================================
    // MODO CARRERA MATEMÁTICA
    // ================================

    startRaceMode() {
        this.currentMode = 'race';
        this.showScreen('raceScreen');

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startRaceMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                this.showMainScreen();
            });
        }

        // Configurar avatar y vehículo del jugador
        const equippedCar = window.shopSystem ? window.shopSystem.getEquipped('cars') : '🏎️';

        document.getElementById('playerRaceAvatar').textContent = equippedCar;
        document.getElementById('playerRaceName').textContent = this.player.name;

        // Actualizar ícono en la pista
        const playerRaceIcon = document.querySelector('#playerRacePosition .racer-icon');
        if (playerRaceIcon) {
            playerRaceIcon.textContent = equippedCar;
        }

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
            this.addCoins(5);

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

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar HUD de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Configurar callbacks del menú de pausa
        if (window.pauseMenu) {
            window.pauseMenu.setRestartCallback(() => {
                this.startBossMode();
            });
            window.pauseMenu.setMainMenuCallback(() => {
                this.showMainScreen();
            });
        }

        // Estado de batalla
        this.gameState = {
            mode: 'boss',
            currentBoss: 1,
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
                { table: 0, name: 'Jefe Final', avatar: '🐉', health: 150 }
            ]
        };

        // Iniciar motor de batalla
        this.initBossGame();
    }

    initBossGame() {
        // Crear instancia del motor de batalla épica
        this.bossEngine = new BossGameEngine(
            'bossGameContainer',
            // Callback: jefe derrotado
            () => this.handleBossDefeated(),
            // Callback: jugador derrotado
            () => this.handlePlayerDefeated()
        );

        // Configurar callbacks de respuestas
        this.bossEngine.onCorrectAnswer = (points) => this.handleBossCorrect(points);
        this.bossEngine.onWrongAnswer = () => this.handleBossWrong();

        // Iniciar batalla con primer jefe
        this.startBossBattle();
    }

    startBossBattle() {
        const boss = this.gameState.bosses[this.gameState.currentBoss - 1];

        // Actualizar número de jefe en header
        document.getElementById('currentBossNum').textContent = this.gameState.currentBoss;

        // Iniciar batalla en el motor
        this.bossEngine.startBattle(boss, {
            name: this.player.name,
            avatar: this.player.avatar
        });

        // Generar primera pregunta
        this.generateBossQuestion();
    }

    generateBossQuestion() {
        if (!this.bossEngine) return;

        const boss = this.gameState.bosses[this.gameState.currentBoss - 1];
        let table, multiplier;

        if (boss.table === 0) {
            // Jefe final: cualquier tabla
            table = Math.floor(Math.random() * 10) + 1;
        } else {
            table = boss.table;
        }

        multiplier = Math.floor(Math.random() * 10) + 1;
        const answer = table * multiplier;

        // Generar opciones
        const options = new Set([answer]);
        while (options.size < 4) {
            const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
            if (wrongAnswer > 0 && wrongAnswer !== answer) {
                options.add(wrongAnswer);
            }
        }

        // Guardar pregunta actual
        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: answer
        };

        // Enviar pregunta al motor
        this.bossEngine.setQuestion(table, multiplier, Array.from(options));
    }

    handleBossCorrect(points) {
        // Registrar respuesta correcta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, true, 0);
        this.player.stats.totalQuestions++;
        this.player.stats.correctAnswers++;

        // Agregar XP
        this.addCoins(7);

        // Agregar estrellas
        if (window.coinSystem) {
            const baseStars = points;
            const multiplier = window.fireModeSystem ? window.fireModeSystem.getMultiplier() : 1;
            const starsToAdd = baseStars * multiplier;

            window.coinSystem.addStars(starsToAdd, {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }

        // Tracking de misiones
        this.trackMissionCorrectAnswer();

        // Incrementar racha de fuego
        if (window.fireModeSystem) {
            window.fireModeSystem.incrementStreak();
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showCorrectFeedback();
        }

        // Generar siguiente pregunta
        setTimeout(() => {
            this.generateBossQuestion();
        }, 500);
    }

    handleBossWrong() {
        // Registrar respuesta incorrecta
        this.adaptiveSystem.recordAnswer(this.currentQuestion.table, false, 0);
        this.player.stats.totalQuestions++;
        this.player.stats.incorrectAnswers++;

        // Resetear racha de fuego
        if (window.fireModeSystem) {
            window.fireModeSystem.resetStreak();
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showWrongFeedback();
        }

        // Mostrar truco mnemónico
        if (window.mnemonicTricksSystem) {
            const trick = window.mnemonicTricksSystem.getTrick(
                this.currentQuestion.table,
                this.currentQuestion.multiplier
            );
            if (trick) {
                setTimeout(() => {
                    window.mnemonicTricksSystem.showTrick(trick);
                }, 1000);
            }
        }

        // Generar siguiente pregunta
        setTimeout(() => {
            this.generateBossQuestion();
        }, 500);
    }

    handleBossDefeated() {
        // Incrementar contador
        this.gameState.bossesDefeated++;

        // Tracking de misión
        this.trackMissionBossWin();

        // Verificar si hay más jefes
        if (this.gameState.currentBoss < 10) {
            // Siguiente jefe
            this.gameState.currentBoss++;
            setTimeout(() => {
                this.startBossBattle();
            }, 3000);
        } else {
            // Victoria final
            setTimeout(() => {
                this.endBossMode(true);
            }, 3000);
        }
    }

    handlePlayerDefeated() {
        // Esperar un poco y mostrar resultados
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

    // ================================
    // TIENDA Y MISIONES
    // ================================

    openShop() {
        if (window.shopSystem) {
            window.shopSystem.open();
        } else {
            console.error('❌ Sistema de tienda no disponible');
        }
    }

    openMissions() {
        if (window.dailyMissionsSystem) {
            window.dailyMissionsSystem.open();
        } else {
            console.error('❌ Sistema de misiones no disponible');
        }
    }

    openGrimorio() {
        console.log('📖 Abriendo Grimorio de Trucos Secretos');
        this.showScreen('grimorioScreen');
        this.renderGrimorio();
    }

    renderGrimorio() {
        const playerService = window.bootstrap?.services?.player;
        if (!playerService) {
            console.error('❌ PlayerService no disponible');
            return;
        }

        // Obtener trucos coleccionados
        const collectedTricks = playerService.getCollectedTricks();
        const tricksList = document.getElementById('tricksList');
        const grimorioEmpty = document.getElementById('grimorioEmpty');
        const grimorioBook = document.querySelector('.grimorio-book');
        const grimorioCollected = document.getElementById('grimorioCollected');
        const grimorioTotal = document.getElementById('grimorioTotal');

        // Actualizar contador
        if (grimorioCollected) grimorioCollected.textContent = collectedTricks.length;
        if (grimorioTotal) grimorioTotal.textContent = 9; // Tablas 2-10

        // Mostrar/ocultar según tenga trucos
        if (collectedTricks.length === 0) {
            grimorioBook.style.display = 'none';
            grimorioEmpty.style.display = 'block';

            // Botón para empezar a aprender
            const startBtn = document.getElementById('startLearningFromGrimorio');
            if (startBtn) {
                startBtn.onclick = () => {
                    this.showScreen('practiceScreen');
                    this.showDomainMap();
                };
            }
            return;
        }

        grimorioBook.style.display = 'grid';
        grimorioEmpty.style.display = 'none';

        // Renderizar lista de trucos
        if (!tricksList) return;
        tricksList.innerHTML = '';

        // Ordenar por número de tabla
        const sortedTricks = [...collectedTricks].sort((a, b) => a.table - b.table);

        sortedTricks.forEach((trick, index) => {
            const trickItem = document.createElement('div');
            trickItem.className = 'trick-item';
            if (index === 0) trickItem.classList.add('selected'); // Seleccionar primero

            trickItem.innerHTML = `
                <div class="trick-item-icon">✨</div>
                <div class="trick-item-content">
                    <h3>Tabla del ${trick.table}</h3>
                    <p>${new Date(trick.collectedAt).toLocaleDateString()}</p>
                </div>
            `;

            trickItem.addEventListener('click', () => {
                // Remover selección de otros
                document.querySelectorAll('.trick-item').forEach(item => {
                    item.classList.remove('selected');
                });
                trickItem.classList.add('selected');

                // Mostrar detalle
                this.showTrickDetail(trick);
            });

            tricksList.appendChild(trickItem);
        });

        // Mostrar detalle del primer truco automáticamente
        if (sortedTricks.length > 0) {
            this.showTrickDetail(sortedTricks[0]);
        }
    }

    showTrickDetail(trick) {
        const detailContent = document.getElementById('trickDetailContent');
        if (!detailContent) return;

        detailContent.innerHTML = `
            <div class="trick-detail">
                <div class="trick-detail-header">
                    <div class="trick-detail-icon">🧙‍♂️</div>
                    <h2 class="trick-detail-title">Tabla del ${trick.table}</h2>
                </div>
                <div class="trick-detail-body">
                    <div class="trick-explanation">
                        <strong>🎯 Truco Secreto:</strong>
                        <p>${trick.trick}</p>
                    </div>
                    ${trick.tip ? `
                        <div class="trick-tip">
                            <strong>💡 Consejo de Mateo:</strong>
                            <p>${trick.tip}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Reproducir sonido
        if (window.soundSystem) {
            window.soundSystem.playTransition();
        }
    }

    openCastleMap() {
        console.log('🏰 Abriendo Mapa del Castillo');
        this.showScreen('castleMapScreen');
        this.renderCastleMap();
    }

    renderCastleMap() {
        const playerService = window.bootstrap?.services?.player;
        if (!playerService) {
            console.error('❌ PlayerService no disponible');
            return;
        }

        const modeController = window.bootstrap?.controllers?.mode;
        const castleTower = document.getElementById('castleTower');
        const castleCompleted = document.getElementById('castleCompleted');

        if (!castleTower) return;

        // Obtener estado de todas las tablas
        const tablesStatus = playerService.getAllTablesStatus();

        // Contar completadas
        const completedCount = tablesStatus.filter(t => t.discovered).length;
        if (castleCompleted) castleCompleted.textContent = completedCount;

        // Limpiar torre
        castleTower.innerHTML = '';

        // Renderizar pisos (de arriba hacia abajo: tabla 10 → tabla 2)
        tablesStatus.reverse().forEach((tableInfo, index) => {
            const floor = document.createElement('div');
            floor.className = 'castle-floor';

            // Determinar estado
            if (!tableInfo.unlocked) {
                floor.classList.add('locked');
            } else if (tableInfo.discovered) {
                floor.classList.add('completed');
            } else {
                floor.classList.add('available');
            }

            // Avatar en el piso actual (primera tabla no descubierta y desbloqueada)
            const isCurrent = tableInfo.unlocked && !tableInfo.discovered &&
                              (index === 0 || tablesStatus[index - 1]?.discovered);

            if (isCurrent) {
                floor.classList.add('current');
            }

            // Iconos según estado
            let statusIcon = '🔒';
            if (!tableInfo.unlocked) {
                statusIcon = '🔒';
            } else if (tableInfo.discovered) {
                statusIcon = '🎉';
            } else {
                statusIcon = '✨';
            }

            // Contenido del piso
            floor.innerHTML = `
                ${isCurrent ? `<div class="floor-avatar">${this.player.avatar}</div>` : ''}
                <div class="floor-icon ${!tableInfo.unlocked ? 'locked-icon' : ''}">
                    ${statusIcon}
                </div>
                <div class="floor-content">
                    <h2 class="floor-title">Tabla del ${tableInfo.table}</h2>
                    <p class="floor-description">
                        ${!tableInfo.unlocked ? `Completa la tabla del ${tableInfo.table - 1} primero` :
                          tableInfo.discovered ? `¡Completada!` :
                          `¡Descubre esta tabla!`}
                    </p>
                    <div class="floor-progress ${tableInfo.discovered ? 'completed-progress' : ''}">
                        ${tableInfo.discovered ? `✅ Dominada al ${tableInfo.mastery}%` :
                          tableInfo.unlocked ? `🎯 Disponible para aprender` :
                          `🔒 Bloqueada`}
                    </div>
                </div>
                <div class="floor-badge">${statusIcon}</div>
            `;

            // Event listener
            floor.addEventListener('click', () => {
                if (!tableInfo.unlocked) {
                    // Bloqueada
                    console.log(`🔒 Tabla ${tableInfo.table} bloqueada`);
                    window.soundSystem?.playError();

                    if (window.mateoMascot) {
                        window.mateoMascot.show(
                            'sad',
                            `¡Alto ahí! Primero debes conquistar la Tabla del ${tableInfo.table - 1} para desbloquear este piso del castillo.`,
                            4000
                        );
                    }

                    // Shake animation
                    floor.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        floor.style.animation = '';
                    }, 500);
                } else {
                    // Desbloqueada - abrir modal "Aprender vs Practicar"
                    window.soundSystem?.playClick();

                    if (modeController) {
                        modeController.handleTableSelection(tableInfo.table, 'auto');
                    } else {
                        console.error('❌ ModeController no disponible');
                    }
                }
            });

            castleTower.appendChild(floor);
        });
    }

    openAdvancedModes() {
        console.log('🎮 Abriendo Modos Avanzados');
        this.showScreen('advancedModesScreen');

        const advancedModesGrid = document.querySelector('.advanced-modes-grid');
        if (!advancedModesGrid) return;

        // Limpiar grid
        advancedModesGrid.innerHTML = '';

        // IDs de los 6 modos avanzados
        const advancedModeIds = [
            'speedDrillMode',
            'shipDefenseMode',
            'factorChainMode',
            'adventureMode',
            'raceMode',
            'bossMode'
        ];

        // Clonar cada modo al grid
        advancedModeIds.forEach(id => {
            const originalCard = document.getElementById(id);
            if (originalCard) {
                const clonedCard = originalCard.cloneNode(true);

                // Mantener el mismo event listener
                clonedCard.addEventListener('click', () => {
                    window.soundSystem?.playClick();

                    // Llamar al método correspondiente según el modo
                    switch(id) {
                        case 'speedDrillMode':
                            this.startSpeedDrillMode();
                            break;
                        case 'shipDefenseMode':
                            this.startShipDefenseMode();
                            break;
                        case 'factorChainMode':
                            this.startFactorChainMode();
                            break;
                        case 'adventureMode':
                            this.startAdventureMode();
                            break;
                        case 'raceMode':
                            this.startRaceMode();
                            break;
                        case 'bossMode':
                            this.startBossMode();
                            break;
                    }
                });

                advancedModesGrid.appendChild(clonedCard);
            }
        });
    }

    openHeroShowcase() {
        if (window.heroShowcase) {
            window.heroShowcase.open(this.player);
        } else {
            console.error('❌ Sistema de Escaparate del Héroe no disponible');
        }
    }

    startFactorChainMode() {
        this.currentMode = 'factorChain';
        this.showScreen('factorChainScreen');

        if (window.mateoMascot) {
            window.mateoMascot.show('happy');
            window.mateoMascot.speak('¡Descompón el número en factores! 🧩', 3000);
        }

        if (window.coinSystem) {
            window.coinSystem.show();
        }

        if (window.factorChainEngine) {
            window.factorChainEngine.start(1);
        }
    }

    // Tracking de misiones
    trackMissionCorrectAnswer() {
        if (window.dailyMissionsSystem) {
            window.dailyMissionsSystem.trackCorrectAnswer();
        }
    }

    trackMissionBossWin() {
        if (window.dailyMissionsSystem) {
            window.dailyMissionsSystem.trackBossWin();
        }
    }

    trackMissionChallengePlayed() {
        if (window.dailyMissionsSystem) {
            window.dailyMissionsSystem.trackChallengePlayed();
        }
    }

    trackMissionPracticeTime(minutes) {
        if (window.dailyMissionsSystem) {
            window.dailyMissionsSystem.trackPracticeTime(minutes);
        }
    }

    updateProgressStats() {
        // FASE 6: Actualizar Galaxy System
        if (this.galaxyEngine) {
            // Actualizar datos de mastery de las tablas
            const tableMastery = {};
            if (this.practiceSystem) {
                tableMastery = this.practiceSystem.tableMastery;
            } else {
                // Fallback al sistema adaptativo antiguo
                for (let i = 2; i <= 10; i++) {
                    const mastery = this.adaptiveSystem.getTableMastery(i);
                    tableMastery[i] = Math.round(mastery * 100);
                }
            }
            this.galaxyEngine.updateMasteryData(tableMastery);

            // Actualizar stats de la Nave Madre
            const stars = window.coinSystem ? window.coinSystem.stars : 0;
            const trophies = window.coinSystem ? window.coinSystem.trophies : 0;
            const streak = window.coinSystem ? window.coinSystem.getStreak() : 0;
            const accuracy = this.player.stats.totalQuestions > 0
                ? Math.round((this.player.stats.correctAnswers / this.player.stats.totalQuestions) * 100)
                : 0;

            this.galaxyEngine.updateStats({
                stars: stars,
                trophies: trophies,
                accuracy: accuracy,
                streak: streak
            });

            // Actualizar Mother Ship UI
            document.getElementById('galaxyStars').textContent = stars.toLocaleString();
            document.getElementById('galaxyTrophies').textContent = trophies;
            document.getElementById('galaxyAccuracy').textContent = accuracy + '%';
            document.getElementById('galaxyStreak').textContent = streak + ' días';
        }

        // Generar Trophy Hall (trofeos de logros)
        this.displayTrophyHall();

        // Generar War Loot (medallas por modo de juego)
        this.displayWarLoot();
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
            { id: 'mastery_25', icon: '⭐', name: 'Aprendiz', desc: 'Alcanza 25% de maestría global', condition: () => this.calculateGlobalMastery() >= 25 },
            { id: 'mastery_50', icon: '🌟', name: 'Estudiante', desc: 'Alcanza 50% de maestría global', condition: () => this.calculateGlobalMastery() >= 50 },
            { id: 'mastery_75', icon: '💫', name: 'Experto', desc: 'Alcanza 75% de maestría global', condition: () => this.calculateGlobalMastery() >= 75 },
            { id: 'mastery_90', icon: '🎖️', name: 'Maestro', desc: 'Alcanza 90% de maestría global', condition: () => this.calculateGlobalMastery() >= 90 },
            { id: 'mastery_100', icon: '👑', name: 'Gran Maestro', desc: 'Alcanza 100% de maestría global', condition: () => this.calculateGlobalMastery() >= 100 },
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
        if (!container) return; // Old system compatibility

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
    // FASE 6: GALAXY SYSTEMS
    // ================================

    displayTrophyHall() {
        const container = document.getElementById('trophyPedestals');
        if (!container) return;

        // Definir trofeos basados en logros
        const trophies = [
            {
                id: 'first_100',
                icon: '🏆',
                name: 'Centenario',
                description: '100 respuestas correctas',
                unlocked: this.player.stats.correctAnswers >= 100,
                date: null
            },
            {
                id: 'streak_master',
                icon: '🔥',
                name: 'Maestro del Fuego',
                description: 'Racha de 50 respuestas',
                unlocked: this.player.bestStreak >= 50,
                date: null
            },
            {
                id: 'mastery_50',
                icon: '⭐',
                name: 'Estudiante Avanzado',
                description: 'Alcanza 50% de maestría global',
                unlocked: this.calculateGlobalMastery() >= 50,
                date: null
            },
            {
                id: 'table_master',
                icon: '🎖️',
                name: 'Dominio Total',
                description: 'Domina 5 tablas al 100%',
                unlocked: this.checkTablesDominated() >= 5,
                date: null
            },
            {
                id: 'boss_slayer',
                icon: '⚔️',
                name: 'Cazador de Jefes',
                description: 'Derrota 10 jefes',
                unlocked: (this.player.stats.bossesDefeated || 0) >= 10,
                date: null
            },
            {
                id: 'speed_demon',
                icon: '⚡',
                name: 'Rayo Veloz',
                description: '50 puntos en desafío',
                unlocked: (this.player.stats.bestChallengeScore || 0) >= 50,
                date: null
            }
        ];

        container.innerHTML = '';

        trophies.forEach(trophy => {
            const pedestalEl = document.createElement('div');
            pedestalEl.className = `trophy-pedestal ${trophy.unlocked ? '' : 'locked'}`;

            if (trophy.unlocked) {
                pedestalEl.innerHTML = `
                    <div class="trophy-display">${trophy.icon}</div>
                    <div class="pedestal-base"></div>
                    <div class="trophy-name">${trophy.name}</div>
                    <div class="trophy-description">${trophy.description}</div>
                    ${trophy.date ? `<div class="trophy-date">Obtenido: ${trophy.date}</div>` : ''}
                `;
            } else {
                pedestalEl.innerHTML = `
                    <div class="trophy-display">🔒</div>
                    <div class="pedestal-base"></div>
                    <div class="trophy-name">${trophy.name}</div>
                    <div class="trophy-locked-text">${trophy.description}</div>
                `;
            }

            container.appendChild(pedestalEl);
        });
    }

    displayWarLoot() {
        const container = document.getElementById('warLootGrid');
        if (!container) return;

        // Definir medallas por modo de juego
        const lootItems = [
            {
                id: 'adventure_hero',
                icon: '🚀',
                name: 'Héroe Espacial',
                type: 'Aventura Espacial',
                description: 'Completa 10 niveles de aventura',
                earned: (this.player.stats.adventureLevelsCompleted || 0),
                requirement: 10,
                unlocked: (this.player.stats.adventureLevelsCompleted || 0) >= 10
            },
            {
                id: 'race_champion',
                icon: '🏁',
                name: 'Campeón de Carrera',
                type: 'Carrera Matemática',
                description: 'Gana 20 carreras',
                earned: (this.player.stats.racesWon || 0),
                requirement: 20,
                unlocked: (this.player.stats.racesWon || 0) >= 20
            },
            {
                id: 'challenge_king',
                icon: '⏱️',
                name: 'Rey del Desafío',
                type: 'Desafío Rápido',
                description: '100 puntos totales en desafíos',
                earned: (this.player.stats.challengeTotalScore || 0),
                requirement: 100,
                unlocked: (this.player.stats.challengeTotalScore || 0) >= 100
            },
            {
                id: 'boss_dominator',
                icon: '👑',
                name: 'Dominador de Jefes',
                type: 'Batalla de Jefes',
                description: 'Derrota 25 jefes',
                earned: (this.player.stats.bossesDefeated || 0),
                requirement: 25,
                unlocked: (this.player.stats.bossesDefeated || 0) >= 25
            },
            {
                id: 'practice_sage',
                icon: '📚',
                name: 'Sabio Practicante',
                type: 'Modo Práctica',
                description: 'Completa 50 sesiones de práctica',
                earned: (this.player.stats.practiceSessions || 0),
                requirement: 50,
                unlocked: (this.player.stats.practiceSessions || 0) >= 50
            },
            {
                id: 'multiplayer_legend',
                icon: '🎮',
                name: 'Leyenda Multijugador',
                type: 'Modo Multijugador',
                description: 'Gana 15 partidas multijugador',
                earned: (this.player.stats.multiplayerWins || 0),
                requirement: 15,
                unlocked: (this.player.stats.multiplayerWins || 0) >= 15
            }
        ];

        container.innerHTML = '';

        lootItems.forEach(loot => {
            const lootEl = document.createElement('div');
            lootEl.className = `loot-item ${loot.unlocked ? '' : 'locked'}`;

            lootEl.innerHTML = `
                <div class="loot-header">
                    <div class="loot-icon">${loot.icon}</div>
                    <div class="loot-info">
                        <div class="loot-name">${loot.name}</div>
                        <div class="loot-type">${loot.type}</div>
                    </div>
                </div>
                <div class="loot-description">${loot.description}</div>
                <div class="loot-earned">
                    <div class="loot-count">
                        Progreso: <span class="loot-count-value">${loot.earned}/${loot.requirement}</span>
                    </div>
                    ${loot.unlocked ? '<div class="loot-badge">✓ DESBLOQUEADO</div>' : ''}
                </div>
            `;

            container.appendChild(lootEl);
        });
    }

    checkTablesDominated() {
        let count = 0;
        if (this.practiceSystem) {
            for (let table = 2; table <= 10; table++) {
                if (this.practiceSystem.tableMastery[table] >= 100) {
                    count++;
                }
            }
        }
        return count;
    }

    // ================================
    // PLANET MODAL SYSTEM
    // ================================

    openPlanetModal(table) {
        const modal = document.getElementById('planetModal');
        if (!modal) return;

        // Obtener datos de dominio de la tabla
        const mastery = this.practiceSystem
            ? (this.practiceSystem.tableMastery[table] || 0)
            : Math.round(this.adaptiveSystem.getTableMastery(table) * 100);

        // Determinar estado
        let status = 'Inexplorado';
        let statusClass = 'asteroid';
        if (mastery >= 100) {
            status = 'Dominado';
            statusClass = 'crystal';
        } else if (mastery >= 91) {
            status = 'Casi Dominado';
            statusClass = 'ringed';
        } else if (mastery >= 51) {
            status = 'En Progreso';
            statusClass = 'vibrant';
        } else if (mastery >= 21) {
            status = 'En Desarrollo';
            statusClass = 'young';
        }

        // Actualizar contenido del modal
        document.getElementById('planetModalIcon').textContent = this.getPlanetEmoji(mastery);
        document.getElementById('planetModalTitle').textContent = `Planeta del ${table}`;
        document.getElementById('planetModalStatusText').textContent = `${status} (${mastery}%)`;
        document.getElementById('planetModalMastery').textContent = `${mastery}%`;
        document.getElementById('planetModalProgress').style.width = `${mastery}%`;

        // Datos de inteligencia (análisis de errores)
        const weakestMultiplier = this.getWeakestMultiplier(table);
        document.getElementById('planetModalWeakest').textContent = `${table} × ${weakestMultiplier}`;

        const tableStats = this.getTableStats(table);
        document.getElementById('planetModalSuccess').textContent = tableStats.successRate + '%';
        document.getElementById('planetModalWins').textContent = tableStats.wins;

        // Recompensa
        const reward = this.getTableReward(table, mastery);
        document.getElementById('planetModalReward').innerHTML = `
            <div class="reward-icon">${reward.icon}</div>
            <div class="reward-name">${reward.name}</div>
        `;

        // Botón de práctica
        document.getElementById('practicePlanetTable').textContent = table;

        // Guardar tabla actual
        this.currentPlanetTable = table;

        // Mostrar modal
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        console.log(`🪐 Modal abierto para Planeta del ${table}`);
    }

    closePlanetModal() {
        const modal = document.getElementById('planetModal');
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    practicePlanetTable() {
        if (!this.currentPlanetTable) return;

        // Cerrar modal
        this.closePlanetModal();

        // Iniciar modo práctica con esa tabla específica
        const table = this.currentPlanetTable;

        // Si tenemos practiceSystem, usarlo
        if (this.practiceSystem) {
            this.showScreen('practiceGameScreen');
            this.startPracticeModeWithTable(table);
        } else {
            // Fallback al sistema antiguo
            this.showScreen('practiceScreen');
            document.querySelectorAll('.table-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.table == table) {
                    btn.classList.add('selected');
                }
            });
            setTimeout(() => this.handleStartPractice(), 100);
        }

        console.log(`🎯 Iniciando práctica de tabla del ${table}`);
    }

    startPracticeModeWithTable(table) {
        this.currentMode = 'practice';
        this.gameState = {
            selectedTables: [table],
            questionsAnswered: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            streak: 0,
            startTime: Date.now()
        };

        this.generatePracticeQuestion();
    }

    getPlanetEmoji(mastery) {
        if (mastery >= 100) return '⭐';
        if (mastery >= 91) return '🪐';
        if (mastery >= 51) return '🌍';
        if (mastery >= 21) return '🌑';
        return '☄️';
    }

    getWeakestMultiplier(table) {
        // Analizar histórico de errores para encontrar el multiplicador más difícil
        // Por ahora retornar uno aleatorio (se puede mejorar con tracking real)
        const difficult = [6, 7, 8, 9]; // Los multiplicadores más comunes de fallar
        return difficult[Math.floor(Math.random() * difficult.length)];
    }

    getTableStats(table) {
        // Obtener estadísticas específicas de la tabla
        const tableData = this.player.tableMastery[table] || { correct: 0, total: 0 };
        const successRate = tableData.total > 0
            ? Math.round((tableData.correct / tableData.total) * 100)
            : 0;
        const wins = tableData.correct || 0;

        return {
            successRate: successRate,
            wins: wins
        };
    }

    getTableReward(table, mastery) {
        // Recompensas por dominar cada tabla
        const rewards = {
            2: { icon: '🎖️', name: 'Medalla de Bronce' },
            3: { icon: '🏅', name: 'Medalla de Honor' },
            4: { icon: '💎', name: 'Gema Cuádruple' },
            5: { icon: '⭐', name: 'Estrella Pentagonal' },
            6: { icon: '🔷', name: 'Cristal Hexagonal' },
            7: { icon: '👑', name: 'Corona del Siete' },
            8: { icon: '🌟', name: 'Estrella Octogonal' },
            9: { icon: '🏆', name: 'Trofeo Supremo' },
            10: { icon: '💫', name: 'Estrella Legendaria' }
        };

        return rewards[table] || { icon: '🎁', name: 'Recompensa Especial' };
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

            // Logros de maestría global
            {
                id: 'mastery_25',
                name: 'Aprendiz',
                desc: 'Alcanza 25% de maestría global',
                icon: '⬆️',
                check: () => this.calculateGlobalMastery() >= 25
            },
            {
                id: 'mastery_50',
                name: 'Estudiante',
                desc: 'Alcanza 50% de maestría global',
                icon: '🏆',
                check: () => this.calculateGlobalMastery() >= 50
            },
            {
                id: 'mastery_75',
                name: 'Experto',
                desc: 'Alcanza 75% de maestría global',
                icon: '💪',
                check: () => this.calculateGlobalMastery() >= 75
            },
            {
                id: 'mastery_90',
                name: 'Maestro',
                desc: 'Alcanza 90% de maestría global',
                icon: '⚡',
                check: () => this.calculateGlobalMastery() >= 90
            },
            {
                id: 'mastery_100',
                name: 'Gran Maestro Global',
                desc: 'Alcanza 100% de maestría global',
                icon: '👑',
                check: () => this.calculateGlobalMastery() >= 100
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
        console.log('🚀 Tutorial: start() llamado');

        if (!this.shouldShow()) {
            console.log('⏭️ Tutorial: Ya fue visto, no mostrando');
            return;
        }

        console.log('✅ Tutorial: Primera vez, mostrando tutorial');
        this.currentStep = 0;

        const overlay = document.getElementById('tutorialOverlay');
        if (overlay) {
            overlay.style.display = 'block';
            console.log('✅ Tutorial: Overlay mostrado');
        } else {
            console.error('❌ Tutorial: No se encontró tutorialOverlay');
        }

        if (window.soundSystem) {
            window.soundSystem.playClick();
        }

        this.showStep(0);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Solo agregar listeners una vez para evitar duplicados
        if (this.listenersAdded) {
            console.log('⚠️ Tutorial: Listeners ya agregados, saltando');
            return;
        }

        console.log('🔧 Tutorial: Configurando event listeners...');
        const nextBtn = document.getElementById('tutorialNext');
        const skipBtn = document.getElementById('tutorialSkip');

        console.log('🔍 Tutorial: nextBtn encontrado?', !!nextBtn);
        console.log('🔍 Tutorial: skipBtn encontrado?', !!skipBtn);

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('▶️ Tutorial: Click en Next/Siguiente');
                this.nextStep();
            });
            console.log('✅ Tutorial: Listener agregado a Next');
        } else {
            console.error('❌ Tutorial: No se encontró botón Next (#tutorialNext)');
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                console.log('⏭️ Tutorial: Click en Saltar');
                this.skip();
            });
            console.log('✅ Tutorial: Listener agregado a Skip');
        } else {
            console.error('❌ Tutorial: No se encontró botón Skip (#tutorialSkip)');
        }

        this.listenersAdded = true;
        console.log('✅ Tutorial: Event listeners configurados exitosamente');
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
        console.log('⏭️ Tutorial: Método skip() llamado');
        this.complete();
    }

    complete() {
        console.log('🏁 Tutorial: Iniciando complete()...');

        // Ocultar y limpiar todo el tutorial
        const overlay = document.getElementById('tutorialOverlay');
        const spotlight = document.getElementById('tutorialSpotlight');
        const content = document.getElementById('tutorialContent');

        console.log('🔍 Tutorial: Elementos encontrados:', {
            overlay: !!overlay,
            spotlight: !!spotlight,
            content: !!content
        });

        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Tutorial: Overlay ocultado');
        } else {
            console.error('❌ Tutorial: No se encontró overlay');
        }

        if (spotlight) {
            spotlight.classList.remove('active');
            spotlight.style.width = '0';
            spotlight.style.height = '0';
            console.log('✅ Tutorial: Spotlight limpiado');
        } else {
            console.error('❌ Tutorial: No se encontró spotlight');
        }

        if (content) {
            content.style.top = '';
            content.style.left = '';
            content.style.transform = '';
            console.log('✅ Tutorial: Content reseteado');
        } else {
            console.error('❌ Tutorial: No se encontró content');
        }

        // Marcar como completado
        localStorage.setItem('tutorialCompleted', 'true');
        console.log('✅ Tutorial: Marcado como completado en localStorage');

        // Sonido de éxito
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
            console.log('🔊 Tutorial: Sonido de éxito reproducido');
        }

        // Asegurar que la pantalla principal sea interactuable
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.pointerEvents = 'auto';
            console.log('✅ Tutorial: mainScreen pointer-events restaurado a auto');
        } else {
            console.error('❌ Tutorial: No se encontró mainScreen');
        }

        console.log('🎉 Tutorial: Complete() finalizado exitosamente');
    }
}

// ================================
// INICIALIZAR APLICACIÓN
// ================================

document.addEventListener('DOMContentLoaded', () => {
    window.game = new MultiplicationGame();
    window.app = window.game; // Alias para compatibilidad con shopSystem

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
