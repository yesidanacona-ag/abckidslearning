// ================================
// SCREEN CONTROLLER
// Gestión de navegación y actualización de UI
// ================================

class ScreenController {
    constructor(store, eventBus, playerService) {
        this.store = store;
        this.eventBus = eventBus;
        this.playerService = playerService;

        // Historial de navegación
        this.history = [];

        // Suscribirse a cambios de pantalla en el store
        if (this.store) {
            this.store.subscribe((state) => {
                this.onStateChange(state);
            });
        }
    }

    /**
     * Muestra una pantalla específica
     * @param {string} screenId - ID del elemento de pantalla
     * @param {boolean} addToHistory - Si agregar al historial
     */
    showScreen(screenId, addToHistory = true) {
        // Ocultar todas las pantallas
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar pantalla solicitada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');

            // Agregar al historial
            if (addToHistory) {
                this.history.push(screenId);
            }

            // Actualizar en el store
            this.store.setScreen(screenId);

            // Emitir evento
            if (this.eventBus) {
                this.eventBus.emit('screen:changed', {
                    screenId,
                    timestamp: Date.now()
                });
            }
        } else {
            console.error(`❌ Pantalla '${screenId}' no encontrada`);
        }
    }

    /**
     * Muestra la pantalla de bienvenida
     */
    showWelcomeScreen() {
        this.showScreen('welcomeScreen');

        // Ocultar elementos que no se necesitan
        if (typeof window !== 'undefined') {
            if (window.pauseButton) {
                window.pauseButton.hide();
            }
            if (window.coinSystem) {
                window.coinSystem.hide();
            }
        }
    }

    /**
     * Muestra la pantalla principal (menú)
     */
    showMainScreen() {
        this.updateHeader();
        this.showScreen('mainScreen');

        // Ocultar botón de pausa (no necesario en menú)
        if (typeof window !== 'undefined') {
            if (window.pauseButton) {
                window.pauseButton.hide();
            }

            // Mostrar CoinSystem
            if (window.coinSystem) {
                window.coinSystem.show();
            }

            // Actualizar Fire Mode System si existe
            if (window.fireModeSystem) {
                window.fireModeSystem.updateUI();
            }

            // Despausar si estaba pausado
            if (window.pauseMenu && window.pauseMenu.isPaused) {
                window.pauseMenu.resume();
            }
        }

        // Emitir evento específico
        if (this.eventBus) {
            this.eventBus.emit('screen:main:shown', {
                timestamp: Date.now()
            });
        }
    }

    /**
     * Actualiza el header con información del jugador
     */
    updateHeader() {
        const player = this.playerService.getPlayer();

        // Actualizar avatar
        const avatarEl = document.getElementById('playerAvatar');
        if (avatarEl) {
            let avatar = player.avatar || '🦸';

            // Obtener avatar equipado si existe shopSystem
            if (typeof window !== 'undefined' && window.shopSystem) {
                const equippedAvatar = window.shopSystem.getEquipped('avatars');
                if (equippedAvatar) {
                    avatar = equippedAvatar;
                }
            }

            avatarEl.textContent = avatar;
        }

        // Actualizar nombre
        const nameEl = document.getElementById('playerNameDisplay');
        if (nameEl && player.name) {
            nameEl.textContent = player.name;
        }

        // Actualizar maestría global
        const masteryEl = document.getElementById('globalMasteryPercent');
        if (masteryEl) {
            const mastery = this.playerService.calculateGlobalMastery();
            masteryEl.textContent = mastery + '%';
        }

        // Actualizar barra de progreso de maestría
        const masteryBar = document.getElementById('globalMasteryBar');
        if (masteryBar) {
            const mastery = this.playerService.calculateGlobalMastery();
            masteryBar.style.width = mastery + '%';

            // Color basado en progreso
            if (mastery < 30) {
                masteryBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ee5a6f)';
            } else if (mastery < 70) {
                masteryBar.style.background = 'linear-gradient(90deg, #ffd93d, #ffaa00)';
            } else {
                masteryBar.style.background = 'linear-gradient(90deg, #6bcf7f, #51cf66)';
            }
        }

        // Actualizar monedas (CoinSystem lo hace automáticamente si está suscrito)
        if (typeof window !== 'undefined' && window.coinSystem) {
            window.coinSystem.updateDisplay(player.coins);
        }
    }

    /**
     * Actualiza el display de items equipados
     */
    updateEquipmentDisplay() {
        if (typeof window === 'undefined' || !window.shopSystem) {
            return;
        }

        const equippedItems = this.playerService.getEquippedItems();

        // Actualizar cada categoría
        ['avatars', 'ships', 'weapons', 'cars'].forEach(category => {
            const equipped = equippedItems[category];
            const displayEl = document.getElementById(`equipped${category.charAt(0).toUpperCase() + category.slice(1)}`);

            if (displayEl && equipped) {
                displayEl.textContent = equipped;
            }
        });
    }

    /**
     * Navega hacia atrás en el historial
     * @returns {boolean} true si pudo navegar hacia atrás
     */
    goBack() {
        if (this.history.length < 2) {
            // No hay historial, ir a main por defecto
            this.showMainScreen();
            return false;
        }

        // Remover pantalla actual
        this.history.pop();

        // Obtener pantalla anterior
        const previousScreen = this.history[this.history.length - 1];

        // Mostrar sin agregar al historial
        this.showScreen(previousScreen, false);

        return true;
    }

    /**
     * Limpia el historial de navegación
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Obtiene la pantalla actual
     * @returns {string} ID de la pantalla actual
     */
    getCurrentScreen() {
        return this.store.getState().ui.currentScreen;
    }

    /**
     * Obtiene la pantalla anterior
     * @returns {string|null} ID de la pantalla anterior
     */
    getPreviousScreen() {
        return this.store.getState().ui.previousScreen;
    }

    /**
     * Muestra una notificación en la UI
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: success, error, info, warning
     * @param {number} duration - Duración en ms
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Implementación básica con DOM
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Estilos inline (deberían estar en CSS)
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            background: ${this.getNotificationColor(type)};
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remover después de duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('ui:notification:shown', {
                message,
                type,
                duration
            });
        }
    }

    /**
     * Obtiene color para tipo de notificación
     * @param {string} type - Tipo de notificación
     * @returns {string} Color CSS
     */
    getNotificationColor(type) {
        const colors = {
            success: '#51cf66',
            error: '#ff6b6b',
            info: '#4dabf7',
            warning: '#ffd93d'
        };
        return colors[type] || colors.info;
    }

    /**
     * Muestra modal de resultados
     * @param {Object} stats - Estadísticas del juego
     */
    showResultsModal(stats) {
        const modal = document.getElementById('resultsModal');
        if (!modal) {
            console.error('❌ Modal de resultados no encontrado');
            return;
        }

        modal.classList.remove('hidden');

        // Actualizar contenido
        const accuracy = stats.accuracy || 0;

        // Icono y título basados en rendimiento
        const iconEl = document.getElementById('resultsIcon');
        const titleEl = document.getElementById('resultsTitle');

        if (iconEl) {
            iconEl.textContent = accuracy >= 80 ? '🎉' : accuracy >= 60 ? '😊' : '💪';
        }

        if (titleEl) {
            titleEl.textContent = accuracy >= 80 ? '¡Increíble!' : accuracy >= 60 ? '¡Bien hecho!' : '¡Sigue practicando!';
        }

        // Actualizar stats
        const scoreEl = document.getElementById('finalScore');
        const correctEl = document.getElementById('finalCorrect');
        const accuracyEl = document.getElementById('finalAccuracy');

        if (scoreEl) scoreEl.textContent = stats.score || 0;
        if (correctEl) correctEl.textContent = stats.correct || 0;
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';

        // Mostrar recompensas
        this.displayRewards(stats);

        // Confetti si muy buen resultado
        if (accuracy >= 90 && typeof window !== 'undefined' && window.app && window.app.createConfetti) {
            window.app.createConfetti();
        }
    }

    /**
     * Muestra recompensas en el modal
     * @param {Object} stats - Estadísticas del juego
     */
    displayRewards(stats) {
        const rewardsEl = document.getElementById('rewardsEarned');
        if (!rewardsEl) return;

        rewardsEl.innerHTML = '<h3>Recompensas:</h3>';

        const accuracy = stats.accuracy || 0;

        // Medallas
        if (accuracy >= 95) {
            rewardsEl.innerHTML += '<div class="reward-item">🥇 Medalla de Oro</div>';
        } else if (accuracy >= 80) {
            rewardsEl.innerHTML += '<div class="reward-item">🥈 Medalla de Plata</div>';
        } else if (accuracy >= 60) {
            rewardsEl.innerHTML += '<div class="reward-item">🥉 Medalla de Bronce</div>';
        }

        // Racha
        if (stats.bestStreak && stats.bestStreak >= 5) {
            rewardsEl.innerHTML += `<div class="reward-item">🔥 Racha de ${stats.bestStreak}</div>`;
        }

        // Puntos/Monedas ganadas (aproximado)
        const coinsEarned = stats.correct * 5;
        if (coinsEarned > 0) {
            rewardsEl.innerHTML += `<div class="reward-item">💰 +${coinsEarned} Monedas</div>`;
        }
    }

    /**
     * Oculta modal de resultados
     */
    hideResultsModal() {
        const modal = document.getElementById('resultsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Reacciona a cambios en el estado
     * @param {Object} state - Nuevo estado
     */
    onStateChange(state) {
        // Actualizar UI basado en cambios de estado
        // Por ejemplo, actualizar monedas cuando cambien
        if (typeof window !== 'undefined' && window.coinSystem) {
            window.coinSystem.updateDisplay(state.player.coins);
        }
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.ScreenController = ScreenController;
}
