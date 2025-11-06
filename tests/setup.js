// tests/setup.js
// Setup global para todos los tests

import { vi } from 'vitest';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

global.localStorage = localStorageMock;

// Mock de console para tests más limpios (opcional)
global.console = {
  ...console,
  // Mantener error y warn, silenciar log en tests
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn()
};

// Mock básico de window
global.window = {
  localStorage: localStorageMock,
  soundSystem: null,
  eventBus: null
};

// Helper para resetear todos los mocks entre tests
export function resetAllMocks() {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
}

// Ejecutar antes de cada test
beforeEach(() => {
  resetAllMocks();
});
