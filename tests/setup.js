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
