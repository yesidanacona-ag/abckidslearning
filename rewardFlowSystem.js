// ================================
// SISTEMA DE FLUJO DE RECOMPENSA ÉPICO
// Animaciones y secuencias para celebrar logros
// ================================

class RewardFlowSystem {
    constructor() {
        this.isPlaying = false;
        this.queue = [];
        this.overlay = null;

        this.createOverlay();
        console.log('🎉 Sistema de Flujo de Recompensa inicializado');
    }

    // ================================
    // CREAR OVERLAY
    // ================================

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'rewardFlowOverlay';
        this.overlay.className = 'reward-flow-overlay';
        this.overlay.style.display = 'none';

        this.overlay.innerHTML = `
            <div class="reward-flow-content">
                <!-- Animación de rayos de luz -->
                <div class="reward-rays"></div>

                <!-- Contenedor de recompensas -->
                <div class="reward-items-container" id="rewardItemsContainer">
                    <!-- Se llena dinámicamente -->
                </div>

                <!-- Mensaje principal -->
                <div class="reward-message" id="rewardMessage">
                    ¡Increíble!
                </div>

                <!-- Partículas de celebración -->
                <div class="reward-particles" id="rewardParticles"></div>

                <!-- Botón de continuar -->
                <button class="reward-continue-btn hidden" id="rewardContinueBtn">
                    ✨ Continuar
                </button>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Event listener para continuar
        document.getElementById('rewardContinueBtn')?.addEventListener('click', () => {
            this.hide();
        });
    }

    // ================================
    // MOSTRAR RECOMPENSAS
    // ================================

    show(rewards) {
        if (this.isPlaying) {
            this.queue.push(rewards);
            return;
        }

        this.isPlaying = true;
        this.overlay.style.display = 'flex';

        // Animación de entrada
        setTimeout(() => {
            this.overlay.classList.add('active');
        }, 10);

        // Reproducir secuencia
        this.playSequence(rewards);
    }

    async playSequence(rewards) {
        const container = document.getElementById('rewardItemsContainer');
        const messageEl = document.getElementById('rewardMessage');

        // Limpiar contenedor
        container.innerHTML = '';

        // Mensaje inicial
        messageEl.textContent = rewards.message || '¡Increíble Trabajo!';

        // Sonido épico
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }

        // Esperar entrada de overlay
        await this.wait(300);

        // Crear partículas
        this.createParticles();

        // Mostrar cada recompensa con delay
        for (let i = 0; i < rewards.items.length; i++) {
            const item = rewards.items[i];
            await this.wait(400);
            this.showRewardItem(item, i);

            // Sonido por cada item
            if (window.soundSystem && i < rewards.items.length - 1) {
                window.soundSystem.playPowerUp();
            }
        }

        // Esperar antes de mostrar botón
        await this.wait(800);

        // Mostrar botón de continuar
        const continueBtn = document.getElementById('rewardContinueBtn');
        if (continueBtn) {
            continueBtn.classList.remove('hidden');
            continueBtn.classList.add('animate-bounce-in');
        }

        // Mateo celebra
        if (window.mateo) {
            window.mateo.showExpression('excited');
            window.mateo.speak('¡Eres increíble! 🌟', 3000);
        }
    }

    showRewardItem(item, index) {
        const container = document.getElementById('rewardItemsContainer');

        const itemEl = document.createElement('div');
        itemEl.className = 'reward-item';
        itemEl.style.animationDelay = `${index * 0.1}s`;

        // Icono grande
        const iconEl = document.createElement('div');
        iconEl.className = 'reward-item-icon';
        iconEl.textContent = item.icon;

        // Cantidad/valor
        const valueEl = document.createElement('div');
        valueEl.className = 'reward-item-value';
        valueEl.textContent = item.value;

        // Label
        const labelEl = document.createElement('div');
        labelEl.className = 'reward-item-label';
        labelEl.textContent = item.label;

        itemEl.appendChild(iconEl);
        itemEl.appendChild(valueEl);
        itemEl.appendChild(labelEl);

        container.appendChild(itemEl);
    }

    // ================================
    // PARTÍCULAS DE CELEBRACIÓN
    // ================================

    createParticles() {
        const particlesContainer = document.getElementById('rewardParticles');
        if (!particlesContainer) return;

        particlesContainer.innerHTML = '';

        // Crear 30 partículas
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'reward-particle';

            // Posición y animación aleatoria
            const startX = Math.random() * 100;
            const startY = 100;
            const endX = startX + (Math.random() - 0.5) * 60;
            const endY = -20;
            const duration = 1 + Math.random() * 1;
            const delay = Math.random() * 0.5;

            // Emojis aleatorios
            const emojis = ['⭐', '✨', '💫', '🌟', '💰', '🏆', '🎉'];
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            particle.style.left = startX + '%';
            particle.style.bottom = startY + '%';
            particle.style.setProperty('--end-x', endX + '%');
            particle.style.setProperty('--end-y', endY + '%');
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = delay + 's';

            particlesContainer.appendChild(particle);
        }
    }

    // ================================
    // OCULTAR OVERLAY
    // ================================

    hide() {
        this.overlay.classList.remove('active');

        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.isPlaying = false;

            // Procesar siguiente en cola
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.show(next);
            }
        }, 300);
    }

    // ================================
    // TIPOS DE RECOMPENSAS PREDEFINIDOS
    // ================================

    showLevelUp(newLevel, coinsEarned) {
        this.show({
            message: `¡Nivel ${newLevel} Alcanzado!`,
            items: [
                {
                    icon: '🎊',
                    value: `Nivel ${newLevel}`,
                    label: 'Nueva Maestría'
                },
                {
                    icon: '💰',
                    value: `+${coinsEarned}`,
                    label: 'Monedas Bonus'
                }
            ]
        });
    }

    showMasteryComplete(tableNumber) {
        this.show({
            message: `¡Tabla del ${tableNumber} Dominada!`,
            items: [
                {
                    icon: '👑',
                    value: '100%',
                    label: `Maestría del ${tableNumber}`
                },
                {
                    icon: '💰',
                    value: '+100',
                    label: 'Monedas Bonus'
                },
                {
                    icon: '🏆',
                    value: '+1',
                    label: 'Trofeo'
                }
            ]
        });
    }

    showWaveComplete(waveNumber, coinsEarned, bonusItems = []) {
        const items = [
            {
                icon: '🌊',
                value: `Oleada ${waveNumber}`,
                label: 'Completada'
            },
            {
                icon: '💰',
                value: `+${coinsEarned}`,
                label: 'Monedas'
            },
            ...bonusItems
        ];

        this.show({
            message: `¡Oleada ${waveNumber} Superada!`,
            items: items
        });
    }

    showBossDefeat(bossName, rewards) {
        this.show({
            message: `¡${bossName} Derrotado!`,
            items: rewards
        });
    }

    showAchievementUnlock(achievement) {
        this.show({
            message: '¡Logro Desbloqueado!',
            items: [
                {
                    icon: achievement.icon,
                    value: achievement.name,
                    label: achievement.description
                }
            ]
        });
    }

    // ================================
    // UTILIDADES
    // ================================

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.rewardFlow = new RewardFlowSystem();

console.log('🎉 Sistema de Flujo de Recompensa listo');
