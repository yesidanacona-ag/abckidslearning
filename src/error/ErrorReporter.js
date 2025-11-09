// ================================
// ERROR REPORTER
// Report errors to monitoring services and create reports
// Error Handling & Monitoring - Fase 3
// ================================

class ErrorReporter {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.reportToConsole = options.reportToConsole !== false;
        this.reportToStorage = options.reportToStorage !== false;
        this.reportToRemote = options.reportToRemote || false;

        // Remote configuration (placeholder for Sentry, etc.)
        this.remoteConfig = {
            endpoint: options.remoteEndpoint || null,
            apiKey: options.apiKey || null,
            projectId: options.projectId || null
        };

        // User context for error reports
        this.userContext = {
            userId: null,
            userName: null,
            sessionId: this.generateSessionId()
        };

        // Device/browser context
        this.deviceContext = this.getDeviceContext();

        // Error queue for batching
        this.errorQueue = [];
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 30000; // 30 seconds

        // Start batch flushing
        if (this.reportToRemote) {
            this.startBatchFlush();
        }

        console.log('✅ ErrorReporter initialized');
    }

    /**
     * Report an error
     */
    report(error, context = {}) {
        if (!this.enabled) return;

        const errorReport = this.createErrorReport(error, context);

        // Console report
        if (this.reportToConsole) {
            this.reportToConsoleMethod(errorReport);
        }

        // Storage report
        if (this.reportToStorage) {
            this.reportToStorageMethod(errorReport);
        }

        // Remote report (batched)
        if (this.reportToRemote && this.remoteConfig.endpoint) {
            this.addToQueue(errorReport);
        }

        // Emit event
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit('error:reported', errorReport);
        }

        return errorReport;
    }

    /**
     * Create structured error report
     */
    createErrorReport(error, context = {}) {
        return {
            // Error details
            error: {
                message: error.message || String(error),
                stack: error.stack || null,
                name: error.name || 'Error',
                type: error.constructor.name
            },

            // Context
            context: {
                ...context,
                operation: context.operation || 'unknown',
                component: context.component || 'unknown',
                severity: context.severity || this.inferSeverity(error)
            },

            // User context
            user: {
                ...this.userContext,
                // Player data (if available)
                playerName: this.getPlayerName(),
                playerLevel: this.getPlayerLevel()
            },

            // Device context
            device: this.deviceContext,

            // App state
            app: {
                version: '1.0.0', // TODO: Get from manifest
                environment: this.getEnvironment(),
                timestamp: Date.now(),
                date: new Date().toISOString()
            },

            // Performance at time of error
            performance: this.getPerformanceSnapshot(),

            // Recent logs (last 10)
            recentLogs: this.getRecentLogs(10),

            // ID for tracking
            reportId: this.generateReportId()
        };
    }

    /**
     * Infer error severity
     */
    inferSeverity(error) {
        const message = error.message || '';

        if (message.includes('CRITICAL') || message.includes('Fatal')) {
            return 'critical';
        }
        if (message.includes('localStorage') || message.includes('QuotaExceeded')) {
            return 'high';
        }
        if (message.includes('Network') || message.includes('fetch')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Get device/browser context
     */
    getDeviceContext() {
        if (typeof navigator === 'undefined') return {};

        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            touchSupport: 'ontouchstart' in window
        };
    }

    /**
     * Get environment (development, production, etc.)
     */
    getEnvironment() {
        if (typeof window === 'undefined') return 'unknown';

        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        }
        return 'production';
    }

    /**
     * Get performance snapshot at time of error
     */
    getPerformanceSnapshot() {
        if (typeof window === 'undefined' || !window.bootstrap) return null;

        const monitor = window.bootstrap.performance?.monitor;
        if (!monitor) return null;

        return monitor.getReport();
    }

    /**
     * Get recent logs
     */
    getRecentLogs(count = 10) {
        if (typeof window === 'undefined' || !window.logger) return [];

        const logs = window.logger.getLogs();
        return logs.slice(-count);
    }

    /**
     * Get player name from store
     */
    getPlayerName() {
        if (typeof window === 'undefined' || !window.bootstrap) return null;

        try {
            return window.bootstrap.store?.getState().player.name || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Get player level from store
     */
    getPlayerLevel() {
        if (typeof window === 'undefined' || !window.bootstrap) return null;

        try {
            return window.bootstrap.store?.getState().player.level || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Report to console
     */
    reportToConsoleMethod(errorReport) {
        console.group('📋 Error Report');
        console.error('Message:', errorReport.error.message);
        console.log('Context:', errorReport.context);
        console.log('User:', errorReport.user);
        console.log('Severity:', errorReport.context.severity);
        console.log('Report ID:', errorReport.reportId);
        if (errorReport.error.stack) {
            console.log('Stack:', errorReport.error.stack);
        }
        console.groupEnd();
    }

    /**
     * Report to localStorage
     */
    reportToStorageMethod(errorReport) {
        try {
            const key = 'mm_error_reports';
            const stored = localStorage.getItem(key);
            const reports = stored ? JSON.parse(stored) : [];

            reports.push(errorReport);

            // Keep only last 50 reports
            if (reports.length > 50) {
                reports.splice(0, reports.length - 50);
            }

            localStorage.setItem(key, JSON.stringify(reports));
        } catch (e) {
            console.warn('Failed to save error report to storage:', e.message);
        }
    }

    /**
     * Add error to queue for batch sending
     */
    addToQueue(errorReport) {
        this.errorQueue.push(errorReport);

        // Flush if batch size reached
        if (this.errorQueue.length >= this.batchSize) {
            this.flushQueue();
        }
    }

    /**
     * Flush error queue to remote
     */
    async flushQueue() {
        if (this.errorQueue.length === 0) return;

        const batch = [...this.errorQueue];
        this.errorQueue = [];

        try {
            await this.sendToRemote(batch);
            console.log(`📤 Sent ${batch.length} error reports to remote`);
        } catch (e) {
            console.error('Failed to send error reports to remote:', e);
            // Re-add to queue
            this.errorQueue.unshift(...batch);
        }
    }

    /**
     * Send error reports to remote endpoint
     */
    async sendToRemote(reports) {
        if (!this.remoteConfig.endpoint) {
            throw new Error('Remote endpoint not configured');
        }

        const response = await fetch(this.remoteConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.remoteConfig.apiKey && { 'X-API-Key': this.remoteConfig.apiKey })
            },
            body: JSON.stringify({
                reports,
                projectId: this.remoteConfig.projectId
            })
        });

        if (!response.ok) {
            throw new Error(`Remote reporting failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Start batch flush interval
     */
    startBatchFlush() {
        setInterval(() => {
            this.flushQueue();
        }, this.flushInterval);
    }

    /**
     * Set user context
     */
    setUserContext(context) {
        this.userContext = {
            ...this.userContext,
            ...context
        };
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate report ID
     */
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get all stored error reports
     */
    getStoredReports() {
        try {
            const key = 'mm_error_reports';
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear stored reports
     */
    clearStoredReports() {
        try {
            localStorage.removeItem('mm_error_reports');
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Create summary report
     */
    createSummaryReport() {
        const storedReports = this.getStoredReports();

        const byComponent = {};
        const bySeverity = {};

        storedReports.forEach(report => {
            const component = report.context.component;
            const severity = report.context.severity;

            byComponent[component] = (byComponent[component] || 0) + 1;
            bySeverity[severity] = (bySeverity[severity] || 0) + 1;
        });

        return {
            total: storedReports.length,
            byComponent,
            bySeverity,
            recentReports: storedReports.slice(-10),
            oldestReport: storedReports[0]?.app.date,
            newestReport: storedReports[storedReports.length - 1]?.app.date
        };
    }

    /**
     * Enable error reporting
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable error reporting
     */
    disable() {
        this.enabled = false;
    }
}

// Global instance
window.ErrorReporter = ErrorReporter;
