// ================================
// ERROR BOUNDARY
// Modular error boundaries for graceful error handling
// Error Handling & Monitoring - Fase 1
// ================================

class ErrorBoundary {
    constructor(context, options = {}) {
        this.context = context; // e.g., 'PlayerService', 'GameController', etc.
        this.errors = [];
        this.errorThreshold = options.errorThreshold || 5; // Max errors before critical
        this.resetInterval = options.resetInterval || 60000; // Reset error count after 1 min
        this.onError = options.onError || null;
        this.onCritical = options.onCritical || null;
        this.recoveryStrategy = options.recoveryStrategy || null;

        this.errorCount = 0;
        this.lastReset = Date.now();
        this.criticalState = false;

        // Auto-reset error count periodically
        this.startAutoReset();
    }

    /**
     * Wrap a function with error boundary
     * @param {Function} fn - Function to wrap
     * @param {string} operationName - Name of the operation for logging
     * @returns {Function} Wrapped function
     */
    wrap(fn, operationName = 'operation') {
        return async (...args) => {
            try {
                // Reset error count if interval passed
                this.checkReset();

                // Execute function
                const result = await fn(...args);

                // Success - reset error count
                if (this.errorCount > 0) {
                    this.errorCount = Math.max(0, this.errorCount - 1);
                }

                return result;
            } catch (error) {
                // Handle error
                return this.handleError(error, operationName, args);
            }
        };
    }

    /**
     * Handle an error
     * @param {Error} error - The error object
     * @param {string} operation - Operation that failed
     * @param {Array} args - Arguments passed to the operation
     */
    handleError(error, operation, args = []) {
        this.errorCount++;

        const errorInfo = {
            context: this.context,
            operation,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            args: this.sanitizeArgs(args),
            timestamp: Date.now(),
            errorCount: this.errorCount
        };

        // Store error
        this.errors.push(errorInfo);

        // Keep only last 50 errors
        if (this.errors.length > 50) {
            this.errors.shift();
        }

        // Log error
        console.error(
            `[ErrorBoundary:${this.context}] ${operation} failed:`,
            error.message,
            `(${this.errorCount}/${this.errorThreshold})`
        );

        // Call custom error handler
        if (this.onError) {
            try {
                this.onError(errorInfo);
            } catch (handlerError) {
                console.error('[ErrorBoundary] Error in custom error handler:', handlerError);
            }
        }

        // Check if critical threshold reached
        if (this.errorCount >= this.errorThreshold && !this.criticalState) {
            this.enterCriticalState(errorInfo);
        }

        // Try recovery strategy
        if (this.recoveryStrategy) {
            try {
                return this.recoveryStrategy(error, operation, args);
            } catch (recoveryError) {
                console.error('[ErrorBoundary] Recovery strategy failed:', recoveryError);
            }
        }

        // Return safe fallback
        return this.getSafeFallback(operation);
    }

    /**
     * Enter critical error state
     */
    enterCriticalState(errorInfo) {
        this.criticalState = true;

        console.error(
            `[ErrorBoundary:${this.context}] CRITICAL: Error threshold reached (${this.errorThreshold})`
        );

        // Call critical handler
        if (this.onCritical) {
            try {
                this.onCritical(errorInfo, this.errors);
            } catch (handlerError) {
                console.error('[ErrorBoundary] Error in critical handler:', handlerError);
            }
        }

        // Emit event
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit('error:critical', {
                context: this.context,
                errorInfo,
                recentErrors: this.errors.slice(-10)
            });
        }
    }

    /**
     * Exit critical state (manual recovery)
     */
    exitCriticalState() {
        this.criticalState = false;
        this.errorCount = 0;
        console.log(`[ErrorBoundary:${this.context}] Exited critical state`);
    }

    /**
     * Check if should reset error count
     */
    checkReset() {
        const now = Date.now();
        if (now - this.lastReset >= this.resetInterval) {
            this.errorCount = 0;
            this.lastReset = now;
            if (this.criticalState) {
                this.criticalState = false;
                console.log(`[ErrorBoundary:${this.context}] Auto-reset from critical state`);
            }
        }
    }

    /**
     * Start auto-reset timer
     */
    startAutoReset() {
        if (typeof window !== 'undefined') {
            setInterval(() => {
                this.checkReset();
            }, this.resetInterval);
        }
    }

    /**
     * Sanitize arguments for logging (remove sensitive data)
     */
    sanitizeArgs(args) {
        try {
            return args.map(arg => {
                if (arg === null || arg === undefined) return arg;
                if (typeof arg === 'function') return '[Function]';
                if (arg instanceof Error) return `[Error: ${arg.message}]`;

                // Truncate large objects
                const str = JSON.stringify(arg);
                if (str.length > 200) {
                    return str.substring(0, 200) + '...';
                }
                return arg;
            });
        } catch (e) {
            return ['[Unable to sanitize args]'];
        }
    }

    /**
     * Get safe fallback value based on operation
     */
    getSafeFallback(operation) {
        // Common fallbacks
        if (operation.includes('get') || operation.includes('fetch')) {
            return null;
        }
        if (operation.includes('list') || operation.includes('find')) {
            return [];
        }
        if (operation.includes('count')) {
            return 0;
        }
        if (operation.includes('is') || operation.includes('has')) {
            return false;
        }

        return undefined;
    }

    /**
     * Get error statistics
     */
    getStats() {
        return {
            context: this.context,
            totalErrors: this.errors.length,
            currentErrorCount: this.errorCount,
            criticalState: this.criticalState,
            threshold: this.errorThreshold,
            recentErrors: this.errors.slice(-10),
            errorsByOperation: this.groupErrorsByOperation(),
            errorRate: this.calculateErrorRate()
        };
    }

    /**
     * Group errors by operation
     */
    groupErrorsByOperation() {
        const grouped = {};
        this.errors.forEach(err => {
            if (!grouped[err.operation]) {
                grouped[err.operation] = 0;
            }
            grouped[err.operation]++;
        });
        return grouped;
    }

    /**
     * Calculate error rate (errors per minute)
     */
    calculateErrorRate() {
        if (this.errors.length === 0) return 0;

        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentErrors = this.errors.filter(e => e.timestamp >= oneMinuteAgo);

        return recentErrors.length;
    }

    /**
     * Clear error history
     */
    clear() {
        this.errors = [];
        this.errorCount = 0;
        this.criticalState = false;
        this.lastReset = Date.now();
    }

    /**
     * Check if in critical state
     */
    isCritical() {
        return this.criticalState;
    }
}

// Global instance
window.ErrorBoundary = ErrorBoundary;
