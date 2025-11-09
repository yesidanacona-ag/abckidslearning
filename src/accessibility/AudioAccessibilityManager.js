// ================================
// AUDIO ACCESSIBILITY MANAGER
// Audio descriptions, captions, announcements
// Accessibility - Fase 5 ($15K)
// ================================

class AudioAccessibilityManager {
    constructor() {
        this.modes = {
            audioDescriptions: false,
            captions: true, // Default on for accessibility
            audioAnnouncements: true,
            textToSpeech: false
        };

        this.volume = {
            master: 1.0,
            effects: 1.0,
            music: 0.7,
            voice: 1.0
        };

        // Caption display
        this.captionElement = null;
        this.currentCaption = null;
        this.captionQueue = [];

        // Audio description queue
        this.descriptionQueue = [];
        this.isDescribing = false;

        // Text-to-speech
        this.ttsEnabled = false;
        this.ttsVoice = null;
        this.ttsRate = 1.0;
        this.ttsPitch = 1.0;

        this.init();
    }

    init() {
        this.createCaptionElement();
        this.setupTextToSpeech();
        this.setupEventListeners();
        console.log('✅ AudioAccessibilityManager initialized');
    }

    /**
     * Create caption display element
     */
    createCaptionElement() {
        if (typeof document === 'undefined') return;

        // Check if already exists
        if (document.getElementById('accessibility-captions')) {
            this.captionElement = document.getElementById('accessibility-captions');
            return;
        }

        const captions = document.createElement('div');
        captions.id = 'accessibility-captions';
        captions.className = 'accessibility-captions';
        captions.setAttribute('role', 'status');
        captions.setAttribute('aria-live', 'polite');
        captions.setAttribute('aria-atomic', 'true');

        document.body.appendChild(captions);
        this.captionElement = captions;

        // Add styles
        this.addCaptionStyles();
    }

    /**
     * Add caption styles
     */
    addCaptionStyles() {
        if (typeof document === 'undefined') return;

        const style = document.createElement('style');
        style.id = 'audio-accessibility-styles';
        style.textContent = `
            .accessibility-captions {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                max-width: 80%;
                background: rgba(0, 0, 0, 0.85);
                color: #fff;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 500;
                text-align: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                line-height: 1.4;
            }

            .accessibility-captions.active {
                opacity: 1;
            }

            .accessibility-captions.large-text {
                font-size: 1.4rem;
                padding: 16px 24px;
            }

            /* High contrast mode */
            body.high-contrast .accessibility-captions {
                background: #000;
                border: 2px solid #fff;
                color: #fff;
            }

            /* Caption speakers (for multi-speaker content) */
            .caption-speaker {
                color: #FFD700;
                font-weight: 700;
                margin-right: 8px;
            }

            /* Audio description indicator */
            .audio-description-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(74, 144, 226, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9rem;
                z-index: 10000;
                display: none;
            }

            .audio-description-indicator.active {
                display: block;
            }
        `;

        if (!document.getElementById('audio-accessibility-styles')) {
            document.head.appendChild(style);
        }
    }

    /**
     * Setup text-to-speech
     */
    setupTextToSpeech() {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('Text-to-speech not supported');
            return;
        }

        // Load voices
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();

            // Prefer Spanish voices
            this.ttsVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    /**
     * Setup event listeners for game events
     */
    setupEventListeners() {
        if (typeof window === 'undefined' || !window.eventBus) return;

        // Game events
        window.eventBus.on('game:answer:correct', () => {
            this.showCaption('¡Respuesta correcta!', 2000);
            if (this.modes.audioAnnouncements) {
                this.speak('¡Respuesta correcta!');
            }
        });

        window.eventBus.on('game:answer:incorrect', () => {
            this.showCaption('Respuesta incorrecta', 2000);
            if (this.modes.audioAnnouncements) {
                this.speak('Respuesta incorrecta. Inténtalo de nuevo.');
            }
        });

        window.eventBus.on('game:level:up', (data) => {
            this.showCaption(`¡Nivel ${data.level}!`, 3000);
            if (this.modes.audioAnnouncements) {
                this.speak(`¡Felicidades! Has alcanzado el nivel ${data.level}`);
            }
        });

        window.eventBus.on('game:achievement:unlocked', (data) => {
            this.showCaption(`Logro desbloqueado: ${data.name}`, 4000);
            if (this.modes.audioAnnouncements) {
                this.speak(`¡Logro desbloqueado! ${data.name}`);
            }
        });

        // Screen changes
        window.eventBus.on('screen:changed', (data) => {
            if (this.modes.audioDescriptions) {
                this.describeScreen(data.screen);
            }
        });

        // Sound effects (add captions for important sounds)
        window.eventBus.on('sound:play', (data) => {
            if (this.modes.captions && data.caption) {
                this.showCaption(data.caption, 1500);
            }
        });
    }

