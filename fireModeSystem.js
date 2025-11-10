// ================================
// MODO FUEGO - Sistema de Rachas
// ================================

class FireModeSystem {
    constructor() {
        try {
            // Estado
            this.isActive = false;
            this.streak = 0;
            this.streakThreshold = 5; // 5 aciertos para activar
            this.duration = 30000; // 30 segundos
            this.multiplier = 2; // x2 puntos
            this.timeRemaining = 0;
            this.timer = null;
            this.hasError = false;

            // Referencias DOM
            this.overlay = null;
            this.indicator = null;
            this.timerDisplay = null;

            this.createFireOverlay();
            console.log('🔥 Sistema de Modo Fuego inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar FireModeSystem:', error);
            this.hasError = true;
        }
    }

    // =============================
    // CREAR OVERLAY DE FUEGO
    // =============================

    createFireOverlay() {
        try {
            // Overlay de llamas en bordes
            this.overlay = document.createElement('div');
            this.overlay.id = 'fireModeOverlay';
            this.overlay.className = 'fire-mode-overlay';
            this.overlay.style.display = 'none';

            this.overlay.innerHTML = `
                <!-- Llamas en bordes -->
                <div class="fire-border fire-border-top"></div>
                <div class="fire-border fire-border-right"></div>
                <div class="fire-border fire-border-bottom"></div>
                <div class="fire-border fire-border-left"></div>
            `;

            document.body.appendChild(this.overlay);

            // Indicador de modo fuego
            this.indicator = document.createElement('div');
            this.indicator.id = 'fireModeIndicator';
            this.indicator.className = 'fire-mode-indicator';
            this.indicator.style.display = 'none';

            this.indicator.innerHTML = `
                <div class="fire-mode-icon">🔥</div>
                <div class="fire-mode-info">
                    <div class="fire-mode-title">¡MODO FUEGO!</div>
                    <div class="fire-mode-multiplier">×${this.multiplier} PUNTOS</div>
                    <div class="fire-mode-timer" id="fireModeTimer">30s</div>
                </div>
            `;

            document.body.appendChild(this.indicator);

            this.timerDisplay = document.getElementById('fireModeTimer');
        } catch (error) {
            console.error('❌ Error creando overlay de modo fuego:', error);
            this.hasError = true;
        }
    }

    // =============================
    // INCREMENTAR RACHA
    // =============================

    incrementStreak() {
        this.streak++;
        console.log(`🔥 Racha: ${this.streak}/${this.streakThreshold}`);

        // Activar modo fuego si alcanza el threshold
        if (this.streak >= this.streakThreshold && !this.isActive) {
            this.activate();
        }

        // Si ya está activo, resetear timer
        if (this.isActive) {
            this.resetTimer();
        }

        return this.streak;
    }

    // =============================
    // RESETEAR RACHA
    // =============================

    resetStreak() {
        const wasActive = this.isActive;
        this.streak = 0;

        console.log('💔 Racha perdida');

        if (wasActive) {
            this.deactivate();
            this.showStreakLostMessage();
        }
    }

    // =============================
    // ACTIVAR MODO FUEGO
    // =============================

    activate() {
        try {
            if (this.isActive || this.hasError) return;

            console.log('🔥🔥🔥 ¡MODO FUEGO ACTIVADO!');

            this.isActive = true;
            this.timeRemaining = this.duration;

            // Mostrar efectos visuales
            if (this.overlay) {
                this.overlay.style.display = 'block';
                setTimeout(() => {
                    if (this.overlay) {
                        this.overlay.classList.add('fire-active');
                    }
                }, 10);
            }

            if (this.indicator) {
                this.indicator.style.display = 'flex';
                setTimeout(() => {
                    if (this.indicator) {
                        this.indicator.classList.add('fire-indicator-active');
                    }
                }, 10);
            }

            // Animación de activación
            this.showActivationMessage();

            // Acelerar música
            if (window.soundSystem) {
                window.soundSystem.setMusicSpeed(1.2); // +20% tempo
            }

            // Iniciar timer
            this.startTimer();

            // Sonido especial
            if (window.soundSystem) {
                window.soundSystem.playPowerUp();
            }
        } catch (error) {
            console.error('❌ Error activando modo fuego:', error);
            this.hasError = true;
            this.deactivate();
        }
    }

