// ================================
// A/B TESTING MANAGER
// Feature flags, variant testing, conversion tracking
// UX Research - Fase 3 ($15K)
// ================================

class ABTestingManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.debugMode = options.debugMode || false;

        // Active experiments
        this.experiments = new Map();

        // User variant assignments
        this.assignments = new Map();

        // Experiment results
        this.results = new Map();

        // Storage
        this.storageKey = 'mm_ab_tests';

        // Default traffic allocation
        this.defaultTrafficAllocation = 100; // Percentage of users in experiments

        this.init();
    }

    init() {
        if (!this.enabled) return;

        this.loadStoredData();
        this.setupEventTracking();

        console.log('✅ ABTestingManager initialized');
    }

    /**
     * Setup event tracking for conversions
     */
    setupEventTracking() {
        if (typeof window === 'undefined' || !window.eventBus) return;

        // Track conversions for active experiments
        window.eventBus.on('game:ended', (data) => {
            this.trackConversion('game_completion', {
                score: data.score,
                accuracy: data.accuracy
            });
        });

        window.eventBus.on('game:level:up', (data) => {
            this.trackConversion('level_up', {
                level: data.level
            });
        });

        window.eventBus.on('shop:item:purchased', (data) => {
            this.trackConversion('purchase', {
                value: data.price
            });
        });

        window.eventBus.on('tutorial:completed', () => {
            this.trackConversion('tutorial_complete');
        });
    }

    /**
     * Create new experiment
     */
    createExperiment(experimentId, config) {
        const experiment = {
            id: experimentId,
            name: config.name,
            description: config.description || '',
            variants: config.variants, // Array of variant objects
            trafficAllocation: config.trafficAllocation || this.defaultTrafficAllocation,
            conversionGoal: config.conversionGoal || null,
            startDate: config.startDate || Date.now(),
            endDate: config.endDate || null,
            status: 'active', // active, paused, completed
            createdAt: Date.now()
        };

        // Validate variants
        if (!experiment.variants || experiment.variants.length < 2) {
            throw new Error('Experiment must have at least 2 variants');
        }

        // Validate variant weights (should sum to 100)
        const totalWeight = experiment.variants.reduce((sum, v) => sum + (v.weight || 0), 0);
        if (totalWeight !== 100) {
            throw new Error('Variant weights must sum to 100');
        }

        this.experiments.set(experimentId, experiment);
        this.results.set(experimentId, {
            variants: {},
            conversions: {},
            started: Date.now()
        });

        // Initialize results for each variant
        experiment.variants.forEach(variant => {
            this.results.get(experimentId).variants[variant.id] = {
                users: 0,
                impressions: 0,
                conversions: 0,
                conversionValue: 0
            };
        });

        this.saveToStorage();

        if (this.debugMode) {
            console.log('🧪 A/B Test Created:', experimentId, experiment);
        }

        return experiment;
    }

    /**
     * Get variant for user
     */
    getVariant(experimentId, userId = null) {
        const experiment = this.experiments.get(experimentId);

        if (!experiment) {
            console.warn(`Experiment ${experimentId} not found`);
            return null;
        }

        if (experiment.status !== 'active') {
            console.warn(`Experiment ${experimentId} is not active`);
            return null;
        }

        // Check if user already assigned
        const assignmentKey = `${experimentId}:${userId || 'anonymous'}`;
        if (this.assignments.has(assignmentKey)) {
            return this.assignments.get(assignmentKey);
        }

        // Check traffic allocation
        if (Math.random() * 100 > experiment.trafficAllocation) {
            return null; // User not in experiment
        }

        // Assign variant based on weights
        const variant = this.assignVariant(experiment);

        // Store assignment
        this.assignments.set(assignmentKey, variant);

        // Track impression
        this.trackImpression(experimentId, variant.id);

        this.saveToStorage();

        if (this.debugMode) {
            console.log('🧪 A/B Test Assignment:', experimentId, variant.id);
        }

        return variant;
    }

    /**
     * Assign variant based on weights
     */
    assignVariant(experiment) {
        const random = Math.random() * 100;
        let cumulative = 0;

        for (const variant of experiment.variants) {
            cumulative += variant.weight;
            if (random <= cumulative) {
                return variant;
            }
        }

        // Fallback to first variant
        return experiment.variants[0];
    }

    /**
     * Track impression
     */
    trackImpression(experimentId, variantId) {
        const results = this.results.get(experimentId);

        if (!results) return;

        if (!results.variants[variantId]) {
            results.variants[variantId] = {
                users: 0,
                impressions: 0,
                conversions: 0,
                conversionValue: 0
            };
        }

        results.variants[variantId].impressions++;
        results.variants[variantId].users++;

        if (window.eventBus) {
            window.eventBus.emit('ab:impression', {
                experimentId,
                variantId
            });
        }
    }

    /**
     * Track conversion
     */
    trackConversion(conversionGoal, data = {}, userId = null) {
        // Find experiments with this conversion goal
        this.experiments.forEach((experiment, experimentId) => {
            if (experiment.conversionGoal !== conversionGoal) return;
            if (experiment.status !== 'active') return;

            // Get user's variant
            const assignmentKey = `${experimentId}:${userId || 'anonymous'}`;
            const variant = this.assignments.get(assignmentKey);

            if (!variant) return;

            // Track conversion
            const results = this.results.get(experimentId);
            if (results && results.variants[variant.id]) {
                results.variants[variant.id].conversions++;

                if (data.value) {
                    results.variants[variant.id].conversionValue += data.value;
                }

                if (!results.conversions[variant.id]) {
                    results.conversions[variant.id] = [];
                }

                results.conversions[variant.id].push({
                    timestamp: Date.now(),
                    data
                });

                this.saveToStorage();

                if (this.debugMode) {
                    console.log('🧪 A/B Test Conversion:', experimentId, variant.id, data);
                }

                if (window.eventBus) {
                    window.eventBus.emit('ab:conversion', {
                        experimentId,
                        variantId: variant.id,
                        data
                    });
                }
            }
        });
    }

    /**
     * Get experiment results
     */
    getResults(experimentId) {
        const experiment = this.experiments.get(experimentId);
        const results = this.results.get(experimentId);

        if (!experiment || !results) return null;

        const analysis = {
            experimentId,
            experimentName: experiment.name,
            variants: []
        };

        // Calculate metrics for each variant
        experiment.variants.forEach(variant => {
            const variantResults = results.variants[variant.id] || {
                users: 0,
                impressions: 0,
                conversions: 0,
                conversionValue: 0
            };

            const conversionRate = variantResults.impressions > 0
                ? (variantResults.conversions / variantResults.impressions) * 100
                : 0;

            const avgConversionValue = variantResults.conversions > 0
                ? variantResults.conversionValue / variantResults.conversions
                : 0;

            analysis.variants.push({
                id: variant.id,
                name: variant.name,
                weight: variant.weight,
                users: variantResults.users,
                impressions: variantResults.impressions,
                conversions: variantResults.conversions,
                conversionRate: conversionRate.toFixed(2),
                conversionValue: variantResults.conversionValue,
                avgConversionValue: avgConversionValue.toFixed(2)
            });
        });

        // Calculate winner (variant with highest conversion rate)
        analysis.variants.sort((a, b) => b.conversionRate - a.conversionRate);
        analysis.winner = analysis.variants[0];

        // Calculate statistical significance (simplified Chi-square test)
        analysis.significance = this.calculateSignificance(analysis.variants);

        return analysis;
    }

    /**
     * Calculate statistical significance (simplified)
     */
    calculateSignificance(variants) {
        if (variants.length !== 2) return null; // Only for A/B tests (2 variants)

        const [control, variant] = variants;

        const n1 = parseInt(control.impressions);
        const n2 = parseInt(variant.impressions);
        const c1 = parseInt(control.conversions);
        const c2 = parseInt(variant.conversions);

        if (n1 === 0 || n2 === 0) return null;

        const p1 = c1 / n1;
        const p2 = c2 / n2;
        const pPool = (c1 + c2) / (n1 + n2);

        const se = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));

        if (se === 0) return null;

        const zScore = (p2 - p1) / se;
        const pValue = this.calculatePValue(Math.abs(zScore));

        return {
            zScore: zScore.toFixed(4),
            pValue: pValue.toFixed(4),
            significant: pValue < 0.05,
            confidenceLevel: ((1 - pValue) * 100).toFixed(2) + '%',
            uplift: ((p2 - p1) / p1 * 100).toFixed(2) + '%'
        };
    }

    /**
     * Calculate p-value from z-score (approximation)
     */
    calculatePValue(z) {
        // Approximation using error function
        const t = 1 / (1 + 0.2316419 * z);
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return p * 2; // Two-tailed test
    }

    /**
     * Pause experiment
     */
    pauseExperiment(experimentId) {
        const experiment = this.experiments.get(experimentId);
        if (experiment) {
            experiment.status = 'paused';
            this.saveToStorage();
        }
    }

    /**
     * Resume experiment
     */
    resumeExperiment(experimentId) {
        const experiment = this.experiments.get(experimentId);
        if (experiment) {
            experiment.status = 'active';
            this.saveToStorage();
        }
    }

    /**
     * Complete experiment
     */
    completeExperiment(experimentId) {
        const experiment = this.experiments.get(experimentId);
        if (experiment) {
            experiment.status = 'completed';
            experiment.endDate = Date.now();
            this.saveToStorage();
        }
    }

    /**
     * Delete experiment
     */
    deleteExperiment(experimentId) {
        this.experiments.delete(experimentId);
        this.results.delete(experimentId);

        // Remove assignments
        const keysToDelete = [];
        this.assignments.forEach((variant, key) => {
            if (key.startsWith(`${experimentId}:`)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.assignments.delete(key));

        this.saveToStorage();
    }

    /**
     * Get all experiments
     */
    getAllExperiments() {
        return Array.from(this.experiments.values());
    }

    /**
     * Get active experiments
     */
    getActiveExperiments() {
        return Array.from(this.experiments.values()).filter(e => e.status === 'active');
    }

    /**
     * Feature flag (simple variant of A/B testing)
     */
    isFeatureEnabled(featureName, userId = null) {
        const experiment = this.experiments.get(featureName);

        if (!experiment) return false;

        const variant = this.getVariant(featureName, userId);

        return variant && variant.enabled === true;
    }

    /**
     * Set feature flag
     */
    setFeatureFlag(featureName, enabled = true, trafficAllocation = 100) {
        this.createExperiment(featureName, {
            name: featureName,
            description: `Feature flag for ${featureName}`,
            variants: [
                { id: 'control', name: 'Control', weight: 100 - trafficAllocation, enabled: false },
                { id: 'enabled', name: 'Enabled', weight: trafficAllocation, enabled: true }
            ],
            trafficAllocation: 100
        });
    }

    /**
     * Save to storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            const data = {
                experiments: Array.from(this.experiments.entries()),
                assignments: Array.from(this.assignments.entries()),
                results: Array.from(this.results.entries())
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save A/B test data:', e.message);
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
                this.experiments = new Map(data.experiments || []);
                this.assignments = new Map(data.assignments || []);
                this.results = new Map(data.results || []);
            }
        } catch (e) {
            console.warn('Failed to load A/B test data:', e.message);
        }
    }

    /**
     * Clear all data
     */
    clearData() {
        this.experiments.clear();
        this.assignments.clear();
        this.results.clear();

        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Export experiment data
     */
    export() {
        const experiments = {};

        this.experiments.forEach((experiment, id) => {
            experiments[id] = {
                experiment,
                results: this.getResults(id)
            };
        });

        return experiments;
    }

    /**
     * Enable A/B testing
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable A/B testing
     */
    disable() {
        this.enabled = false;
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

// Global instance
window.ABTestingManager = ABTestingManager;
