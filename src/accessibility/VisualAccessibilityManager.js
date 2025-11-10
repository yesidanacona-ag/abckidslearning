// ================================
// VISUAL ACCESSIBILITY MANAGER
// High contrast, large text, color blindness support
// Accessibility - Fase 4 ($20K)
// ================================

class VisualAccessibilityManager {
    constructor() {
        this.modes = {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            darkMode: false,
            colorBlindMode: null // 'protanopia', 'deuteranopia', 'tritanopia'
        };

        this.init();
    }

    init() {
        this.addVisualStyles();
        console.log('✅ VisualAccessibilityManager initialized');
    }

    addVisualStyles() {
        if (typeof document === 'undefined') return;

        const style = document.createElement('style');
        style.id = 'visual-accessibility-styles';
        style.textContent = `
            /* High Contrast Mode */
            body.high-contrast {
                --bg-color: #000;
                --text-color: #fff;
                --primary-color: #ffff00;
                --secondary-color: #00ffff;
                --border-color: #fff;
            }

            body.high-contrast * {
                background-color: var(--bg-color) !important;
                color: var(--text-color) !important;
                border-color: var(--border-color) !important;
            }

            body.high-contrast button,
            body.high-contrast .btn {
                background-color: var(--primary-color) !important;
                color: #000 !important;
                border: 2px solid var(--text-color) !important;
            }

            /* Large Text Mode */
            body.large-text {
                font-size: 125%;
            }

            body.large-text h1 { font-size: 3rem; }
            body.large-text h2 { font-size: 2.5rem; }
            body.large-text h3 { font-size: 2rem; }
            body.large-text p, body.large-text button { font-size: 1.25rem; }

            /* Reduced Motion */
            body.reduced-motion *,
            body.reduced-motion *::before,
            body.reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }

            /* Dark Mode */
            body.dark-mode {
                background: #1a1a1a;
                color: #e0e0e0;
            }

            /* Focus indicators (always visible) */
            *:focus-visible {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }
        `;

        if (!document.getElementById('visual-accessibility-styles')) {
            document.head.appendChild(style);
        }
    }

    setHighContrast(enabled) {
        this.modes.highContrast = enabled;

        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        }
    }

    setLargeText(enabled) {
        this.modes.largeText = enabled;

        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('large-text');
            } else {
                document.body.classList.remove('large-text');
            }
        }
    }

    setReducedMotion(enabled) {
        this.modes.reducedMotion = enabled;

        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        }
    }

    setColorBlindMode(mode) {
        this.modes.colorBlindMode = mode;

        // Apply color blind filter
        // This would require CSS filters or SVG filters for proper simulation
        // For now, we'll log it
        if (window.logger) {
            window.logger.info('Color blind mode set', { mode }, 'VisualAccessibilityManager');
        }
    }

    audit() {
        const issues = [];

        if (typeof document === 'undefined') return issues;

        // Check contrast ratios (simplified)
        const computedStyle = window.getComputedStyle(document.body);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        // Would implement actual contrast ratio calculation here
        // For now, just a placeholder

        return issues;
    }
}

window.VisualAccessibilityManager = VisualAccessibilityManager;
