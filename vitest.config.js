import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['app.js', 'mateo.js', 'sounds.js', 'mnemonicTricks.js'],
      exclude: ['tests/**', 'node_modules/**', 'assets/**']
    }
  }
});
