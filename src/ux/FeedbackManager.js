// ================================
// FEEDBACK MANAGER
// User feedback collection, surveys, NPS, bug reports
// UX Research - Fase 4 ($10K)
// ================================

class FeedbackManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;

        // Feedback storage
        this.feedback = [];
        this.surveys = new Map();
        this.surveyResponses = new Map();

        // Bug reports
        this.bugReports = [];

        // NPS tracking
        this.npsScores = [];

        // Feedback widget
        this.widgetVisible = false;
        this.widgetElement = null;

        // Storage
        this.storageKey = 'mm_feedback';
        this.maxFeedback = 100;

        // Timing
        this.lastPrompt = null;
        this.promptCooldown = 24 * 60 * 60 * 1000; // 24 hours

        this.init();
    }

    init() {
        if (!this.enabled) return;

        this.loadStoredData();
        this.createFeedbackWidget();
        this.setupEventTracking();

        console.log('✅ FeedbackManager initialized');
    }

    /**
     * Create feedback widget
     */
    createFeedbackWidget() {
        if (typeof document === 'undefined') return;

        // Check if already exists
        if (document.getElementById('feedback-widget')) {
            this.widgetElement = document.getElementById('feedback-widget');
            return;
        }

        const widget = document.createElement('div');
        widget.id = 'feedback-widget';
        widget.className = 'feedback-widget';
        widget.innerHTML = `
            <button class="feedback-trigger" id="feedback-trigger" aria-label="Enviar comentarios">
                💬
            </button>
            <div class="feedback-panel" id="feedback-panel" style="display: none;">
                <div class="feedback-header">
                    <h3>Tu opinión importa</h3>
                    <button class="feedback-close" id="feedback-close" aria-label="Cerrar">×</button>
                </div>
                <div class="feedback-content">
                    <div class="feedback-tabs">
                        <button class="feedback-tab active" data-tab="general">General</button>
                        <button class="feedback-tab" data-tab="bug">Reportar Bug</button>
                        <button class="feedback-tab" data-tab="nps">Recomendar</button>
                    </div>

                    <!-- General Feedback -->
                    <div class="feedback-tab-content active" id="tab-general">
                        <label for="feedback-type">Tipo de comentario:</label>
                        <select id="feedback-type">
                            <option value="suggestion">Sugerencia</option>
                            <option value="compliment">Felicitación</option>
                            <option value="complaint">Queja</option>
                            <option value="question">Pregunta</option>
                        </select>

                        <label for="feedback-message">Mensaje:</label>
                        <textarea id="feedback-message" rows="4" placeholder="Cuéntanos tu experiencia..."></textarea>

                        <label for="feedback-email">Email (opcional):</label>
                        <input type="email" id="feedback-email" placeholder="tu@email.com">

                        <button class="feedback-submit" id="feedback-submit-general">Enviar</button>
                    </div>

                    <!-- Bug Report -->
                    <div class="feedback-tab-content" id="tab-bug">
                        <label for="bug-title">Título del problema:</label>
                        <input type="text" id="bug-title" placeholder="Describe el problema brevemente">

                        <label for="bug-description">Descripción detallada:</label>
                        <textarea id="bug-description" rows="4" placeholder="¿Qué estabas haciendo cuando ocurrió el error?"></textarea>

                        <label for="bug-severity">Gravedad:</label>
                        <select id="bug-severity">
                            <option value="low">Baja - Molestia menor</option>
                            <option value="medium">Media - Afecta funcionalidad</option>
                            <option value="high">Alta - Bloquea uso</option>
                            <option value="critical">Crítica - App no funciona</option>
                        </select>

                        <button class="feedback-submit" id="feedback-submit-bug">Reportar Bug</button>
                    </div>

                    <!-- NPS -->
                    <div class="feedback-tab-content" id="tab-nps">
                        <p>¿Qué tan probable es que recomiendes Multiplicar Mágico a un amigo?</p>
                        <div class="nps-scale">
                            ${Array.from({length: 11}, (_, i) => `
                                <button class="nps-score" data-score="${i}">${i}</button>
                            `).join('')}
                        </div>
                        <div class="nps-labels">
                            <span>Nada probable</span>
                            <span>Muy probable</span>
                        </div>
                        <div id="nps-followup" style="display: none;">
                            <label>¿Por qué elegiste esta puntuación?</label>
                            <textarea id="nps-reason" rows="3"></textarea>
                            <button class="feedback-submit" id="feedback-submit-nps">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.widgetElement = widget;

        // Add styles
        this.addFeedbackStyles();

        // Setup event listeners
        this.setupWidgetListeners();
    }

    /**
     * Add feedback widget styles
     */
    addFeedbackStyles() {
        if (typeof document === 'undefined') return;

        const style = document.createElement('style');
        style.id = 'feedback-widget-styles';
        style.textContent = `
            .feedback-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
            }

            .feedback-trigger {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            }

            .feedback-trigger:hover {
                transform: scale(1.1);
            }

            .feedback-panel {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 400px;
                max-width: calc(100vw - 40px);
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                overflow: hidden;
            }

            .feedback-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .feedback-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .feedback-close {
                background: none;
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
            }

            .feedback-content {
                padding: 16px;
            }

            .feedback-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                border-bottom: 2px solid #e0e0e0;
            }

            .feedback-tab {
                flex: 1;
                padding: 8px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                margin-bottom: -2px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .feedback-tab.active {
                border-bottom-color: #667eea;
                color: #667eea;
                font-weight: 600;
            }

            .feedback-tab-content {
                display: none;
            }

            .feedback-tab-content.active {
                display: block;
            }

            .feedback-tab-content label {
                display: block;
                margin: 12px 0 4px;
                font-weight: 600;
                font-size: 14px;
            }

            .feedback-tab-content input,
            .feedback-tab-content select,
            .feedback-tab-content textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-family: inherit;
                font-size: 14px;
            }

            .feedback-submit {
                width: 100%;
                padding: 12px;
                margin-top: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .feedback-submit:hover {
                opacity: 0.9;
            }

            .nps-scale {
                display: flex;
                gap: 4px;
                margin: 16px 0 8px;
            }

            .nps-score {
                flex: 1;
                padding: 12px 4px;
                background: #f0f0f0;
                border: 2px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.2s;
            }

            .nps-score:hover {
                background: #e0e0e0;
            }

            .nps-score.selected {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .nps-labels {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #666;
            }

            @media (max-width: 500px) {
                .feedback-panel {
                    width: calc(100vw - 40px);
                }

                .nps-score {
                    padding: 8px 2px;
                    font-size: 14px;
                }
            }
        `;

        if (!document.getElementById('feedback-widget-styles')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Setup widget event listeners
     */
    setupWidgetListeners() {
        if (!this.widgetElement) return;

        // Toggle panel
        const trigger = this.widgetElement.querySelector('#feedback-trigger');
        const panel = this.widgetElement.querySelector('#feedback-panel');
        const close = this.widgetElement.querySelector('#feedback-close');

        trigger.addEventListener('click', () => {
            this.toggleWidget();
        });

        close.addEventListener('click', () => {
            this.hideWidget();
        });

        // Tab switching
        const tabs = this.widgetElement.querySelectorAll('.feedback-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // General feedback submit
        const submitGeneral = this.widgetElement.querySelector('#feedback-submit-general');
        submitGeneral.addEventListener('click', () => {
            this.submitGeneralFeedback();
        });

        // Bug report submit
        const submitBug = this.widgetElement.querySelector('#feedback-submit-bug');
        submitBug.addEventListener('click', () => {
            this.submitBugReport();
        });

        // NPS score selection
        const npsButtons = this.widgetElement.querySelectorAll('.nps-score');
        npsButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectNPSScore(parseInt(button.dataset.score));
            });
        });

        // NPS submit
        const submitNPS = this.widgetElement.querySelector('#feedback-submit-nps');
        submitNPS.addEventListener('click', () => {
            this.submitNPS();
        });
    }

    /**
     * Setup event tracking for automatic prompts
     */
    setupEventTracking() {
        if (typeof window === 'undefined' || !window.eventBus) return;

        // Prompt for feedback after significant events
        window.eventBus.on('game:level:up', (data) => {
            if (data.level % 5 === 0) { // Every 5 levels
                this.promptForFeedback('Congratulations on reaching level ' + data.level + '!');
            }
        });

        window.eventBus.on('achievement:unlocked', () => {
            // Occasional prompt after achievements
            if (Math.random() < 0.1) { // 10% chance
                this.promptForFeedback('You just unlocked an achievement!');
            }
        });
    }

    /**
     * Toggle widget visibility
     */
    toggleWidget() {
        if (this.widgetVisible) {
            this.hideWidget();
        } else {
            this.showWidget();
        }
    }

    /**
     * Show widget
     */
    showWidget() {
        if (!this.widgetElement) return;

        const panel = this.widgetElement.querySelector('#feedback-panel');
        panel.style.display = 'block';
        this.widgetVisible = true;

        // Track interaction
        if (window.eventBus) {
            window.eventBus.emit('feedback:widget:opened');
        }
    }

    /**
     * Hide widget
     */
    hideWidget() {
        if (!this.widgetElement) return;

        const panel = this.widgetElement.querySelector('#feedback-panel');
        panel.style.display = 'none';
        this.widgetVisible = false;
    }

    /**
     * Switch tab
     */
    switchTab(tabName) {
        if (!this.widgetElement) return;

        // Update tab buttons
        const tabs = this.widgetElement.querySelectorAll('.feedback-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab content
        const contents = this.widgetElement.querySelectorAll('.feedback-tab-content');
        contents.forEach(content => {
            if (content.id === `tab-${tabName}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    /**
     * Submit general feedback
     */
    submitGeneralFeedback() {
        if (!this.widgetElement) return;

        const type = this.widgetElement.querySelector('#feedback-type').value;
        const message = this.widgetElement.querySelector('#feedback-message').value;
        const email = this.widgetElement.querySelector('#feedback-email').value;

        if (!message.trim()) {
            alert('Por favor escribe un mensaje');
            return;
        }

        this.submitFeedback({
            type,
            message,
            email: email || null,
            category: 'general'
        });

        // Clear form
        this.widgetElement.querySelector('#feedback-message').value = '';
        this.widgetElement.querySelector('#feedback-email').value = '';

        this.showThankYou();
    }

    /**
     * Submit bug report
     */
    submitBugReport() {
        if (!this.widgetElement) return;

        const title = this.widgetElement.querySelector('#bug-title').value;
        const description = this.widgetElement.querySelector('#bug-description').value;
        const severity = this.widgetElement.querySelector('#bug-severity').value;

        if (!title.trim() || !description.trim()) {
            alert('Por favor completa todos los campos');
            return;
        }

        const bugReport = {
            title,
            description,
            severity,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            url: window.location.href
        };

        this.bugReports.push(bugReport);
        this.trimBugReports();
        this.saveToStorage();

        // Clear form
        this.widgetElement.querySelector('#bug-title').value = '';
        this.widgetElement.querySelector('#bug-description').value = '';

        this.showThankYou('Gracias por reportar el bug. Lo revisaremos pronto.');

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('feedback:bug:reported', bugReport);
        }
    }

    /**
     * Select NPS score
     */
    selectNPSScore(score) {
        if (!this.widgetElement) return;

        this.selectedNPSScore = score;

        // Highlight selected score
        const buttons = this.widgetElement.querySelectorAll('.nps-score');
        buttons.forEach(button => {
            if (parseInt(button.dataset.score) === score) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });

        // Show follow-up
        const followup = this.widgetElement.querySelector('#nps-followup');
        followup.style.display = 'block';
    }

    /**
     * Submit NPS
     */
    submitNPS() {
        if (!this.widgetElement || this.selectedNPSScore === undefined) return;

        const reason = this.widgetElement.querySelector('#nps-reason').value;

        const npsData = {
            score: this.selectedNPSScore,
            reason,
            timestamp: Date.now(),
            category: this.getNPSCategory(this.selectedNPSScore)
        };

        this.npsScores.push(npsData);
        this.saveToStorage();

        // Clear
        this.selectedNPSScore = undefined;
        this.widgetElement.querySelector('#nps-reason').value = '';
        this.widgetElement.querySelector('#nps-followup').style.display = 'none';

        const buttons = this.widgetElement.querySelectorAll('.nps-score');
        buttons.forEach(button => button.classList.remove('selected'));

        this.showThankYou('¡Gracias por tu opinión!');

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('feedback:nps:submitted', npsData);
        }
    }

    /**
     * Get NPS category
     */
    getNPSCategory(score) {
        if (score >= 9) return 'promoter';
        if (score >= 7) return 'passive';
        return 'detractor';
    }

    /**
     * Submit feedback
     */
    submitFeedback(feedbackData) {
        const feedback = {
            ...feedbackData,
            timestamp: Date.now(),
            id: this.generateFeedbackId()
        };

        this.feedback.push(feedback);
        this.trimFeedback();
        this.saveToStorage();

        if (window.logger) {
            window.logger.info('Feedback submitted', feedback, 'FeedbackManager');
        }

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('feedback:submitted', feedback);
        }

        return feedback;
    }

    /**
     * Show thank you message
     */
    showThankYou(message = '¡Gracias por tus comentarios!') {
        if (!this.widgetElement) return;

        const content = this.widgetElement.querySelector('.feedback-content');
        const originalContent = content.innerHTML;

        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h3>${message}</h3>
                <p style="color: #666;">Tu opinión nos ayuda a mejorar.</p>
            </div>
        `;

        setTimeout(() => {
            content.innerHTML = originalContent;
            this.setupWidgetListeners();
            this.hideWidget();
        }, 3000);
    }

    /**
     * Prompt for feedback (after significant events)
     */
    promptForFeedback(context = '') {
        // Check cooldown
        if (this.lastPrompt && Date.now() - this.lastPrompt < this.promptCooldown) {
            return;
        }

        this.lastPrompt = Date.now();

        // Show widget with context
        this.showWidget();

        if (window.logger) {
            window.logger.info('Feedback prompted', { context }, 'FeedbackManager');
        }
    }

    /**
     * Create survey
     */
    createSurvey(surveyId, config) {
        const survey = {
            id: surveyId,
            name: config.name,
            questions: config.questions,
            createdAt: Date.now(),
            active: true
        };

        this.surveys.set(surveyId, survey);
        this.surveyResponses.set(surveyId, []);

        return survey;
    }

    /**
     * Submit survey response
     */
    submitSurveyResponse(surveyId, responses) {
        const survey = this.surveys.get(surveyId);
        if (!survey) return null;

        const response = {
            surveyId,
            responses,
            timestamp: Date.now()
        };

        const surveyResponses = this.surveyResponses.get(surveyId);
        surveyResponses.push(response);

        this.saveToStorage();

        return response;
    }

    /**
     * Get NPS score
     */
    getNPSScore() {
        if (this.npsScores.length === 0) return null;

        const promoters = this.npsScores.filter(s => s.score >= 9).length;
        const detractors = this.npsScores.filter(s => s.score <= 6).length;
        const total = this.npsScores.length;

        const nps = ((promoters - detractors) / total) * 100;

        return {
            score: Math.round(nps),
            promoters,
            detractors,
            passives: total - promoters - detractors,
            total
        };
    }

    /**
     * Trim feedback
     */
    trimFeedback() {
        if (this.feedback.length > this.maxFeedback) {
            this.feedback = this.feedback.slice(-this.maxFeedback);
        }
    }

    /**
     * Trim bug reports
     */
    trimBugReports() {
        if (this.bugReports.length > 50) {
            this.bugReports = this.bugReports.slice(-50);
        }
    }

    /**
     * Save to storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage === 'undefined') return;

            const data = {
                feedback: this.feedback.slice(-50),
                bugReports: this.bugReports.slice(-20),
                npsScores: this.npsScores.slice(-50),
                lastPrompt: this.lastPrompt
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save feedback data:', e.message);
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
                this.feedback = data.feedback || [];
                this.bugReports = data.bugReports || [];
                this.npsScores = data.npsScores || [];
                this.lastPrompt = data.lastPrompt || null;
            }
        } catch (e) {
            console.warn('Failed to load feedback data:', e.message);
        }
    }

    /**
     * Clear all data
     */
    clearData() {
        this.feedback = [];
        this.bugReports = [];
        this.npsScores = [];
        this.lastPrompt = null;

        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Generate feedback ID
     */
    generateFeedbackId() {
        return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export all feedback data
     */
    export() {
        return {
            feedback: this.feedback,
            bugReports: this.bugReports,
            nps: this.getNPSScore(),
            npsScores: this.npsScores
        };
    }

    /**
     * Enable feedback
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable feedback
     */
    disable() {
        this.enabled = false;
        this.hideWidget();
    }
}

// Global instance
window.FeedbackManager = FeedbackManager;
