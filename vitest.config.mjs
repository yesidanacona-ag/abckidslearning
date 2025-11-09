import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: [
        // Legacy monolithic files
        'app.js',
        'mateo.js',
        'sounds.js',
        'mnemonicTricks.js',
        // New modular architecture
        'src/core/**/*.js',
        'src/services/**/*.js',
        'src/controllers/**/*.js',
        'src/Bootstrap.js'
      ],
      exclude: [
        'tests/**',
        'node_modules/**',
        'assets/**',
        'server.js'
      ],
      // Coverage thresholds (80%+ target)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    // Test timeout for slower systems
    testTimeout: 10000,
    // Separate slow integration tests
    slowTestThreshold: 5000
  }
});
