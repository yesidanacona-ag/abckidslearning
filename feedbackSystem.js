// ================================
// SISTEMA DE FEEDBACK INMEDIATO
// ================================

class FeedbackSystem {
    constructor() {
        this.isProcessingFeedback = false;
        this.confettiParticles = [];
        console.log('✨ Sistema de feedback inicializado');
    }

    // =============================
    // RESPUESTA CORRECTA
    // =============================

    async showCorrectFeedback(element, points = 10) {
        if (this.isProcessingFeedback) return;
        this.isProcessingFeedback = true;

        console.log('✅ Feedback: Respuesta correcta');

        // 1. Efecto visual en el elemento
        if (element) {
            element.classList.add('feedback-correct');

            // Escala y brillo
            element.style.transform = 'scale(1.1)';
            element.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.8)';
        }

        // 2. Sonido
        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        // 3. Confeti explosion
        this.triggerConfetti(element);

        // 4. Monedas (si hay sistema de monedas)
        if (window.coinSystem && element) {
            window.coinSystem.addStars(points, element);
        }

        // 5. Pausa breve para que se vea el efecto
        await this.delay(200);

        // 6. Limpiar efectos
        if (element) {
            element.classList.remove('feedback-correct');
            element.style.transform = '';
            element.style.boxShadow = '';
        }

        this.isProcessingFeedback = false;
    }

    // =============================
    // RESPUESTA INCORRECTA
    // =============================

    async showIncorrectFeedback(wrongElement, correctAnswer = null) {
        if (this.isProcessingFeedback) return;
        this.isProcessingFeedback = true;

        console.log('❌ Feedback: Respuesta incorrecta');

        // 1. Sonido
        if (window.soundSystem) {
            window.soundSystem.playWrong();
        }

        // 2. Shake effect en elemento incorrecto
        if (wrongElement) {
            wrongElement.classList.add('feedback-shake');
            wrongElement.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }

        // 3. Esperar que termine el shake
        await this.delay(600);

        // 4. Mostrar respuesta correcta si se proporciona
        if (correctAnswer !== null) {
            const correctElement = this.findCorrectAnswerElement(correctAnswer);

            if (correctElement) {
                correctElement.classList.add('feedback-show-correct');
                correctElement.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                correctElement.style.transform = 'scale(1.1)';
                correctElement.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.8)';

                // Agregar indicador visual
                const indicator = document.createElement('div');
                indicator.className = 'correct-answer-indicator';
                indicator.innerHTML = '✓ Correcta';
                correctElement.appendChild(indicator);
            }
        }

        // 5. Pausa de 2 segundos para que vean la respuesta correcta
        await this.delay(2000);

        // 6. Limpiar efectos
        if (wrongElement) {
            wrongElement.classList.remove('feedback-shake');
            wrongElement.style.background = '';
        }

        const correctElement = this.findCorrectAnswerElement(correctAnswer);
        if (correctElement) {
            correctElement.classList.remove('feedback-show-correct');
            correctElement.style.background = '';
            correctElement.style.transform = '';
            correctElement.style.boxShadow = '';

            const indicator = correctElement.querySelector('.correct-answer-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        this.isProcessingFeedback = false;
    }

    // =============================
    // CONFETI
    // =============================

    triggerConfetti(sourceElement = null) {
        console.log('🎉 Confeti: Iniciando explosión');

        // Determinar posición de origen
        let centerX, centerY;

        if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        } else {
            centerX = window.innerWidth / 2;
            centerY = window.innerHeight / 2;
        }

        // Crear partículas
        const particleCount = 30;
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

        for (let i = 0; i < particleCount; i++) {
            this.createConfettiParticle(centerX, centerY, colors[i % colors.length]);
        }
    }

    createConfettiParticle(centerX, centerY, color) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.background = color;

        // Variación aleatoria
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 200;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 150; // Bias hacia arriba

        particle.style.setProperty('--vx', `${vx}px`);
        particle.style.setProperty('--vy', `${vy}px`);
        particle.style.setProperty('--rotation', `${Math.random() * 720}deg`);
        particle.style.setProperty('--duration', `${0.8 + Math.random() * 0.4}s`);

        document.body.appendChild(particle);

        // Iniciar animación
        setTimeout(() => {
            particle.classList.add('confetti-explode');
        }, 10);

        // Eliminar después de la animación
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }

    // =============================
    // UTILIDADES
    // =============================

    findCorrectAnswerElement(correctAnswer) {
        // Buscar en las opciones de respuesta actuales
        const options = document.querySelectorAll('.answer-option');

        for (const option of options) {
            const optionText = option.textContent.trim();
            if (optionText === String(correctAnswer) || optionText === correctAnswer) {
                return option;
            }
        }

        return null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // =============================
    // FEEDBACK GENÉRICO
    // =============================

    async showFeedback(isCorrect, element, correctAnswer = null, points = 10) {
        if (isCorrect) {
            await this.showCorrectFeedback(element, points);
        } else {
            await this.showIncorrectFeedback(element, correctAnswer);
        }
    }

    // =============================
    // FEEDBACK PARA NIVEL COMPLETADO
    // =============================

    showLevelCompleteFeedback(stars = 3, bonus = 50) {
        console.log('🎊 Feedback: Nivel completado');

        // Confeti masivo desde múltiples puntos
        const positions = [
            { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 },
            { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
            { x: window.innerWidth * 0.75, y: window.innerHeight * 0.3 }
        ];

        positions.forEach(pos => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    this.triggerConfetti({ getBoundingClientRect: () => ({
                        left: pos.x,
                        top: pos.y,
                        width: 0,
                        height: 0
                    })});
                }, i * 50);
            }
        });

        // Sonido de victoria
        if (window.soundSystem) {
            window.soundSystem.playLevelComplete();
        }

        // Bonus de estrellas
        if (window.coinSystem && bonus > 0) {
            setTimeout(() => {
                window.coinSystem.addStars(bonus, {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                });
            }, 500);
        }
    }

    // =============================
    // RESET
    // =============================

    reset() {
        this.isProcessingFeedback = false;
        this.confettiParticles = [];

        // Limpiar todos los elementos de feedback activos
        document.querySelectorAll('.confetti-particle').forEach(el => el.remove());
        document.querySelectorAll('.correct-answer-indicator').forEach(el => el.remove());

        console.log('🔄 Sistema de feedback reseteado');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

// Crear instancia global del sistema de feedback
window.feedbackSystem = new FeedbackSystem();

console.log('✨ Sistema de feedback listo');