    /**
     * Show caption
     */
    showCaption(text, duration = 3000, speaker = null) {
        if (!this.modes.captions || !this.captionElement) return;

        // Clear current caption
        this.clearCaption();

        // Format with speaker if provided
        let captionHTML = text;
        if (speaker) {
            captionHTML = `<span class="caption-speaker">${speaker}:</span>${text}`;
        }

        this.captionElement.innerHTML = captionHTML;
        this.captionElement.classList.add('active');

        this.currentCaption = setTimeout(() => {
            this.clearCaption();
        }, duration);
    }

    /**
     * Clear current caption
     */
    clearCaption() {
        if (this.currentCaption) {
            clearTimeout(this.currentCaption);
            this.currentCaption = null;
        }

        if (this.captionElement) {
            this.captionElement.classList.remove('active');
        }
    }

    /**
     * Queue caption (for sequential captions)
     */
    queueCaption(text, duration = 3000, speaker = null) {
        this.captionQueue.push({ text, duration, speaker });

        if (!this.currentCaption) {
            this.processNextCaption();
        }
    }

    /**
     * Process next caption in queue
     */
    processNextCaption() {
        if (this.captionQueue.length === 0) return;

        const { text, duration, speaker } = this.captionQueue.shift();
        this.showCaption(text, duration, speaker);

        // Process next after duration
        setTimeout(() => {
            this.processNextCaption();
        }, duration + 200);
    }

    /**
     * Text-to-speech
     */
    speak(text, options = {}) {
        if (!this.modes.textToSpeech || typeof window === 'undefined' || !window.speechSynthesis) {
            return;
        }

        // Cancel current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.ttsVoice;
        utterance.rate = options.rate || this.ttsRate;
        utterance.pitch = options.pitch || this.ttsPitch;
        utterance.volume = this.volume.voice;
        utterance.lang = 'es-ES';

        window.speechSynthesis.speak(utterance);

        // Also show caption
        if (this.modes.captions) {
            this.showCaption(text, text.length * 50); // ~50ms per character
        }
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
    }

    /**
     * Describe screen for audio descriptions
     */
    describeScreen(screenName) {
        const descriptions = {
            welcome: 'Pantalla de bienvenida. Ingresa tu nombre para comenzar.',
            main: 'Pantalla principal. Selecciona un modo de juego: Práctica, Aventura Espacial, Batalla de Jefes, o Galaxia.',
            practice: 'Modo práctica. Selecciona una tabla de multiplicar para practicar.',
            space: 'Modo aventura espacial. Responde preguntas para avanzar por el espacio.',
            boss: 'Modo batalla de jefes. Derrota al jefe respondiendo preguntas correctamente.',
            galaxy: 'Modo galaxia. Explora diferentes planetas y completa desafíos.',
            achievements: 'Pantalla de logros. Aquí puedes ver todos los logros desbloqueados.',
            shop: 'Tienda. Usa tus monedas para comprar objetos y mejoras.',
            stats: 'Estadísticas. Revisa tu progreso y rendimiento.'
        };

        const description = descriptions[screenName] || `Pantalla: ${screenName}`;

        this.queueDescription(description);

        if (this.modes.audioAnnouncements) {
            this.speak(description);
        }
    }

    /**
     * Queue audio description
     */
    queueDescription(description) {
        this.descriptionQueue.push(description);

        if (!this.isDescribing) {
            this.processNextDescription();
        }
    }

    /**
     * Process next description
     */
    async processNextDescription() {
        if (this.descriptionQueue.length === 0) {
            this.isDescribing = false;
            return;
        }

        this.isDescribing = true;
        const description = this.descriptionQueue.shift();

        // Show description indicator
        this.showDescriptionIndicator();

        // Speak description
        if (this.modes.textToSpeech) {
            this.speak(description);

            // Wait for speech to complete
            await new Promise(resolve => {
                setTimeout(resolve, description.length * 50);
            });
        }

        // Hide indicator
        this.hideDescriptionIndicator();

        // Process next
        this.processNextDescription();
    }

    /**
     * Show audio description indicator
     */
    showDescriptionIndicator() {
        if (typeof document === 'undefined') return;

        let indicator = document.getElementById('audio-description-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'audio-description-indicator';
            indicator.className = 'audio-description-indicator';
            indicator.textContent = '🔊 Descripción de audio';
            document.body.appendChild(indicator);
        }

        indicator.classList.add('active');
    }

