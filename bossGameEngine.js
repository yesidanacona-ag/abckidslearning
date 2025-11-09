// ================================
// MOTOR DE BATALLA DE JEFES ÉPICA
// Sistema de turnos con animaciones y efectos
// ================================

class BossGameEngine {
    constructor(containerId, onBossDefeated, onPlayerDefeated) {
        this.container = document.getElementById(containerId);
        this.onBossDefeated = onBossDefeated;
        this.onPlayerDefeated = onPlayerDefeated;

        // Estado de batalla
        this.currentBoss = null;
        this.player = null;
        this.bossHealth = 100;
        this.playerHealth = 100;
        this.maxBossHealth = 100;

        // Sistema de turnos
        this.turn = 'boss'; // 'boss' o 'player'
        this.turnPhase = 'question'; // 'question', 'attack', 'damage', 'transition'
        this.isProcessing = false;

        // Sistema de súper-ataque
        this.superAttackCharge = 0;
        this.superAttackReady = false;
        this.correctStreak = 0;

        // Efectos y partículas
        this.particles = [];
        this.shakeIntensity = 0;
        this.flashEffect = null;

        // Pregunta actual
        this.currentQuestion = null;

        // Callbacks
        this.onCorrectAnswer = null;
        this.onWrongAnswer = null;

        this.createBattleUI();
    }

    createBattleUI() {
        this.container.innerHTML = `
            <!-- Indicador de turno -->
            <div class="battle-turn-indicator" id="turnIndicator">
                <div class="turn-text" id="turnText">TURNO DEL JEFE</div>
                <div class="turn-subtitle" id="turnSubtext">¡Prepárate para defender!</div>
            </div>

            <!-- Jefe -->
            <div class="battle-entity boss-entity" id="bossEntity">
                <div class="entity-avatar boss-avatar" id="bossAvatar">
                    🐉
                </div>
                <div class="entity-name" id="bossName">Jefe del 7</div>
                <div class="entity-health-container">
                    <div class="health-bar boss-health-bar">
                        <div class="health-fill" id="bossHealthFill" style="width: 100%"></div>
                        <div class="health-text" id="bossHealthText">100%</div>
                    </div>
                    <div class="boss-phase" id="bossPhase">FASE 1</div>
                </div>
            </div>

            <!-- Animación de ataque -->
            <div class="battle-animation-layer" id="animationLayer">
                <canvas id="battleCanvas" width="800" height="400"></canvas>
            </div>

            <!-- Jugador -->
            <div class="battle-entity player-entity" id="playerEntity">
                <div class="entity-health-container">
                    <div class="health-bar player-health-bar">
                        <div class="health-fill" id="playerHealthFill" style="width: 100%"></div>
                        <div class="health-text" id="playerHealthText">100%</div>
                    </div>
                </div>
                <div class="entity-name" id="playerName">Martín</div>
                <div class="entity-avatar player-avatar" id="playerAvatar">
                    👦
                </div>
                <div class="entity-weapon" id="playerWeapon">
                    🗡️
                </div>

                <!-- Súper-ataque -->
                <div class="super-attack-container" id="superAttackContainer">
                    <div class="super-attack-bar">
                        <div class="super-attack-fill" id="superAttackFill" style="width: 0%"></div>
                    </div>
                    <div class="super-attack-text">⚡ SÚPER-ATAQUE</div>
                </div>
            </div>

            <!-- Área de pregunta y opciones -->
            <div class="battle-question-area" id="questionArea">
                <div class="battle-question" id="battleQuestion">
                    7 × 8 = ?
                </div>
                <div class="battle-options" id="battleOptions">
                    <!-- Opciones se generan dinámicamente -->
                </div>

                <!-- Botón de súper-ataque -->
                <button class="super-attack-button hidden" id="superAttackButton">
                    <span class="super-attack-icon">⚡</span>
                    <span class="super-attack-label">USAR SÚPER-ATAQUE</span>
                </button>
            </div>

            <!-- Log de batalla -->
            <div class="battle-log" id="battleLog">
                <!-- Mensajes de batalla -->
            </div>

            <!-- Modal de cofre -->
            <div class="chest-modal hidden" id="chestModal">
                <div class="chest-content">
                    <div class="chest-animation" id="chestAnimation">
                        🎁
                    </div>
                    <h2 class="chest-title">¡COFRE DESBLOQUEADO!</h2>
                    <div class="chest-rewards" id="chestRewards">
                        <!-- Recompensas -->
                    </div>
                    <button class="chest-open-btn" id="chestOpenBtn">
                        Abrir Cofre
                    </button>
                    <button class="chest-continue-btn hidden" id="chestContinueBtn">
                        Continuar
                    </button>
                </div>
            </div>
        `;

        // Referencias
        this.refs = {
            turnIndicator: document.getElementById('turnIndicator'),
            turnText: document.getElementById('turnText'),
            turnSubtext: document.getElementById('turnSubtext'),
            bossEntity: document.getElementById('bossEntity'),
            bossAvatar: document.getElementById('bossAvatar'),
            bossName: document.getElementById('bossName'),
            bossHealthFill: document.getElementById('bossHealthFill'),
            bossHealthText: document.getElementById('bossHealthText'),
            bossPhase: document.getElementById('bossPhase'),
            playerEntity: document.getElementById('playerEntity'),
            playerAvatar: document.getElementById('playerAvatar'),
            playerWeapon: document.getElementById('playerWeapon'),
            playerName: document.getElementById('playerName'),
            playerHealthFill: document.getElementById('playerHealthFill'),
            playerHealthText: document.getElementById('playerHealthText'),
            superAttackContainer: document.getElementById('superAttackContainer'),
            superAttackFill: document.getElementById('superAttackFill'),
            questionArea: document.getElementById('questionArea'),
            battleQuestion: document.getElementById('battleQuestion'),
            battleOptions: document.getElementById('battleOptions'),
            superAttackButton: document.getElementById('superAttackButton'),
            battleLog: document.getElementById('battleLog'),
            canvas: document.getElementById('battleCanvas'),
            animationLayer: document.getElementById('animationLayer')
        };

        this.ctx = this.refs.canvas.getContext('2d');

        // Setup de eventos
        this.setupEventListeners();

        // Iniciar loop de animación
        this.animationLoop();
    }

