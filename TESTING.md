# 🧪 Guía de Testing - Multiplicar Mágico

## 📋 Resumen

Sistema completo de pruebas unitarias para garantizar la calidad y estabilidad de la aplicación educativa "Multiplicar Mágico".

### ✅ Estado Actual

```
✓ 135 tests pasando
✓ 3 archivos de test
✓ Framework: Vitest 1.6.1
✓ Entorno: happy-dom
```

## 🚀 Instalación

Instalar dependencias de testing:

```bash
npm install
```

## 📝 Comandos Disponibles

### Ejecutar todos los tests (una vez)
```bash
npm test
```
o
```bash
npm run test:run
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:ui
```

### Ejecutar tests con reporte de cobertura
```bash
npm run test:coverage
```

## 📂 Estructura de Tests

```
tests/
├── setup.js              # Configuración global y mocks
├── mateo.test.js         # Tests de la mascota Mateo (42 tests)
├── tutorial.test.js      # Tests del sistema de tutorial (44 tests)
└── game-logic.test.js    # Tests de lógica del juego (49 tests)
```

## 🎯 Cobertura de Tests

### 1. MateoMascot (mateo.test.js) - 42 tests

**Funcionalidades probadas:**
- ✅ Constructor y estado inicial
- ✅ Método `show()` con diferentes expresiones
- ✅ Método `hide()` con timings
- ✅ Método `speak()` con duración
- ✅ Reacciones a respuestas correctas/incorrectas
- ✅ Mensajes de power-ups
- ✅ Celebraciones de nivel up
- ✅ Logros desbloqueados
- ✅ Modo tutorial
- ✅ Inicio/fin de juego
- ✅ Mensajes de ánimo
- ✅ Consejos de tablas

**Ejemplo:**
```javascript
describe('MateoMascot', () => {
  it('debe mostrar expresión celebrating para streak >= 5', () => {
    mateo.onCorrectAnswer(5);
    expect(mateo.currentExpression).toBe('celebrating');
    expect(mateo.speech.textContent).toContain('RACHA DE 5');
  });
});
```

### 2. TutorialSystem (tutorial.test.js) - 44 tests

**Funcionalidades probadas:**
- ✅ Inicialización y configuración
- ✅ Detección de primera vez (`shouldShow()`)
- ✅ Sistema de pasos
- ✅ Event listeners sin duplicados (FIX DE BUG)
- ✅ Posicionamiento de spotlight
- ✅ Navegación entre pasos
- ✅ Botón "Saltar" funcional (FIX DE BUG)
- ✅ Cleanup completo al cerrar (FIX CRÍTICO)
- ✅ Restauración de `pointer-events` (FIX CRÍTICO)
- ✅ Overlay transparente (FIX DE PANTALLA NEGRA)

**Tests críticos del bug fix:**
```javascript
describe('Método complete() - FIX CRÍTICO DE BUG', () => {
  it('CRÍTICO: debe restaurar pointer-events en mainScreen', () => {
    tutorial.complete();
    const mainScreen = document.getElementById('mainScreen');
    expect(mainScreen.style.pointerEvents).toBe('auto');
  });

  it('debe limpiar el spotlight completamente', () => {
    tutorial.complete();
    const spotlight = document.getElementById('tutorialSpotlight');
    expect(spotlight.classList.contains('active')).toBe(false);
    expect(spotlight.style.width).toBe('0px');
    expect(spotlight.style.height).toBe('0px');
  });
});
```

### 3. Lógica del Juego (game-logic.test.js) - 49 tests

**Sistemas probados:**

#### 📊 Validación de Respuestas (7 tests)
- Respuestas correctas/incorrectas
- Multiplicación por 0 y 1
- Números de dos dígitos
- Validación de entrada

#### ❓ Generación de Preguntas (4 tests)
- Rangos de números
- Tablas específicas
- Cálculo correcto

#### 🎲 Opciones Múltiples (5 tests)
- Cantidad correcta de opciones
- Inclusión de respuesta correcta
- Unicidad de opciones
- Números positivos

#### 🔥 Sistema de Rachas (7 tests)
- Incremento de racha
- Reset en error
- Mejor racha histórica
- Multiplicadores (1x, 1.5x, 2x, 3x)

#### ⚡ Sistema de Power-ups (10 tests)
- Uso y contadores
- Activación/desactivación
- Múltiples activos simultáneos
- Validación de tipos

#### 🎯 Sistema de Puntuación (9 tests)
- Puntuación base
- Multiplicadores de racha
- Bonus de tiempo
- Multiplicador de dificultad
- Combinaciones

