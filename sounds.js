// ================================
// SISTEMA DE SONIDOS - MULTIPLICAR MÁGICO
// Web Audio API - Sonidos sintéticos
// ================================

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // Volumen por defecto (30%)
        this.initAudioContext();
        this.loadSoundPreference();
    }

    initAudioContext() {
        try {
            // Safari necesita webkitAudioContext
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API no soportada', e);
            this.enabled = false;
        }
    }

    loadSoundPreference() {
        const saved = localStorage.getItem('soundEnabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    }

    saveSoundPreference() {
        localStorage.setItem('soundEnabled', this.enabled);
    }

    toggle() {
        this.enabled = !this.enabled;
        this.saveSoundPreference();

        if (this.enabled) {
            this.playSuccess();
        }

        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // ================================
    // SONIDO: RESPUESTA CORRECTA ✅
    // ================================
    playSuccess() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Oscillador principal (nota alegre ascendente)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Melodía: Do - Mi - Sol (C - E - G)
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

        osc.type = 'sine';

        // Envelope suave
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    // ================================
    // SONIDO: RESPUESTA INCORRECTA ❌
    // ================================
    playError() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Tono suave, no negativo (no queremos frustrar al niño)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Tono neutro descendente
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3); // A3

        osc.type = 'sine';

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // ================================
    // SONIDO: NIVEL UP 🎉
    // ================================
    playLevelUp() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Fanfarria épica ascendente
        const notes = [
            { freq: 523.25, time: 0 },    // C5
            { freq: 659.25, time: 0.15 },  // E5
            { freq: 783.99, time: 0.3 },   // G5
            { freq: 1046.50, time: 0.45 }  // C6
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(note.freq, now + note.time);
            osc.type = 'triangle';

            const startTime = now + note.time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.5, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // ================================
    // SONIDO: RACHA (COMBO) 🔥
    // ================================
    playStreak(streakCount) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Sonido más intenso según la racha
        const intensity = Math.min(streakCount / 10, 1);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Frecuencia más alta con mayor racha
        const baseFreq = 800 + (streakCount * 50);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

        osc.type = 'square';

        const vol = this.volume * (0.3 + intensity * 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // ================================
    // SONIDO: CONFETTI/CELEBRACIÓN 🎊
    // ================================
    playConfetti() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Múltiples tonos aleatorios (efecto de cascada)
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                const freq = 400 + Math.random() * 800;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(this.volume * 0.15, ctx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
            }, i * 50);
        }
    }

    // ================================
    // SONIDO: ESTRELLA/PUNTO ⭐
    // ================================
    playStar() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Tono brillante corto
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // ================================
    // SONIDO: CLICK/TAP 👆
    // ================================
    playClick() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(800, now);
        osc.type = 'sine';

        gain.gain.setValueAtTime(this.volume * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // ================================
    // SONIDO: COUNTDOWN (3, 2, 1) ⏱️
    // ================================
    playCountdown(number) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Frecuencia según el número
        const freq = number === 0 ? 1000 : 600; // Más alto en "¡YA!"
        osc.frequency.setValueAtTime(freq, now);
        osc.type = number === 0 ? 'square' : 'sine';

        const duration = number === 0 ? 0.3 : 0.15;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    // ================================
    // SONIDO: POWER-UP 💫
    // ================================
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Arpeggio ascendente rápido
        const notes = [262, 330, 392, 523]; // C-E-G-C

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.05);
            osc.frequency.setValueAtTime(freq, startTime);
            osc.type = 'square';

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    // ================================
    // SONIDO: VICTORIA/WIN 🏆
    // ================================
    playVictory() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Melodía de victoria épica
        const melody = [
            { freq: 523.25, time: 0 },     // C5
            { freq: 659.25, time: 0.15 },  // E5
            { freq: 783.99, time: 0.3 },   // G5
            { freq: 1046.50, time: 0.45 }, // C6
            { freq: 783.99, time: 0.6 },   // G5
            { freq: 1046.50, time: 0.75 }  // C6
        ];

        melody.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + note.time;
            osc.frequency.setValueAtTime(note.freq, startTime);
            osc.type = 'triangle';

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    // ================================
    // SONIDO: NOTIFICACIÓN 🔔
    // ================================
    playNotification() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Dos tonos rápidos (ding-dong)
        [880, 660].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.1);
            osc.frequency.setValueAtTime(freq, startTime);
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }

    playPowerup() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Sonido mágico ascendente: C - E - G - C (octava superior)
        const frequencies = [261.63, 329.63, 392.00, 523.25];

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.Q.setValueAtTime(1, now);

            const startTime = now + (i * 0.1);
            osc.frequency.setValueAtTime(freq, startTime);
            osc.type = 'triangle';

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
}

// ================================
// CREAR INSTANCIA GLOBAL
// ================================
window.soundSystem = new SoundSystem();

// Log de carga
console.log('🔊 Sistema de sonidos cargado:', window.soundSystem.enabled ? 'Activado' : 'Desactivado');