    /**
     * Hide audio description indicator
     */
    hideDescriptionIndicator() {
        const indicator = document.getElementById('audio-description-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    /**
     * Set audio descriptions mode
     */
    setAudioDescriptions(enabled) {
        this.modes.audioDescriptions = enabled;

        if (window.logger) {
            window.logger.info('Audio descriptions set', { enabled }, 'AudioAccessibilityManager');
        }
    }

    /**
     * Set captions mode
     */
    setCaptions(enabled) {
        this.modes.captions = enabled;

        if (!enabled) {
            this.clearCaption();
        }

        if (window.logger) {
            window.logger.info('Captions set', { enabled }, 'AudioAccessibilityManager');
        }
    }

    /**
     * Set audio announcements mode
     */
    setAudioAnnouncements(enabled) {
        this.modes.audioAnnouncements = enabled;

        if (!enabled) {
            this.stopSpeaking();
        }

        if (window.logger) {
            window.logger.info('Audio announcements set', { enabled }, 'AudioAccessibilityManager');
        }
    }

    /**
     * Set text-to-speech mode
     */
    setTextToSpeech(enabled) {
        this.modes.textToSpeech = enabled;
        this.ttsEnabled = enabled;

        if (!enabled) {
            this.stopSpeaking();
        }

        if (window.logger) {
            window.logger.info('Text-to-speech set', { enabled }, 'AudioAccessibilityManager');
        }
    }

    /**
     * Set TTS rate
     */
    setTTSRate(rate) {
        this.ttsRate = Math.max(0.5, Math.min(2.0, rate));
    }

    /**
     * Set TTS pitch
     */
    setTTSPitch(pitch) {
        this.ttsPitch = Math.max(0.5, Math.min(2.0, pitch));
    }

    /**
     * Set volume
     */
    setVolume(type, volume) {
        if (this.volume[type] !== undefined) {
            this.volume[type] = Math.max(0, Math.min(1, volume));

            // Emit event for sound system
            if (typeof window !== 'undefined' && window.eventBus) {
                window.eventBus.emit('audio:volume:changed', {
                    type,
                    volume: this.volume[type]
                });
            }
        }
    }

    /**
     * Get current modes
     */
    getModes() {
        return { ...this.modes };
    }

    /**
     * Get current volumes
     */
    getVolumes() {
        return { ...this.volume };
    }

    /**
     * Caption game event (for integration with game systems)
     */
    captionGameEvent(eventType, data = {}) {
        const captions = {
            'question:new': `Pregunta: ${data.question}`,
            'answer:correct': '✓ Correcto',
            'answer:incorrect': '✗ Incorrecto',
            'coin:earned': `+${data.amount} monedas`,
            'xp:earned': `+${data.amount} XP`,
            'powerup:used': `Poder usado: ${data.name}`,
            'combo:started': `¡Combo x${data.multiplier}!`,
            'streak:milestone': `¡Racha de ${data.streak}!`
        };

        const caption = captions[eventType];
        if (caption && this.modes.captions) {
            this.showCaption(caption, 2000);
        }
    }

    /**
     * Announce game state (for screen readers)
     */
    announceGameState(state) {
        if (!this.modes.audioAnnouncements) return;

        const announcements = {
            'game:started': 'Juego iniciado',
            'game:paused': 'Juego pausado',
            'game:resumed': 'Juego reanudado',
            'game:ended': 'Juego terminado',
            'round:started': `Ronda ${state.round} iniciada`,
            'timer:warning': `Quedan ${state.seconds} segundos`,
            'lives:low': `Cuidado, solo quedan ${state.lives} vidas`
        };

        const announcement = announcements[state.type];
        if (announcement) {
            this.speak(announcement);
        }
    }

    /**
     * Clear all captions and queues
     */
    clearAll() {
        this.clearCaption();
        this.captionQueue = [];
        this.descriptionQueue = [];
        this.stopSpeaking();
        this.isDescribing = false;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            modes: this.getModes(),
            volumes: this.getVolumes(),
            captionQueueLength: this.captionQueue.length,
            descriptionQueueLength: this.descriptionQueue.length,
            isDescribing: this.isDescribing,
            ttsSupported: typeof window !== 'undefined' && !!window.speechSynthesis,
            currentVoice: this.ttsVoice ? this.ttsVoice.name : null
        };
    }
}

// Global instance
window.AudioAccessibilityManager = AudioAccessibilityManager;
