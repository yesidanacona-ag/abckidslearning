// ================================
// TUTORIAL SYSTEM
// Sistema de tutorial interactivo con spotlight
// ================================

/**
 * TutorialSystem proporciona un tutorial interactivo paso a paso
 * con spotlight visual y posicionamiento inteligente.
 *
 * Features:
 * - Tutorial paso a paso con spotlight
 * - Posicionamiento dinámico (top/bottom/left/right)
 * - Persistencia de estado (completado/saltado)
 * - Animaciones suaves
 * - Integración con EventBus
 *
 * @class TutorialSystem
 * @example
 * const tutorial = new TutorialSystem();
 * tutorial.start();
 */
class TutorialSystem {
    constructor(options = {}) {
        this.currentStep = 0;
        this.listenersAdded = false;
        this.completed = false;
        this.skipped = false;

        /** @type {Object} Configuración */
        this.config = {
            storageKey: options.storageKey || 'tutorialCompleted',
            autoStart: options.autoStart !== false,
            showOnFirstVisit: options.showOnFirstVisit !== false,
            ...options
        };

        /** @type {Array<Object>} Pasos del tutorial */
        this.steps = this.defineSteps();

        /** @type {Object} Referencias a elementos del DOM */
        this.refs = {
            overlay: null,
            spotlight: null,
            content: null,
            nextBtn: null,
            skipBtn: null
        };
    }

    /**
     * Define los pasos del tutorial
     * @private
     * @returns {Array<Object>}
     */
    defineSteps() {
        return [
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

    /**
     * Agrega un paso personalizado al tutorial
     * @param {Object} step - Configuración del paso
     */
    addStep(step) {
        this.steps.push(step);
    }

    /**
     * Verifica si debe mostrarse el tutorial
     * @returns {boolean}
     */
    shouldShow() {
        if (!this.config.showOnFirstVisit) {
            return false;
        }

        const hasSeenTutorial = localStorage.getItem(this.config.storageKey);
        return !hasSeenTutorial;
    }

    /**
     * Inicializa referencias a elementos del DOM
     * @private
     */
    initRefs() {
        this.refs.overlay = document.getElementById('tutorialOverlay');
        this.refs.spotlight = document.getElementById('tutorialSpotlight');
        this.refs.content = document.getElementById('tutorialContent');
        this.refs.nextBtn = document.getElementById('tutorialNext');
        this.refs.skipBtn = document.getElementById('tutorialSkip');

        // Verificar elementos críticos
        const missing = [];
        if (!this.refs.overlay) missing.push('tutorialOverlay');
        if (!this.refs.spotlight) missing.push('tutorialSpotlight');
        if (!this.refs.content) missing.push('tutorialContent');

        if (missing.length > 0) {
            console.error('❌ Tutorial: Missing DOM elements:', missing);
            return false;
        }

        return true;
    }

    /**
     * Inicia el tutorial
     */
    start() {
        console.log('🚀 Tutorial: start() llamado');

        if (!this.shouldShow()) {
            console.log('⏭️ Tutorial: Ya fue visto, no mostrando');
            return;
        }

        // Inicializar referencias
        if (!this.initRefs()) {
            console.error('❌ Tutorial: No se pudieron inicializar referencias DOM');
            return;
        }

        console.log('✅ Tutorial: Primera vez, mostrando tutorial');

        this.currentStep = 0;
        this.completed = false;
        this.skipped = false;

        // Mostrar overlay
        this.refs.overlay.style.display = 'block';
        console.log('✅ Tutorial: Overlay mostrado');

        // Reproducir sonido
        if (window.soundSystem) {
            window.soundSystem.playClick();
        }

        // Mostrar primer paso
        this.showStep(0);

        // Setup listeners
        this.setupEventListeners();

        // Emitir evento
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('tutorial:started');
        }
    }

    /**
     * Configura event listeners
     * @private
     */
    setupEventListeners() {
        if (this.listenersAdded) {
            console.log('⚠️ Tutorial: Listeners ya agregados, saltando');
            return;
        }

        console.log('🔧 Tutorial: Configurando event listeners...');

        if (this.refs.nextBtn) {
            this.refs.nextBtn.addEventListener('click', () => {
                console.log('▶️ Tutorial: Click en Next/Siguiente');
                this.nextStep();
            });
            console.log('✅ Tutorial: Listener agregado a Next');
        } else {
            console.error('❌ Tutorial: No se encontró botón Next');
        }

        if (this.refs.skipBtn) {
            this.refs.skipBtn.addEventListener('click', () => {
                console.log('⏭️ Tutorial: Click en Saltar');
                this.skip();
            });
            console.log('✅ Tutorial: Listener agregado a Skip');
        } else {
            console.error('❌ Tutorial: No se encontró botón Skip');
        }

        // Listener de teclado (ESC para saltar)
        this.keyboardHandler = (e) => {
            if (e.key === 'Escape') {
                this.skip();
            } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                this.previousStep();
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);

        this.listenersAdded = true;
        console.log('✅ Tutorial: Event listeners configurados exitosamente');
    }

    /**
     * Muestra un paso específico del tutorial
     * @param {number} stepIndex
     */
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            console.warn('⚠️ Tutorial: Índice de paso inválido:', stepIndex);
            return;
        }

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        console.log(`📖 Tutorial: Mostrando paso ${stepIndex + 1}/${this.steps.length}`);