#### 📈 Sistema de Niveles (7 tests)
- Subida de nivel
- XP sobrante
- Múltiples niveles
- Porcentaje de progreso

## 🔧 Configuración

### vitest.config.js

```javascript
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
```

### Mocks Globales (tests/setup.js)

El archivo de setup incluye:
- ✅ Mock de `localStorage`
- ✅ Mock de `Audio` API
- ✅ Mock de `SpeechSynthesis` API
- ✅ Mock de `requestAnimationFrame`
- ✅ Limpieza automática antes de cada test

## 🐛 Bugs Detectados y Probados

### Bug #1: Tutorial Bloqueaba Pantalla (RESUELTO)
**Síntomas:** Pantalla negra, no se podía interactuar
**Tests que lo verifican:**
- `debe limpiar el spotlight completamente`
- `CRÍTICO: debe restaurar pointer-events en mainScreen`
- `overlay debe tener background transparent`

### Bug #2: Skip Button No Funcionaba (RESUELTO)
**Síntomas:** Botón "Saltar" no respondía
**Tests que lo verifican:**
- `NO debe agregar listeners duplicados`
- `debe verificar que existan los botones antes de agregar listeners`
- `debe llamar a complete()`

### Bug #3: Event Listeners Duplicados (RESUELTO)
**Síntomas:** Acciones se ejecutaban múltiples veces
**Test que lo verifica:**
- `NO debe agregar listeners duplicados`

## 📊 Interpretar Resultados

### Ejecución Exitosa
```
✓ tests/game-logic.test.js  (49 tests) 24ms
✓ tests/mateo.test.js  (42 tests) 44ms
✓ tests/tutorial.test.js  (44 tests) 115ms

Test Files  3 passed (3)
     Tests  135 passed (135)
```

### Ejecución con Errores
```
❯ tests/tutorial.test.js > TutorialSystem > complete() > ...
  AssertionError: expected '...' to be '...'

  ❯ tests/tutorial.test.js:544:37
```

## 🎯 Agregar Nuevos Tests

### 1. Crear archivo de test

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Mi Nueva Funcionalidad', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  it('debe hacer algo específico', () => {
    // Arrange: preparar
    const resultado = miFuncion(input);

    // Assert: verificar
    expect(resultado).toBe(esperado);
  });
});
```

### 2. Ejecutar solo ese archivo

```bash
npm test -- tests/mi-archivo.test.js
```

### 3. Ejecutar en modo watch para desarrollo

```bash
npm run test:ui
```

## 🔍 Debugging de Tests

### Ver output detallado
```bash
npm test -- --reporter=verbose
```

### Ejecutar test específico
```bash
npm test -- -t "nombre del test"
```

### Ver solo tests que fallan
```bash
npm test -- --reporter=verbose --only
```

## 📈 Métricas de Calidad

### Tiempo de Ejecución
- ⚡ **Total:** ~2.5 segundos
- ⚡ **Promedio por test:** ~18ms
- ⚡ **Tests más lentos:** Tutorial (~115ms)

### Cobertura por Componente
- ✅ **MateoMascot:** 100% de métodos públicos
- ✅ **TutorialSystem:** 100% de métodos públicos
- ✅ **Lógica de Juego:** 100% de funcionalidades críticas

## 🎓 Buenas Prácticas

1. **Ejecuta tests antes de commit:**
   ```bash
   npm test && git commit -m "mensaje"
   ```

2. **Escribe tests para bugs nuevos:**
   - Primero escribe el test que falla
   - Luego arregla el código
   - Verifica que el test pasa

3. **Mantén tests independientes:**
   - Cada test debe poder ejecutarse solo
   - Usa `beforeEach` para setup
   - No dependas del orden de ejecución

4. **Nombres descriptivos:**
   ```javascript
   // ✅ Bueno
   it('debe resetear racha cuando la respuesta es incorrecta', ...)

   // ❌ Malo
   it('test 1', ...)
   ```

## 🔄 CI/CD (Futuro)

Para integración continua, agrega a tu pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Happy DOM](https://github.com/capricorn86/happy-dom)

## 🎉 Resumen

Este sistema de testing garantiza:
- ✅ Detección temprana de bugs
- ✅ Regresiones previstas
- ✅ Refactorización segura
- ✅ Documentación viva del comportamiento
- ✅ Confianza en deploys

**135 tests protegiendo la experiencia de aprendizaje de los niños** 🎓✨
