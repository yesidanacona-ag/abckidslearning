# 🎯 PLAN DE MEJORA: FIX CRÍTICO PARA SISTEMA DE DESCUBRIMIENTO

**Versión**: 2.0
**Fecha**: 2025-11-10
**Basado en**: Auditoría exhaustiva completa

---

## 📋 RESUMEN EJECUTIVO

### Problema Identificado
El sistema de descubrimiento de tablas **NO funciona** porque:
1. `ModeController` no recibe el objeto `services` en su constructor
2. `needsDiscovery()` siempre devuelve `false` (porque `this.services` es `undefined`)
3. El modal "APRENDER vs PRACTICAR" nunca se muestra
4. Usuarios SIEMPRE van a modo práctica tradicional
5. La pantalla "El Truco Secreto de la Tabla del X" nunca aparece

### Root Cause
**Archivo**: `src/Bootstrap.js:421-426`

El constructor de ModeController NO recibe el 5º parámetro (`services`):

```javascript
// ❌ ACTUAL (INCORRECTO)
this.controllers.mode = new ModeController(
    this.store,
    this.eventBus,
    this.controllers.screen,
    this.controllers.game
    // ← FALTA: this.services
);
```

### Solución Propuesta
Modificar **2 archivos**:
1. `src/Bootstrap.js`: Pasar `services` como 5º parámetro
2. `src/controllers/ModeController.js`: Recibir y almacenar `services`

**Impacto**: BAJO (solo 2 líneas de código modificadas)
**Riesgo**: MÍNIMO (fix quirúrgico y preciso)
**Tiempo estimado**: 15 minutos (implementación + testing)

---

## 🔍 HALLAZGOS DE LA AUDITORÍA

### 🔴 CRITICAL BUG #1: ModeController sin acceso a services
**Ubicación**: `src/Bootstrap.js:421-426`
**Severidad**: CRÍTICA
**Impacto**: Sistema de descubrimiento completamente roto

```javascript
// ❌ CÓDIGO ACTUAL
this.controllers.mode = new ModeController(
    this.store,           // ✅ Parámetro 1
    this.eventBus,        // ✅ Parámetro 2
    this.controllers.screen,  // ✅ Parámetro 3
    this.controllers.game     // ✅ Parámetro 4
    // ❌ FALTA: this.services (Parámetro 5)
);
```

**Consecuencia**: `ModeController.services` queda `undefined`

---

### 🔴 CRITICAL BUG #2: needsDiscovery() siempre devuelve false
**Ubicación**: `src/controllers/ModeController.js:498-503`
**Severidad**: CRÍTICA
**Impacto**: Lógica de decisión APRENDER/PRACTICAR nunca se activa

```javascript
needsDiscovery(table) {
    if (!this.services?.player) return false;  // ❌ this.services es undefined

    const isDiscovered = this.services.player.isTableDiscovered(table);
    return !isDiscovered;
}
```

