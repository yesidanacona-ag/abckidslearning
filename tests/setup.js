/**
 * Setup file for Vitest tests
 * Mocks y configuración global para testing
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { vi, beforeEach } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock de localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

global.localStorage = localStorageMock;

// Mock de Audio API
global.Audio = class Audio {
  constructor(src) {
    this.src = src;
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {}
};

// Mock de SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = 'es-ES';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
  }
};

// Mock de speechSynthesis
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [])
};

// Mock de requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock completo de Canvas y CanvasRenderingContext2D
class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.globalAlpha = 1;
  }

  // Drawing methods
  fillRect = vi.fn();
  strokeRect = vi.fn();
  clearRect = vi.fn();
  fillText = vi.fn();
  strokeText = vi.fn();
  measureText = vi.fn((text) => ({ width: text.length * 10 }));

  // Path methods
  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  arcTo = vi.fn();
  rect = vi.fn();
  quadraticCurveTo = vi.fn();
  bezierCurveTo = vi.fn();

  // Fill and stroke
  fill = vi.fn();
  stroke = vi.fn();
  clip = vi.fn();

  // Transform methods
  scale = vi.fn();
  rotate = vi.fn();
  translate = vi.fn();
  transform = vi.fn();
  setTransform = vi.fn();
  resetTransform = vi.fn();

  // State methods
  save = vi.fn();
  restore = vi.fn();

  // Image drawing
  drawImage = vi.fn();

  // Pixel manipulation
  createImageData = vi.fn();
  getImageData = vi.fn();
  putImageData = vi.fn();
}

class MockCanvas {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.style = {};
    this._context = new MockCanvasRenderingContext2D();
    this._eventListeners = {};
  }

  getContext(type) {
    if (type === '2d') {
      return this._context;
    }
    return null;
  }

  toDataURL() {
    return 'data:image/png;base64,mock';
  }

  addEventListener(event, handler) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this._eventListeners[event]) {
      this._eventListeners[event] = this._eventListeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event) {
    if (this._eventListeners[event.type]) {
      this._eventListeners[event.type].forEach(handler => handler(event));
    }
  }

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height,
      x: 0,
      y: 0
    };
  }
}

// Mock de HTMLElement genérico
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.id = '';
    this.className = '';
    this.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(() => false)
    };
    this.style = {};
    this.innerHTML = '';
    this.textContent = '';
    this.children = [];
    this._eventListeners = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return child;
  }

  addEventListener(event, handler) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this._eventListeners[event]) {
      this._eventListeners[event] = this._eventListeners[event].filter(h => h !== handler);
    }
  }

  querySelector(selector) {
    return new MockElement();
  }

  querySelectorAll(selector) {
    return [];
  }

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    };
  }
}

// Mejorar el document existente (happy-dom ya lo provee)
// Mockear getContext para canvas elements
if (global.document) {
  const originalCreateElement = global.document.createElement.bind(global.document);

  global.document.createElement = function(tagName) {
    const element = originalCreateElement(tagName);

    // Si es canvas, agregar método getContext mockeado
    if (tagName === 'canvas') {
      element.getContext = function(type) {
        if (type === '2d') {
          return new MockCanvasRenderingContext2D();
        }
        return null;
      };
    }

    return element;
  };

  const originalGetElementById = global.document.getElementById.bind(global.document);

  global.document.getElementById = function(id) {
    let element = originalGetElementById(id);

    // Si existe y es canvas, asegurar que getContext está mockeado
    if (element && (element.tagName === 'CANVAS' || element.nodeName === 'CANVAS')) {
      if (!element.getContext || typeof element.getContext !== 'function') {
        element.getContext = function(type) {
          if (type === '2d') {
            return new MockCanvasRenderingContext2D();
          }
          return null;
        };
      }
    }

    // Retornar elemento (puede ser null si no existe)
    return element;
  };
}

// Cargar game engines en el entorno de test
try {
  // Cargar spaceGameEngine.js
  const spaceEngineCode = readFileSync(join(__dirname, '../spaceGameEngine.js'), 'utf-8');
  eval(spaceEngineCode.replace('window.SpaceGameEngine', 'global.window.SpaceGameEngine'));

  // Cargar bossGameEngine.js
  const bossEngineCode = readFileSync(join(__dirname, '../bossGameEngine.js'), 'utf-8');
  eval(bossEngineCode.replace('window.BossGameEngine', 'global.window.BossGameEngine'));

  // Cargar galaxySystemEngine.js
  const galaxyEngineCode = readFileSync(join(__dirname, '../galaxySystemEngine.js'), 'utf-8');
  eval(galaxyEngineCode.replace('window.GalaxySystemEngine', 'global.window.GalaxySystemEngine'));
} catch (error) {
  console.error('Error loading game engines:', error);
}

// Limpiar localStorage antes de cada test
beforeEach(() => {
  localStorage.clear();
});
