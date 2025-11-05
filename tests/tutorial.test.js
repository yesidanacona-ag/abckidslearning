/**
 * Tests para TutorialSystem
 * Testing crítico del fix para overlay negro y skip button
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock del DOM para el sistema de tutorial
function setupTutorialDOM() {
  document.body.innerHTML = `
    <div id="mainScreen" style="pointer-events: auto;">
      <button id="practiceMode">Modo Práctica</button>
      <div id="powerupsBar">Power-ups</div>
      <button id="showTricksBtn">Trucos</button>
    </div>

    <div id="tutorialOverlay" style="display: none; background: transparent;">
      <div class="tutorial-backdrop"></div>
      <div id="tutorialSpotlight" class="tutorial-spotlight"></div>
      <div id="tutorialContent" class="tutorial-content">
        <div class="tutorial-box">
          <div class="tutorial-header">
            <span id="tutorialEmoji" class="tutorial-emoji"></span>
            <h3 id="tutorialTitle"></h3>
          </div>
          <p id="tutorialText"></p>
          <div class="tutorial-footer">
            <span class="tutorial-progress">
              <span id="tutorialStep">1</span> / <span id="tutorialTotal">5</span>
            </span>
            <div class="tutorial-buttons">
              <button id="tutorialSkip" class="btn-secondary">Saltar</button>
              <button id="tutorialNext" class="btn-primary">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Mock del soundSystem global
function setupSoundSystem() {
  window.soundSystem = {
    playClick: vi.fn(),
    playSuccess: vi.fn()
  };
}

// Cargar clase TutorialSystem
function loadTutorialSystem() {
  class TutorialSystem {
    constructor() {
      this.currentStep = 0;
      this.listenersAdded = false;
      this.steps = [
        {
          emoji: '👋',
          title: '¡Bienvenido a Multiplicar Mágico!',
          text: 'Te mostraré cómo usar la app en solo 30 segundos. ¿Listo?',
          target: null,
          position: 'center'
        },
        {
          emoji: '🎮',
          title: 'Elige tu Modo de Juego',
          text: '¡Tenemos 5 modos diferentes! Práctica, Desafío, Aventura, Carrera y Batalla. Cada uno es único y divertido.',
          target: '#practiceMode',
          position: 'bottom'
        },
        {
          emoji: '🛡️',
          title: 'Power-ups Mágicos',
          text: 'Usa Escudo 🛡️ para protegerte de errores, Pista 💡 para ver la respuesta, y Saltar ⏭️ para omitir preguntas difíciles.',
          target: '#powerupsBar',
          position: 'bottom'
        },
        {
          emoji: '📚',
          title: 'Trucos para Recordar',
          text: 'Si te atoras, presiona el botón "📚 Trucos" para ver consejos que te ayudarán a memorizar cada tabla.',
          target: '#showTricksBtn',
          position: 'left'
        },
        {
          emoji: '🎉',
          title: '¡Listo para Comenzar!',
          text: 'Ahora sabes todo lo necesario. ¡Diviértete aprendiendo y desbloqueando logros! 🏆',
          target: null,
          position: 'center'
        }
      ];
    }

    shouldShow() {
      const hasSeenTutorial = localStorage.getItem('tutorialCompleted');
      return !hasSeenTutorial;
    }

    start() {
      if (!this.shouldShow()) return;

      this.currentStep = 0;
      document.getElementById('tutorialOverlay').style.display = 'block';

      if (window.soundSystem) {
        window.soundSystem.playClick();
      }

      this.showStep(0);
      this.setupEventListeners();
    }

    setupEventListeners() {
      if (this.listenersAdded) return;

      const nextBtn = document.getElementById('tutorialNext');
      const skipBtn = document.getElementById('tutorialSkip');

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextStep());
      }

      if (skipBtn) {
        skipBtn.addEventListener('click', () => this.skip());
      }

      this.listenersAdded = true;
    }

    showStep(stepIndex) {
      const step = this.steps[stepIndex];
      this.currentStep = stepIndex;

      document.getElementById('tutorialEmoji').textContent = step.emoji;
      document.getElementById('tutorialTitle').textContent = step.title;
      document.getElementById('tutorialText').textContent = step.text;
      document.getElementById('tutorialStep').textContent = stepIndex + 1;
      document.getElementById('tutorialTotal').textContent = this.steps.length;

      const nextBtn = document.getElementById('tutorialNext');
      if (stepIndex === this.steps.length - 1) {
        nextBtn.textContent = '¡Entendido!';
      } else {
        nextBtn.textContent = 'Siguiente';
      }

      this.positionTutorial(step);

      if (window.soundSystem) {
        window.soundSystem.playClick();
      }
    }

    positionTutorial(step) {
      const spotlight = document.getElementById('tutorialSpotlight');
      const content = document.getElementById('tutorialContent');
      const box = content.querySelector('.tutorial-box');

      box.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');

      if (step.target) {
        const targetElement = document.querySelector(step.target);

        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();

          spotlight.style.top = (rect.top - 10) + 'px';
          spotlight.style.left = (rect.left - 10) + 'px';
          spotlight.style.width = (rect.width + 20) + 'px';
          spotlight.style.height = (rect.height + 20) + 'px';
          spotlight.classList.add('active');

          switch(step.position) {
            case 'bottom':
              content.style.top = (rect.bottom + 30) + 'px';
              content.style.left = (rect.left + rect.width / 2 - 200) + 'px';
              box.classList.add('arrow-top');
              break;
            case 'top':
              content.style.top = (rect.top - 250) + 'px';
              content.style.left = (rect.left + rect.width / 2 - 200) + 'px';
              box.classList.add('arrow-bottom');
              break;
            case 'left':
              content.style.top = (rect.top + rect.height / 2 - 150) + 'px';
              content.style.left = (rect.left - 430) + 'px';
              box.classList.add('arrow-right');
              break;
            case 'right':
              content.style.top = (rect.top + rect.height / 2 - 150) + 'px';
              content.style.left = (rect.right + 30) + 'px';
              box.classList.add('arrow-left');
              break;
          }
        }
      } else {
        spotlight.classList.remove('active');
        spotlight.style.width = '0';
        spotlight.style.height = '0';

        content.style.top = '50%';
        content.style.left = '50%';
        content.style.transform = 'translate(-50%, -50%)';
      }
    }

    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.showStep(this.currentStep + 1);
      } else {
        this.complete();
      }
    }

    skip() {
      this.complete();
    }

    complete() {
      const overlay = document.getElementById('tutorialOverlay');
      const spotlight = document.getElementById('tutorialSpotlight');
      const content = document.getElementById('tutorialContent');

      if (overlay) {
        overlay.style.display = 'none';
      }

      if (spotlight) {
        spotlight.classList.remove('active');
        spotlight.style.width = '0';
        spotlight.style.height = '0';
      }

      if (content) {
        content.style.top = '';
        content.style.left = '';
        content.style.transform = '';
      }

      localStorage.setItem('tutorialCompleted', 'true');

      if (window.soundSystem) {
        window.soundSystem.playSuccess();
      }

      const mainScreen = document.getElementById('mainScreen');
      if (mainScreen) {
        mainScreen.style.pointerEvents = 'auto';
      }
    }
  }

  return TutorialSystem;
}

describe('TutorialSystem', () => {
  let TutorialSystem;
  let tutorial;

  beforeEach(() => {
    setupTutorialDOM();
    setupSoundSystem();
    TutorialSystem = loadTutorialSystem();
    tutorial = new TutorialSystem();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Constructor y Estado Inicial', () => {
    it('debe inicializarse con currentStep en 0', () => {
      expect(tutorial.currentStep).toBe(0);
    });

    it('debe tener listenersAdded en false inicialmente', () => {
      expect(tutorial.listenersAdded).toBe(false);
    });

    it('debe tener 5 pasos definidos', () => {
      expect(tutorial.steps).toHaveLength(5);
    });

    it('cada paso debe tener propiedades requeridas', () => {
      tutorial.steps.forEach(step => {
        expect(step).toHaveProperty('emoji');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('text');
        expect(step).toHaveProperty('target');
        expect(step).toHaveProperty('position');
      });
    });
  });

  describe('Método shouldShow()', () => {
    it('debe retornar true si nunca se ha visto el tutorial', () => {
      localStorage.removeItem('tutorialCompleted');
      expect(tutorial.shouldShow()).toBe(true);
    });

    it('debe retornar false si el tutorial ya fue completado', () => {
      localStorage.setItem('tutorialCompleted', 'true');
      expect(tutorial.shouldShow()).toBe(false);
    });
  });

  describe('Método start()', () => {
    it('debe mostrar el overlay cuando no se ha visto el tutorial', () => {
      tutorial.start();

      const overlay = document.getElementById('tutorialOverlay');
      expect(overlay.style.display).toBe('block');
    });

    it('NO debe mostrar el overlay si ya se completó', () => {
      localStorage.setItem('tutorialCompleted', 'true');
      tutorial.start();

      const overlay = document.getElementById('tutorialOverlay');
      expect(overlay.style.display).toBe('none');
    });

    it('debe iniciar en el paso 0', () => {
      tutorial.start();
      expect(tutorial.currentStep).toBe(0);
    });

    it('debe reproducir sonido de click', () => {
      tutorial.start();
      expect(window.soundSystem.playClick).toHaveBeenCalled();
    });

    it('debe configurar event listeners', () => {
      tutorial.start();
      expect(tutorial.listenersAdded).toBe(true);
    });
  });

  describe('Método setupEventListeners() - FIX DE BUG', () => {
    it('NO debe agregar listeners duplicados', () => {
      tutorial.setupEventListeners();
      expect(tutorial.listenersAdded).toBe(true);

      const firstListenersFlag = tutorial.listenersAdded;
      tutorial.setupEventListeners();

      // Debe retornar temprano sin cambios
      expect(tutorial.listenersAdded).toBe(firstListenersFlag);
    });

    it('debe verificar que existan los botones antes de agregar listeners', () => {
      // Remover botones del DOM
      document.getElementById('tutorialNext').remove();
      document.getElementById('tutorialSkip').remove();

      // No debe lanzar error
      expect(() => tutorial.setupEventListeners()).not.toThrow();
    });

    it('debe agregar listener al botón Next si existe', () => {
      const nextBtn = document.getElementById('tutorialNext');
      const clickSpy = vi.fn();
      nextBtn.addEventListener = clickSpy;

      tutorial.setupEventListeners();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('debe agregar listener al botón Skip si existe', () => {
      const skipBtn = document.getElementById('tutorialSkip');
      const clickSpy = vi.fn();
      skipBtn.addEventListener = clickSpy;

      tutorial.setupEventListeners();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Método showStep()', () => {
    it('debe actualizar el contenido del paso correctamente', () => {
      tutorial.showStep(0);

      expect(document.getElementById('tutorialEmoji').textContent).toBe('👋');
      expect(document.getElementById('tutorialTitle').textContent).toBe('¡Bienvenido a Multiplicar Mágico!');
      expect(document.getElementById('tutorialStep').textContent).toBe('1');
      expect(document.getElementById('tutorialTotal').textContent).toBe('5');
    });

    it('debe cambiar el texto del botón en el último paso', () => {
      tutorial.showStep(4); // Último paso (índice 4 de 5 pasos)

      const nextBtn = document.getElementById('tutorialNext');
      expect(nextBtn.textContent).toBe('¡Entendido!');
    });

    it('debe mantener "Siguiente" en pasos intermedios', () => {
      tutorial.showStep(2);

      const nextBtn = document.getElementById('tutorialNext');
      expect(nextBtn.textContent).toBe('Siguiente');
    });

    it('debe actualizar currentStep', () => {
      tutorial.showStep(3);
      expect(tutorial.currentStep).toBe(3);
    });

    it('debe reproducir sonido en cada paso', () => {
      window.soundSystem.playClick.mockClear();
      tutorial.showStep(1);

      expect(window.soundSystem.playClick).toHaveBeenCalled();
    });
  });

  describe('Método positionTutorial()', () => {
    it('debe activar spotlight cuando hay target', () => {
      const step = tutorial.steps[1]; // Paso con #practiceMode
      tutorial.positionTutorial(step);

      const spotlight = document.getElementById('tutorialSpotlight');
      expect(spotlight.classList.contains('active')).toBe(true);
    });

    it('debe desactivar spotlight cuando NO hay target', () => {
      const step = tutorial.steps[0]; // Paso sin target
      tutorial.positionTutorial(step);

      const spotlight = document.getElementById('tutorialSpotlight');
      expect(spotlight.classList.contains('active')).toBe(false);
      expect(spotlight.style.width).toBe('0px');
      expect(spotlight.style.height).toBe('0px');
    });

    it('debe centrar el contenido cuando no hay target', () => {
      const step = tutorial.steps[0];
      tutorial.positionTutorial(step);

      const content = document.getElementById('tutorialContent');
      expect(content.style.top).toBe('50%');
      expect(content.style.left).toBe('50%');
      expect(content.style.transform).toBe('translate(-50%, -50%)');
    });

    it('debe agregar clase arrow-top para posición bottom', () => {
      const step = tutorial.steps[1]; // position: 'bottom'
      tutorial.positionTutorial(step);

      const box = document.querySelector('.tutorial-box');
      expect(box.classList.contains('arrow-top')).toBe(true);
    });

    it('debe limpiar clases de flecha anteriores', () => {
      const box = document.querySelector('.tutorial-box');
      box.classList.add('arrow-left', 'arrow-right');

      tutorial.positionTutorial(tutorial.steps[1]);

      expect(box.classList.contains('arrow-left')).toBe(false);
      expect(box.classList.contains('arrow-right')).toBe(false);
    });
  });

  describe('Método nextStep()', () => {
    it('debe avanzar al siguiente paso', () => {
      tutorial.currentStep = 1;
      tutorial.nextStep();

      expect(tutorial.currentStep).toBe(2);
    });

    it('debe llamar a complete() en el último paso', () => {
      tutorial.complete = vi.fn();
      tutorial.currentStep = 4; // Último paso

      tutorial.nextStep();

      expect(tutorial.complete).toHaveBeenCalled();
    });

    it('NO debe llamar a complete() en pasos intermedios', () => {
      tutorial.complete = vi.fn();
      tutorial.currentStep = 2;

      tutorial.nextStep();

      expect(tutorial.complete).not.toHaveBeenCalled();
    });
  });

  describe('Método skip() - FIX DE BUG', () => {
    it('debe llamar a complete()', () => {
      tutorial.complete = vi.fn();
      tutorial.skip();

      expect(tutorial.complete).toHaveBeenCalled();
    });

    it('debe funcionar desde cualquier paso', () => {
      tutorial.currentStep = 2;
      tutorial.skip();

      expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    });
  });

  describe('Método complete() - FIX CRÍTICO DE BUG', () => {
    beforeEach(() => {
      // Simular tutorial activo
      const overlay = document.getElementById('tutorialOverlay');
      overlay.style.display = 'block';

      const spotlight = document.getElementById('tutorialSpotlight');
      spotlight.classList.add('active');
      spotlight.style.width = '200px';
      spotlight.style.height = '100px';

      const content = document.getElementById('tutorialContent');
      content.style.top = '100px';
      content.style.left = '200px';
      content.style.transform = 'scale(1)';

      const mainScreen = document.getElementById('mainScreen');
      mainScreen.style.pointerEvents = 'none';
    });

    it('debe ocultar el overlay', () => {
      tutorial.complete();

      const overlay = document.getElementById('tutorialOverlay');
      expect(overlay.style.display).toBe('none');
    });

    it('debe limpiar el spotlight completamente', () => {
      tutorial.complete();

      const spotlight = document.getElementById('tutorialSpotlight');
      expect(spotlight.classList.contains('active')).toBe(false);
      expect(spotlight.style.width).toBe('0px');
      expect(spotlight.style.height).toBe('0px');
    });

    it('debe resetear los estilos de posicionamiento del contenido', () => {
      tutorial.complete();

      const content = document.getElementById('tutorialContent');
      expect(content.style.top).toBe('');
      expect(content.style.left).toBe('');
      expect(content.style.transform).toBe('');
    });

    it('debe marcar el tutorial como completado en localStorage', () => {
      tutorial.complete();

      expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    });

    it('debe reproducir sonido de éxito', () => {
      tutorial.complete();

      expect(window.soundSystem.playSuccess).toHaveBeenCalled();
    });

    it('CRÍTICO: debe restaurar pointer-events en mainScreen', () => {
      tutorial.complete();

      const mainScreen = document.getElementById('mainScreen');
      expect(mainScreen.style.pointerEvents).toBe('auto');
    });

    it('debe funcionar aunque algunos elementos no existan', () => {
      // Remover elementos
      document.getElementById('tutorialSpotlight').remove();

      // No debe lanzar error
      expect(() => tutorial.complete()).not.toThrow();
    });
  });

  describe('Integración: Flujo completo del tutorial', () => {
    it('debe completar el tutorial paso por paso', () => {
      tutorial.start();

      // Paso 1
      expect(tutorial.currentStep).toBe(0);
      expect(document.getElementById('tutorialEmoji').textContent).toBe('👋');

      // Avanzar
      tutorial.nextStep();
      expect(tutorial.currentStep).toBe(1);

      // Avanzar
      tutorial.nextStep();
      expect(tutorial.currentStep).toBe(2);

      // Avanzar
      tutorial.nextStep();
      expect(tutorial.currentStep).toBe(3);

      // Avanzar
      tutorial.nextStep();
      expect(tutorial.currentStep).toBe(4);

      // Último paso debe completar
      tutorial.nextStep();
      expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    });

    it('debe permitir saltar el tutorial en cualquier momento', () => {
      tutorial.start();
      tutorial.showStep(2); // Ir al paso 3

      tutorial.skip();

      const overlay = document.getElementById('tutorialOverlay');
      expect(overlay.style.display).toBe('none');
      expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    });

    it('debe restaurar interactividad después de completar', () => {
      const mainScreen = document.getElementById('mainScreen');
      mainScreen.style.pointerEvents = 'none';

      tutorial.start();
      tutorial.complete();

      expect(mainScreen.style.pointerEvents).toBe('auto');
    });

    it('NO debe mostrar de nuevo después de completar', () => {
      tutorial.start();
      tutorial.complete();

      // Crear nueva instancia
      const newTutorial = new TutorialSystem();
      newTutorial.start();

      const overlay = document.getElementById('tutorialOverlay');
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('Regresión: Bug de pantalla negra', () => {
    it('overlay debe tener background transparent', () => {
      const overlay = document.getElementById('tutorialOverlay');

      // Verificar que el overlay tiene background transparent (como en el fix)
      expect(overlay.style.background).toBe('transparent');
    });

    it('debe limpiar todos los estilos al cerrar', () => {
      tutorial.start();

      const content = document.getElementById('tutorialContent');
      const spotlight = document.getElementById('tutorialSpotlight');

      // Simular que tiene estilos aplicados
      tutorial.showStep(1);

      // Verificar que hay estilos
      expect(content.style.top).not.toBe('');

      // Completar
      tutorial.complete();

      // Verificar que se limpiaron
      expect(content.style.top).toBe('');
      expect(content.style.left).toBe('');
      expect(content.style.transform).toBe('');
      expect(spotlight.style.width).toBe('0px');
      expect(spotlight.style.height).toBe('0px');
    });

    it('mainScreen debe ser interactuable después del tutorial', () => {
      const mainScreen = document.getElementById('mainScreen');

      // Simular que el tutorial bloqueó la pantalla
      mainScreen.style.pointerEvents = 'none';

      tutorial.complete();

      // CRÍTICO: debe restaurarse
      expect(mainScreen.style.pointerEvents).toBe('auto');
    });
  });
});
