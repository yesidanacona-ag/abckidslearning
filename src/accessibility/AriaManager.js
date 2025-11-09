// ================================
// ARIA MANAGER
// Manage ARIA labels, roles, and semantic HTML
// Accessibility - Fase 1 ($25K)
// ================================

class AriaManager {
    constructor() {
        this.ariaLabels = new Map();
        this.announcements = [];
        this.liveRegion = null;

        this.init();
    }

    /**
     * Initialize ARIA manager
     */
    init() {
        this.createLiveRegion();
        this.enhanceExistingElements();
        console.log('✅ AriaManager initialized');
    }

    /**
     * Create ARIA live region for announcements
     */
    createLiveRegion() {
        if (typeof document === 'undefined') return;

        // Create polite live region (doesn't interrupt)
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';

        document.body.appendChild(this.liveRegion);
    }

    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;

        // Store announcement
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });

        // Update live region
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;

        // Clear after 3 seconds
        setTimeout(() => {
            if (this.liveRegion.textContent === message) {
                this.liveRegion.textContent = '';
            }
        }, 3000);

        // Log
        if (window.logger) {
            window.logger.debug('ARIA announcement', { message, priority }, 'AriaManager');
        }
    }

    /**
     * Enhance existing elements with ARIA
     */
    enhanceExistingElements() {
        if (typeof document === 'undefined') return;

        // Buttons
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            const text = button.textContent.trim() || button.getAttribute('title');
            if (text) {
                button.setAttribute('aria-label', text);
            }
        });

        // Links
        document.querySelectorAll('a:not([aria-label])').forEach(link => {
            const text = link.textContent.trim() || link.getAttribute('title');
            if (text) {
                link.setAttribute('aria-label', text);
            }
        });

        // Images without alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', '');
            img.setAttribute('role', 'presentation');
        });

        // Form inputs
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
                if (!label.id) {
                    label.id = `label-${input.id}`;
                }
            } else if (input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });
    }

    /**
     * Set ARIA label for element
     */
    setLabel(element, label) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-label', label);
            this.ariaLabels.set(element, label);
        }
    }

    /**
     * Set ARIA role for element
     */
    setRole(element, role) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('role', role);
        }
    }

    /**
     * Set ARIA described-by
     */
    setDescribedBy(element, descriptionId) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-describedby', descriptionId);
        }
    }

    /**
     * Mark element as hidden from screen readers
     */
    hideFromScreenReaders(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Show element to screen readers
     */
    showToScreenReaders(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.removeAttribute('aria-hidden');
        }
    }

    /**
     * Set ARIA expanded state
     */
    setExpanded(element, expanded) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-expanded', expanded.toString());
        }
    }

    /**
     * Set ARIA pressed state (for toggle buttons)
     */
    setPressed(element, pressed) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-pressed', pressed.toString());
        }
    }

    /**
     * Set ARIA selected state
     */
    setSelected(element, selected) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-selected', selected.toString());
        }
    }

    /**
     * Set ARIA current
     */
    setCurrent(element, current = 'page') {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-current', current);
        }
    }

    /**
     * Set ARIA invalid
     */
    setInvalid(element, invalid, errorMessage = '') {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.setAttribute('aria-invalid', invalid.toString());

            if (invalid && errorMessage) {
                const errorId = `error-${element.id || Date.now()}`;
                let errorElement = document.getElementById(errorId);

                if (!errorElement) {
                    errorElement = document.createElement('span');
                    errorElement.id = errorId;
                    errorElement.className = 'error-message';
                    errorElement.textContent = errorMessage;
                    element.parentNode.insertBefore(errorElement, element.nextSibling);
                }

                element.setAttribute('aria-describedby', errorId);
            }
        }
    }

    /**
     * Audit ARIA implementation
     */
    audit() {
        const issues = [];

        if (typeof document === 'undefined') return issues;

        // Check for buttons without labels
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
            if (!button.textContent.trim()) {
                issues.push({
                    severity: 'error',
                    element: button,
                    message: 'Button without accessible label',
                    wcag: '4.1.2'
                });
            }
        });

        // Check for images without alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            issues.push({
                severity: 'error',
                element: img,
                message: 'Image without alt text',
                wcag: '1.1.1'
            });
        });

        // Check for form inputs without labels
        document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])').forEach(input => {
            const hasLabel = document.querySelector(`label[for="${input.id}"]`);
            if (!hasLabel) {
                issues.push({
                    severity: 'error',
                    element: input,
                    message: 'Form input without label',
                    wcag: '3.3.2'
                });
            }
        });

        return issues;
    }

    /**
     * Get recent announcements
     */
    getAnnouncements(limit = 10) {
        return this.announcements.slice(-limit);
    }
}

// Global instance
window.AriaManager = AriaManager;
