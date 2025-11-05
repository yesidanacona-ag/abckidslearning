// ================================
// SISTEMA DE PAUSA GLOBAL
// ================================

class PauseMenu {
    constructor() {
        this.isPaused = false;
        this.overlay = null;
        this.modal = null;
        this.onContinue = null;
        this.onRestart = null;
        this.onMainMenu = null;

        this.createPauseMenu();
    }

    createPauseMenu() {
        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'pauseOverlay';
        this.overlay.className = 'pause-overlay';
        this.overlay.style.display = 'none';

        // Crear modal
        this.modal = document.createElement('div');
        this.modal.className = 'pause-modal';

        this.modal.innerHTML = `
            <div class="pause-header">
                <h2>⏸️ Juego Pausado</h2>
            </div>

            <div class="pause-buttons">
                <button class="pause-btn pause-btn-primary" id="pauseContinue">
                    <span class="pause-btn-icon">▶️</span>
                    <span class="pause-btn-text">Continuar</span>
                </button>

                <button class="pause-btn pause-btn-secondary" id="pauseRestart">
                    <span class="pause-btn-icon">🔄</span>
                    <span class="pause-btn-text">Reiniciar Nivel</span>
                </button>

                <button class="pause-btn pause-btn-secondary" id="pauseMainMenu">
                    <span class="pause-btn-icon">🏠</span>
                    <span class="pause-btn-text">Menú Principal</span>
                </button>
            </div>

            <div class="pause-controls">
                <div class="pause-control-item">
                    <span class="pause-control-label">🔊 Sonido</span>
                    <button class="pause-toggle" id="pauseSoundToggle">
                        <span class="pause-toggle-slider"></span>
                    </button>
                </div>

                <div class="pause-control-item">
                    <span class="pause-control-label">🎵 Música</span>
                    <button class="pause-toggle" id="pauseMusicToggle">
                        <span class="pause-toggle-slider"></span>
                    </button>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        this.setupEventListeners();
        this.updateToggleStates();
    }

    setupEventListeners() {
        // Botón Continuar
        const continueBtn = document.getElementById('pauseContinue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.resume();
                if (this.onContinue) this.onContinue();
            });
        }

        // Botón Reiniciar
        const restartBtn = document.getElementById('pauseRestart');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hide();
                if (this.onRestart) this.onRestart();
            });
        }

        // Botón Menú Principal
        const mainMenuBtn = document.getElementById('pauseMainMenu');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.hide();
                if (this.onMainMenu) this.onMainMenu();
            });
        }

        // Toggle de Sonido
        const soundToggle = document.getElementById('pauseSoundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                if (window.soundSystem) {
                    window.soundSystem.toggle();
                    this.updateToggleStates();
                }
            });
        }

        // Toggle de Música
        const musicToggle = document.getElementById('pauseMusicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => {
                if (window.soundSystem) {
                    window.soundSystem.toggleMusic();
                    this.updateToggleStates();
                }
            });
        }

        // Click en overlay (fuera del modal) para cerrar
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.resume();
            }
        });

        // Tecla ESC para pausar/despausar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay) {
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.show();
                }
            }
        });
    }

    updateToggleStates() {
        const soundToggle = document.getElementById('pauseSoundToggle');
        const musicToggle = document.getElementById('pauseMusicToggle');

        if (window.soundSystem) {
            if (soundToggle) {
                if (window.soundSystem.enabled) {
                    soundToggle.classList.add('active');
                } else {
                    soundToggle.classList.remove('active');
                }
            }

            if (musicToggle) {
                if (window.soundSystem.musicEnabled) {
                    musicToggle.classList.add('active');
                } else {
                    musicToggle.classList.remove('active');
                }
            }
        }
    }

    show() {
        console.log('⏸️ Pausa: Mostrando menú de pausa');
        this.isPaused = true;
        this.overlay.style.display = 'flex';

        // Animar entrada
        setTimeout(() => {
            this.modal.classList.add('pause-modal-show');
        }, 10);

        // Pausar sonidos
        if (window.soundSystem) {
            window.soundSystem.pauseBackgroundMusic();
        }

        // Actualizar estados de toggles
        this.updateToggleStates();

        // Emitir evento de pausa
        document.dispatchEvent(new CustomEvent('gamePaused'));
    }

    hide() {
        console.log('▶️ Pausa: Ocultando menú de pausa');
        this.modal.classList.remove('pause-modal-show');

        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.isPaused = false;
        }, 300);
    }

    resume() {
        console.log('▶️ Pausa: Reanudando juego');
        this.hide();

        // Reanudar sonidos
        if (window.soundSystem && window.soundSystem.musicEnabled) {
            window.soundSystem.resumeBackgroundMusic();
        }

        // Emitir evento de reanudación
        document.dispatchEvent(new CustomEvent('gameResumed'));
    }

    // Métodos para configurar callbacks
    setContinueCallback(callback) {
        this.onContinue = callback;
    }

    setRestartCallback(callback) {
        this.onRestart = callback;
    }

    setMainMenuCallback(callback) {
        this.onMainMenu = callback;
    }
}

// ================================
// BOTÓN DE PAUSA FLOTANTE
// ================================

class PauseButton {
    constructor(pauseMenu) {
        this.pauseMenu = pauseMenu;
        this.button = null;
        this.createButton();
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'pause-button-float';
        this.button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1"/>
                <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1"/>
            </svg>
        `;
        this.button.setAttribute('aria-label', 'Pausar juego');
        this.button.style.display = 'none';

        this.button.addEventListener('click', () => {
            if (window.soundSystem) {
                window.soundSystem.playClick();
            }
            this.pauseMenu.show();
        });

        document.body.appendChild(this.button);
    }

    show() {
        if (this.button) {
            this.button.style.display = 'flex';
        }
    }

    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }

    destroy() {
        if (this.button && this.button.parentNode) {
            this.button.parentNode.removeChild(this.button);
        }
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

// Crear instancia global del menú de pausa
window.pauseMenu = new PauseMenu();
window.pauseButton = new PauseButton(window.pauseMenu);

console.log('⏸️ Sistema de pausa inicializado');
