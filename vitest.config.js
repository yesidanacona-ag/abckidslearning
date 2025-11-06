// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Entorno de testing (happy-dom es más rápido que jsdom)
    environment: 'happy-dom',

    // Archivos de test
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'server.js',
        'dist/',
        'coverage/'
      ],
      // Target >80% coverage
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },

    // Globals para no tener que importar describe/it/expect
    globals: true,

    // Setup files
    setupFiles: ['./tests/setup.js'],

    // Timeout para tests
    testTimeout: 10000,

    // Reportes
    reporters: ['verbose'],

    // Mock automático de localStorage, etc
    mockReset: true,
    restoreMocks: true
  }
});