    setupEventListeners() {
        // Botón de súper-ataque
        this.refs.superAttackButton.addEventListener('click', () => {
            this.activateSuperAttack();
        });

        // Eventos de pausa
        document.addEventListener('gamePaused', () => {
            this.isProcessing = true;
        });

        document.addEventListener('gameResumed', () => {
            this.isProcessing = false;
        });
    }

    // =============================
    // CONFIGURACIÓN DE BATALLA
    // =============================

    startBattle(boss, player) {
        this.currentBoss = boss;
        this.player = player;
        this.bossHealth = boss.health;
        this.maxBossHealth = boss.health;
        this.playerHealth = 100;
        this.correctStreak = 0;
        this.superAttackCharge = 0;
        this.superAttackReady = false;

        // UI
        this.refs.bossAvatar.textContent = boss.avatar;
        this.refs.bossName.textContent = boss.name;
        this.refs.playerAvatar.textContent = player.avatar;
        this.refs.playerName.textContent = player.name;

        // Arma equipada
        const equippedWeapon = window.shopSystem ? window.shopSystem.getEquipped('weapons') : '🗡️';
        this.refs.playerWeapon.textContent = equippedWeapon;

        // Log
        this.addLog(`¡${boss.name} apareció!`, 'boss');

        // Primera pregunta (turno del jefe = defensa del jugador)
        this.turn = 'boss';
        this.showQuestion();
    }

    // =============================
    // SISTEMA DE TURNOS
    // =============================