    // =============================
    // DESACTIVAR MODO FUEGO
    // =============================

    deactivate() {
        try {
            if (!this.isActive) return;

            console.log('🧯 Modo Fuego desactivado');

            this.isActive = false;
            this.streak = 0;

            // Ocultar efectos visuales
            if (this.overlay) {
                this.overlay.classList.remove('fire-active');
                setTimeout(() => {
                    if (this.overlay) {
                        this.overlay.style.display = 'none';
                    }
                }, 500);
            }

            if (this.indicator) {
                this.indicator.classList.remove('fire-indicator-active');
                setTimeout(() => {
                    if (this.indicator) {
                        this.indicator.style.display = 'none';
                    }
                }, 500);
            }

            // Restaurar velocidad de música
            if (window.soundSystem) {
                window.soundSystem.setMusicSpeed(1.0);
            }

            // Detener timer
            this.stopTimer();
        } catch (error) {
            console.error('❌ Error desactivando modo fuego:', error);
            this.hasError = true;
        }
    }

    // =============================
    // TIMER
    // =============================

    startTimer() {
        this.stopTimer(); // Limpiar timer existente

        this.timer = setInterval(() => {
            this.timeRemaining -= 100;

            // Actualizar display
            const seconds = Math.ceil(this.timeRemaining / 1000);
            if (this.timerDisplay) {
                this.timerDisplay.textContent = `${seconds}s`;

                // Parpadear cuando quedan pocos segundos
                if (seconds <= 5) {
                    this.timerDisplay.classList.add('fire-timer-warning');
                } else {
                    this.timerDisplay.classList.remove('fire-timer-warning');
                }
            }

            // Desactivar si se acaba el tiempo
            if (this.timeRemaining <= 0) {
                this.deactivate();
                this.showTimeUpMessage();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.timeRemaining = this.duration;
        const seconds = Math.ceil(this.timeRemaining / 1000);
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `${seconds}s`;
            this.timerDisplay.classList.remove('fire-timer-warning');
        }
    }

    // =============================
    // MENSAJES
    // =============================

    showActivationMessage() {
        this.showMessage('¡MODO FUEGO ACTIVADO!', '×2 PUNTOS POR 30 SEGUNDOS', '#FF4757');
    }

    showStreakLostMessage() {
        this.showMessage('💔 Racha Perdida', 'Modo Fuego Desactivado', '#6B7280');
    }

    showTimeUpMessage() {
        this.showMessage('⏰ Tiempo Agotado', 'Modo Fuego Terminado', '#6B7280');
    }

    showMessage(title, subtitle, color = '#FF4757') {
        const message = document.createElement('div');
        message.className = 'fire-mode-message';
        message.style.borderColor = color;

        message.innerHTML = `
            <div class="fire-mode-message-icon">🔥</div>
            <div class="fire-mode-message-text">
                <div class="fire-mode-message-title">${title}</div>
                <div class="fire-mode-message-subtitle">${subtitle}</div>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.add('fire-message-show');
        }, 100);

        setTimeout(() => {
            message.classList.remove('fire-message-show');
            setTimeout(() => {
                message.remove();
            }, 500);
        }, 3000);
    }

    // =============================
    // GETTERS
    // =============================

    isFireModeActive() {
        return this.isActive;
    }

    getMultiplier() {
        return this.isActive ? this.multiplier : 1;
    }

    getStreak() {
        return this.streak;
    }

    getTimeRemaining() {
        return this.timeRemaining;
    }

    // =============================
    // RESET
    // =============================

    reset() {
        this.deactivate();
        this.streak = 0;
        console.log('🔄 Sistema de Modo Fuego reseteado');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

// Crear instancia global del sistema de modo fuego
window.fireModeSystem = new FireModeSystem();

console.log('🔥 Sistema de Modo Fuego listo');
