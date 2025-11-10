// ================================
// KEYBOARD NAVIGATION MANAGER
// Complete keyboard navigation support
// Accessibility - Fase 2 ($20K)
// ================================

class KeyboardNavigationManager {
    constructor() {
        this.enabled = true;
        this.focusableElements = [];
        this.focusStack = [];
        this.shortcuts = new Map();
        this.currentFocusIndex = -1;

        this.init();
    }

    init() {
        if (typeof document === 'undefined') return;

        // Setup keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('focus', this.handleFocus.bind(this), true);

        // Update focusable elements
        this.updateFocusableElements();

        // Setup tab trapping for modals
        this.setupTabTrapping();

        // Add visual focus indicators
        this.addFocusStyles();

        console.log('✅ KeyboardNavigationManager initialized');
    }

    handleKeyDown(e) {
        if (!this.enabled) return;

        // Tab navigation
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }

        // Arrow key navigation (for custom components)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleArrowNavigation(e);
        }

        // Escape key (close modals, etc.)
        if (e.key === 'Escape') {
            this.handleEscape(e);
        }

        // Enter/Space (activate elements)
        if (e.key === 'Enter' || e.key === ' ') {
            this.handleActivation(e);
        }

        // Keyboard shortcuts
        this.handleShortcuts(e);
    }

    handleTabNavigation(e) {
        const modal = document.querySelector('.modal-overlay.active, [role="dialog"]:not([aria-hidden="true"])');

        if (modal) {
            // Trap focus within modal
            const focusableInModal = this.getFocusableElements(modal);

            if (focusableInModal.length === 0) return;

            const firstFocusable = focusableInModal[0];
            const lastFocusable = focusableInModal[focusableInModal.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }

    handleArrowNavigation(e) {
        // Check if we're in a custom navigable component
        const target = e.target;
        const role = target.getAttribute('role');

        // Grid/listbox navigation
        if (role === 'listbox' || role === 'grid' || role === 'radiogroup') {
            e.preventDefault();
            this.navigateInContainer(target, e.key);
        }

        // Tab navigation
        if (target.closest('[role="tablist"]')) {
            e.preventDefault();
            this.navigateTabs(target, e.key);
        }
    }

    navigateInContainer(container, direction) {
        const items = Array.from(container.querySelectorAll('[role="option"], [role="gridcell"], [role="radio"]'));
        const currentIndex = items.indexOf(document.activeElement);

        let nextIndex;
        if (direction === 'ArrowDown' || direction === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % items.length;
        } else {
            nextIndex = (currentIndex - 1 + items.length) % items.length;
        }

        items[nextIndex].focus();
    }

    navigateTabs(currentTab, direction) {
        const tablist = currentTab.closest('[role="tablist"]');
        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        const currentIndex = tabs.indexOf(currentTab);

        let nextIndex;
        if (direction === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (direction === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else {
            return;
        }

        tabs[nextIndex].focus();
        tabs[nextIndex].click(); // Activate tab
    }

    handleEscape(e) {
        // Close topmost modal
        const modal = document.querySelector('.modal-overlay.active, [role="dialog"]:not([aria-hidden="true"])');

        if (modal) {
            const closeButton = modal.querySelector('.modal-close, [data-close-modal]');
            if (closeButton) {
                closeButton.click();
            }
        }

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('keyboard:escape', { target: e.target });
        }
    }

    handleActivation(e) {
        const target = e.target;

        // Don't interfere with native elements
        if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
            return;
        }

        // Custom activatable elements
        if (target.getAttribute('role') === 'button' || target.hasAttribute('data-keyboard-activate')) {
            e.preventDefault();
            target.click();
        }
    }

    handleShortcuts(e) {
        const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;

        if (this.shortcuts.has(key)) {
            e.preventDefault();
            const handler = this.shortcuts.get(key);
            handler(e);
        }
    }

    handleFocus(e) {
        // Track focus for skip links
        this.currentFocusIndex = this.focusableElements.indexOf(e.target);

        // Emit focus event
        if (window.eventBus) {
            window.eventBus.emit('keyboard:focus', {
                element: e.target,
                index: this.currentFocusIndex
            });
        }
    }

    registerShortcut(key, handler, description = '') {
        this.shortcuts.set(key, handler);

        if (window.logger) {
            window.logger.debug('Keyboard shortcut registered', { key, description }, 'KeyboardNavigationManager');
        }
    }

    unregisterShortcut(key) {
        this.shortcuts.delete(key);
    }

    getFocusableElements(container = document) {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(',');

        return Array.from(container.querySelectorAll(selector))
            .filter(el => el.offsetParent !== null); // Visible elements only
    }

    updateFocusableElements() {
        this.focusableElements = this.getFocusableElements();
    }

    setupTabTrapping() {
        // Observe DOM changes to update focusable elements
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.updateFocusableElements();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
            });
        }
    }

    addFocusStyles() {
        if (typeof document === 'undefined') return;

        // Add focus styles via CSS
        const style = document.createElement('style');
        style.id = 'keyboard-focus-styles';
        style.textContent = `
            /* Keyboard focus indicators */
            *:focus {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }

            *:focus:not(:focus-visible) {
                outline: none;
            }

            *:focus-visible {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }

            /* Skip link */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 100000;
            }

            .skip-link:focus {
                top: 0;
            }
        `;

        if (!document.getElementById('keyboard-focus-styles')) {
            document.head.appendChild(style);
        }
    }

    addSkipLink(targetId, text = 'Saltar al contenido principal') {
        if (typeof document === 'undefined') return;

        const skipLink = document.createElement('a');
        skipLink.href = `#${targetId}`;
        skipLink.className = 'skip-link';
        skipLink.textContent = text;

        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(targetId);
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    focusFirst() {
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }
    }

    focusLast() {
        if (this.focusableElements.length > 0) {
            this.focusableElements[this.focusableElements.length - 1].focus();
        }
    }

    audit() {
        const issues = [];

        // Check for keyboard traps
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            const focusable = this.getFocusableElements(modal);
            if (focusable.length === 0 && !modal.hasAttribute('aria-hidden')) {
                issues.push({
                    severity: 'error',
                    element: modal,
                    message: 'Modal without focusable elements (keyboard trap)',
                    wcag: '2.1.2'
                });
            }
        });

        return issues;
    }
}

// Global instance
window.KeyboardNavigationManager = KeyboardNavigationManager;