    showQuestion() {
        if (this.isProcessing) return;

        this.turnPhase = 'question';

        // Actualizar indicador de turno
        if (this.turn === 'boss') {
            this.refs.turnText.textContent = '🛡️ DEFIENDE';
            this.refs.turnSubtext.textContent = '¡Responde correctamente para bloquear el ataque!';
            this.refs.turnIndicator.className = 'battle-turn-indicator boss-turn';
            this.addLog('El jefe se prepara para atacar...', 'boss');
        } else {
            this.refs.turnText.textContent = '⚔️ ATACA';
            this.refs.turnSubtext.textContent = '¡Es tu turno de atacar!';
            this.refs.turnIndicator.className = 'battle-turn-indicator player-turn';
            this.addLog('¡Tu turno de atacar!', 'player');
        }

        // Mostrar indicador
        this.refs.turnIndicator.classList.add('show');
        setTimeout(() => {
            this.refs.turnIndicator.classList.remove('show');
        }, 2000);

        // Generar pregunta (se hace desde app.js)
        // Esperamos que se llame setQuestion()
    }

    setQuestion(table, multiplier, options) {
        const answer = table * multiplier;

        this.currentQuestion = {
            table,
            multiplier,
            answer,
            isSuperAttack: false
        };

        // Mostrar pregunta
        this.refs.battleQuestion.textContent = `${table} × ${multiplier} = ?`;

        // Generar opciones
        this.refs.battleOptions.innerHTML = '';
        options.forEach(value => {
            const btn = document.createElement('button');
            btn.className = 'battle-option';
            btn.textContent = value;
            btn.addEventListener('click', () => this.handleAnswer(value));
            this.refs.battleOptions.appendChild(btn);
        });

        // Mostrar botón de súper-ataque si está disponible
        if (this.superAttackReady && this.turn === 'player') {
            this.refs.superAttackButton.classList.remove('hidden');
        } else {
            this.refs.superAttackButton.classList.add('hidden');
        }
    }

    handleAnswer(selectedValue) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const isCorrect = selectedValue === this.currentQuestion.answer;