**Evaluación**:
- `this.services` = `undefined` (BUG #1)
- `this.services?.player` = `undefined`
- `!undefined` = `true`
- **`return false`** ← SIEMPRE devuelve "NO necesita descubrimiento"

**Consecuencia**: `handleTableSelection()` SIEMPRE va a práctica, NUNCA muestra modal

---

### 🔴 CRITICAL BUG #3: Constructor de ModeController incompleto
**Ubicación**: `src/controllers/ModeController.js:7-11`
**Severidad**: CRÍTICA
**Impacto**: No puede almacenar services aunque se pase

```javascript
// ❌ CÓDIGO ACTUAL
constructor(store, eventBus, screenController, gameController) {
    this.store = store;
    this.eventBus = eventBus;
    this.screenController = screenController;
    this.gameController = gameController;
    // ❌ FALTA: this.services = services;
}
```

**Consecuencia**: Aunque se pase `services` (BUG #1), no se almacenaría

---

### 🟡 DESIGN ISSUE: Logging insuficiente
**Ubicación**: Múltiples archivos
**Severidad**: MEDIA
**Impacto**: Difícil debugging, no se detectó el bug antes

**Archivos sin logging adecuado**:
- `src/Bootstrap.js` (no muestra qué se pasa a ModeController)
- `src/controllers/ModeController.js:498` (no muestra resultado de needsDiscovery)
- `src/controllers/ModeController.js:510` (no muestra decisión de auto mode)

**Recomendación**: Agregar console.log estratégicos

---

## ✅ PLAN DE IMPLEMENTACIÓN

### FASE 1: FIX CRÍTICO (Pasar services a ModeController)

#### Cambio 1.1: Modificar Bootstrap.js
**Archivo**: `src/Bootstrap.js:421-426`
**Líneas a modificar**: 1 línea (agregar parámetro)

```javascript
// ❌ ANTES
this.controllers.mode = new ModeController(
    this.store,
    this.eventBus,
    this.controllers.screen,
    this.controllers.game
);

// ✅ DESPUÉS
this.controllers.mode = new ModeController(
    this.store,
    this.eventBus,
    this.controllers.screen,
    this.controllers.game,
    this.services  // ← AGREGAR ESTA LÍNEA
);
```

**Testing**: Verificar que `this.services` existe antes de pasar
**Rollback**: Quitar la línea agregada

---

#### Cambio 1.2: Modificar constructor de ModeController
**Archivo**: `src/controllers/ModeController.js:7-26`
**Líneas a modificar**: Signature del constructor + 1 línea

```javascript
// ❌ ANTES
class ModeController {
    constructor(store, eventBus, screenController, gameController) {
        this.store = store;
        this.eventBus = eventBus;
        this.screenController = screenController;
        this.gameController = gameController;

        // Referencias a game engines externos
        this.engines = {
            // ...
        };

        // Modo actual
        this.currentMode = null;
    }
}

// ✅ DESPUÉS
class ModeController {
    constructor(store, eventBus, screenController, gameController, services) {
        this.store = store;
        this.eventBus = eventBus;
        this.screenController = screenController;
        this.gameController = gameController;
        this.services = services;  // ← AGREGAR ESTA LÍNEA

        // Referencias a game engines externos
        this.engines = {
            // ...
        };

        // Modo actual
        this.currentMode = null;
    }
}
```

**Testing**: Verificar que `this.services` se almacena correctamente
**Rollback**: Quitar parámetro y línea agregada

---

### FASE 2: MEJORAS DE LOGGING (Debugging proactivo)

#### Cambio 2.1: Agregar logging en Bootstrap.js
**Archivo**: `src/Bootstrap.js:419-431`
**Objetivo**: Ver qué se pasa a ModeController

```javascript
// ModeController
if (typeof ModeController !== 'undefined') {
    console.log('🔧 Inicializando ModeController con:', {
        store: !!this.store,
        eventBus: !!this.eventBus,
        screen: !!this.controllers.screen,
        game: !!this.controllers.game,
        services: !!this.services,
        player: !!this.services?.player
    });

    this.controllers.mode = new ModeController(
        this.store,
        this.eventBus,
        this.controllers.screen,
        this.controllers.game,
        this.services
    );
    console.log('  ✓ ModeController');
} else {
    console.error('  ❌ ModeController no disponible');
}
```

---

#### Cambio 2.2: Agregar logging en needsDiscovery()
**Archivo**: `src/controllers/ModeController.js:498-503`
**Objetivo**: Ver resultado de decisión

```javascript
needsDiscovery(table) {
    // Fail-safe: si no hay PlayerService, asumir que SÍ necesita descubrimiento
    if (!this.services?.player) {
        console.warn(`⚠️ PlayerService no disponible para tabla ${table}, asumiendo que necesita descubrimiento`);
        return true;  // ← CAMBIO: De false a true
    }

    const isDiscovered = this.services.player.isTableDiscovered(table);
    const needs = !isDiscovered;

    console.log(`🔍 Tabla ${table}: isDiscovered=${isDiscovered}, needsDiscovery=${needs}`);

    return needs;
}
```

**Cambio importante**: `return true` cuando no hay services (fail-safe)

---

#### Cambio 2.3: Agregar logging en handleTableSelection()
**Archivo**: `src/controllers/ModeController.js:510-529`
**Objetivo**: Ver decisiones de flujo

```javascript
handleTableSelection(table, mode = 'auto') {
    console.log(`🎯 ModeController.handleTableSelection(table=${table}, mode=${mode})`);

    // Auto-detect si necesita descubrimiento
    if (mode === 'auto') {
        const needs = this.needsDiscovery(table);
        console.log(`📊 needsDiscovery(${table}) = ${needs}`);

        if (needs) {
            console.log(`🎓 Mostrando opciones APRENDER/PRACTICAR para tabla ${table}`);
            this.showDiscoveryOptions(table);
            return;
        } else {
            console.log(`⚡ Tabla ${table} ya descubierta, ir directo a práctica`);
            mode = 'practice';
        }
    }

    // Ejecutar modo seleccionado
    console.log(`🚀 Ejecutando modo: ${mode} para tabla ${table}`);
    if (mode === 'discover') {
        this.startTableDiscovery(table);
    } else if (mode === 'practice') {
        this.startPracticeMode([table]);
    }
}
```

---

#### Cambio 2.4: Agregar logging en practicePlanetTable()
**Archivo**: `app.js:3535-3549`
**Objetivo**: Verificar disponibilidad de Bootstrap

```javascript
practicePlanetTable() {
    if (!this.currentPlanetTable) return;

    this.closePlanetModal();

    const table = this.currentPlanetTable;

    // Debug: Verificar disponibilidad de Bootstrap
    const bootstrapState = {
        bootstrap: !!window.bootstrap,
        controllers: !!window.bootstrap?.controllers,
        mode: !!window.bootstrap?.controllers?.mode,
        services: !!window.bootstrap?.services,
        player: !!window.bootstrap?.services?.player
    };
    console.log('🔍 Estado de Bootstrap:', bootstrapState);

    // Usar ModeController si está disponible
    if (window.bootstrap?.controllers?.mode) {
        console.log(`🌌 Galaxy → Usando ModeController para tabla ${table}`);
        window.bootstrap.controllers.mode.handleTableSelection(table, 'auto');
        return;
    }

    // Fallback: Si tenemos practiceSystem, usarlo
    console.warn(`⚠️ ModeController no disponible, usando fallback para tabla ${table}`);
    if (this.practiceSystem) {
        this.showScreen('practiceGameScreen');
        this.startPracticeModeWithTable(table);
    } else {
        // Fallback al sistema antiguo
        this.showScreen('practiceScreen');
        document.querySelectorAll('.table-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.table == table) {
                btn.classList.add('selected');
            }
        });
        setTimeout(() => this.handleStartPractice(), 100);
    }

    console.log(`🎯 Iniciando práctica de tabla del ${table}`);
}
```

---

### FASE 3: TESTING EXHAUSTIVO

#### Test 3.1: Verificar sintaxis JavaScript
```bash
node --check src/Bootstrap.js
node --check src/controllers/ModeController.js
node --check app.js
```

**Criterio de éxito**: No errores de sintaxis

---

#### Test 3.2: Testing manual - Flujo completo

**Pre-requisitos**:
1. Abrir consola del navegador (F12)
2. Ejecutar: `localStorage.clear()` para resetear progreso
3. Recargar página

**Pasos**:

1. **Inicio de app**
   - ✅ Verificar en consola: "✓ ModeController" con logging de parámetros
   - ✅ Verificar que `services: true` y `player: true` en el log

2. **Ir a Galaxia**
   - Click en botón "Galaxia" o "Explorar Galaxia"
   - ✅ Ver mapa de galaxia con planetas

3. **Click en planeta (ej: Tabla del 2)**
   - ✅ Modal del planeta se abre
   - ✅ Ver información: "Tabla del 2", mastery 0%, etc.

4. **Click en "Practicar"**
   - ✅ Verificar en consola:
     ```
     🔍 Estado de Bootstrap: {bootstrap: true, controllers: true, mode: true, services: true, player: true}
     🌌 Galaxy → Usando ModeController para tabla 2
     🎯 ModeController.handleTableSelection(table=2, mode=auto)
     🔍 Tabla 2: isDiscovered=false, needsDiscovery=true
     📊 needsDiscovery(2) = true
     🎓 Mostrando opciones APRENDER/PRACTICAR para tabla 2
     ```

5. **Verificar modal APRENDER/PRACTICAR**
   - ✅ Modal `learnOrPracticeModal` se muestra
   - ✅ Ver Mateo grande (🧙‍♂️)
   - ✅ Ver mensaje: "Veo que quieres trabajar con la **Tabla del 2**..."
   - ✅ Ver botón: **¡APRENDER!** (Descubre el truco secreto)
   - ✅ Ver botón: **¡PRACTICAR!** (Responde preguntas)

6. **Click en "APRENDER"**
   - ✅ Verificar en consola:
     ```
     📚 Usuario eligió APRENDER tabla 2
     🎓 Iniciando descubrimiento de Tabla 2
     ```
   - ✅ Pantalla `discoveryIntroScreen` se muestra
   - ✅ Ver título: **"🧙‍♂️ El Truco Secreto de la Tabla del 2"**
   - ✅ Ver explicación del truco mnemónico
   - ✅ Ver botón: **"✨ ENTIENDO, ¡PRACTICEMOS!"**

7. **Completar flujo de descubrimiento**
   - Click en "ENTIENDO, ¡PRACTICEMOS!"
   - ✅ Responder 10 preguntas guiadas
   - ✅ Recibir recompensas al finalizar
   - ✅ Volver a pantalla principal

8. **Verificar progreso guardado**
   - Abrir consola, ejecutar:
     ```javascript
     JSON.parse(localStorage.getItem('playerData')).tablesMastery[2]
     ```
   - ✅ Ver `discoveryCompleted: true`
   - ✅ Ver `mastery: X` (algún porcentaje > 0)

9. **Re-test con tabla ya descubierta**
   - Ir a Galaxia → Click en Tabla del 2 → Click "Practicar"
   - ✅ Verificar en consola:
     ```
     🔍 Tabla 2: isDiscovered=true, needsDiscovery=false
     ⚡ Tabla 2 ya descubierta, ir directo a práctica
     🚀 Ejecutando modo: practice para tabla 2
     ```
   - ✅ NO aparece modal APRENDER/PRACTICAR
   - ✅ Va directo a modo práctica

---

#### Test 3.3: Testing de regresión

**Objetivo**: Verificar que no rompimos nada existente

1. **Modo práctica desde botón principal**
   - Click en "Practicar" desde menú principal
   - ✅ Funciona normalmente

2. **Modo aventura espacial**
   - Click en "Aventura Espacial"
   - ✅ Funciona normalmente

3. **Modo boss battle**
   - Click en "Batalla de Jefes"
   - ✅ Funciona normalmente

4. **Otros entry points de práctica**
   - Desde misiones diarias
   - Desde achievements
   - ✅ Todos funcionan

---

#### Test 3.4: Testing de edge cases

1. **¿Qué pasa si services no existe?**
   - Simular: `window.bootstrap.services = undefined`
   - ✅ Verificar: `needsDiscovery()` devuelve `true` (fail-safe)
   - ✅ Modal APRENDER/PRACTICAR aparece de todas formas

2. **¿Qué pasa si player no existe?**
   - Simular: `window.bootstrap.services.player = undefined`
   - ✅ Verificar: Warning en consola
   - ✅ Modal APRENDER/PRACTICAR aparece

3. **¿Qué pasa si ModeController no existe?**
   - Simular: `window.bootstrap.controllers.mode = undefined`
   - ✅ Verificar: Cae al fallback en `practicePlanetTable()`
   - ✅ Va a práctica tradicional (comportamiento antiguo)

4. **¿Qué pasa si usuario ya completó todas las tablas?**
   - Setear todas como descubiertas en localStorage
   - ✅ Verificar: Siempre va directo a práctica
   - ✅ Nunca muestra modal APRENDER

---

### FASE 4: COMMIT Y PUSH

#### Commit Message
```
🐛 FIX CRÍTICO: Sistema de descubrimiento roto por falta de services

Root Cause:
- ModeController no recibía objeto 'services' en constructor
- needsDiscovery() siempre devolvía false (this.services = undefined)
- Modal APRENDER/PRACTICAR nunca se mostraba
- discoveryIntroScreen nunca se activaba

Solución:
1. Bootstrap.js:426 - Pasar this.services como 5º parámetro
2. ModeController.js:7 - Recibir y almacenar services en constructor
3. ModeController.js:498 - Mejorar fail-safe en needsDiscovery()
4. Agregar logging exhaustivo para debugging

Cambios técnicos:
- src/Bootstrap.js:426: Agregado parámetro this.services
- src/controllers/ModeController.js:7: Agregado parámetro services
- src/controllers/ModeController.js:11: Agregado this.services = services
- src/controllers/ModeController.js:498-503: Mejorado needsDiscovery() con logging
- src/controllers/ModeController.js:510-529: Agregado logging en handleTableSelection()
- app.js:3535-3567: Mejorado logging en practicePlanetTable()

Testing:
- ✅ Sintaxis JavaScript verificada
- ✅ Modal APRENDER/PRACTICAR se muestra correctamente
- ✅ discoveryIntroScreen se muestra con truco secreto
- ✅ Flujo completo probado con localStorage.clear()
- ✅ Progreso se guarda correctamente
- ✅ Tablas ya descubiertas van directo a práctica
- ✅ No hay regresiones en otros modos

Flujo corregido:
1. Click planeta → Modal se abre
2. Click "Practicar" → ModeController verifica needsDiscovery()
3. Si NO descubierta → Modal APRENDER/PRACTICAR aparece
4. Click "APRENDER" → "El Truco Secreto de la Tabla del X" ✨
5. Completar 10 preguntas guiadas → Recompensas → Progreso guardado
6. Si YA descubierta → Directo a práctica

Relacionado: PLAN_MEJORA_DISCOVERY_v2.md, AUDITORIA_DISCOVERY.md
```

---

## 🔄 PLAN DE ROLLBACK

Si algo sale mal, aquí están las opciones:

### Opción A: Revert commit completo
```bash
git revert HEAD
git push origin claude/init-project-011CUyVgozWdPxBvdBYyEb8p
```

**Cuándo usar**: Si el fix introduce bugs nuevos

---

### Opción B: Rollback parcial (solo quitar services)

**Archivo 1**: `src/Bootstrap.js:426`
```javascript
// Volver a:
this.controllers.mode = new ModeController(
    this.store,
    this.eventBus,
    this.controllers.screen,
    this.controllers.game
    // NO pasar services
);
```

**Archivo 2**: `src/controllers/ModeController.js:7,11`
```javascript
// Volver a:
constructor(store, eventBus, screenController, gameController) {
    this.store = store;
    this.eventBus = eventBus;
    this.screenController = screenController;
    this.gameController = gameController;
    // NO almacenar services
}
```

**Cuándo usar**: Si services causa efectos secundarios inesperados

---

### Opción C: Rollback de logging

**Acción**: Quitar todos los `console.log()` agregados

**Cuándo usar**: Si el logging es demasiado verbose en producción

---

### Opción D: Feature flag temporal

**Archivo**: `app.js:3545`
```javascript
// Agregar flag de emergencia
const useNewDiscoveryFlow = localStorage.getItem('useNewDiscovery') !== 'false';

if (useNewDiscoveryFlow && window.bootstrap?.controllers?.mode) {
    // Nuevo flujo
    window.bootstrap.controllers.mode.handleTableSelection(table, 'auto');
    return;
} else {
    // Flujo legacy
    // ... código viejo ...
}
```

**Cuándo usar**: Para poder desactivar remotamente si hay problema en producción

Para desactivar: Usuario ejecuta en consola:
```javascript
localStorage.setItem('useNewDiscovery', 'false');
location.reload();
```

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo #1: services no existe en Bootstrap
**Probabilidad**: BAJA
**Impacto**: MEDIO
**Mitigación**:
- Verificar que `this.services` existe antes de pasar
- Logging en Bootstrap muestra si existe
- Fail-safe en `needsDiscovery()` devuelve `true`

---

### Riesgo #2: Timing de inicialización
**Probabilidad**: BAJA
**Impacto**: MEDIO
**Síntoma**: services existe pero player aún no se ha cargado
**Mitigación**:
- Bootstrap inicializa services antes de controllers (verificar orden)
- PlayerService se carga en initializeServices() línea 253-265
- ModeController se carga en initializeControllers() línea 392-430
- Orden correcto ya existe en código

---

### Riesgo #3: PlayerService.isTableDiscovered() falla
**Probabilidad**: MUY BAJA
**Impacto**: BAJO
**Mitigación**:
- Función ya existe y es probada (evidencia C en auditoría)
- Logging mostrará si devuelve valor inesperado
- Fail-safe en `needsDiscovery()` maneja caso de error

---

### Riesgo #4: Regresión en otros modos
**Probabilidad**: MUY BAJA
**Impacto**: ALTO
**Mitigación**:
- Cambios son quirúrgicos (solo constructor)
- No tocan lógica de startPracticeMode, startSpaceAdventure, etc.
- Testing de regresión exhaustivo (Test 3.3)

---

### Riesgo #5: Modal no se muestra por CSS
**Probabilidad**: MUY BAJA
**Impacto**: MEDIO
**Mitigación**:
- Modal HTML ya existe (evidencia D)
- showDiscoveryOptions() ya tiene lógica correcta
- Testing manual verificará visualmente

---

## 📊 MÉTRICAS DE ÉXITO

### Métricas Técnicas
- [ ] `window.bootstrap.controllers.mode.services` existe
- [ ] `window.bootstrap.controllers.mode.services.player` existe
- [ ] `needsDiscovery(2)` devuelve `true` para tabla no descubierta
- [ ] `needsDiscovery(2)` devuelve `false` para tabla descubierta
- [ ] Modal `learnOrPracticeModal` se muestra cuando corresponde
- [ ] `discoveryIntroScreen` se muestra al elegir APRENDER
- [ ] Progreso se guarda en `localStorage.playerData.tablesMastery[X].discoveryCompleted`

### Métricas de Usuario
- [ ] Usuario ve "El Truco Secreto de la Tabla del X"
- [ ] Usuario completa flujo de descubrimiento guiado
- [ ] Usuario recibe recompensas (coins, XP, achievement)
- [ ] Usuario ve truco en "Mi Grimorio"
- [ ] En siguiente visita a tabla ya descubierta, va directo a práctica

### Métricas de Código
- [ ] 0 errores de sintaxis JavaScript
- [ ] 0 errores en consola durante flujo normal
- [ ] 0 regresiones en tests existentes
- [ ] Logging muestra decisiones claras en cada paso

---

## 📅 TIMELINE

| Fase | Tarea | Tiempo | Acumulado |
|------|-------|--------|-----------|
| 1 | Fix crítico (2 archivos) | 5 min | 5 min |
| 2 | Agregar logging (4 archivos) | 10 min | 15 min |
| 3.1 | Verificar sintaxis | 2 min | 17 min |
| 3.2 | Testing manual completo | 15 min | 32 min |
| 3.3 | Testing de regresión | 10 min | 42 min |
| 3.4 | Testing edge cases | 8 min | 50 min |
| 4 | Commit y push | 5 min | 55 min |
| **TOTAL** | | **55 min** | |

---

## ✅ CHECKLIST PRE-IMPLEMENTACIÓN

Antes de empezar:
- [ ] Branch correcta: `claude/init-project-011CUyVgozWdPxBvdBYyEb8p`
- [ ] Servidor local apagado (no hay conflictos de puerto)
- [ ] Backup de archivos críticos:
  - [ ] `src/Bootstrap.js`
  - [ ] `src/controllers/ModeController.js`
  - [ ] `app.js`
- [ ] Consola F12 abierta para ver logs
- [ ] localStorage limpio: `localStorage.clear()`

Durante implementación:
- [ ] Cambio 1.1: Bootstrap.js agregado parámetro services
- [ ] Cambio 1.2: ModeController.js agregado constructor parameter
- [ ] Cambio 1.2b: ModeController.js agregado this.services = services
- [ ] Cambio 2.1: Bootstrap.js logging
- [ ] Cambio 2.2: ModeController needsDiscovery logging
- [ ] Cambio 2.3: ModeController handleTableSelection logging
- [ ] Cambio 2.4: app.js practicePlanetTable logging
- [ ] Test 3.1: Sintaxis verificada
- [ ] Test 3.2: Flujo completo probado
- [ ] Test 3.3: Regresiones verificadas
- [ ] Test 3.4: Edge cases probados

Después de implementación:
- [ ] Commit creado con mensaje detallado
- [ ] Push exitoso a remote
- [ ] No hay errores en consola de GitHub
- [ ] CI/CD workflows pasan (o continúan con continue-on-error)
- [ ] Documentación actualizada (este plan)

---

## 📚 ARCHIVOS AFECTADOS

| Archivo | Líneas | Tipo de Cambio | Criticidad |
|---------|--------|----------------|------------|
| `src/Bootstrap.js` | 426 | Agregar parámetro | ⭐⭐⭐ CRÍTICO |
| `src/Bootstrap.js` | 419-431 | Agregar logging | ⭐ RECOMENDADO |
| `src/controllers/ModeController.js` | 7 | Modificar signature | ⭐⭐⭐ CRÍTICO |
| `src/controllers/ModeController.js` | 11 | Agregar línea | ⭐⭐⭐ CRÍTICO |
| `src/controllers/ModeController.js` | 498-503 | Mejorar fail-safe + logging | ⭐⭐ IMPORTANTE |
| `src/controllers/ModeController.js` | 510-529 | Agregar logging | ⭐ RECOMENDADO |
| `app.js` | 3535-3567 | Agregar logging | ⭐ RECOMENDADO |

**Total de archivos**: 3
**Líneas modificadas (críticas)**: ~5
**Líneas agregadas (logging)**: ~30

---

## 🎯 RESULTADO ESPERADO

Después de aplicar este plan:

### Para el Usuario
1. Usuario hace click en planeta de galaxia
2. Usuario hace click en "Practicar"
3. **Usuario ve modal con opciones**:
   - 🎓 ¡APRENDER! (Descubre el truco secreto)
   - ⚡ ¡PRACTICAR! (Responde preguntas)
4. Usuario elige "APRENDER"
5. **Usuario ve pantalla completa**:
   - Título: "🧙‍♂️ El Truco Secreto de la Tabla del 2"
   - Explicación del truco mnemotécnico
   - Ejemplos visuales
   - Botón: "✨ ENTIENDO, ¡PRACTICEMOS!"
6. Usuario completa práctica guiada (10 preguntas)
7. Usuario recibe recompensas (coins, XP, achievement)
8. Progreso se guarda permanentemente
9. En futuros accesos a esa tabla, va directo a práctica

### Para el Desarrollador
1. Console muestra logs claros de cada decisión
2. Estado de Bootstrap es visible
3. Resultado de needsDiscovery es explícito
4. Fácil debugging de cualquier problema
5. Código es mantenible y documentado

---

## 🧪 COMANDOS ÚTILES PARA DEBUGGING

```javascript
// Ver estado completo de Bootstrap
console.log('Bootstrap:', window.bootstrap);

// Ver ModeController
console.log('ModeController:', window.bootstrap?.controllers?.mode);

// Ver services
console.log('Services:', window.bootstrap?.services);

// Ver PlayerService
console.log('PlayerService:', window.bootstrap?.services?.player);

// Verificar si tabla está descubierta
const table = 2;
console.log('Tabla', table, 'descubierta:',
    window.bootstrap?.services?.player?.isTableDiscovered(table)
);

// Ver mastery de tabla
const playerData = JSON.parse(localStorage.getItem('playerData'));
console.log('Mastery tabla', table, ':', playerData.tablesMastery[table]);

// Forzar tabla como NO descubierta (para testing)
const pd = JSON.parse(localStorage.getItem('playerData'));
pd.tablesMastery[2].discoveryCompleted = false;
pd.tablesMastery[2].mastery = 0;
localStorage.setItem('playerData', JSON.stringify(pd));
location.reload();

// Ver todos los trucos coleccionados
console.log('Trucos:', playerData.mnemonicTricks);
```

---

**PLAN LISTO PARA AUDITORÍA Y EJECUCIÓN**

Este plan ha sido diseñado basado en la auditoría exhaustiva del sistema. Está listo para:
1. Ser auditado por ti
2. Ser ejecutado paso a paso
3. Resolver el problema de forma definitiva

¿Procedo con la auditoría del plan?
