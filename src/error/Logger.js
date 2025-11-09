// ================================
// LOGGER
// Structured logging system with levels and targets
// Error Handling & Monitoring - Fase 2
// ================================

class Logger {
    constructor(options = {}) {
        this.level = options.level || 'info'; // debug, info, warn, error
        this.enabled = options.enabled !== false;
        this.maxLogs = options.maxLogs || 500;
        this.persistToStorage = options.persistToStorage !== false;
        this.storageKey = options.storageKey || 'mm_logs';

        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        this.logs = [];
        this.targets = new Set(['console']); // console, storage, remote

        // Load persisted logs
        if (this.persistToStorage) {
            this.loadFromStorage();
        }
    }

    /**
     * Log debug message
     */
    debug(message, data = {}, context = '') {
        this.log('debug', message, data, context);
    }

    /**
     * Log info message
     */
    info(message, data = {}, context = '') {
        this.log('info', message, data, context);
    }

    /**
     * Log warning message
     */
    warn(message, data = {}, context = '') {
        this.log('warn', message, data, context);
    }

    /**
     * Log error message
     */
    error(message, data = {}, context = '') {
        this.log('error', message, data, context);
    }

    /**
     * Core logging method
     */
    log(level, message, data = {}, context = '') {
        if (!this.enabled) return;

        // Check if level should be logged
        if (this.levels[level] < this.levels[this.level]) {
            return;
        }

        const logEntry = {
            level,
            message,
            data: this.sanitizeData(data),
            context,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown'
        };

        // Store log
        this.logs.push(logEntry);
        this.trimLogs();

        // Output to targets
        this.output(logEntry);

        // Persist to storage
        if (this.persistToStorage && this.targets.has('storage')) {
            this.saveToStorage();
        }

        // Emit event
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit(`log:${level}`, logEntry);
        }
    }

    /**
     * Output log to targets
     */
    output(logEntry) {
        const { level, message, data, context } = logEntry;
        const prefix = context ? `[${context}]` : '';
        const emoji = this.getLevelEmoji(level);

        // Console output
        if (this.targets.has('console')) {
            const consoleMethod = level === 'debug' ? 'log' : level;

            if (Object.keys(data).length > 0) {
                console[consoleMethod](`${emoji} ${prefix} ${message}`, data);
            } else {
                console[consoleMethod](`${emoji} ${prefix} ${message}`);
            }
        }

        // Remote output (placeholder for future implementation)
        if (this.targets.has('remote')) {
            this.sendToRemote(logEntry);
        }
    }

    /**
     * Get emoji for log level
     */
    getLevelEmoji(level) {
        const emojis = {
            debug: '🐛',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌'
        };
        return emojis[level] || '';
    }

    /**
     * Sanitize data for logging (remove sensitive info, truncate large objects)
     */
    sanitizeData(data) {
        try {
            // Clone to avoid mutating original
            const sanitized = JSON.parse(JSON.stringify(data));

            // Remove sensitive keys
            const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
            const removeSensitive = (obj) => {
                if (typeof obj !== 'object' || obj === null) return obj;

                Object.keys(obj).forEach(key => {
                    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object') {
                        removeSensitive(obj[key]);
                    }
                });

                return obj;
            };

            return removeSensitive(sanitized);
        } catch (e) {
            return { error: 'Unable to sanitize data' };
        }
    }

    /**
     * Trim logs to max size
     */
    trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * Save logs to localStorage
     */
    saveToStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            // Keep only last 100 logs for storage
            const logsToSave = this.logs.slice(-100);
            localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
        } catch (e) {
            // Storage full or unavailable
            console.warn('Failed to save logs to storage:', e.message);
        }
    }

    /**
     * Load logs from localStorage
     */
    loadFromStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedLogs = JSON.parse(stored);
                this.logs = parsedLogs;
            }
        } catch (e) {
            console.warn('Failed to load logs from storage:', e.message);
        }
    }

    /**
     * Send log to remote endpoint (placeholder)
     */
    sendToRemote(logEntry) {
        // TODO: Implement when backend is available
        // Example:
        // fetch('/api/logs', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(logEntry)
        // });
    }

    /**
     * Add logging target
     */
    addTarget(target) {
        this.targets.add(target);
    }

    /**
     * Remove logging target
     */
    removeTarget(target) {
        this.targets.delete(target);
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.level = level;
        }
    }

    /**
     * Get logs filtered by level
     */
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    /**
     * Get logs filtered by context
     */
    getLogsByContext(context) {
        return this.logs.filter(log => log.context === context);
    }

    /**
     * Get logs within timeframe
     */
    getLogsByTimeframe(timeframeMs = 60000) {
        const now = Date.now();
        return this.logs.filter(log => now - log.timestamp < timeframeMs);
    }

    /**
     * Get all logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Get error logs only
     */
    getErrors() {
        return this.logs.filter(log => log.level === 'error');
    }

    /**
     * Get warnings only
     */
    getWarnings() {
        return this.logs.filter(log => log.level === 'warn');
    }

    /**
     * Get log statistics
     */
    getStats() {
        const byLevel = {};
        this.logs.forEach(log => {
            byLevel[log.level] = (byLevel[log.level] || 0) + 1;
        });

        const byContext = {};
        this.logs.forEach(log => {
            if (log.context) {
                byContext[log.context] = (byContext[log.context] || 0) + 1;
            }
        });

        return {
            total: this.logs.length,
            byLevel,
            byContext,
            recentLogs: this.getLogsByTimeframe(60000).length,
            oldestLog: this.logs[0]?.timestamp,
            newestLog: this.logs[this.logs.length - 1]?.timestamp
        };
    }

    /**
     * Clear all logs
     */
    clear() {
        this.logs = [];
        if (this.persistToStorage) {
            try {
                localStorage.removeItem(this.storageKey);
            } catch (e) {
                // Ignore
            }
        }
    }

    /**
     * Export logs as JSON
     */
    export() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Export logs as CSV
     */
    exportCSV() {
        const headers = ['timestamp', 'date', 'level', 'context', 'message', 'data'];
        const rows = this.logs.map(log => [
            log.timestamp,
            log.date,
            log.level,
            log.context,
            log.message,
            JSON.stringify(log.data)
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csv;
    }

    /**
     * Download logs as file
     */
    download(format = 'json') {
        const data = format === 'csv' ? this.exportCSV() : this.export();
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${Date.now()}.${format}`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Enable logging
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable logging
     */
    disable() {
        this.enabled = false;
    }
}

// Global instance
window.Logger = Logger;
