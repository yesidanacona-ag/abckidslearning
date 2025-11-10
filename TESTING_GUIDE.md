# 🧪 Guía Completa de Testing

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Configuración Inicial](#configuración-inicial)
3. [Tipos de Tests](#tipos-de-tests)
4. [Ejecutar Tests](#ejecutar-tests)
5. [Escribir Tests](#escribir-tests)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Coverage Reports](#coverage-reports)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Visión General

**Multiplicar Mágico** tiene una suite completa de tests que cubre:
- ✅ **135+ tests unitarios** (core modules, services, controllers)
- ✅ **50+ tests de integración** (módulos trabajando juntos)
- ✅ **20+ tests E2E** (flujos completos de usuario)
- 🎯 **Target: 80%+ code coverage**

### Estructura de Tests

```
tests/
├── setup.js                          # Configuración global (mocks, globals)
├── core-modules.test.js              # Tests de StorageManager, EventBus, GameStore (68 tests)
├── services.test.js                  # Tests de Services (120+ tests)
├── integration.test.js               # Tests de integración (50+ tests)
└── e2e/
    ├── game-flow.spec.js             # E2E: flujos de juego completos
    └── achievements-adaptive.spec.js # E2E: achievements y adaptive learning
```

---

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- **Vitest** - Test runner (unit & integration tests)
- **@vitest/ui** - Interfaz visual para tests
- **@vitest/coverage-v8** - Code coverage con V8
- **happy-dom** - DOM environment para tests
- **@playwright/test** - E2E testing framework

### 2. Instalar Playwright Browsers (solo para E2E)

```bash
npx playwright install
```

Esto descarga los navegadores necesarios para E2E tests (Chromium, Firefox, WebKit).

---

## Tipos de Tests

### 1️⃣ Unit Tests (Tests Unitarios)

**Objetivo**: Probar módulos individuales en aislamiento.

**Archivos**:
- `tests/core-modules.test.js` - StorageManager, EventBus, GameStore (68 tests)
- `tests/services.test.js` - PlayerService, AdaptiveService, QuestionService, AchievementService (120+ tests)

**Ejemplo**:
```javascript
describe('PlayerService', () => {
    it('debe agregar monedas correctamente', () => {
        const playerService = new PlayerService(store, eventBus);
        playerService.addCoins(50);
        expect(store.getState().player.coins).toBe(50);
    });
});
```

**Ejecutar**:
```bash
npm run test:run              # Run once
npm test                      # Watch mode
npm run test:ui               # Visual UI
```

### 2️⃣ Integration Tests (Tests de Integración)

**Objetivo**: Probar cómo interactúan múltiples módulos juntos.

**Archivo**: `tests/integration.test.js` (50+ tests)

**Cubre**:
- ✅ Bootstrap initialization
- ✅ Store + Services synchronization
- ✅ GameController + Services integration
- ✅ Event flow across modules
- ✅ Persistence across sessions
- ✅ Performance benchmarks

**Ejemplo**:
```javascript
describe('GameController + Services Integration', () => {
    it('debe manejar respuesta correcta integrando todos los services', () => {
        gameController.startGame('practice', { tables: [7], count: 1 });
        const question = gameController.getCurrentQuestion();
        const result = gameController.handleAnswer(question.answer);

        expect(result.isCorrect).toBe(true);
        expect(store.getState().player.coins).toBeGreaterThan(0);
    });
});
```

**Ejecutar**:
```bash
npm run test:run tests/integration.test.js
```

### 3️⃣ E2E Tests (End-to-End Tests)

**Objetivo**: Probar flujos completos de usuario en el navegador real.

**Archivos**:
- `tests/e2e/game-flow.spec.js` - Flujos completos de juego
- `tests/e2e/achievements-adaptive.spec.js` - Sistema de achievements y adaptive learning

**Cubre**:
- ✅ Carga de la aplicación
- ✅ Crear nuevo jugador
- ✅ Flujo completo de Modo Práctica
- ✅ Navegación entre pantallas
- ✅ Tienda (comprar/equipar items)
- ✅ Desbloqueo de achievements
- ✅ Sistema adaptativo (maestría)
- ✅ Responsive design (móvil, tablet, desktop)

**Ejemplo**:
```javascript
test('flujo completo: Modo Práctica', async ({ page }) => {
    await page.goto('/');

    // Setup jugador
    await page.evaluate(() => {
        localStorage.setItem('playerData', JSON.stringify({ name: 'Test' }));
    });
    await page.reload();

    // Click en Modo Práctica
    await page.locator('button:has-text("Práctica")').click();

    // Verificar pregunta mostrada
    await expect(page.locator('.question-text')).toBeVisible();
});
```

**Ejecutar**:
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Visual UI mode
npm run test:e2e:debug        # Debug mode
```

---

## Ejecutar Tests

### Comandos Rápidos

```bash
# Unit & Integration Tests
npm test                      # Watch mode (auto-rerun on file change)
npm run test:run              # Run once
npm run test:ui               # Visual UI (recommended)
npm run test:coverage         # Run with coverage report

# E2E Tests
npm run test:e2e              # Run E2E tests
npm run test:e2e:ui           # E2E with visual UI
npm run test:e2e:debug        # E2E debug mode

# Todo junto
npm run test:all              # Unit + Integration + E2E
```

### Test UI (Recomendado)

La interfaz visual de Vitest es la mejor manera de desarrollar y debuggear tests:

```bash
npm run test:ui
```

Esto abre un navegador con:
- 🔄 Auto-reload al cambiar archivos
- 🎯 Filtrar tests por nombre
- 🐛 Ver errores detallados
- 📊 Code coverage visual
- ⚡ Ejecutar tests individuales

### Watch Mode

Para desarrollo continuo:

```bash
npm test
```

Los tests se re-ejecutan automáticamente cuando cambias:
- Archivos de test (tests/**/*.test.js)
- Archivos de código fuente (src/**/*.js, app.js, etc.)

### Coverage Report

Para ver cobertura de código:

```bash
npm run test:coverage
```

Esto genera:
- **Terminal**: Resumen de coverage por archivo
- **HTML Report**: `coverage/index.html` (abrir en navegador)
- **LCOV**: `coverage/lcov.info` (para CI/CD)
- **JSON**: `coverage/coverage-summary.json`

**Coverage Thresholds** (configurado en `vitest.config.mjs`):
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

Si el coverage está por debajo, el comando falla (útil para CI/CD).

---

## Escribir Tests

### Estructura de un Test

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Nombre del Módulo', () => {
    let dependency1, dependency2;

    beforeEach(() => {
        // Setup: reiniciar estado antes de cada test
        localStorage.clear();
        dependency1 = new Dependency1();
        dependency2 = new Dependency2();
    });

    it('debe hacer algo específico', () => {
        // Arrange: preparar datos
        const input = 'test';

        // Act: ejecutar acción
        const result = moduleUnderTest.doSomething(input);

        // Assert: verificar resultado
        expect(result).toBe('expected');
    });
});
```

### Matchers Comunes

```javascript
// Igualdad
expect(value).toBe(42);                // Igualdad estricta (===)
expect(obj).toEqual({ a: 1 });         // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeNull();

// Números
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThan(10);
expect(num).toBeGreaterThanOrEqual(5);

// Arrays
expect(arr).toContain('item');
expect(arr).toHaveLength(3);

// Strings
expect(str).toMatch(/pattern/);

// Funciones
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('arg');
expect(fn).toHaveBeenCalledTimes(2);

// Excepciones
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('Error message');
```

### Mocking con Vitest

```javascript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn('arg');
expect(mockFn).toHaveBeenCalledWith('arg');

// Mock return value
const mockFn = vi.fn().mockReturnValue(42);
expect(mockFn()).toBe(42);

// Mock implementation
const mockFn = vi.fn((x) => x * 2);
expect(mockFn(5)).toBe(10);

// Spy on method
const spy = vi.spyOn(object, 'method');
object.method();
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

### Testing Async Code

```javascript
// Con done callback
it('debe emitir evento', (done) => {
    eventBus.on('test', (data) => {
        expect(data.value).toBe(42);
        done();
    });
    eventBus.emit('test', { value: 42 });
});

// Con async/await
it('debe esperar promesa', async () => {
    const result = await asyncFunction();
    expect(result).toBe('success');
});

// Con timeout
it('debe timeout si no recibe evento', async () => {
    await expect(
        bus.waitFor('never', 10)
    ).rejects.toThrow('Timeout');
});
```

### Testing DOM (E2E)

```javascript
// Playwright E2E
test('debe mostrar elemento', async ({ page }) => {
    await page.goto('/');

    // Localizar elemento
    const button = page.locator('button:has-text("Click")');

    // Verificar visibilidad
    await expect(button).toBeVisible();

    // Click
    await button.click();

    // Verificar texto
    await expect(page.locator('.result')).toHaveText('Success');
});
```

### Best Practices

1. **Un concepto por test**: Cada test debe probar una sola cosa
2. **Nombres descriptivos**: `debe hacer X cuando Y`
3. **Arrange-Act-Assert**: Estructura clara
4. **Independencia**: Tests no deben depender entre sí
5. **Limpieza**: Usar `beforeEach` para resetear estado
6. **No hardcodear datos**: Usar factories o builders para objetos complejos

---

## CI/CD Pipeline

### GitHub Actions Workflow

El proyecto tiene un pipeline automatizado en `.github/workflows/test.yml`:

**Triggers**:
- ✅ Push a `main`, `master`, `develop`, `claude/**`
- ✅ Pull requests
- ✅ Manual dispatch

**Jobs**:

1. **Unit Tests** (matriz: Node 18.x, 20.x)
   - Ejecuta `npm run test:run`
   - Genera coverage report
   - Sube coverage a Codecov
   - Guarda artifact de coverage

2. **Code Quality**
   - Verifica sintaxis JavaScript
   - Ejecuta coverage con thresholds
   - Falla si coverage < 80%

3. **E2E Tests** (placeholder)
   - Configurado para Playwright
   - Actualmente en modo skip

4. **Performance**
   - Ejecuta integration tests con benchmarks
   - Verifica thresholds de performance

5. **Test Summary**
   - Resumen de todos los jobs
   - Muestra status en GitHub UI

### Ver Resultados en GitHub

1. Ir a tu repositorio en GitHub
2. Click en "Actions" tab
3. Ver status de cada workflow run
4. Click en un run para ver detalles de cada job
5. Download coverage artifacts si necesitas

### Coverage Badges (opcional)

Si usas Codecov:

```markdown
[![Coverage](https://codecov.io/gh/usuario/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/usuario/repo)
```

---

## Coverage Reports

### Interpretar Coverage

**Coverage Report** muestra 4 métricas:

1. **Lines**: % de líneas ejecutadas
2. **Functions**: % de funciones llamadas
3. **Branches**: % de ramas (if/else, switch) cubiertas
4. **Statements**: % de statements ejecutados

**Objetivo**: 80%+ en todas las métricas (configurado en `vitest.config.mjs`)

### Ver Coverage HTML

```bash
npm run test:coverage
open coverage/index.html
```

Esto muestra:
- 📊 Overview por archivo
- 🟢 Líneas cubiertas (verde)
- 🔴 Líneas no cubiertas (rojo)
- 🟡 Ramas parcialmente cubiertas (amarillo)

### Mejorar Coverage

Si coverage está bajo:

1. **Identificar archivos sin coverage**:
   - Ver `coverage/index.html`
   - Buscar archivos en rojo (<80%)

2. **Agregar tests para código no cubierto**:
   - Ver líneas rojas en HTML report
   - Escribir tests que ejerciten esas líneas

3. **Considerar edge cases**:
   - Error handling (try/catch)
   - Validaciones (if/else)
   - Casos límite (empty arrays, null, undefined)

---

## Best Practices

### 1. Write Tests First (TDD)

Para nuevas features:
```
1. Escribir test (falla) ❌
2. Implementar código (test pasa) ✅
3. Refactorizar 🔄
```

### 2. Keep Tests Fast

- ✅ Unit tests: < 50ms cada uno
- ✅ Integration tests: < 500ms cada uno
- ✅ E2E tests: < 30s cada uno

### 3. Use Descriptive Names

```javascript
// ❌ Mal
it('test 1', () => { ... });

// ✅ Bien
it('debe agregar monedas al jugador cuando responde correctamente', () => { ... });
```

### 4. Test Behavior, Not Implementation

```javascript
// ❌ Mal (prueba implementación interna)
it('debe llamar a this.store.setState', () => {
    const spy = vi.spyOn(store, 'setState');
    service.addCoins(10);
    expect(spy).toHaveBeenCalled();
});

// ✅ Bien (prueba comportamiento observable)
it('debe incrementar monedas en 10', () => {
    service.addCoins(10);
    expect(store.getState().player.coins).toBe(10);
});
```

### 5. Clean Up After Tests

```javascript
beforeEach(() => {
    localStorage.clear();
    // Reiniciar mocks
    vi.clearAllMocks();
});

afterEach(() => {
    // Limpiar timers, event listeners, etc.
    vi.clearAllTimers();
});
```

### 6. Avoid Test Interdependence

```javascript
// ❌ Mal
it('test A', () => {
    globalVar = 'something';
});

it('test B', () => {
    expect(globalVar).toBe('something'); // Depende de test A
});

// ✅ Bien
it('test A', () => {
    const localVar = 'something';
    expect(localVar).toBe('something');
});

it('test B', () => {
    const localVar = 'something';
    expect(localVar).toBe('something');
});
```

---

## Troubleshooting

### Tests Failing

#### "Cannot find module..."

**Problema**: Module not found

**Solución**:
```bash
npm install
```

#### "localStorage is not defined"

**Problema**: DOM API not available

**Solución**: Verifica que `tests/setup.js` está configurado:
```javascript
// tests/setup.js
global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
```

#### "Timeout of 5000ms exceeded"

**Problema**: Test tarda demasiado

**Solución**:
```javascript
// Aumentar timeout para este test
it('slow test', async () => { ... }, 10000); // 10s timeout

// O configurar en vitest.config.mjs
testTimeout: 10000
```

### E2E Tests Failing

#### "Target closed"

**Problema**: Página se cerró antes de completar test

**Solución**: Aumentar timeout en `playwright.config.js`:
```javascript
timeout: 60000 // 60 segundos
```

#### "Selector not found"

**Problema**: Elemento no está en el DOM

**Solución**:
```javascript
// Esperar a que aparezca
await page.locator('button').waitFor({ timeout: 5000 });

// O usar expect con timeout implícito
await expect(page.locator('button')).toBeVisible({ timeout: 5000 });
```

### Coverage Not Updating

**Problema**: Coverage report desactualizado

**Solución**:
```bash
# Limpiar coverage anterior
rm -rf coverage

# Re-generar
npm run test:coverage
```

### CI/CD Failing

#### "Coverage below threshold"

**Problema**: Coverage < 80%

**Solución**: Agregar más tests o ajustar thresholds en `vitest.config.mjs`

#### "Tests pass locally but fail on CI"

**Posibles causas**:
1. **Timing issues**: Usar `waitFor()` en vez de `setTimeout()`
2. **Environment differences**: Verificar Node version
3. **Flaky tests**: Agregar retries en `playwright.config.js`

---

## Recursos Adicionales

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Checklist para Pull Requests

Antes de hacer merge, verificar:

- [ ] Todos los tests pasan (`npm run test:all`)
- [ ] Coverage >= 80% (`npm run test:coverage`)
- [ ] No hay tests skip/only (`fit`, `fdescribe`, `it.skip`)
- [ ] Tests nuevos para código nuevo
- [ ] CI/CD pipeline pasa en GitHub Actions
- [ ] Tests E2E pasan en múltiples navegadores

---

## Contacto y Soporte

Si tienes problemas con los tests:
1. Revisar esta guía
2. Ver ejemplos en archivos existentes
3. Revisar documentación oficial de Vitest/Playwright
4. Abrir issue en GitHub con detalles del error