        // Feedback visual en botones
        const buttons = this.refs.battleOptions.querySelectorAll('.battle-option');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            const value = parseInt(btn.textContent);
            if (value === this.currentQuestion.answer) {
                btn.classList.add('correct');
            }
            if (value === selectedValue && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    handleCorrectAnswer() {
        // Incrementar racha
        this.correctStreak++;

        // Cargar súper-ataque
        if (this.correctStreak >= 3 && !this.superAttackReady) {
            this.superAttackCharge = 100;
            this.superAttackReady = true;
            this.refs.superAttackFill.style.width = '100%';
            this.refs.superAttackContainer.classList.add('ready');
            this.addLog('⚡ ¡SÚPER-ATAQUE CARGADO!', 'special');
        } else if (!this.superAttackReady) {
            this.superAttackCharge = (this.correctStreak / 3) * 100;
            this.refs.superAttackFill.style.width = this.superAttackCharge + '%';
        }

        if (this.turn === 'boss') {
            // Defensa exitosa
            this.addLog('✓ ¡Bloqueaste el ataque!', 'player');
            this.animatePlayerDefense();

            setTimeout(() => {
                // Cambiar a turno del jugador
                this.turn = 'player';
                this.isProcessing = false;
                this.showQuestion();
            }, 2000);

        } else {
            // Ataque al jefe
            const damage = this.currentQuestion.isSuperAttack ? 45 : 15;
            this.addLog(`⚔️ ¡Ataque exitoso! -${damage} HP`, 'player');

            this.animatePlayerAttack(damage);

            setTimeout(() => {
                this.dealDamage('boss', damage);

                // Verificar si el jefe fue derrotado
                if (this.bossHealth <= 0) {
                    this.handleBossDefeated();
                } else {
                    // Cambiar a turno del jefe
                    this.turn = 'boss';
                    this.isProcessing = false;
                    this.showQuestion();
                }
            }, 1500);
        }

        // Callback
        if (this.onCorrectAnswer) {
            this.onCorrectAnswer(this.currentQuestion.isSuperAttack ? 30 : 10);
        }
    }

    handleWrongAnswer() {
        // Resetear racha
        this.correctStreak = 0;
        this.superAttackCharge = 0;
        this.superAttackReady = false;
        this.refs.superAttackFill.style.width = '0%';
        this.refs.superAttackContainer.classList.remove('ready');

        if (this.turn === 'boss') {
            // Defensa fallida - el jefe ataca
            const damage = 15;
            this.addLog(`💥 ¡El ataque te golpeó! -${damage} HP`, 'boss');

            this.animateBossAttack(damage);

            setTimeout(() => {
                this.dealDamage('player', damage);

                // Verificar si el jugador fue derrotado
                if (this.playerHealth <= 0) {
                    this.handlePlayerDefeated();
                } else {
                    // Cambiar a turno del jugador
                    this.turn = 'player';
                    this.isProcessing = false;
                    this.showQuestion();
                }
            }, 1500);

        } else {
            // Ataque fallido - pierde el turno
            this.addLog('✗ ¡Ataque fallido!', 'boss');
            this.animatePlayerMiss();

            setTimeout(() => {
                // Cambiar a turno del jefe
                this.turn = 'boss';
                this.isProcessing = false;
                this.showQuestion();
            }, 2000);
        }

        // Callback
        if (this.onWrongAnswer) {
            this.onWrongAnswer();
        }
    }

    // =============================
    // SISTEMA DE SÚPER-ATAQUE
    // =============================

    activateSuperAttack() {
        if (!this.superAttackReady || this.turn !== 'player') return;

        console.log('⚡ SÚPER-ATAQUE ACTIVADO!');

        this.superAttackReady = false;
        this.refs.superAttackButton.classList.add('hidden');
        this.refs.superAttackContainer.classList.remove('ready');
        this.refs.superAttackContainer.classList.add('used');

        // Marcar pregunta como súper-ataque (TRIPLE DAÑO)
        this.currentQuestion.isSuperAttack = true;

        // EFECTOS VISUALES ÉPICOS
        this.addLog('⚡⚡⚡ ¡SÚPER-ATAQUE ACTIVADO! ⚡⚡⚡', 'special');
        this.flashScreen('#FFD700');

        // Cambiar color de todas las opciones a dorado
        const buttons = this.refs.battleOptions.querySelectorAll('.battle-option');
        buttons.forEach(btn => {
            btn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            btn.style.borderColor = '#FFD700';
            btn.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            btn.style.animation = 'pulse 0.5s ease infinite';
        });

        // Cambiar color de la pregunta
        this.refs.battleQuestion.style.color = '#FFD700';
        this.refs.battleQuestion.style.textShadow = '0 0 20px #FFD700';
        this.refs.battleQuestion.style.animation = 'pulse 0.5s ease infinite';

        // Mostrar indicador visual grande
        const indicator = document.createElement('div');
        indicator.className = 'super-attack-indicator';
        indicator.innerHTML = `
            <div class="super-attack-glow">
                <div class="super-attack-text">
                    ⚡ SÚPER-ATAQUE ⚡<br>
                    <span style="font-size: 0.6em;">TRIPLE DAÑO (45 HP)</span>
                </div>
            </div>
        `;
        this.refs.questionArea.appendChild(indicator);

        // Animar indicador
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'scale(0.5)';
            setTimeout(() => indicator.remove(), 500);
        }, 2000);

