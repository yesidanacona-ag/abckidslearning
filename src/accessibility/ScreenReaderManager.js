// ================================
// SCREEN READER MANAGER
// Screen reader support and optimizations
// Accessibility - Fase 3 ($20K)
// ================================

class ScreenReaderManager {
    constructor() {
        this.enabled = true;
        this.descriptions = new Map();
        this.currentContext = null;

        this.init();
    }

    init() {
        // Add screen reader only class
        this.addScreenReaderStyles();

        // Setup context announcements
        this.setupContextAnnouncements();

        console.log('✅ ScreenReaderManager initialized');
    }

    addScreenReaderStyles() {
        if (typeof document === 'undefined') return;

        const style = document.createElement('style');
        style.id = 'screen-reader-styles';
        style.textContent = `
            /* Screen reader only content */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0,0,0,0);
                white-space: nowrap;
                border: 0;
            }

            /* Focusable screen reader content */
            .sr-only-focusable:focus {
                position: static;
                width: auto;
                height: auto;
                overflow: visible;
                clip: auto;
                white-space: normal;
            }
        `;

        if (!document.getElementById('screen-reader-styles')) {
            document.head.appendChild(style);
        }
    }

    setupContextAnnouncements() {
        if (typeof window === 'undefined' || !window.eventBus) return;

        // Announce screen changes
        window.eventBus.on('screen:changed', (data) => {
            this.announceScreenChange(data.screen);
        });

        // Announce game events
        window.eventBus.on('game:answer:correct', () => {
            this.announce('¡Respuesta correcta!');
        });

        window.eventBus.on('game:answer:wrong', (data) => {
            this.announce(`Incorrecto. La respuesta era ${data.correctAnswer}`);
        });

        // Announce achievements
        window.eventBus.on('player:achievement:unlocked', (data) => {
            this.announce(`¡Logro desbloqueado! ${data.achievementName}`);
        });
    }

    announce(message, priority = 'polite') {
        if (window.bootstrap?.accessibility?.aria) {
            window.bootstrap.accessibility.aria.announce(message, priority);
        }
    }

    announceScreenChange(screenName) {
        const descriptions = {
            'mainScreen': 'Pantalla principal. Selecciona un modo de juego.',
            'practiceScreen': 'Modo práctica. Selecciona una tabla para practicar.',
            'gameScreen': 'Juego en progreso.',
            'statsScreen': 'Estadísticas del jugador.',
            'shopScreen': 'Tienda. Compra mejoras con tus monedas.'
        };

        const description = descriptions[screenName] || `Navegaste a ${screenName}`;
        this.announce(description);
    }

    describeElement(element, description) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            // Create description element
            const descId = `desc-${Date.now()}`;
            const descElement = document.createElement('div');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;

            element.appendChild(descElement);
            element.setAttribute('aria-describedby', descId);

            this.descriptions.set(element, descId);
        }
    }

    addLabel(element, label) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            const labelElement = document.createElement('span');
            labelElement.className = 'sr-only';
            labelElement.textContent = label;

            element.insertBefore(labelElement, element.firstChild);
        }
    }

    setContext(context) {
        this.currentContext = context;
        this.announce(`Contexto: ${context}`);
    }

    audit() {
        const issues = [];

        // Check for missing descriptions on complex elements
        if (typeof document !== 'undefined') {
            document.querySelectorAll('[role="button"]:not([aria-label]):not([aria-labelledby])').forEach(el => {
                if (!el.textContent.trim()) {
                    issues.push({
                        severity: 'error',
                        element: el,
                        message: 'Interactive element without accessible name',
                        wcag: '4.1.2'
                    });
                }
            });
        }

        return issues;
    }
}

window.ScreenReaderManager = ScreenReaderManager;
