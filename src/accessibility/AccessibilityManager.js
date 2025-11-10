// ================================
// ACCESSIBILITY MANAGER
// Central manager for accessibility features
// Accessibility - Main Controller
// ================================

class AccessibilityManager {
    constructor() {
        this.enabled = true;
        this.features = {
            ariaLabels: true,
            keyboardNavigation: true,
            screenReader: true,
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            audioDescriptions: false,
            captions: false
        };

        // Sub-managers
        this.aria = null;
        this.keyboard = null;
        this.screenReader = null;
        this.visual = null;
        this.audio = null;

        // User preferences
        this.preferences = this.loadPreferences();

        // Apply saved preferences
        this.applyPreferences();

        // Detect system preferences
        this.detectSystemPreferences();

        console.log('✅ AccessibilityManager initialized');
    }

    /**
     * Initialize all accessibility sub-managers
     */
    initializeSubManagers(dependencies = {}) {
        // Will be called by Bootstrap with dependencies
        this.aria = dependencies.aria || null;
        this.keyboard = dependencies.keyboard || null;
        this.screenReader = dependencies.screenReader || null;
        this.visual = dependencies.visual || null;
        this.audio = dependencies.audio || null;

        console.log('✅ Accessibility sub-managers initialized');
    }

    /**
     * Detect system accessibility preferences
     */
    detectSystemPreferences() {
        if (typeof window === 'undefined') return;

        // Detect prefers-reduced-motion
        if (window.matchMedia) {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (reducedMotion.matches) {
                this.setReducedMotion(true);
            }

            // Listen for changes
            reducedMotion.addEventListener('change', (e) => {
                this.setReducedMotion(e.matches);
            });

            // Detect prefers-contrast
            const highContrast = window.matchMedia('(prefers-contrast: high)');
            if (highContrast.matches) {
                this.setHighContrast(true);
            }

            highContrast.addEventListener('change', (e) => {
                this.setHighContrast(e.matches);
            });

            // Detect prefers-color-scheme (dark mode)
            const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
            if (darkMode.matches) {
                this.setDarkMode(true);
            }

            darkMode.addEventListener('change', (e) => {
                this.setDarkMode(e.matches);
            });
        }
    }

    /**
     * Enable/disable accessibility features
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        if (enabled) {
            this.applyPreferences();
        } else {
            this.disableAll();
        }

        this.savePreferences();
    }

    /**
     * Set high contrast mode
     */
    setHighContrast(enabled) {
        this.features.highContrast = enabled;

        if (this.visual) {
            this.visual.setHighContrast(enabled);
        }

        // Apply CSS class
        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        }

