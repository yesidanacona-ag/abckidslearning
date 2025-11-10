// ================================
// GLOBAL ERROR HANDLER
// Catch-all for unhandled errors and promise rejections
// Error Handling & Monitoring - Fase 1
// ================================

class GlobalErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.handlers = {
            onError: null,
            onPromiseRejection: null,
            onCritical: null
        };

        this.stats = {
            totalErrors: 0,
            totalPromiseRejections: 0,
            lastError: null
        };

        this.init();
    }

    /**
     * Initialize global error handlers
     */
    init() {
        // Catch synchronous errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: Date.now()
            });

            // Prevent default browser error handling
            // (only if we have a custom handler)
            if (this.handlers.onError) {
                event.preventDefault();
            }
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection({
                type: 'unhandledrejection',
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            });

            // Prevent default browser handling
            if (this.handlers.onPromiseRejection) {
                event.preventDefault();
            }
        });

        console.log('✅ GlobalErrorHandler initialized');
    }

    /**
     * Handle synchronous error
     */
    handleError(errorInfo) {
        this.stats.totalErrors++;
        this.stats.lastError = errorInfo;

        // Store error
        this.errors.push(errorInfo);
        this.trimErrors();

        // Log to console
        console.error(
            '[GlobalErrorHandler] Uncaught error:',
            errorInfo.message,
            `at ${errorInfo.filename}:${errorInfo.lineno}:${errorInfo.colno}`
        );

        // Call custom handler
        if (this.handlers.onError) {
            try {
                this.handlers.onError(errorInfo);
            } catch (handlerError) {
                console.error('[GlobalErrorHandler] Error in custom error handler:', handlerError);
            }
        }

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('error:global', errorInfo);
        }

        // Check if critical
        this.checkCritical();
    }

    /**
     * Handle unhandled promise rejection
     */
    handlePromiseRejection(rejectionInfo) {
        this.stats.totalPromiseRejections++;
        this.stats.lastError = rejectionInfo;

        // Store rejection
        this.errors.push(rejectionInfo);
        this.trimErrors();

        // Log to console
        console.error(
            '[GlobalErrorHandler] Unhandled promise rejection:',
            rejectionInfo.reason
        );

        // Call custom handler
        if (this.handlers.onPromiseRejection) {
            try {
                this.handlers.onPromiseRejection(rejectionInfo);
            } catch (handlerError) {
                console.error('[GlobalErrorHandler] Error in rejection handler:', handlerError);
            }
        }

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('error:promise:rejection', rejectionInfo);
        }

        // Check if critical
        this.checkCritical();
    }

    /**
     * Check if error situation is critical
     */
    checkCritical() {
        const recentErrors = this.getRecentErrors(60000); // Last minute

        // Critical if 5+ errors in last minute
        if (recentErrors.length >= 5) {
            console.error('[GlobalErrorHandler] CRITICAL: Multiple errors detected');

            if (this.handlers.onCritical) {
                try {
                    this.handlers.onCritical(recentErrors);
                } catch (handlerError) {
                    console.error('[GlobalErrorHandler] Error in critical handler:', handlerError);
                }
            }

            if (window.eventBus) {
                window.eventBus.emit('error:critical:global', {
                    recentErrors,
                    totalErrors: this.stats.totalErrors
                });
            }
        }
    }

    /**
     * Get recent errors within timeframe
     */
    getRecentErrors(timeframeMs = 60000) {
        const now = Date.now();
        return this.errors.filter(err => now - err.timestamp < timeframeMs);
    }

    /**
     * Trim errors to max size
     */
    trimErrors() {
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
    }

    /**
     * Set custom error handler
     */
    onError(handler) {
        this.handlers.onError = handler;
    }

    /**
     * Set custom promise rejection handler
     */
    onPromiseRejection(handler) {
        this.handlers.onPromiseRejection = handler;
    }

    /**
     * Set critical error handler
     */
    onCritical(handler) {
        this.handlers.onCritical = handler;
    }

    /**
     * Get error statistics
     */
    getStats() {
        return {
            ...this.stats,
            recentErrors: this.getRecentErrors(60000).length,
            errorRate: this.calculateErrorRate(),
            topErrors: this.getTopErrors()
        };
    }

    /**
     * Calculate error rate (errors per minute)
     */
    calculateErrorRate() {
        const recentErrors = this.getRecentErrors(60000);
        return recentErrors.length;
    }

    /**
     * Get most common errors
     */
    getTopErrors(limit = 5) {
        const errorCounts = {};

        this.errors.forEach(err => {
            const key = err.message || String(err.reason);
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([message, count]) => ({ message, count }));
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Clear error history
     */
    clear() {
        this.errors = [];
        this.stats = {
            totalErrors: 0,
            totalPromiseRejections: 0,
            lastError: null
        };
    }

    /**
     * Create error report
     */
    createReport() {
        const recentErrors = this.getRecentErrors(300000); // Last 5 minutes

        return {
            summary: {
                totalErrors: this.stats.totalErrors,
                totalPromiseRejections: this.stats.totalPromiseRejections,
                recentErrors: recentErrors.length,
                errorRate: this.calculateErrorRate()
            },
            topErrors: this.getTopErrors(10),
            recentErrors: recentErrors.slice(-20),
            timestamp: Date.now()
        };
    }
}

// Global instance
window.GlobalErrorHandler = GlobalErrorHandler;
