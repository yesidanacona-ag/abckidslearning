// ================================
// MATEO EL MAGO - SISTEMA DE MASCOTA
// ================================

class MateoMascot {
    constructor() {
        this.container = document.getElementById('mateoContainer');
        this.image = document.getElementById('mateoImage');
        this.speech = document.getElementById('mateoSpeech');
        this.currentExpression = 'happy';
        this.isVisible = false;
        this.hideTimeout = null;
    }

    // Expresiones disponibles
    expressions = {
        happy: 'assets/characters/mateo-happy.svg',
        celebrating: 'assets/characters/mateo-celebrating.svg',
        thinking: 'assets/characters/mateo-thinking.svg',
        confused: 'assets/characters/mateo-confused.svg',
        teaching: 'assets/characters/mateo-teaching.svg'
    };

    // Mostrar Mateo con una expresión específica
    show(expression = 'happy', message = '', duration = 5000) {
        clearTimeout(this.hideTimeout);

        // Cambiar expresión
        if (this.expressions[expression]) {
            this.currentExpression = expression;
            this.image.src = this.expressions[expression];
        }

        // Mostrar contenedor
        this.container.style.display = 'block';
        this.container.classList.remove('hide');
        this.container.classList.add('show');
        this.isVisible = true;

        // Mostrar mensaje si existe
        if (message) {
            this.speak(message);
        }

        // Auto-ocultar después de duración
        if (duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, duration);
        }
    }

    // Ocultar Mateo
    hide() {
        clearTimeout(this.hideTimeout);
        this.container.classList.remove('show');
        this.container.classList.add('hide');
        this.speech.classList.remove('show');
        this.isVisible = false;

        setTimeout(() => {
            if (!this.isVisible) {
                this.container.style.display = 'none';
            }
        }, 400);
    }

    // Hacer que Mateo "hable"
    speak(message, duration = 4000) {
        this.speech.textContent = message;
        this.speech.classList.add('show');

        if (duration > 0) {
            setTimeout(() => {
                this.speech.classList.remove('show');
            }, duration);
        }
    }

    // Reacciones específicas para eventos

    onCorrectAnswer(streak = 1) {
        const messages = [
            "¡Excelente! 🌟",
            "¡Muy bien! Sigue así 🎉",
            "¡Perfecto! Eres un genio 🧙‍♂️",
            "¡Increíble! Lo estás dominando ⚡",
            "¡Bravo! Sigue con ese ritmo 🚀"
        ];

        if (streak >= 5) {
            this.show('celebrating', `¡RACHA DE ${streak}! 🔥 ¡Imparable!`, 4000);
        } else {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.show('happy', randomMessage, 3000);
        }
    }

    onIncorrectAnswer(showExplanation = false) {
        const messages = [
            "No te preocupes, ¡sigue intentando! 💪",
            "¡Casi! Inténtalo de nuevo 🎯",
            "No pasa nada, aprenderás rápido 📚",
            "¡Tú puedes! Vamos otra vez 🌟"
        ];

        if (showExplanation) {
            this.show('teaching', "Déjame explicarte... 📝", 5000);
        } else {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.show('confused', randomMessage, 3000);
        }
    }

    onPowerUpUsed(type) {
        const messages = {
            shield: "¡Escudo activado! Estás protegido 🛡️",
            hint: "Mira la respuesta destacada 💡",
            skip: "¡Saltemos esta! ⏭️"
        };

        this.show('thinking', messages[type] || "¡Power-up activado!", 3000);
    }

    onLevelUp(newLevel) {
        this.show('celebrating', `¡NIVEL ${newLevel}! 👑 ¡Sigues creciendo!`, 5000);
    }

    onAchievementUnlocked(achievementName) {
        this.show('celebrating', `¡Logro desbloqueado: ${achievementName}! 🏆`, 5000);
    }

    onTutorialStep(message) {
        this.show('teaching', message, 0); // No auto-ocultar en tutorial
    }

    onGameStart(modeName) {
        const messages = {
            practice: "¡Vamos a practicar juntos! 📚",
            challenge: "¡Prepárate para el desafío! ⚡",
            adventure: "¡A explorar el espacio! 🚀",
            race: "¡Que gane el mejor! 🏁",
            boss: "¡Hora de la batalla! ⚔️"
        };

        this.show('happy', messages[modeName] || "¡Comencemos!", 4000);
    }

    onGameEnd(won = true, score = 0) {
        if (won) {
            this.show('celebrating', `¡Victoria! Puntuación: ${score} 🎉`, 6000);
        } else {
            this.show('thinking', `Puntuación: ${score}. ¡Sigue practicando! 💪`, 5000);
        }
    }

    // Mensajes de ánimo aleatorios
    showEncouragement() {
        const messages = [
            "¡Recuerda respirar profundo! 😌",
            "¡Tómate tu tiempo! ⏰",
            "¡Cada error es una oportunidad! 📈",
            "¡La práctica hace al maestro! 🎓",
            "¡Confía en ti! Sabes más de lo que crees 💭"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.show('happy', randomMessage, 4000);
    }

    // Consejos sobre trucos mnemotécnicos
    showTrickHint(table) {
        const hints = {
            2: "¡La tabla del 2 es como duplicar! 👯",
            3: "¡La tabla del 3 es como tríos! 🎭",
            5: "¡La tabla del 5 termina en 0 o 5! 🖐️",
            9: "¡El truco del 9 con los dedos es mágico! ✋",
            10: "¡La tabla del 10 es solo agregar un 0! 🔟"
        };

        const hint = hints[table] || "¿Quieres ver un truco? Presiona el botón de trucos 📚";
        this.show('thinking', hint, 5000);
    }
}

// Crear instancia global
window.mateoMascot = new MateoMascot();