        this.savePreferences();
        this.emitChange('high-contrast', enabled);
    }

    /**
     * Set large text mode
     */
    setLargeText(enabled) {
        this.features.largeText = enabled;

        if (this.visual) {
            this.visual.setLargeText(enabled);
        }

        // Apply CSS class
        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('large-text');
            } else {
                document.body.classList.remove('large-text');
            }
        }

        this.savePreferences();
        this.emitChange('large-text', enabled);
    }

    /**
     * Set reduced motion mode
     */
    setReducedMotion(enabled) {
        this.features.reducedMotion = enabled;

        if (this.visual) {
            this.visual.setReducedMotion(enabled);
        }

        // Apply CSS class
        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        }

        this.savePreferences();
        this.emitChange('reduced-motion', enabled);
    }

    /**
     * Set dark mode
     */
    setDarkMode(enabled) {
        this.features.darkMode = enabled;

        if (typeof document !== 'undefined') {
            if (enabled) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }

        this.savePreferences();
        this.emitChange('dark-mode', enabled);
    }

    /**
     * Set audio descriptions
     */
    setAudioDescriptions(enabled) {
        this.features.audioDescriptions = enabled;

        if (this.audio) {
            this.audio.setAudioDescriptions(enabled);
        }

        this.savePreferences();
        this.emitChange('audio-descriptions', enabled);
    }

    /**
     * Set captions
     */
    setCaptions(enabled) {
        this.features.captions = enabled;

        if (this.audio) {
            this.audio.setCaptions(enabled);
        }

        this.savePreferences();
        this.emitChange('captions', enabled);
    }

    /**
     * Toggle feature
     */
    toggleFeature(featureName) {
        const currentValue = this.features[featureName];
        const setter = `set${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`;

        if (this[setter]) {
            this[setter](!currentValue);
        }
    }

    /**
     * Apply all preferences
     */
    applyPreferences() {
        if (this.preferences.highContrast) this.setHighContrast(true);
        if (this.preferences.largeText) this.setLargeText(true);
        if (this.preferences.reducedMotion) this.setReducedMotion(true);
        if (this.preferences.darkMode) this.setDarkMode(true);
        if (this.preferences.audioDescriptions) this.setAudioDescriptions(true);
        if (this.preferences.captions) this.setCaptions(true);
    }

    /**
     * Disable all accessibility features
     */
    disableAll() {
        this.setHighContrast(false);
        this.setLargeText(false);
        this.setReducedMotion(false);
        this.setAudioDescriptions(false);
        this.setCaptions(false);
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            if (typeof localStorage === 'undefined') return {};

            const stored = localStorage.getItem('mm_accessibility_preferences');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            if (typeof localStorage === 'undefined') return;

            const prefs = {
                highContrast: this.features.highContrast,
                largeText: this.features.largeText,
                reducedMotion: this.features.reducedMotion,
                darkMode: this.features.darkMode,
                audioDescriptions: this.features.audioDescriptions,
                captions: this.features.captions
            };

            localStorage.setItem('mm_accessibility_preferences', JSON.stringify(prefs));
        } catch (e) {
            console.warn('Failed to save accessibility preferences:', e);
        }
    }

    /**
     * Emit accessibility change event
     */
    emitChange(feature, enabled) {
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit('accessibility:changed', {
                feature,
                enabled,
                allFeatures: this.features
            });
        }
    }

    /**
     * Get accessibility status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            features: { ...this.features },
            wcagLevel: this.getWCAGLevel()
        };
    }

    /**
     * Calculate WCAG compliance level
     */
    getWCAGLevel() {
        const requiredForAA = [
            this.features.ariaLabels,
            this.features.keyboardNavigation,
            this.features.screenReader
        ];

        const requiredForAAA = [
            ...requiredForAA,
            this.features.highContrast || true, // Optional but recommended
            this.features.captions
        ];

        if (requiredForAAA.every(f => f)) {
            return 'AAA';
        } else if (requiredForAA.every(f => f)) {
            return 'AA';
        } else {
            return 'A';
        }
    }

    /**
     * Run accessibility audit
     */
    audit() {
        const issues = [];

        // Check ARIA labels
        if (this.aria && this.aria.audit) {
            issues.push(...this.aria.audit());
        }

        // Check keyboard navigation
        if (this.keyboard && this.keyboard.audit) {
            issues.push(...this.keyboard.audit());
        }

        // Check contrast ratios
        if (this.visual && this.visual.audit) {
            issues.push(...this.visual.audit());
        }

        return {
            wcagLevel: this.getWCAGLevel(),
            issuesFound: issues.length,
            issues,
            timestamp: Date.now()
        };
    }

    /**
     * Get feature recommendations
     */
    getRecommendations() {
        const recommendations = [];

        if (!this.features.highContrast) {
            recommendations.push({
                feature: 'highContrast',
                reason: 'Mejora legibilidad para usuarios con baja visión',
                priority: 'medium'
            });
        }

        if (!this.features.captions) {
            recommendations.push({
                feature: 'captions',
                reason: 'Necesario para usuarios con discapacidad auditiva',
                priority: 'high'
            });
        }

        if (!this.features.audioDescriptions) {
            recommendations.push({
                feature: 'audioDescriptions',
                reason: 'Ayuda a usuarios con discapacidad visual',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

// Global instance
window.AccessibilityManager = AccessibilityManager;
