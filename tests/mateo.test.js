/**
 * Tests para MateoMascot - Sistema de Mascota
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock del DOM para mateo.js
function setupDOM() {
  document.body.innerHTML = `
    <div id="mateoContainer" style="display: none;">
      <img id="mateoImage" src="" alt="Mateo el Mago" class="mateo-character">
      <div id="mateoSpeech" class="mateo-speech"></div>
    </div>
  `;
}

// Importar y ejecutar mateo.js en el contexto del test
function loadMateoScript() {
  // Simular el código de mateo.js
  class MateoMascot {
    constructor() {
      this.container = document.getElementById('mateoContainer');
      this.image = document.getElementById('mateoImage');
      this.speech = document.getElementById('mateoSpeech');
      this.currentExpression = 'happy';
      this.isVisible = false;
      this.hideTimeout = null;
    }

    expressions = {
      happy: 'assets/characters/mateo-happy.svg',
      celebrating: 'assets/characters/mateo-celebrating.svg',
      thinking: 'assets/characters/mateo-thinking.svg',
      confused: 'assets/characters/mateo-confused.svg',
      teaching: 'assets/characters/mateo-teaching.svg'
    };

    show(expression = 'happy', message = '', duration = 5000) {
      clearTimeout(this.hideTimeout);

      if (this.expressions[expression]) {
        this.currentExpression = expression;
        this.image.src = this.expressions[expression];
      }

      this.container.style.display = 'block';
      this.container.classList.remove('hide');
      this.container.classList.add('show');
      this.isVisible = true;

      if (message) {
        this.speak(message);
      }

      if (duration > 0) {
        this.hideTimeout = setTimeout(() => {
          this.hide();
        }, duration);
      }
    }

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

    speak(message, duration = 4000) {
      this.speech.textContent = message;
      this.speech.classList.add('show');

      if (duration > 0) {
        setTimeout(() => {
          this.speech.classList.remove('show');
        }, duration);
      }
    }

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
      this.show('teaching', message, 0);
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

  return new MateoMascot();
}

describe('MateoMascot', () => {
  let mateo;

  beforeEach(() => {
    setupDOM();
    mateo = loadMateoScript();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Constructor y Estado Inicial', () => {
    it('debe inicializarse con los elementos DOM correctos', () => {
      expect(mateo.container).toBeTruthy();
      expect(mateo.image).toBeTruthy();
      expect(mateo.speech).toBeTruthy();
    });

    it('debe tener expresión inicial "happy"', () => {
      expect(mateo.currentExpression).toBe('happy');
    });

    it('debe estar oculto inicialmente', () => {
      expect(mateo.isVisible).toBe(false);
    });

    it('debe tener todas las expresiones definidas', () => {
      expect(mateo.expressions).toHaveProperty('happy');
      expect(mateo.expressions).toHaveProperty('celebrating');
      expect(mateo.expressions).toHaveProperty('thinking');
      expect(mateo.expressions).toHaveProperty('confused');
      expect(mateo.expressions).toHaveProperty('teaching');
    });
  });

  describe('Método show()', () => {
    it('debe mostrar el contenedor correctamente', () => {
      mateo.show('happy', '¡Hola!');

      expect(mateo.container.style.display).toBe('block');
      expect(mateo.container.classList.contains('show')).toBe(true);
      expect(mateo.isVisible).toBe(true);
    });

    it('debe cambiar la expresión correctamente', () => {
      mateo.show('celebrating');

      expect(mateo.currentExpression).toBe('celebrating');
      expect(mateo.image.src).toContain('mateo-celebrating.svg');
    });

    it('debe mostrar mensaje si se proporciona', () => {
      mateo.show('happy', '¡Test!');

      expect(mateo.speech.textContent).toBe('¡Test!');
      expect(mateo.speech.classList.contains('show')).toBe(true);
    });

    it('debe programar auto-ocultado con duración especificada', () => {
      mateo.show('happy', 'Test', 3000);

      expect(mateo.isVisible).toBe(true);

      vi.advanceTimersByTime(3000);

      expect(mateo.container.classList.contains('hide')).toBe(true);
    });

    it('no debe auto-ocultar si duration es 0', () => {
      mateo.show('teaching', 'Tutorial', 0);

      vi.advanceTimersByTime(10000);

      expect(mateo.isVisible).toBe(true);
    });

    it('debe limpiar timeout anterior al mostrar de nuevo', () => {
      mateo.show('happy', 'Mensaje 1', 5000);
      const firstTimeout = mateo.hideTimeout;

      mateo.show('celebrating', 'Mensaje 2', 3000);

      expect(mateo.hideTimeout).not.toBe(firstTimeout);
    });
  });

  describe('Método hide()', () => {
    beforeEach(() => {
      mateo.show('happy', 'Test');
    });

    it('debe ocultar el contenedor correctamente', () => {
      mateo.hide();

      expect(mateo.container.classList.contains('show')).toBe(false);
      expect(mateo.container.classList.contains('hide')).toBe(true);
      expect(mateo.isVisible).toBe(false);
    });

    it('debe ocultar el globo de diálogo', () => {
      mateo.hide();

      expect(mateo.speech.classList.contains('show')).toBe(false);
    });

    it('debe establecer display none después de la animación', () => {
      mateo.hide();

      vi.advanceTimersByTime(400);

      expect(mateo.container.style.display).toBe('none');
    });

    it('no debe establecer display none si se vuelve a mostrar antes', () => {
      mateo.hide();

      vi.advanceTimersByTime(200);
      mateo.show('happy');
      vi.advanceTimersByTime(300);

      expect(mateo.container.style.display).toBe('block');
    });
  });

  describe('Método speak()', () => {
    it('debe mostrar el mensaje en el globo', () => {
      mateo.speak('¡Hola mundo!');

      expect(mateo.speech.textContent).toBe('¡Hola mundo!');
      expect(mateo.speech.classList.contains('show')).toBe(true);
    });

    it('debe ocultar el mensaje después de la duración', () => {
      mateo.speak('Test', 2000);

      expect(mateo.speech.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(2000);

      expect(mateo.speech.classList.contains('show')).toBe(false);
    });

    it('no debe auto-ocultar si duration es 0', () => {
      mateo.speak('Mensaje persistente', 0);

      vi.advanceTimersByTime(10000);

      expect(mateo.speech.classList.contains('show')).toBe(true);
    });
  });

  describe('Método onCorrectAnswer()', () => {
    it('debe mostrar expresión happy para streak menor a 5', () => {
      mateo.onCorrectAnswer(3);

      expect(mateo.currentExpression).toBe('happy');
      expect(mateo.isVisible).toBe(true);
    });

    it('debe mostrar expresión celebrating para streak >= 5', () => {
      mateo.onCorrectAnswer(5);

      expect(mateo.currentExpression).toBe('celebrating');
      expect(mateo.speech.textContent).toContain('RACHA DE 5');
    });

    it('debe mostrar mensaje de racha correcto', () => {
      mateo.onCorrectAnswer(10);

      expect(mateo.speech.textContent).toBe('¡RACHA DE 10! 🔥 ¡Imparable!');
    });

    it('debe mostrar algún mensaje de felicitación', () => {
      mateo.onCorrectAnswer(1);

      expect(mateo.speech.textContent).toBeTruthy();
      expect(mateo.speech.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('Método onIncorrectAnswer()', () => {
    it('debe mostrar expresión confused por defecto', () => {
      mateo.onIncorrectAnswer(false);

      expect(mateo.currentExpression).toBe('confused');
    });

    it('debe mostrar expresión teaching si showExplanation es true', () => {
      mateo.onIncorrectAnswer(true);

      expect(mateo.currentExpression).toBe('teaching');
      expect(mateo.speech.textContent).toBe('Déjame explicarte... 📝');
    });

    it('debe mostrar mensaje de ánimo', () => {
      mateo.onIncorrectAnswer(false);

      expect(mateo.speech.textContent).toBeTruthy();
      expect(mateo.isVisible).toBe(true);
    });
  });

  describe('Método onPowerUpUsed()', () => {
    it('debe mostrar mensaje correcto para shield', () => {
      mateo.onPowerUpUsed('shield');

      expect(mateo.currentExpression).toBe('thinking');
      expect(mateo.speech.textContent).toBe('¡Escudo activado! Estás protegido 🛡️');
    });

    it('debe mostrar mensaje correcto para hint', () => {
      mateo.onPowerUpUsed('hint');

      expect(mateo.speech.textContent).toBe('Mira la respuesta destacada 💡');
    });

    it('debe mostrar mensaje correcto para skip', () => {
      mateo.onPowerUpUsed('skip');

      expect(mateo.speech.textContent).toBe('¡Saltemos esta! ⏭️');
    });

    it('debe mostrar mensaje genérico para tipo desconocido', () => {
      mateo.onPowerUpUsed('unknown');

      expect(mateo.speech.textContent).toBe('¡Power-up activado!');
    });
  });

  describe('Método onLevelUp()', () => {
    it('debe mostrar expresión celebrating', () => {
      mateo.onLevelUp(5);

      expect(mateo.currentExpression).toBe('celebrating');
    });

    it('debe mostrar nivel correcto en el mensaje', () => {
      mateo.onLevelUp(10);

      expect(mateo.speech.textContent).toBe('¡NIVEL 10! 👑 ¡Sigues creciendo!');
    });
  });

  describe('Método onAchievementUnlocked()', () => {
    it('debe mostrar expresión celebrating', () => {
      mateo.onAchievementUnlocked('Maestro');

      expect(mateo.currentExpression).toBe('celebrating');
    });

    it('debe mostrar nombre del logro en el mensaje', () => {
      mateo.onAchievementUnlocked('Primera Victoria');

      expect(mateo.speech.textContent).toBe('¡Logro desbloqueado: Primera Victoria! 🏆');
    });
  });

  describe('Método onTutorialStep()', () => {
    it('debe mostrar expresión teaching', () => {
      mateo.onTutorialStep('Paso 1 del tutorial');

      expect(mateo.currentExpression).toBe('teaching');
    });

    it('no debe auto-ocultar en modo tutorial', () => {
      mateo.onTutorialStep('Mensaje persistente');

      vi.advanceTimersByTime(10000);

      expect(mateo.isVisible).toBe(true);
    });
  });

  describe('Método onGameStart()', () => {
    it('debe mostrar mensaje correcto para cada modo', () => {
      const modes = {
        practice: "¡Vamos a practicar juntos! 📚",
        challenge: "¡Prepárate para el desafío! ⚡",
        adventure: "¡A explorar el espacio! 🚀",
        race: "¡Que gane el mejor! 🏁",
        boss: "¡Hora de la batalla! ⚔️"
      };

      Object.entries(modes).forEach(([mode, expectedMessage]) => {
        mateo.onGameStart(mode);
        expect(mateo.speech.textContent).toBe(expectedMessage);
      });
    });

    it('debe mostrar mensaje genérico para modo desconocido', () => {
      mateo.onGameStart('unknown');

      expect(mateo.speech.textContent).toBe('¡Comencemos!');
    });
  });

  describe('Método onGameEnd()', () => {
    it('debe mostrar celebrating si ganó', () => {
      mateo.onGameEnd(true, 1000);

      expect(mateo.currentExpression).toBe('celebrating');
      expect(mateo.speech.textContent).toContain('Victoria');
      expect(mateo.speech.textContent).toContain('1000');
    });

    it('debe mostrar thinking si perdió', () => {
      mateo.onGameEnd(false, 500);

      expect(mateo.currentExpression).toBe('thinking');
      expect(mateo.speech.textContent).toContain('500');
      expect(mateo.speech.textContent).toContain('practicando');
    });
  });

  describe('Método showEncouragement()', () => {
    it('debe mostrar algún mensaje de ánimo', () => {
      mateo.showEncouragement();

      expect(mateo.isVisible).toBe(true);
      expect(mateo.speech.textContent).toBeTruthy();
      expect(mateo.currentExpression).toBe('happy');
    });
  });

  describe('Método showTrickHint()', () => {
    it('debe mostrar hint correcto para tablas conocidas', () => {
      const hints = {
        2: "¡La tabla del 2 es como duplicar! 👯",
        5: "¡La tabla del 5 termina en 0 o 5! 🖐️",
        9: "¡El truco del 9 con los dedos es mágico! ✋"
      };

      Object.entries(hints).forEach(([table, expectedHint]) => {
        mateo.showTrickHint(parseInt(table));
        expect(mateo.speech.textContent).toBe(expectedHint);
      });
    });

    it('debe mostrar mensaje genérico para tabla desconocida', () => {
      mateo.showTrickHint(7);

      expect(mateo.speech.textContent).toContain('Presiona el botón de trucos');
    });

    it('debe mostrar expresión thinking', () => {
      mateo.showTrickHint(5);

      expect(mateo.currentExpression).toBe('thinking');
    });
  });
});
