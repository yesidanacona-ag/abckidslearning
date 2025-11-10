// ================================
// RECOVERY MANAGER
// Automatic recovery strategies for common errors
// Error Handling & Monitoring - Fase 4
// ================================

class RecoveryManager {
    constructor() {
        this.strategies = new Map();
        this.recoveryAttempts = new Map();
        this.maxRetries = 3;

        // Register default recovery strategies
        this.registerDefaultStrategies();

        console.log('✅ RecoveryManager initialized');
    }

    /**
     * Register default recovery strategies
     */
    registerDefaultStrategies() {
        // Network errors: Retry with exponential backoff
        this.register('NetworkError', async (error, context, attempt) => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            console.log(`🔄 Retrying network request after ${delay}ms (attempt ${attempt + 1})`);

            await this.sleep(delay);

            // Retry the operation
            if (context.retry && typeof context.retry === 'function') {
                return await context.retry();
            }

            return null;
        });

        // localStorage full: Clear old data
        this.register('QuotaExceededError', async (error, context) => {
            console.log('💾 localStorage full, clearing old data...');

            try {
                // Clear logs
                if (window.logger) {
                    window.logger.clear();
                }

                // Clear old error reports
                if (window.errorReporter) {
                    const reports = window.errorReporter.getStoredReports();
                    if (reports.length > 10) {
                        window.errorReporter.clearStoredReports();
                    }
                }

                // Clear performance cache (if needed)
                // ...

                console.log('✅ Cleared old data, retrying operation');

                // Retry original operation
                if (context.retry) {
                    return await context.retry();
                }
            } catch (e) {
                console.error('Recovery failed:', e);
            }

            return null;
        });

        // Undefined/null errors: Return safe default
        this.register('TypeError', async (error, context) => {
            if (error.message.includes('undefined') || error.message.includes('null')) {
                console.warn('⚠️ Null/undefined error, returning safe default');

                // Return safe default based on context
                if (context.defaultValue !== undefined) {
                    return context.defaultValue;
                }

                return null;
            }

            // Can't recover, rethrow
            throw error;
        });

        // JSON parse errors: Return empty object/array
        this.register('SyntaxError', async (error, context) => {
            if (error.message.includes('JSON')) {
                console.warn('⚠️ JSON parse error, returning safe default');

                if (context.expectedType === 'array') {
                    return [];
                }
                if (context.expectedType === 'object') {
                    return {};
                }

                return null;
            }

            throw error;
        });

        // Promise rejection: Retry with timeout
        this.register('PromiseRejection', async (error, context, attempt) => {
            const delay = 1000 * (attempt + 1);
            console.log(`🔄 Retrying promise after ${delay}ms`);

            await this.sleep(delay);

            if (context.retry) {
                return await context.retry();
            }

            return null;
        });
    }

    /**
     * Register a recovery strategy
     */
    register(errorType, strategy) {
        this.strategies.set(errorType, strategy);
    }

    /**
     * Attempt to recover from an error
     */
    async recover(error, context = {}) {
        const errorType = error.name || error.constructor.name;
        const strategy = this.strategies.get(errorType);

        if (!strategy) {
            console.warn(`No recovery strategy for error type: ${errorType}`);
            return null;
        }

        // Track recovery attempts
        const key = `${errorType}:${context.operation || 'unknown'}`;
        const attempts = this.recoveryAttempts.get(key) || 0;

        if (attempts >= this.maxRetries) {
            console.error(`Max recovery attempts reached for ${key}`);
            this.recoveryAttempts.delete(key);
            return null;
        }

        this.recoveryAttempts.set(key, attempts + 1);

        try {
            console.log(`🔧 Attempting recovery for ${errorType} (attempt ${attempts + 1}/${this.maxRetries})`);

            const result = await strategy(error, context, attempts);

            // Success - reset attempts
            this.recoveryAttempts.delete(key);

            console.log(`✅ Recovery successful for ${errorType}`);

            // Emit event
            if (typeof window !== 'undefined' && window.eventBus) {
                window.eventBus.emit('recovery:success', {
                    errorType,
                    context,
                    attempts: attempts + 1
                });
            }

            return result;
        } catch (recoveryError) {
            console.error(`❌ Recovery failed for ${errorType}:`, recoveryError.message);

            // Check if should retry
            if (attempts + 1 < this.maxRetries) {
                // Will retry on next error
                return null;
            } else {
                // Max retries reached, emit failure event
                this.recoveryAttempts.delete(key);

                if (typeof window !== 'undefined' && window.eventBus) {
                    window.eventBus.emit('recovery:failed', {
                        errorType,
                        context,
                        attempts: attempts + 1,
                        finalError: recoveryError
                    });
                }

                return null;
            }
        }
    }

    /**
     * Wrap a function with automatic recovery
     */
    wrap(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                // Attempt recovery
                const recoveryContext = {
                    ...context,
                    retry: () => fn(...args)
                };

                const result = await this.recover(error, recoveryContext);

                // If recovery failed, rethrow
                if (result === null) {
                    throw error;
                }

                return result;
            }
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear recovery attempt tracking
     */
    clearAttempts() {
        this.recoveryAttempts.clear();
    }

    /**
     * Get recovery statistics
     */
    getStats() {
        const stats = {
            totalStrategies: this.strategies.size,
            activeRecoveries: this.recoveryAttempts.size,
            byErrorType: {}
        };

        this.recoveryAttempts.forEach((attempts, key) => {
            const [errorType] = key.split(':');
            stats.byErrorType[errorType] = (stats.byErrorType[errorType] || 0) + attempts;
        });

        return stats;
    }

    /**
     * Register custom recovery strategy
     */
    registerCustom(errorType, strategyFn, options = {}) {
        const maxRetries = options.maxRetries || this.maxRetries;

        this.strategies.set(errorType, async (error, context, attempt) => {
            if (attempt >= maxRetries) {
                throw new Error(`Max retries (${maxRetries}) reached for ${errorType}`);
            }

            return await strategyFn(error, context, attempt);
        });

        console.log(`✅ Registered custom recovery strategy for ${errorType}`);
    }

    /**
     * Remove recovery strategy
     */
    unregister(errorType) {
        this.strategies.delete(errorType);
    }

    /**
     * Check if recovery strategy exists
     */
    hasStrategy(errorType) {
        return this.strategies.has(errorType);
    }

    /**
     * Get all registered strategies
     */
    getStrategies() {
        return Array.from(this.strategies.keys());
    }
}

// Global instance
window.RecoveryManager = RecoveryManager;
