// ================================
// MODE CONTROLLER
// Gestión de modos de juego y coordinación con engines
// ================================

class ModeController {
    constructor(store, eventBus, screenController, gameController) {
        this.store = store;
        this.eventBus = eventBus;
        this.screenController = screenController;
        this.gameController = gameController;

        // Referencias a game engines externos
        this.engines = {
            practice: null,
            space: null,
            boss: null,
            galaxy: null,
            speedDrill: null,
            shipDefense: null,
            factorChain: null
        };

        // Modo actual
        this.currentMode = null;
    }

    /**
     * Inicia el modo práctica
     * @param {Array} tables - Tablas a practicar
     * @param {number} questionCount - Número de preguntas
     */
    startPracticeMode(tables, questionCount = 10) {
        this.currentMode = 'practice';

        // Mostrar pantalla de práctica
        this.screenController.showScreen('practiceScreen');

        // Mostrar sistemas de UI
        this.showGameUI();

        // Iniciar juego con GameController
        this.gameController.startGame('practice', {
            tables: tables,
            count: questionCount
        });

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'practice',
                tables,
                questionCount
            });
        }
    }

    /**
     * Inicia el modo desafío (tiempo limitado)
     * @param {number} duration - Duración en segundos
     */
    startChallengeMode(duration = 60) {
        this.currentMode = 'challenge';

        this.screenController.showScreen('challengeScreen');
        this.showGameUI();

        // El modo challenge tiene su propia lógica de timer
        // que se maneja en app.js o en un ChallengeEngine separado

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'challenge',
                duration
            });
        }
    }

    /**
     * Inicia la aventura espacial
     * @param {number} level - Nivel inicial
     */
    startSpaceAdventure(level = 1) {
        this.currentMode = 'space';

        this.screenController.showScreen('adventureScreen');
        this.showGameUI();

        // Inicializar SpaceGameEngine si existe
        if (typeof window !== 'undefined' && window.SpaceGameEngine) {
            if (!this.engines.space) {
                this.engines.space = new window.SpaceGameEngine('spaceCanvas');
            }

            this.engines.space.start(level);
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'space',
                level
            });
        }
    }

    /**
     * Inicia batalla contra jefe
     * @param {number} bossId - ID del jefe
     */
    startBossBattle(bossId = 1) {
        this.currentMode = 'boss';

        this.screenController.showScreen('bossScreen');
        this.showGameUI();

        // Inicializar BossGameEngine si existe
        if (typeof window !== 'undefined' && window.BossGameEngine) {
            if (!this.engines.boss) {
                this.engines.boss = new window.BossGameEngine();
            }

            this.engines.boss.startBattle(bossId);
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'boss',
                bossId
            });
        }
    }

    /**
     * Inicia modo galaxia
     */
    startGalaxyMode() {
        this.currentMode = 'galaxy';

        this.screenController.showScreen('galaxyScreen');

        // Galaxy engine se inicializa en app.js
        if (typeof window !== 'undefined' && window.app && window.app.galaxyEngine) {
            window.app.galaxyEngine.render();
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'galaxy'
            });
        }
    }

    /**
     * Inicia modo speed drill (taladro rápido)
     * @param {Array} tables - Tablas a practicar
     */
    startSpeedDrillMode(tables) {
        this.currentMode = 'speedDrill';

        this.screenController.showScreen('speedDrillScreen');
        this.showGameUI();

        // Inicializar SpeedDrillEngine si existe
        if (typeof window !== 'undefined' && window.speedDrillEngine) {
            window.speedDrillEngine.start(tables);
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'speedDrill',
                tables
            });
        }
    }

    /**
     * Inicia modo defensa de la nave
     * @param {number} level - Nivel de dificultad
     */
    startShipDefenseMode(level = 1) {
        this.currentMode = 'shipDefense';

        this.screenController.showScreen('shipDefenseScreen');
        this.showGameUI();

        // Inicializar ShipDefenseEngine si existe
        if (typeof window !== 'undefined' && window.shipDefense) {
            window.shipDefense.start(level);
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'shipDefense',
                level
            });
        }
    }

    /**
     * Inicia modo cadena de factores
     * @param {number} level - Nivel inicial
     */
    startFactorChainMode(level = 1) {
        this.currentMode = 'factorChain';

        this.screenController.showScreen('factorChainScreen');
        this.showGameUI();

        // Inicializar FactorChainEngine si existe
        if (typeof window !== 'undefined' && window.factorChainEngine) {
            window.factorChainEngine.start(level);
        }

        if (this.eventBus) {
            this.eventBus.emit('mode:started', {
                mode: 'factorChain',
                level
            });
        }
    }

    /**
     * Finaliza el modo actual
     */
    endCurrentMode() {
        if (!this.currentMode) {
            return;
        }

        const mode = this.currentMode;

        // Detener engine si existe
        this.stopEngine(mode);

        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('mode:ended', {
                mode: mode,
                timestamp: Date.now()
            });
        }

        // Limpiar modo actual
        this.currentMode = null;

        // Volver al menú principal
        this.screenController.showMainScreen();
    }

    /**
     * Detiene el engine del modo especificado
     * @param {string} mode - Modo a detener
     */
    stopEngine(mode) {
        switch (mode) {
            case 'space':
                if (this.engines.space && this.engines.space.stop) {
                    this.engines.space.stop();
                }
                break;

            case 'boss':
                if (this.engines.boss && this.engines.boss.stop) {
                    this.engines.boss.stop();
                }
                break;

            case 'speedDrill':
                if (typeof window !== 'undefined' && window.speedDrillEngine) {
                    window.speedDrillEngine.stop();
                }
                break;

            case 'shipDefense':
                if (typeof window !== 'undefined' && window.shipDefense) {
                    window.shipDefense.stop();
                }
                break;

            case 'factorChain':
                if (typeof window !== 'undefined' && window.factorChainEngine) {
                    window.factorChainEngine.stop();
                }
                break;
        }
    }

    /**
     * Muestra elementos de UI necesarios para jugar
     */
    showGameUI() {
        if (typeof window === 'undefined') return;

        // Mostrar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.show();
        }

        // Mostrar sistema de monedas
        if (window.coinSystem) {
            window.coinSystem.show();
        }

        // Mostrar Mateo
        if (window.mateoMascot) {
            window.mateoMascot.show('happy');
        }
    }

    /**
     * Oculta elementos de UI del juego
     */
    hideGameUI() {
        if (typeof window === 'undefined') return;

        // Ocultar botón de pausa
        if (window.pauseButton) {
            window.pauseButton.hide();
        }

        // Ocultar Mateo
        if (window.mateoMascot) {
            window.mateoMascot.hide();
        }
    }

    /**
     * Cambia de modo (finaliza actual e inicia nuevo)
     * @param {string} newMode - Nuevo modo a iniciar
     * @param {Object} config - Configuración del nuevo modo
     */
    switchMode(newMode, config = {}) {
        // Finalizar modo actual
        this.endCurrentMode();

        // Iniciar nuevo modo
        switch (newMode) {
            case 'practice':
                this.startPracticeMode(config.tables || [2, 3, 4], config.count || 10);
                break;

            case 'challenge':
                this.startChallengeMode(config.duration || 60);
                break;

            case 'space':
                this.startSpaceAdventure(config.level || 1);
                break;

            case 'boss':
                this.startBossBattle(config.bossId || 1);
                break;

            case 'galaxy':
                this.startGalaxyMode();
                break;

            case 'speedDrill':
                this.startSpeedDrillMode(config.tables || [2, 3, 4]);
                break;

            case 'shipDefense':
                this.startShipDefenseMode(config.level || 1);
                break;

            case 'factorChain':
                this.startFactorChainMode(config.level || 1);
                break;

            default:
                console.error(`❌ Modo '${newMode}' no reconocido`);
                this.screenController.showMainScreen();
        }
    }

    /**
     * Obtiene el modo actual
     * @returns {string|null} Modo actual
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Verifica si un modo está activo
     * @param {string} mode - Modo a verificar
     * @returns {boolean}
     */
    isModeActive(mode) {
        return this.currentMode === mode;
    }

    /**
     * Obtiene lista de modos disponibles
     * @returns {Array} Array de modos
     */
    getAvailableModes() {
        return [
            {
                id: 'practice',
                name: 'Modo Práctica',
                description: 'Practica tablas específicas',
                icon: '📚',
                available: true
            },
            {
                id: 'challenge',
                name: 'Desafío Rápido',
                description: 'Responde lo más rápido posible',
                icon: '⚡',
                available: true
            },
            {
                id: 'space',
                name: 'Aventura Espacial',
                description: 'Viaja por el espacio',
                icon: '🚀',
                available: typeof window !== 'undefined' && !!window.SpaceGameEngine
            },
            {
                id: 'boss',
                name: 'Batalla de Jefes',
                description: 'Derrota jefes poderosos',
                icon: '⚔️',
                available: typeof window !== 'undefined' && !!window.BossGameEngine
            },
            {
                id: 'galaxy',
                name: 'Modo Galaxia',
                description: 'Explora el sistema solar',
                icon: '🌌',
                available: typeof window !== 'undefined' && !!window.GalaxySystemEngine
            },
            {
                id: 'speedDrill',
                name: 'Taladro Rápido',
                description: 'Práctica intensiva con teclado',
                icon: '⌨️',
                available: typeof window !== 'undefined' && !!window.speedDrillEngine
            },
            {
                id: 'shipDefense',
                name: 'Defensa de la Nave',
                description: 'Defiende tu nave de invasores',
                icon: '🛸',
                available: typeof window !== 'undefined' && !!window.shipDefense
            },
            {
                id: 'factorChain',
                name: 'Cadena de Factores',
                description: 'Descompón números en factores',
                icon: '🧩',
                available: typeof window !== 'undefined' && !!window.factorChainEngine
            }
        ];
    }

    /**
     * Inicia el flujo de descubrimiento de una tabla
     * @param {number} table - Número de tabla (2-10)
     */
    startTableDiscovery(table) {
        console.log(`🎓 Iniciando descubrimiento de Tabla ${table}`);

        // Verificar que TableDiscoveryEngine esté disponible
        if (typeof window === 'undefined' || !window.TableDiscoveryEngine) {
            console.error('❌ TableDiscoveryEngine no disponible');
            return;
        }

        // Crear contexto para el discovery engine
        const context = {
            eventBus: this.eventBus,
            store: this.store,
            services: {
                player: this.services?.player
            },
            controllers: {
                screen: this.screenController,
                mode: this,
                game: this.gameController
            }
        };

        // Crear y lanzar discovery engine
        const discovery = new window.TableDiscoveryEngine(table, context);
        discovery.start();

        // Guardar referencia para poder limpiar después
        this.currentDiscovery = discovery;
    }

    /**
     * Verifica si una tabla necesita modo descubrimiento
     * @param {number} table - Número de tabla (2-10)
     * @returns {boolean} true si necesita descubrimiento
     */
    needsDiscovery(table) {
        if (!this.services?.player) return false;

        const isDiscovered = this.services.player.isTableDiscovered(table);
        return !isDiscovered;
    }

    /**
     * Maneja selección de tabla con decisión aprender/practicar
     * @param {number} table - Número de tabla (2-10)
     * @param {string} mode - 'discover' o 'practice'
     */
    handleTableSelection(table, mode = 'auto') {
        // Auto-detect si necesita descubrimiento
        if (mode === 'auto') {
            if (this.needsDiscovery(table)) {
                // Mostrar opciones: Aprender o Practicar
                this.showDiscoveryOptions(table);
                return;
            } else {
                // Ya completó descubrimiento, ir directo a práctica
                mode = 'practice';
            }
        }

        // Ejecutar modo seleccionado
        if (mode === 'discover') {
            this.startTableDiscovery(table);
        } else if (mode === 'practice') {
            this.startPracticeMode([table]);
        }
    }

    /**
     * Muestra opciones de aprender vs practicar
     * @param {number} table - Número de tabla (2-10)
     */
    showDiscoveryOptions(table) {
        console.log(`🎯 Mostrando opciones para Tabla del ${table}`);

        // Obtener referencias al modal
        const modal = document.getElementById('learnOrPracticeModal');
        const tableNumberSpan = document.getElementById('modalTableNumber');
        const btnLearn = document.getElementById('btnLearnTable');
        const btnPractice = document.getElementById('btnPracticeTable');
        const btnClose = document.getElementById('closeLearnPracticeModal');

        if (!modal) {
            console.error('❌ Modal de decisión no encontrado');
            // Fallback: ir directo a descubrimiento
            this.startTableDiscovery(table);
            return;
        }

        // Actualizar número de tabla en el modal
        if (tableNumberSpan) {
            tableNumberSpan.textContent = table;
        }

        // Limpiar event listeners previos
        const newBtnLearn = btnLearn.cloneNode(true);
        const newBtnPractice = btnPractice.cloneNode(true);
        const newBtnClose = btnClose.cloneNode(true);

        btnLearn.replaceWith(newBtnLearn);
        btnPractice.replaceWith(newBtnPractice);
        btnClose.replaceWith(newBtnClose);

        // Handler para "APRENDER"
        newBtnLearn.addEventListener('click', () => {
            console.log(`📚 Usuario eligió APRENDER tabla ${table}`);

            // Ocultar modal
            modal.style.display = 'none';

            // Reproducir sonido de selección
            if (window.soundSystem) {
                window.soundSystem.playClick();
            }

            // Track en analytics
            if (window.bootstrap?.uxResearch?.analytics) {
                window.bootstrap.uxResearch.analytics.trackEvent('mode_selected', {
                    table,
                    mode: 'discover',
                    source: 'learn_practice_modal'
                });
            }

            // Emitir evento
            if (this.eventBus) {
                this.eventBus.emit('mode:selected', {
                    table,
                    mode: 'discover'
                });
            }

            // Iniciar descubrimiento
            this.startTableDiscovery(table);
        });

        // Handler para "PRACTICAR"
        newBtnPractice.addEventListener('click', () => {
            console.log(`⚡ Usuario eligió PRACTICAR tabla ${table}`);

            // Ocultar modal
            modal.style.display = 'none';

            // Reproducir sonido de selección
            if (window.soundSystem) {
                window.soundSystem.playClick();
            }

            // Track en analytics
            if (window.bootstrap?.uxResearch?.analytics) {
                window.bootstrap.uxResearch.analytics.trackEvent('mode_selected', {
                    table,
                    mode: 'practice',
                    source: 'learn_practice_modal'
                });
            }

            // Emitir evento
            if (this.eventBus) {
                this.eventBus.emit('mode:selected', {
                    table,
                    mode: 'practice'
                });
            }

            // Iniciar práctica
            this.startPracticeMode([table]);
        });

        // Handler para cerrar modal (equivalente a cancelar)
        newBtnClose.addEventListener('click', () => {
            console.log('❌ Usuario cerró modal de decisión');
            modal.style.display = 'none';

            // Reproducir sonido
            if (window.soundSystem) {
                window.soundSystem.playTransition();
            }

            // Emitir evento de cancelación
            if (this.eventBus) {
                this.eventBus.emit('mode:selection:cancelled', { table });
            }
        });

        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                newBtnClose.click();
            }
        });

        // Mostrar modal con animación
        modal.style.display = 'flex';

        // Accessibility: Focus en el botón de aprender
        setTimeout(() => {
            newBtnLearn.focus();
        }, 100);

        // Audio caption para accesibilidad
        if (window.bootstrap?.accessibility?.audio) {
            window.bootstrap.accessibility.audio.showCaption(
                `Elige si quieres aprender o practicar la Tabla del ${table}`,
                5000
            );
        }

        // ARIA announcement
        if (window.bootstrap?.accessibility?.aria) {
            window.bootstrap.accessibility.aria.announce(
                `Opciones para la Tabla del ${table}. Puedes aprender con el truco secreto o practicar directamente.`
            );
        }

        // Emitir evento de modal mostrado
        if (this.eventBus) {
            this.eventBus.emit('discovery:options:shown', {
                table,
                options: ['discover', 'practice']
            });
        }
    }

    /**
     * Limpia el discovery engine actual
     */
    cleanupDiscovery() {
        if (this.currentDiscovery) {
            this.currentDiscovery.destroy();
            this.currentDiscovery = null;
        }
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.ModeController = ModeController;
}