        // Actualizar contenido
        this.updateContent(step, stepIndex);

        // Posicionar tutorial
        this.positionTutorial(step);

        // Reproducir sonido
        if (window.soundSystem) {
            window.soundSystem.playClick();
        }

        // Emitir evento
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('tutorial:stepChanged', { step: stepIndex, total: this.steps.length });
        }
    }

    /**
     * Actualiza el contenido del paso
     * @private
     */
    updateContent(step, stepIndex) {
        const emojiEl = document.getElementById('tutorialEmoji');
        const titleEl = document.getElementById('tutorialTitle');
        const textEl = document.getElementById('tutorialText');
        const stepEl = document.getElementById('tutorialStep');
        const totalEl = document.getElementById('tutorialTotal');

        if (emojiEl) emojiEl.textContent = step.emoji;
        if (titleEl) titleEl.textContent = step.title;
        if (textEl) textEl.textContent = step.text;
        if (stepEl) stepEl.textContent = stepIndex + 1;
        if (totalEl) totalEl.textContent = this.steps.length;

        // Actualizar botón siguiente
        if (this.refs.nextBtn) {
            if (stepIndex === this.steps.length - 1) {
                this.refs.nextBtn.textContent = '¡Entendido!';
            } else {
                this.refs.nextBtn.textContent = 'Siguiente';
            }
        }
    }

    /**
     * Posiciona el spotlight y contenido del tutorial
     * @private
     */
    positionTutorial(step) {
        const spotlight = this.refs.spotlight;
        const content = this.refs.content;

        if (!spotlight || !content) return;

        const box = content.querySelector('.tutorial-box');
        if (!box) return;

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
                this.positionBox(content, box, rect, step.position);
            } else {
                console.warn('⚠️ Tutorial: Elemento target no encontrado:', step.target);
                this.positionCenter(spotlight, content);
            }
        } else {
            // Centro de pantalla para pasos sin target
            this.positionCenter(spotlight, content);
        }
    }

    /**
     * Posiciona el box del tutorial relativo al target
     * @private
     */
    positionBox(content, box, rect, position) {
        const boxWidth = 400;
        const boxHeight = 300;
        const margin = 30;

        switch(position) {
            case 'bottom':
                content.style.top = (rect.bottom + margin) + 'px';
                content.style.left = (rect.left + rect.width / 2 - boxWidth / 2) + 'px';
                content.style.transform = '';
                box.classList.add('arrow-top');
                break;

            case 'top':
                content.style.top = (rect.top - boxHeight - margin) + 'px';
                content.style.left = (rect.left + rect.width / 2 - boxWidth / 2) + 'px';
                content.style.transform = '';
                box.classList.add('arrow-bottom');
                break;

            case 'left':
                content.style.top = (rect.top + rect.height / 2 - boxHeight / 2) + 'px';
                content.style.left = (rect.left - boxWidth - margin) + 'px';
                content.style.transform = '';
                box.classList.add('arrow-right');
                break;

            case 'right':
                content.style.top = (rect.top + rect.height / 2 - boxHeight / 2) + 'px';
                content.style.left = (rect.right + margin) + 'px';
                content.style.transform = '';
                box.classList.add('arrow-left');
                break;

            default:
                this.positionCenter(null, content);
        }
    }

    /**
     * Posiciona en el centro de la pantalla
     * @private
     */
    positionCenter(spotlight, content) {
        if (spotlight) {
            spotlight.classList.remove('active');
            spotlight.style.width = '0';
            spotlight.style.height = '0';
        }

        content.style.top = '50%';
        content.style.left = '50%';
        content.style.transform = 'translate(-50%, -50%)';
    }

    /**
     * Avanza al siguiente paso
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }

    /**
     * Retrocede al paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Salta el tutorial
     */
    skip() {
        console.log('⏭️ Tutorial: Método skip() llamado');
        this.skipped = true;

        if (typeof eventBus !== 'undefined') {
            eventBus.emit('tutorial:skipped');
        }

        this.complete();
    }

    /**
     * Completa el tutorial
     */
    complete() {
        console.log('🏁 Tutorial: Iniciando complete()...');

        this.completed = true;

        // Ocultar y limpiar todo el tutorial
        if (this.refs.overlay) {
            this.refs.overlay.style.display = 'none';
            console.log('✅ Tutorial: Overlay ocultado');
        }

        if (this.refs.spotlight) {
            this.refs.spotlight.classList.remove('active');
            this.refs.spotlight.style.width = '0';
            this.refs.spotlight.style.height = '0';
            console.log('✅ Tutorial: Spotlight limpiado');
        }

        if (this.refs.content) {
            this.refs.content.style.top = '';
            this.refs.content.style.left = '';
            this.refs.content.style.transform = '';
            console.log('✅ Tutorial: Content reseteado');
        }

        // Marcar como completado
        localStorage.setItem(this.config.storageKey, 'true');
        console.log('✅ Tutorial: Marcado como completado en localStorage');

        // Sonido de éxito
        if (window.soundSystem && !this.skipped) {
            window.soundSystem.playSuccess();
            console.log('🔊 Tutorial: Sonido de éxito reproducido');
        }

        // Asegurar que la pantalla principal sea interactuable
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.pointerEvents = 'auto';
            console.log('✅ Tutorial: mainScreen pointer-events restaurado a auto');
        }

        // Limpiar listeners
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }

        // Emitir evento
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('tutorial:completed', { skipped: this.skipped });
        }

        console.log('🎉 Tutorial: Complete() finalizado exitosamente');
    }

    /**
     * Resetea el tutorial para mostrarlo nuevamente
     */
    reset() {
        localStorage.removeItem(this.config.storageKey);
        this.currentStep = 0;
        this.completed = false;
        this.skipped = false;
        this.listenersAdded = false;
        console.log('🔄 Tutorial: Reseteado');
    }

    /**
     * Verifica si el tutorial está activo
     * @returns {boolean}
     */
    isActive() {
        return this.refs.overlay && this.refs.overlay.style.display === 'block';
    }

    /**
     * Debug info
     */
    debug() {
        console.group('📖 TutorialSystem Debug');
        console.log('Current Step:', `${this.currentStep + 1}/${this.steps.length}`);
        console.log('Completed:', this.completed);
        console.log('Skipped:', this.skipped);
        console.log('Active:', this.isActive());
        console.log('Should Show:', this.shouldShow());
        console.groupEnd();
    }
}

// ================================
// EXPORTS
// ================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorialSystem };
} else {
    window.TutorialSystem = TutorialSystem;
}
