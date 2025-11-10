// ================================
// ANALYTICS MANAGER
// Event tracking, metrics, custom dimensions
// UX Research - Fase 2 ($15K)
// ================================

class AnalyticsManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.debugMode = options.debugMode || false;

        // Analytics providers (Google Analytics, Mixpanel, etc.)
        this.providers = new Map();

        // Event queue (for batching)
        this.eventQueue = [];
        this.batchSize = options.batchSize || 20;
        this.flushInterval = options.flushInterval || 30000; // 30 seconds

        // Metrics
        this.metrics = {
            events: [],
            pageViews: [],
            customDimensions: {},
            customMetrics: {}
        };

        // User properties
        this.userProperties = {
            userId: null,
            playerName: null,
            playerLevel: null,
            totalPlayTime: 0,
            gamesPlayed: 0
        };

        // Session info
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();

        // Storage
        this.storageKey = 'mm_analytics';

        this.init();
    }

    init() {
        if (!this.enabled) return;

        this.loadStoredData();
        this.setupEventTracking();
        this.startBatchFlush();

        console.log('✅ AnalyticsManager initialized');
    }

    /**
     * Setup event tracking
     */
    setupEventTracking() {
        if (typeof window === 'undefined' || !window.eventBus) return;

        // Game events
        window.eventBus.on('game:started', (data) => {
            this.trackEvent('game_start', {
                mode: data.mode,
                table: data.table,
                difficulty: data.difficulty
            });
        });

        window.eventBus.on('game:ended', (data) => {
            this.trackEvent('game_end', {
                mode: data.mode,
                score: data.score,
                accuracy: data.accuracy,
                duration: data.duration
            });
        });

        window.eventBus.on('game:answer:correct', (data) => {
            this.trackEvent('answer_correct', {
                question: data.question,
                answer: data.answer,
                timeToAnswer: data.time
            });
        });

        window.eventBus.on('game:answer:incorrect', (data) => {
            this.trackEvent('answer_incorrect', {
                question: data.question,
                userAnswer: data.userAnswer,
                correctAnswer: data.correctAnswer
            });
        });

        window.eventBus.on('game:level:up', (data) => {
            this.trackEvent('level_up', {
                newLevel: data.level,
                xpEarned: data.xp
            });
        });

        window.eventBus.on('game:achievement:unlocked', (data) => {
            this.trackEvent('achievement_unlocked', {
                achievementId: data.id,
                achievementName: data.name
            });
        });

        // Screen changes
        window.eventBus.on('screen:changed', (data) => {
            this.trackPageView(data.screen);
        });

        // Shop events
        window.eventBus.on('shop:item:purchased', (data) => {
            this.trackEvent('item_purchased', {
                itemId: data.id,
                itemName: data.name,
                price: data.price,
                category: data.category
            });
        });

        // Tutorial events
        window.eventBus.on('tutorial:started', () => {
            this.trackEvent('tutorial_start');
        });

        window.eventBus.on('tutorial:completed', (data) => {
            this.trackEvent('tutorial_complete', {
                duration: data.duration,
                stepsCompleted: data.steps
            });
        });

        window.eventBus.on('tutorial:skipped', () => {
            this.trackEvent('tutorial_skip');
        });

        // Mission events
        window.eventBus.on('mission:completed', (data) => {
            this.trackEvent('mission_complete', {
                missionId: data.id,
                reward: data.reward
            });
        });

        // Error tracking
        window.eventBus.on('error:global', (data) => {
            this.trackEvent('error', {
                errorType: data.type,
                errorMessage: data.message,
                severity: 'high'
            });
        });
    }

    /**
     * Track event
     */
    trackEvent(eventName, properties = {}, options = {}) {
        if (!this.enabled) return;

        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                ...this.getUserProperties()
            },
            timestamp: Date.now()
        };

        // Add to metrics
        this.metrics.events.push(event);

        // Add to queue
        this.eventQueue.push(event);

        // Debug log
        if (this.debugMode) {
            console.log('📊 Analytics Event:', eventName, properties);
        }

        // Send to providers
        this.providers.forEach((provider, name) => {
            try {
                provider.trackEvent(eventName, event.properties);
            } catch (e) {
                console.error(`Failed to send event to ${name}:`, e);
            }
        });

        // Check if should flush
        if (this.eventQueue.length >= this.batchSize) {
            this.flushQueue();
        }

        // Emit event
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit('analytics:event:tracked', event);
        }

        return event;
    }

    /**
     * Track page view
     */
    trackPageView(pageName, properties = {}) {
        if (!this.enabled) return;

        const pageView = {
            page: pageName,
            timestamp: Date.now(),
            properties: {
                ...properties,
                ...this.getUserProperties()
            }
        };

        this.metrics.pageViews.push(pageView);

        // Send to providers
        this.providers.forEach((provider, name) => {
            try {
                if (provider.trackPageView) {
                    provider.trackPageView(pageName, pageView.properties);
                }
            } catch (e) {
                console.error(`Failed to send page view to ${name}:`, e);
            }
        });

        if (this.debugMode) {
            console.log('📊 Analytics Page View:', pageName);
        }
    }

    /**
     * Set user property
     */
    setUserProperty(name, value) {
        this.userProperties[name] = value;

        // Send to providers
        this.providers.forEach((provider, providerName) => {
            try {
                if (provider.setUserProperty) {
                    provider.setUserProperty(name, value);
                }
            } catch (e) {
                console.error(`Failed to set user property in ${providerName}:`, e);
            }
        });
    }

    /**
     * Set multiple user properties
     */
    setUserProperties(properties) {
        Object.entries(properties).forEach(([name, value]) => {
            this.setUserProperty(name, value);
        });
    }

    /**
     * Get user properties
     */
    getUserProperties() {
        return { ...this.userProperties };
    }

    /**
     * Set custom dimension
     */
    setCustomDimension(name, value) {
        this.metrics.customDimensions[name] = value;
    }

    /**
     * Set custom metric
     */
    setCustomMetric(name, value) {
        this.metrics.customMetrics[name] = value;
    }

    /**
     * Track timing (performance metrics)
     */
    trackTiming(category, variable, timeMs, label = '') {
        this.trackEvent('timing', {
            category,
            variable,
            timeMs,
            label
        });
    }

    /**
     * Track exception/error
     */
    trackException(description, fatal = false) {
        this.trackEvent('exception', {
            description,
            fatal
        });
    }

    /**
     * Track social interaction
     */
    trackSocial(network, action, target) {
        this.trackEvent('social', {
            network,
            action,
            target
        });
    }

    /**
     * Track conversion
     */
    trackConversion(goal, value = null) {
        this.trackEvent('conversion', {
            goal,
            value,
            timestamp: Date.now()
        });
    }

    /**
     * Register analytics provider
     */
    registerProvider(name, provider) {
        this.providers.set(name, provider);
        console.log(`✅ Analytics provider registered: ${name}`);
    }

    /**
     * Unregister provider
     */
    unregisterProvider(name) {
        this.providers.delete(name);
    }

    /**
     * Flush event queue
     */
    flushQueue() {
        if (this.eventQueue.length === 0) return;

        const batch = [...this.eventQueue];
        this.eventQueue = [];

        // Send batch to providers
        this.providers.forEach((provider, name) => {
            try {
                if (provider.sendBatch) {
                    provider.sendBatch(batch);
                }
            } catch (e) {
                console.error(`Failed to send batch to ${name}:`, e);
            }
        });

        // Save to storage
        this.saveToStorage();

        if (this.debugMode) {
            console.log(`📊 Analytics: Flushed ${batch.length} events`);
        }
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
     * Get event statistics
     */
    getEventStats() {
        const events = this.metrics.events;

        if (events.length === 0) return null;

        // Count by event name
        const byName = {};
        events.forEach(event => {
            byName[event.name] = (byName[event.name] || 0) + 1;
        });

        // Most common events
        const topEvents = Object.entries(byName)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        return {
            totalEvents: events.length,
            uniqueEvents: Object.keys(byName).length,
            topEvents,
            byName
        };
    }

    /**
     * Get page view statistics
     */
    getPageViewStats() {
        const pageViews = this.metrics.pageViews;

        if (pageViews.length === 0) return null;

        // Count by page
        const byPage = {};
        pageViews.forEach(view => {
            byPage[view.page] = (byPage[view.page] || 0) + 1;
        });

        // Most viewed pages
        const topPages = Object.entries(byPage)
            .sort((a, b) => b[1] - a[1])
            .map(([page, count]) => ({ page, count }));

        return {
            totalPageViews: pageViews.length,
            uniquePages: Object.keys(byPage).length,
            topPages,
            byPage
        };
    }

    /**
     * Get conversion funnel
     */
    getConversionFunnel(steps) {
        const funnel = {};
        steps.forEach(step => {
            funnel[step] = this.metrics.events.filter(e => e.name === step).length;
        });

        // Calculate conversion rates
        const conversions = {};
        for (let i = 1; i < steps.length; i++) {
            const fromStep = steps[i - 1];
            const toStep = steps[i];
            const fromCount = funnel[fromStep] || 1;
            const toCount = funnel[toStep] || 0;
            conversions[`${fromStep}_to_${toStep}`] = toCount / fromCount;
        }

        return {
            funnel,
            conversions
        };
    }

    /**
     * Get retention metrics
     */
    getRetentionMetrics() {
        const sessions = this.metrics.events.filter(e => e.name === 'game_start');

        if (sessions.length === 0) return null;

        // Group by day
        const byDay = {};
        sessions.forEach(session => {
            const day = new Date(session.timestamp).toDateString();
            byDay[day] = (byDay[day] || 0) + 1;
        });

        // Calculate retention
        const days = Object.keys(byDay).sort();
        const retention = {
            day1: days.length > 1 ? byDay[days[1]] / byDay[days[0]] : 0,
            day7: days.length > 7 ? byDay[days[7]] / byDay[days[0]] : 0,
            day30: days.length > 30 ? byDay[days[30]] / byDay[days[0]] : 0
        };

        return {
            totalDays: days.length,
            byDay,
            retention
        };
    }

    /**
     * Get engagement metrics
     */
    getEngagementMetrics() {
        const events = this.metrics.events;

        if (events.length === 0) return null;

        // Session duration
        const sessionDuration = Date.now() - this.sessionStart;

        // Events per session
        const eventsPerSession = events.length;

        // Game sessions
        const gameSessions = events.filter(e => e.name === 'game_start').length;

        // Average game duration
        const gameEnds = events.filter(e => e.name === 'game_end');
        const avgGameDuration = gameEnds.length > 0
            ? gameEnds.reduce((sum, e) => sum + (e.properties.duration || 0), 0) / gameEnds.length
            : 0;

        return {
            sessionDuration,
            eventsPerSession,
            gameSessions,
            avgGameDuration,
            engagementScore: this.calculateEngagementScore()
        };
    }

    /**
     * Calculate engagement score (0-100)
     */
    calculateEngagementScore() {
        const events = this.metrics.events;
        if (events.length === 0) return 0;

        // Factors:
        // - Number of events (max 50 points)
        // - Session duration (max 25 points)
        // - Game completion rate (max 25 points)

        const eventScore = Math.min(events.length, 50);

        const sessionDuration = Date.now() - this.sessionStart;
        const durationScore = Math.min((sessionDuration / (1000 * 60 * 10)) * 25, 25); // 10 min = max

        const gameStarts = events.filter(e => e.name === 'game_start').length;
        const gameEnds = events.filter(e => e.name === 'game_end').length;
        const completionRate = gameStarts > 0 ? gameEnds / gameStarts : 0;
        const completionScore = completionRate * 25;

        return Math.round(eventScore + durationScore + completionScore);
    }

    /**
     * Save to storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            const data = {
                events: this.metrics.events.slice(-100), // Last 100 events
                pageViews: this.metrics.pageViews.slice(-50),
                customDimensions: this.metrics.customDimensions,
                customMetrics: this.metrics.customMetrics,
                userProperties: this.userProperties
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save analytics data:', e.message);
        }
    }

    /**
     * Load from storage
     */
    loadStoredData() {
        try {
            if (typeof localStorage === 'undefined') return;

            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.metrics.events = data.events || [];
                this.metrics.pageViews = data.pageViews || [];
                this.metrics.customDimensions = data.customDimensions || {};
                this.metrics.customMetrics = data.customMetrics || {};
                this.userProperties = { ...this.userProperties, ...data.userProperties };
            }
        } catch (e) {
            console.warn('Failed to load analytics data:', e.message);
        }
    }

    /**
     * Clear analytics data
     */
    clearData() {
        this.metrics = {
            events: [],
            pageViews: [],
            customDimensions: {},
            customMetrics: {}
        };
        this.eventQueue = [];

        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export analytics data
     */
    export() {
        return {
            metrics: this.metrics,
            userProperties: this.userProperties,
            sessionId: this.sessionId,
            stats: {
                events: this.getEventStats(),
                pageViews: this.getPageViewStats(),
                engagement: this.getEngagementMetrics()
            }
        };
    }

    /**
     * Enable analytics
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable analytics
     */
    disable() {
        this.enabled = false;
        this.flushQueue();
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
    }
}

// Google Analytics Provider (example)
class GoogleAnalyticsProvider {
    constructor(trackingId) {
        this.trackingId = trackingId;
        this.init();
    }

    init() {
        // Initialize gtag (placeholder - would need actual implementation)
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', this.trackingId);
        }
    }

    trackEvent(eventName, properties) {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, properties);
        }
    }

    trackPageView(pageName, properties) {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: pageName,
                ...properties
            });
        }
    }

    setUserProperty(name, value) {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('set', 'user_properties', {
                [name]: value
            });
        }
    }

    sendBatch(events) {
        // Google Analytics doesn't support batch sending
        // Each event would be sent individually
        events.forEach(event => {
            this.trackEvent(event.name, event.properties);
        });
    }
}

// Global instances
window.AnalyticsManager = AnalyticsManager;
window.GoogleAnalyticsProvider = GoogleAnalyticsProvider;
