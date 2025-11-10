// ================================
// USER RESEARCH MANAGER
// User behavior tracking, heatmaps, session recording
// UX Research - Fase 1 ($10K)
// ================================

class UserResearchManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.trackClicks = options.trackClicks !== false;
        this.trackScrolls = options.trackScrolls !== false;
        this.trackHovers = options.trackHovers || false;
        this.trackKeys = options.trackKeys || false;
        this.recordSessions = options.recordSessions || false;

        // Data storage
        this.sessions = [];
        this.currentSession = null;
        this.heatmapData = {
            clicks: [],
            scrolls: [],
            hovers: []
        };

        // User journey tracking
        this.userJourney = [];
        this.interactions = [];

        // Session recording
        this.sessionEvents = [];
        this.recordingInterval = null;

        // Storage
        this.storageKey = 'mm_ux_research';
        this.maxSessions = 50;

        this.init();
    }

    init() {
        if (!this.enabled) return;

        this.startSession();
        this.setupEventTracking();
        this.loadStoredData();

        console.log('✅ UserResearchManager initialized');
    }

    /**
     * Start new research session
     */
    startSession() {
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            endTime: null,
            duration: 0,

            // User info
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },

            // Session data
            screenViews: [],
            interactions: [],
            journey: [],
            errors: [],

            // Metrics
            totalClicks: 0,
            totalScrolls: 0,
            totalHovers: 0,
            totalKeys: 0,

            // Performance
            pageLoadTime: performance.now(),
            timeToInteractive: null
        };

        // Track page load
        this.trackPageLoad();
    }

    /**
     * End current session
     */
    endSession() {
        if (!this.currentSession) return;

        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

        // Save session
        this.sessions.push(this.currentSession);
        this.trimSessions();
        this.saveToStorage();

        // Emit event
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.emit('ux:session:ended', this.currentSession);
        }

        this.currentSession = null;
    }

    /**
     * Setup event tracking
     */
    setupEventTracking() {
        if (typeof document === 'undefined') return;

        // Click tracking
        if (this.trackClicks) {
            document.addEventListener('click', (e) => {
                this.trackClick(e);
            }, { passive: true });
        }

        // Scroll tracking
        if (this.trackScrolls) {
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.trackScroll();
                }, 150);
            }, { passive: true });
        }

        // Hover tracking (disabled by default - generates lots of data)
        if (this.trackHovers) {
            document.addEventListener('mousemove', (e) => {
                this.trackHover(e);
            }, { passive: true });
        }

        // Key tracking (for interaction patterns, not content)
        if (this.trackKeys) {
            document.addEventListener('keydown', (e) => {
                this.trackKey(e);
            }, { passive: true });
        }

        // Screen changes
        if (typeof window !== 'undefined' && window.eventBus) {
            window.eventBus.on('screen:changed', (data) => {
                this.trackScreenView(data.screen);
            });

            // Track game events
            window.eventBus.on('game:started', (data) => {
                this.trackInteraction('game_start', data);
            });

            window.eventBus.on('game:ended', (data) => {
                this.trackInteraction('game_end', data);
            });

            window.eventBus.on('error:global', (data) => {
                this.trackError(data);
            });
        }

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackInteraction('page_hidden', { timestamp: Date.now() });
            } else {
                this.trackInteraction('page_visible', { timestamp: Date.now() });
            }
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    /**
     * Track page load
     */
    trackPageLoad() {
        if (typeof performance === 'undefined') return;

        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];

            if (this.currentSession) {
                this.currentSession.timeToInteractive = Date.now() - this.currentSession.startTime;

                this.trackInteraction('page_load', {
                    loadTime: perfData ? perfData.loadEventEnd - perfData.loadEventStart : null,
                    domReady: perfData ? perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart : null
                });
            }
        });
    }

    /**
     * Track click event
     */
    trackClick(event) {
        if (!this.currentSession) return;

        const clickData = {
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY,
            pageX: event.pageX,
            pageY: event.pageY,
            target: this.getElementInfo(event.target),
            button: event.button
        };

        // Add to heatmap data
        this.heatmapData.clicks.push(clickData);

        // Track interaction
        this.trackInteraction('click', clickData);

        this.currentSession.totalClicks++;
    }

    /**
     * Track scroll event
     */
    trackScroll() {
        if (!this.currentSession) return;

        const scrollData = {
            timestamp: Date.now(),
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100)
        };

        this.heatmapData.scrolls.push(scrollData);
        this.currentSession.totalScrolls++;
    }

    /**
     * Track hover event
     */
    trackHover(event) {
        if (!this.currentSession) return;

        // Sample hovers (only track every 500ms to avoid data explosion)
        const now = Date.now();
        if (this._lastHoverTrack && now - this._lastHoverTrack < 500) return;
        this._lastHoverTrack = now;

        const hoverData = {
            timestamp: now,
            x: event.clientX,
            y: event.clientY,
            target: this.getElementInfo(event.target)
        };

        this.heatmapData.hovers.push(hoverData);
        this.currentSession.totalHovers++;
    }

    /**
     * Track key event
     */
    trackKey(event) {
        if (!this.currentSession) return;

        // Don't track actual key content for privacy
        this.trackInteraction('keypress', {
            timestamp: Date.now(),
            key: event.key.length === 1 ? 'character' : event.key, // Mask actual characters
            code: event.code,
            target: this.getElementInfo(event.target)
        });

        this.currentSession.totalKeys++;
    }

    /**
     * Track screen view
     */
    trackScreenView(screenName) {
        if (!this.currentSession) return;

        const screenView = {
            screen: screenName,
            timestamp: Date.now(),
            duration: null // Will be calculated when leaving screen
        };

        // Calculate duration of previous screen
        if (this.currentSession.screenViews.length > 0) {
            const previousScreen = this.currentSession.screenViews[this.currentSession.screenViews.length - 1];
            previousScreen.duration = screenView.timestamp - previousScreen.timestamp;
        }

        this.currentSession.screenViews.push(screenView);

        // Add to user journey
        this.userJourney.push({
            type: 'screen_view',
            screen: screenName,
            timestamp: Date.now()
        });

        if (window.logger) {
            window.logger.debug('Screen view tracked', { screenName }, 'UserResearchManager');
        }
    }

    /**
     * Track generic interaction
     */
    trackInteraction(type, data = {}) {
        if (!this.currentSession) return;

        const interaction = {
            type,
            timestamp: Date.now(),
            data: this.sanitizeData(data)
        };

        this.currentSession.interactions.push(interaction);
        this.interactions.push(interaction);

        // Add to user journey
        this.userJourney.push({
            type: 'interaction',
            interactionType: type,
            timestamp: Date.now()
        });

        // Trim to prevent memory issues
        if (this.interactions.length > 1000) {
            this.interactions = this.interactions.slice(-500);
        }
    }

    /**
     * Track error
     */
    trackError(errorData) {
        if (!this.currentSession) return;

        this.currentSession.errors.push({
            ...errorData,
            timestamp: Date.now()
        });
    }

    /**
     * Get element information (for privacy-safe tracking)
     */
    getElementInfo(element) {
        if (!element) return null;

        return {
            tagName: element.tagName,
            id: element.id || null,
            className: element.className || null,
            textContent: element.textContent ? element.textContent.substring(0, 50) : null,
            dataset: element.dataset ? { ...element.dataset } : null
        };
    }

    /**
     * Sanitize data (remove sensitive info)
     */
    sanitizeData(data) {
        try {
            const sanitized = JSON.parse(JSON.stringify(data));
            const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'email'];

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
            return {};
        }
    }

    /**
     * Generate heatmap visualization data
     */
    generateHeatmap(type = 'clicks') {
        const data = this.heatmapData[type] || [];

        // Create density map
        const gridSize = 50; // 50x50 grid
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;

        const heatmap = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));

        data.forEach(point => {
            const gridX = Math.floor(point.x / cellWidth);
            const gridY = Math.floor(point.y / cellHeight);

            if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
                heatmap[gridY][gridX]++;
            }
        });

        return heatmap;
    }

    /**
     * Get user journey funnel
     */
    getFunnel() {
        const funnel = {
            welcome: 0,
            main: 0,
            practice: 0,
            game_started: 0,
            game_completed: 0
        };

        this.sessions.forEach(session => {
            session.screenViews.forEach(view => {
                if (funnel[view.screen] !== undefined) {
                    funnel[view.screen]++;
                }
            });

            session.interactions.forEach(interaction => {
                if (interaction.type === 'game_start') funnel.game_started++;
                if (interaction.type === 'game_end') funnel.game_completed++;
            });
        });

        // Calculate conversion rates
        const total = funnel.welcome || 1;
        return {
            steps: funnel,
            conversions: {
                welcome_to_main: funnel.main / total,
                main_to_practice: funnel.practice / (funnel.main || 1),
                practice_to_game: funnel.game_started / (funnel.practice || 1),
                game_completion: funnel.game_completed / (funnel.game_started || 1)
            }
        };
    }

    /**
     * Get session statistics
     */
    getSessionStats() {
        const sessions = this.sessions;

        if (sessions.length === 0) return null;

        const totalSessions = sessions.length;
        const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;
        const avgClicks = sessions.reduce((sum, s) => sum + s.totalClicks, 0) / totalSessions;
        const avgScreenViews = sessions.reduce((sum, s) => sum + s.screenViews.length, 0) / totalSessions;

        return {
            totalSessions,
            avgDuration,
            avgClicks,
            avgScreenViews,
            errorRate: sessions.reduce((sum, s) => sum + s.errors.length, 0) / totalSessions
        };
    }

    /**
     * Get popular paths through the app
     */
    getPopularPaths() {
        const paths = {};

        this.sessions.forEach(session => {
            const path = session.screenViews.map(v => v.screen).join(' → ');
            paths[path] = (paths[path] || 0) + 1;
        });

        return Object.entries(paths)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([path, count]) => ({ path, count }));
    }

    /**
     * Trim sessions to max size
     */
    trimSessions() {
        if (this.sessions.length > this.maxSessions) {
            this.sessions = this.sessions.slice(-this.maxSessions);
        }
    }

    /**
     * Save data to storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            const data = {
                sessions: this.sessions.slice(-10), // Save last 10 sessions
                heatmapData: {
                    clicks: this.heatmapData.clicks.slice(-100),
                    scrolls: this.heatmapData.scrolls.slice(-100),
                    hovers: this.heatmapData.hovers.slice(-100)
                }
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save UX research data:', e.message);
        }
    }

    /**
     * Load data from storage
     */
    loadStoredData() {
        try {
            if (typeof localStorage === 'undefined') return;

            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.sessions = data.sessions || [];
                this.heatmapData = data.heatmapData || { clicks: [], scrolls: [], hovers: [] };
            }
        } catch (e) {
            console.warn('Failed to load UX research data:', e.message);
        }
    }

    /**
     * Clear all research data
     */
    clearData() {
        this.sessions = [];
        this.heatmapData = { clicks: [], scrolls: [], hovers: [] };
        this.userJourney = [];
        this.interactions = [];

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
     * Export research data
     */
    export() {
        return {
            sessions: this.sessions,
            heatmapData: this.heatmapData,
            stats: this.getSessionStats(),
            funnel: this.getFunnel(),
            popularPaths: this.getPopularPaths()
        };
    }

    /**
     * Enable tracking
     */
    enable() {
        this.enabled = true;
        if (!this.currentSession) {
            this.startSession();
        }
    }

    /**
     * Disable tracking
     */
    disable() {
        this.enabled = false;
        if (this.currentSession) {
            this.endSession();
        }
    }
}

// Global instance
window.UserResearchManager = UserResearchManager;
