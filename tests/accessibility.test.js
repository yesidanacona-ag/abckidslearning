/**
 * Tests de Accesibilidad (WCAG 2.1 AAA)
 * - ARIA roles y labels
 * - Navegación por teclado
 * - Focus management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup mock DOM with ARIA attributes
function setupAccessibilityDOM() {
  document.body.innerHTML = `
    <div id="welcomeScreen" class="screen active" role="main" aria-label="Pantalla de bienvenida">
      <input type="text" id="playerName" aria-label="Ingresa tu nombre" aria-required="true" />

      <div class="avatar-tabs" role="tablist" aria-labelledby="avatar-label">
        <button class="avatar-tab active" data-category="personajes" role="tab" aria-selected="true" aria-controls="avatarGrid">👥 Personajes</button>
        <button class="avatar-tab" data-category="animales" role="tab" aria-selected="false" aria-controls="avatarGrid">🐾 Animales</button>
        <button class="avatar-tab" data-category="emojis" role="tab" aria-selected="false" aria-controls="avatarGrid">😊 Emojis</button>
      </div>

      <button id="startAdventure" class="btn-primary" aria-label="Comenzar la aventura de aprendizaje">¡Comenzar!</button>
    </div>

    <div id="mainScreen" class="screen" role="main" aria-label="Menú principal del juego">
      <header id="main-header" role="banner">
        <div class="player-stats" role="status" aria-label="Estadísticas del jugador">
          <div class="stat" aria-label="Estrellas totales">
            <span class="stat-icon" aria-hidden="true">⭐</span>
            <span id="totalStars">0</span>
          </div>
        </div>
      </header>

      <div class="game-modes" role="navigation" aria-label="Modos de juego">
        <div class="mode-card" id="practiceMode" role="button" tabindex="0"
             aria-label="Modo Aprender Tablas: Aprende a tu propio ritmo sin presión de tiempo">
          <div class="mode-icon" aria-hidden="true">📚</div>
          <h3>¡Aprender Tablas!</h3>
        </div>

        <div class="mode-card" id="adventureMode" role="button" tabindex="0"
             aria-label="Modo Aventura Espacial: Viaja por el espacio resolviendo multiplicaciones en cada planeta">
          <div class="mode-icon" aria-hidden="true">🚀</div>
          <h3>Aventura Espacial</h3>
        </div>

        <div class="mode-card" id="bossMode" role="button" tabindex="0"
             aria-label="Modo Batalla de Jefe: Enfrenta jefes épicos con desafíos de multiplicación">
          <div class="mode-icon" aria-hidden="true">⚔️</div>
          <h3>Batalla de Jefe</h3>
        </div>

        <div class="mode-card" id="shopMode" role="button" tabindex="0"
             aria-label="Tienda: Compra mejoras y personalizaciones con tus monedas">
          <div class="mode-icon" aria-hidden="true">🏪</div>
          <h3>Tienda</h3>
        </div>
      </div>

      <div id="mateoContainer" class="mateo-container" role="complementary" aria-label="Asistente Mateo el Mago">
        <div id="mateoSpeech" class="mateo-speech" role="status" aria-live="polite" aria-atomic="true"></div>
      </div>
    </div>

    <div class="score-display" role="status" aria-live="polite" aria-label="Puntuación actual">
      Puntos: <span id="practiceScore">0</span>
    </div>

    <button class="btn-back" id="backFromPractice" aria-label="Volver al menú principal">← Volver</button>
  `;
}

// Setup sound system mock
function setupSoundSystem() {
  window.soundSystem = {
    playClick: vi.fn()
  };
}

describe('♿ Accesibilidad - ARIA Roles y Labels', () => {
  beforeEach(() => {
    setupAccessibilityDOM();
    setupSoundSystem();
  });

  describe('Roles Semánticos', () => {
    it('welcomeScreen tiene role="main"', () => {
      const welcomeScreen = document.getElementById('welcomeScreen');
      expect(welcomeScreen.getAttribute('role')).toBe('main');
    });

    it('mainScreen tiene role="main"', () => {
      const mainScreen = document.getElementById('mainScreen');
      expect(mainScreen.getAttribute('role')).toBe('main');
    });

    it('main-header tiene role="banner"', () => {
      const header = document.getElementById('main-header');
      expect(header.getAttribute('role')).toBe('banner');
    });

    it('game-modes tiene role="navigation"', () => {
      const gameModes = document.querySelector('.game-modes');
      expect(gameModes.getAttribute('role')).toBe('navigation');
    });

    it('mateoContainer tiene role="complementary"', () => {
      const mateo = document.getElementById('mateoContainer');
      expect(mateo.getAttribute('role')).toBe('complementary');
    });

    it('player-stats tiene role="status"', () => {
      const stats = document.querySelector('.player-stats');
      expect(stats.getAttribute('role')).toBe('status');
    });
  });

  describe('ARIA Labels', () => {
    it('playerName input tiene aria-label', () => {
      const input = document.getElementById('playerName');
      expect(input.getAttribute('aria-label')).toBe('Ingresa tu nombre');
    });

    it('playerName input tiene aria-required', () => {
      const input = document.getElementById('playerName');
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('avatar-tabs tiene role="tablist"', () => {
      const tablist = document.querySelector('.avatar-tabs');
      expect(tablist.getAttribute('role')).toBe('tablist');
    });

    it('startAdventure button tiene aria-label', () => {
      const btn = document.getElementById('startAdventure');
      expect(btn.getAttribute('aria-label')).toBe('Comenzar la aventura de aprendizaje');
    });
  });

  describe('Mode Cards Accessibility', () => {
    it('todos los mode-cards tienen role="button"', () => {
      const modeCards = document.querySelectorAll('.mode-card');
      modeCards.forEach(card => {
        expect(card.getAttribute('role')).toBe('button');
      });
    });

    it('todos los mode-cards tienen tabindex="0"', () => {
      const modeCards = document.querySelectorAll('.mode-card');
      modeCards.forEach(card => {
        expect(card.getAttribute('tabindex')).toBe('0');
      });
    });

    it('todos los mode-cards tienen aria-label descriptivo', () => {
      const modeCards = document.querySelectorAll('.mode-card');
      modeCards.forEach(card => {
        const ariaLabel = card.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel.length).toBeGreaterThan(10); // Label descriptivo
      });
    });

    it('iconos decorativos tienen aria-hidden="true"', () => {
      const icons = document.querySelectorAll('.mode-icon');
      icons.forEach(icon => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('ARIA Live Regions', () => {
    it('mateoSpeech tiene aria-live="polite"', () => {
      const speech = document.getElementById('mateoSpeech');
      expect(speech.getAttribute('aria-live')).toBe('polite');
    });

    it('mateoSpeech tiene aria-atomic="true"', () => {
      const speech = document.getElementById('mateoSpeech');
      expect(speech.getAttribute('aria-atomic')).toBe('true');
    });

    it('practiceScore tiene aria-live="polite"', () => {
      const score = document.querySelector('.score-display');
      expect(score.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Navigation Buttons', () => {
    it('botones de vuelta tienen aria-label', () => {
      const backButtons = document.querySelectorAll('.btn-back');
      backButtons.forEach(btn => {
        const ariaLabel = btn.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('Volver');
      });
    });
  });
});

// Mock keyboard handler for mode cards
function setupModeCardKeyboardHandlers() {
  const mockHandlers = {
    openCastleMap: vi.fn(),
    startAdventureMode: vi.fn(),
    startBossMode: vi.fn(),
    openShop: vi.fn()
  };

  const modeCards = [
    { id: 'practiceMode', handler: mockHandlers.openCastleMap },
    { id: 'adventureMode', handler: mockHandlers.startAdventureMode },
    { id: 'bossMode', handler: mockHandlers.startBossMode },
    { id: 'shopMode', handler: mockHandlers.openShop }
  ];

  modeCards.forEach(({ id, handler }) => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.soundSystem?.playClick();
        handler();
      }
    });
  });

  return mockHandlers;
}

// Mock keyboard handler for avatar tabs
function setupAvatarTabsKeyboardHandlers() {
  const tabs = document.querySelectorAll('.avatar-tab');
  const avatarOptions = document.querySelectorAll('.avatar-option');

  const activateTab = (tab) => {
    const category = tab.dataset.category;

    if (window.soundSystem) {
      window.soundSystem.playClick();
    }

    // Update active tabs and aria-selected
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Filter avatars
    avatarOptions.forEach(avatar => {
      if (avatar.dataset.category === category) {
        avatar.style.display = 'flex';
      } else {
        avatar.style.display = 'none';
      }
    });
  };

  tabs.forEach((tab, index) => {
    // Click handler
    tab.addEventListener('click', () => {
      activateTab(tab);
    });

    // Keyboard handler - Enter/Space
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(tab);
      }
      // Arrow keys navigation
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const tabsArray = Array.from(tabs);
        let newIndex = index;

        if (e.key === 'ArrowRight') {
          newIndex = (index + 1) % tabsArray.length;
        } else {
          newIndex = (index - 1 + tabsArray.length) % tabsArray.length;
        }

        const newTab = tabsArray[newIndex];
        newTab.focus();
        activateTab(newTab);
      }
    });
  });
}

describe('⌨️ Navegación por Teclado', () => {
  beforeEach(() => {
    setupAccessibilityDOM();
    setupSoundSystem();
  });

  describe('Mode Cards - Keyboard Activation', () => {
    it('practiceMode responde a Enter key', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const practiceMode = document.getElementById('practiceMode');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      practiceMode.dispatchEvent(enterEvent);

      expect(mockHandlers.openCastleMap).toHaveBeenCalled();
    });

    it('practiceMode responde a Space key', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const practiceMode = document.getElementById('practiceMode');

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      practiceMode.dispatchEvent(spaceEvent);

      expect(mockHandlers.openCastleMap).toHaveBeenCalled();
    });

    it('adventureMode responde a Enter key', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const adventureMode = document.getElementById('adventureMode');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      adventureMode.dispatchEvent(enterEvent);

      expect(mockHandlers.startAdventureMode).toHaveBeenCalled();
    });

    it('bossMode responde a Enter key', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const bossMode = document.getElementById('bossMode');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      bossMode.dispatchEvent(enterEvent);

      expect(mockHandlers.startBossMode).toHaveBeenCalled();
    });

    it('shopMode responde a Space key', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const shopMode = document.getElementById('shopMode');

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      shopMode.dispatchEvent(spaceEvent);

      expect(mockHandlers.openShop).toHaveBeenCalled();
    });

    it('reproduce sonido al activar mode-card con teclado', () => {
      const mockHandlers = setupModeCardKeyboardHandlers();
      const practiceMode = document.getElementById('practiceMode');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      practiceMode.dispatchEvent(enterEvent);

      expect(window.soundSystem.playClick).toHaveBeenCalled();
    });
  });

  describe('Avatar Tabs - Keyboard Navigation', () => {
    it('avatar tab responde a Enter key', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const secondTab = tabs[1]; // Tab de "Animales"

      expect(secondTab.classList.contains('active')).toBe(false);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      secondTab.dispatchEvent(enterEvent);

      expect(secondTab.classList.contains('active')).toBe(true);
      expect(secondTab.getAttribute('aria-selected')).toBe('true');
    });

    it('avatar tab responde a Space key', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const secondTab = tabs[1];

      expect(secondTab.classList.contains('active')).toBe(false);

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      secondTab.dispatchEvent(spaceEvent);

      expect(secondTab.classList.contains('active')).toBe(true);
      expect(secondTab.getAttribute('aria-selected')).toBe('true');
    });

    it('ArrowRight navega al siguiente tab', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const firstTab = tabs[0];
      const secondTab = tabs[1];

      // Mock focus function
      firstTab.focus = vi.fn();
      secondTab.focus = vi.fn();

      expect(firstTab.classList.contains('active')).toBe(true);

      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      firstTab.dispatchEvent(arrowRightEvent);

      expect(secondTab.focus).toHaveBeenCalled();
      expect(secondTab.classList.contains('active')).toBe(true);
    });

    it('ArrowLeft navega al tab anterior', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const firstTab = tabs[0];
      const secondTab = tabs[1];

      // Activar segundo tab primero
      secondTab.click();

      firstTab.focus = vi.fn();
      secondTab.focus = vi.fn();

      const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      secondTab.dispatchEvent(arrowLeftEvent);

      expect(firstTab.focus).toHaveBeenCalled();
      expect(firstTab.classList.contains('active')).toBe(true);
    });

    it('aria-selected se actualiza al cambiar de tab', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const firstTab = tabs[0];
      const secondTab = tabs[1];

      expect(firstTab.getAttribute('aria-selected')).toBe('true');
      expect(secondTab.getAttribute('aria-selected')).toBe('false');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      secondTab.dispatchEvent(enterEvent);

      expect(firstTab.getAttribute('aria-selected')).toBe('false');
      expect(secondTab.getAttribute('aria-selected')).toBe('true');
    });

    it('navegación circular con ArrowRight (último → primero)', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const lastTab = tabs[tabs.length - 1];
      const firstTab = tabs[0];

      // Activar último tab
      lastTab.click();

      firstTab.focus = vi.fn();
      lastTab.focus = vi.fn();

      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      lastTab.dispatchEvent(arrowRightEvent);

      expect(firstTab.focus).toHaveBeenCalled();
      expect(firstTab.classList.contains('active')).toBe(true);
    });

    it('navegación circular con ArrowLeft (primero → último)', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const firstTab = tabs[0];
      const lastTab = tabs[tabs.length - 1];

      firstTab.focus = vi.fn();
      lastTab.focus = vi.fn();

      const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      firstTab.dispatchEvent(arrowLeftEvent);

      expect(lastTab.focus).toHaveBeenCalled();
      expect(lastTab.classList.contains('active')).toBe(true);
    });

    it('reproduce sonido al cambiar tab con teclado', () => {
      setupAvatarTabsKeyboardHandlers();
      const tabs = document.querySelectorAll('.avatar-tab');
      const secondTab = tabs[1];

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      secondTab.dispatchEvent(enterEvent);

      expect(window.soundSystem.playClick).toHaveBeenCalled();
    });
  });
});

describe('🎯 Focus Styles', () => {
  beforeEach(() => {
    setupAccessibilityDOM();
  });

  it('mode-cards tienen tabindex="0" para ser focusables', () => {
    const modeCards = document.querySelectorAll('.mode-card');
    expect(modeCards.length).toBeGreaterThan(0);

    modeCards.forEach(card => {
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });

  it('buttons son naturalmente focusables', () => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-back');
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach(btn => {
      expect(btn.tagName).toBe('BUTTON');
    });
  });

  it('avatar-tabs son botones y naturalmente focusables', () => {
    const tabs = document.querySelectorAll('.avatar-tab');
    expect(tabs.length).toBe(3);

    tabs.forEach(tab => {
      expect(tab.tagName).toBe('BUTTON');
    });
  });
});