        // Resetear después de usar
        setTimeout(() => {
            this.superAttackCharge = 0;
            this.correctStreak = 0;
            this.refs.superAttackFill.style.width = '0%';
            this.refs.superAttackContainer.classList.remove('used');

            // Restaurar estilos normales de pregunta
            this.refs.battleQuestion.style.color = '#FFD700';
            this.refs.battleQuestion.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
            this.refs.battleQuestion.style.animation = '';
        }, 1000);
    }

    // =============================
    // SISTEMA DE DAÑO
    // =============================

    dealDamage(target, amount) {
        if (target === 'boss') {
            this.bossHealth = Math.max(0, this.bossHealth - amount);
            const healthPercent = (this.bossHealth / this.maxBossHealth) * 100;
            this.refs.bossHealthFill.style.width = healthPercent + '%';
            this.refs.bossHealthText.textContent = Math.round(healthPercent) + '%';

            // Actualizar fase del jefe
            this.updateBossPhase();

            // Shake del jefe
            this.refs.bossEntity.classList.add('shake');
            setTimeout(() => {
                this.refs.bossEntity.classList.remove('shake');
            }, 500);

        } else if (target === 'player') {
            this.playerHealth = Math.max(0, this.playerHealth - amount);
            const healthPercent = this.playerHealth;
            this.refs.playerHealthFill.style.width = healthPercent + '%';
            this.refs.playerHealthText.textContent = Math.round(healthPercent) + '%';

            // Shake del jugador
            this.refs.playerEntity.classList.add('shake');
            setTimeout(() => {
                this.refs.playerEntity.classList.remove('shake');
            }, 500);
        }
    }

    updateBossPhase() {
        const healthPercent = (this.bossHealth / this.maxBossHealth) * 100;

        if (healthPercent > 66) {
            this.refs.bossPhase.textContent = 'FASE 1';
            this.refs.bossPhase.className = 'boss-phase phase-1';
        } else if (healthPercent > 33) {
            this.refs.bossPhase.textContent = 'FASE 2';
            this.refs.bossPhase.className = 'boss-phase phase-2';
            this.refs.bossEntity.classList.add('phase-2');
        } else {
            this.refs.bossPhase.textContent = 'FASE 3 - FURIA';
            this.refs.bossPhase.className = 'boss-phase phase-3';
            this.refs.bossEntity.classList.add('phase-3');
        }
    }

    // =============================
    // ANIMACIONES DE COMBATE
    // =============================

    animatePlayerAttack(damage) {
        // Animación del avatar del jugador
        this.refs.playerAvatar.classList.add('attack');
        setTimeout(() => {
            this.refs.playerAvatar.classList.remove('attack');
        }, 600);

        // Proyectil de ataque en canvas
        this.createAttackProjectile('player', damage);

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }
    }

    animateBossAttack(damage) {
        // Animación del avatar del jefe
        this.refs.bossAvatar.classList.add('attack');
        setTimeout(() => {
            this.refs.bossAvatar.classList.remove('attack');
        }, 600);

        // Proyectil de ataque en canvas
        this.createAttackProjectile('boss', damage);

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }
    }

    animatePlayerDefense() {
        // Efecto de escudo
        this.refs.playerAvatar.classList.add('defend');
        setTimeout(() => {
            this.refs.playerAvatar.classList.remove('defend');
        }, 600);

        // Partículas de bloqueo
        this.createBlockParticles(400, 300);
    }

    animatePlayerMiss() {
        // Animación de fallo
        this.refs.playerAvatar.classList.add('miss');
        setTimeout(() => {
            this.refs.playerAvatar.classList.remove('miss');
        }, 400);
    }

    createAttackProjectile(attacker, damage) {
        const startX = attacker === 'player' ? 400 : 400;
        const startY = attacker === 'player' ? 300 : 100;
        const endX = attacker === 'player' ? 400 : 400;
        const endY = attacker === 'player' ? 100 : 300;
        const color = attacker === 'player' ? '#10B981' : '#EF4444';

        const projectile = {
            x: startX,
            y: startY,
            targetX: endX,
            targetY: endY,
            progress: 0,
            color: color,
            damage: damage,
            size: 20
        };

        // Animar projectil
        const animateProjectile = () => {
            projectile.progress += 0.05;
            projectile.x = startX + (endX - startX) * projectile.progress;
            projectile.y = startY + (endY - startY) * projectile.progress;

            if (projectile.progress >= 1) {
                // Crear explosión al llegar
                this.createImpactParticles(projectile.x, projectile.y, projectile.color);
            } else {
                // Dibujar projectil
                this.ctx.fillStyle = projectile.color;
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
                this.ctx.fill();

                requestAnimationFrame(animateProjectile);
            }
        };

        animateProjectile();
    }

    createImpactParticles(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: color,
                size: Math.random() * 8 + 4
            });
        }
    }

    createBlockParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: '#4ECDC4',
                size: Math.random() * 6 + 3
            });
        }
    }

    animationLoop() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

        // Actualizar y dibujar partículas
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3; // Gravedad
            particle.life -= 0.02;

            if (particle.life > 0) {
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });

        requestAnimationFrame(() => this.animationLoop());
    }

    flashScreen(color) {
        this.refs.animationLayer.style.backgroundColor = color;
        this.refs.animationLayer.style.opacity = '0.5';
        setTimeout(() => {
            this.refs.animationLayer.style.backgroundColor = 'transparent';
            this.refs.animationLayer.style.opacity = '1';
        }, 200);
    }

    // =============================
    // VICTORIA Y DERROTA
    // =============================

    handleBossDefeated() {
        this.addLog(`🎉 ¡VICTORIA! ${this.currentBoss.name} derrotado!`, 'victory');

        // Animación de victoria
        this.refs.bossEntity.classList.add('defeated');
        this.refs.playerAvatar.classList.add('victory');

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playVictory();
        }

        // Mostrar cofre
        setTimeout(() => {
            this.showChest();
        }, 2000);
    }

    handlePlayerDefeated() {
        this.addLog('💔 Has sido derrotado...', 'boss');

        // Animación de derrota
        this.refs.playerEntity.classList.add('defeated');

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        setTimeout(() => {
            if (this.onPlayerDefeated) {
                this.onPlayerDefeated();
            }
        }, 2000);
    }

    // =============================
    // SISTEMA DE COFRES
    // =============================

    showChest() {
        const modal = document.getElementById('chestModal');
        const openBtn = document.getElementById('chestOpenBtn');
        const continueBtn = document.getElementById('chestContinueBtn');
        const animation = document.getElementById('chestAnimation');

        modal.classList.remove('hidden');

        // Abrir cofre
        openBtn.addEventListener('click', () => {
            animation.classList.add('opening');
            animation.textContent = '✨';
            openBtn.classList.add('hidden');

            setTimeout(() => {
                this.revealRewards();
                continueBtn.classList.remove('hidden');
            }, 1000);
        }, { once: true });

        // Continuar
        continueBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            if (this.onBossDefeated) {
                this.onBossDefeated();
            }
        }, { once: true });
    }

    revealRewards() {
        const rewardsContainer = document.getElementById('chestRewards');

        // Calcular recompensas basadas en el jefe derrotado
        const baseStars = 200;
        const trophies = 1;

        // Posibilidad de item especial (20% chance)
        const hasSpecialItem = Math.random() < 0.2;
        const specialItems = [
            { icon: '⚔️', name: 'Espada Legendaria' },
            { icon: '🛡️', name: 'Escudo Divino' },
            { icon: '👑', name: 'Corona del Maestro' },
            { icon: '💎', name: 'Gema de Poder' }
        ];
        const specialItem = specialItems[Math.floor(Math.random() * specialItems.length)];

        rewardsContainer.innerHTML = `
            <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-text">+${baseStars} Estrellas</span>
            </div>
            <div class="reward-item">
                <span class="reward-icon">🏆</span>
                <span class="reward-text">+${trophies} Trofeo</span>
            </div>
            ${hasSpecialItem ? `
                <div class="reward-item special">
                    <span class="reward-icon">${specialItem.icon}</span>
                    <span class="reward-text">${specialItem.name}</span>
                </div>
            ` : ''}
        `;

        // Agregar estrellas al sistema
        if (window.coinSystem) {
            window.coinSystem.addStars(baseStars);
        }
    }

    // =============================
    // SISTEMA DE LOG
    // =============================

    addLog(message, type = '') {
        const entry = document.createElement('div');
        entry.className = `battle-log-entry ${type}`;
        entry.textContent = message;

        this.refs.battleLog.prepend(entry);

        // Mantener solo últimos 8 mensajes
        while (this.refs.battleLog.children.length > 8) {
            this.refs.battleLog.removeChild(this.refs.battleLog.lastChild);
        }
    }

    // =============================
    // UTILIDADES
    // =============================

    reset() {
        this.particles = [];
        this.correctStreak = 0;
        this.superAttackCharge = 0;
        this.superAttackReady = false;
        this.isProcessing = false;
    }
}

// Exportar para uso global
window.BossGameEngine = BossGameEngine;
