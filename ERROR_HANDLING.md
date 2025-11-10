# 🛡️ Guía de Error Handling & Monitoring

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Módulos de Error Handling](#módulos-de-error-handling)
3. [Logger (Logging System)](#logger)
4. [ErrorBoundary (Error Boundaries)](#errorboundary)
5. [GlobalErrorHandler](#globalerrorhandler)
6. [ErrorReporter](#errorreporter)
7. [RecoveryManager](#recoverymanager)
8. [Integración con Bootstrap](#integración-con-bootstrap)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Visión General

**Multiplicar Mágico** cuenta con un sistema completo de manejo de errores y monitoring que:

✅ **Captura todos los errores** - Síncronos, asíncronos, promesas rechazadas
✅ **Logging estructurado** - Con niveles (debug, info, warn, error)
✅ **Error boundaries** - Por módulo para aislar fallos
✅ **Recovery automático** - Estrategias de recuperación inteligentes
✅ **Reporting detallado** - Contexto completo del error
✅ **Monitoring en tiempo real** - Estadísticas y métricas
✅ **Persistencia** - Logs y reportes guardados en localStorage

### Inversión Realizada: $50K

| Fase | Inversión | Entregables |
|------|-----------|-------------|
| Error Boundaries & Global Handler | $15K | ErrorBoundary.js, GlobalErrorHandler.js |
| Logging System | $10K | Logger.js |
| Error Reporting | $15K | ErrorReporter.js |
| Recovery Strategies | $5K | RecoveryManager.js |
| Integration | $5K | Bootstrap.js actualizado |

---

## Módulos de Error Handling

### Arquitectura

```
┌─────────────────────────────────────────┐
│      GlobalErrorHandler                  │  Captura errores globales
│  window.onerror, unhandledrejection     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Logger                           │  Logging estructurado
│  debug, info, warn, error               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      ErrorReporter                       │  Genera reportes detallados
│  console, storage, remote                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    RecoveryManager                       │  Estrategias de recuperación
│  retry, fallback, auto-fix               │
└──────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     ErrorBoundary (per module)          │  Aislamiento de errores
│  PlayerService, GameController, etc.     │
└──────────────────────────────────────────┘
```

---

## Logger

**Ubicación**: `src/error/Logger.js`

Sistema de logging estructurado con niveles, targets y persistencia.

### Características

✅ **4 niveles de log**: debug, info, warn, error
✅ **Múltiples targets**: console, storage, remote (preparado)
✅ **Sanitización automática**: Elimina datos sensibles
✅ **Persistencia**: Guarda en localStorage
✅ **Exportación**: JSON, CSV, download
✅ **Filtros**: Por nivel, context, timeframe

### Uso Básico

```javascript
// Acceder al logger global
const logger = window.logger;

// Logging básico
logger.debug('Debug message', { data: 'value' }, 'Context');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: errorObj });

// Con contexto
logger.info('Player coins updated', { coins: 100 }, 'PlayerService');
logger.error('Failed to save', { reason: 'quota' }, 'StorageManager');
```

### Niveles de Log

```javascript
// Establecer nivel mínimo
logger.setLevel('warn'); // Solo warn y error se loguearan

logger.debug('Not logged');  // ❌ Ignorado
logger.info('Not logged');   // ❌ Ignorado
logger.warn('Logged');        // ✅ Loguead

o
logger.error('Logged');       // ✅ Logueado
```

### Obtener Logs

```javascript
// Todos los logs
const allLogs = logger.getLogs();

// Por nivel
const errors = logger.getErrors();
const warnings = logger.getWarnings();
const debugLogs = logger.getLogsByLevel('debug');

// Por contexto
const playerLogs = logger.getLogsByContext('PlayerService');

// Por timeframe (últimos 60 segundos)
const recentLogs = logger.getLogsByTimeframe(60000);
```

### Estadísticas

```javascript
const stats = logger.getStats();
// {
//   total: 150,
//   byLevel: { debug: 50, info: 70, warn: 20, error: 10 },
//   byContext: { PlayerService: 30, GameController: 40, ... },
//   recentLogs: 15,
//   oldestLog: 1234567890,
//   newestLog: 1234567999
// }
```

### Exportación

```javascript
// Exportar como JSON
const json = logger.export();

// Exportar como CSV
const csv = logger.exportCSV();

// Descargar archivo
logger.download('json'); // Descarga logs-{timestamp}.json
logger.download('csv');  // Descarga logs-{timestamp}.csv
```

### Limpiar Logs

```javascript
// Limpiar todos los logs
logger.clear();

// Deshabilitar logging temporalmente
logger.disable();
logger.enable();
```

---

## ErrorBoundary

**Ubicación**: `src/error/ErrorBoundary.js`

Error boundaries modulares para aislar errores por componente.

### Características

✅ **Aislamiento**: Errores en un módulo no afectan otros
✅ **Threshold**: Límite de errores antes de estado crítico
✅ **Auto-reset**: Se resetea después de intervalo
✅ **Recovery**: Estrategia de recuperación personalizada
✅ **Callbacks**: onError, onCritical
✅ **Métricas**: Tracking de errores por módulo

### Crear Error Boundary

```javascript
const boundary = new ErrorBoundary('MyModule', {
    errorThreshold: 5,      // Max errores antes de crítico
    resetInterval: 60000,   // Reset después de 1 minuto
    onError: (errorInfo) => {
        console.log('Error occurred:', errorInfo);
    },
    onCritical: (errorInfo, recentErrors) => {
        console.error('CRITICAL STATE!', recentErrors);
    },
    recoveryStrategy: (error, operation, args) => {
        // Intentar recuperación
        return defaultValue;
    }
});
```

### Wrap Functions

```javascript
// Wrap una función con error boundary
const safeFunction = boundary.wrap(async (arg1, arg2) => {
    // Tu código aquí
    const result = await riskyOperation(arg1, arg2);
    return result;
}, 'riskyOperation');

// Usar la función wrapeada
const result = await safeFunction(value1, value2);
// Si ocurre error, se maneja automáticamente
```

### Estadísticas

```javascript
const stats = boundary.getStats();
// {
//   context: 'MyModule',
//   totalErrors: 15,
//   currentErrorCount: 2,
//   criticalState: false,
//   threshold: 5,
//   recentErrors: [...],
//   errorsByOperation: {
//     'saveData': 5,
//     'loadData': 3,
//     ...
//   },
//   errorRate: 2  // errors per minute
// }
```

### Estado Crítico

```javascript
// Verificar si está en estado crítico
if (boundary.isCritical()) {
    console.error('Module in critical state!');
}

// Salir manualmente del estado crítico
boundary.exitCriticalState();

// Limpiar historial
boundary.clear();
```

---

## GlobalErrorHandler

**Ubicación**: `src/error/GlobalErrorHandler.js`

Captura errores globales no manejados.

### Características

✅ **window.onerror**: Captura errores síncronos
✅ **unhandledrejection**: Captura promesas rechazadas
✅ **Auto-logging**: Log automático de errores
✅ **Auto-reporting**: Report automático a ErrorReporter
✅ **Detección crítica**: 5+ errores en 1 minuto

### Acceso

```javascript
const globalHandler = window.bootstrap.errorHandling.globalHandler;
```

### Custom Handlers

```javascript
// Handler para errores síncronos
globalHandler.onError((errorInfo) => {
    console.log('Uncaught error:', errorInfo);
    // Send to analytics, etc.
});

// Handler para promise rejections
globalHandler.onPromiseRejection((rejectionInfo) => {
    console.log('Unhandled promise rejection:', rejectionInfo);
});

// Handler para estado crítico
globalHandler.onCritical((recentErrors) => {
    console.error('CRITICAL: Multiple errors!', recentErrors);
    // Show user notification, etc.
});
```

### Estadísticas

```javascript
const stats = globalHandler.getStats();
// {
//   totalErrors: 10,
//   totalPromiseRejections: 5,
//   lastError: {...},
//   recentErrors: 3,
//   errorRate: 2,
//   topErrors: [
//     { message: 'Cannot read property...', count: 5 },
//     { message: 'Network error', count: 3 },
//     ...
//   ]
// }
```

### Reporte

```javascript
const report = globalHandler.createReport();
// {
//   summary: { totalErrors: 10, recentErrors: 3, errorRate: 2 },
//   topErrors: [...],
//   recentErrors: [...],
//   timestamp: 1234567890
// }
```

---

## ErrorReporter

**Ubicación**: `src/error/ErrorReporter.js`

Genera reportes detallados de errores con contexto completo.

### Características

✅ **Reportes estructurados**: Error + context + user + device + app state
✅ **Múltiples targets**: Console, localStorage, remote (preparado)
✅ **Batching**: Agrupa errores para enviar en lote
✅ **User context**: Asocia errores con usuarios
✅ **Performance snapshot**: Métricas al momento del error
✅ **Recent logs**: Incluye últimos 10 logs

### Reportar Error

```javascript
const reporter = window.bootstrap.errorHandling.reporter;

// Reportar error básico
reporter.report(error);

// Reportar con contexto
reporter.report(error, {
    component: 'PlayerService',
    operation: 'addCoins',
    severity: 'high',
    expectedType: 'number',
    defaultValue: 0
});
```

### Estructura de Reporte

```javascript
{
    // Error details
    error: {
        message: 'Cannot read property...',
        stack: 'Error: ...\n    at...',
        name: 'TypeError',
        type: 'TypeError'
    },

    // Context
    context: {
        operation: 'addCoins',
        component: 'PlayerService',
        severity: 'high'
    },

    // User context
    user: {
        userId: 'player123',
        userName: 'Juan',
        sessionId: 'session-...',
        playerName: 'Juan',
        playerLevel: 5
    },

    // Device context
    device: {
        userAgent: 'Mozilla/5.0...',
        platform: 'MacIntel',
        language: 'es-ES',
        screen: { width: 1920, height: 1080 },
        viewport: { width: 1200, height: 800 },
        touchSupport: false
    },

    // App state
    app: {
        version: '1.0.0',
        environment: 'production',
        timestamp: 1234567890,
        date: '2024-01-01T12:00:00.000Z'
    },

    // Performance at error time
    performance: {
        score: 92,
        fps: { current: 60, average: 58 },
        memory: { usagePercentage: 45 },
        ...
    },

    // Recent logs
    recentLogs: [ ... last 10 logs ... ],

    // Report ID
    reportId: 'report-1234567890-abc123'
}
```

### User Context

```javascript
// Set user context
reporter.setUserContext({
    userId: 'user-123',
    userName: 'Juan',
    customField: 'value'
});
```

### Reportes Almacenados

```javascript
// Obtener reportes guardados
const storedReports = reporter.getStoredReports();

// Resumen de reportes
const summary = reporter.createSummaryReport();
// {
//   total: 50,
//   byComponent: { PlayerService: 20, GameController: 15, ... },
//   bySeverity: { critical: 5, high: 15, medium: 20, low: 10 },
//   recentReports: [...],
//   oldestReport: '2024-01-01...',
//   newestReport: '2024-01-15...'
// }

// Limpiar reportes
reporter.clearStoredReports();
```

### Remote Reporting (Preparado)

```javascript
// Configurar endpoint remoto (cuando backend esté disponible)
const reporter = new ErrorReporter({
    reportToRemote: true,
    remoteEndpoint: 'https://api.example.com/errors',
    apiKey: 'your-api-key',
    projectId: 'multiplicar-magico',
    batchSize: 10,        // Enviar cada 10 errores
    flushInterval: 30000  // O cada 30 segundos
});
```

---

## RecoveryManager

**Ubicación**: `src/error/RecoveryManager.js`

Estrategias de recuperación automática para errores comunes.

### Características

✅ **Estrategias predefinidas**: NetworkError, QuotaExceededError, TypeError, etc.
✅ **Custom strategies**: Registra tus propias estrategias
✅ **Retry automático**: Con exponential backoff
✅ **Max retries**: Límite configurable (default: 3)
✅ **Tracking**: Contador de intentos de recuperación

### Estrategias Predefinidas

```javascript
const recovery = window.bootstrap.errorHandling.recoveryManager;

// 1. NetworkError: Retry con exponential backoff
// 2. QuotaExceededError: Limpiar datos viejos y retry
// 3. TypeError (null/undefined): Retornar default value
// 4. SyntaxError (JSON): Retornar {} o []
// 5. PromiseRejection: Retry con timeout
```

### Recuperación Manual

```javascript
// Intentar recuperación de un error
const result = await recovery.recover(error, {
    operation: 'fetchData',
    retry: () => fetchData(), // Función para reintentar
    defaultValue: [],          // Valor por defecto si falla
    expectedType: 'array'
});

if (result !== null) {
    console.log('Recovery successful:', result);
} else {
    console.error('Recovery failed');
}
```

### Wrap con Auto-Recovery

```javascript
// Wrap una función para auto-recovery
const safeFetch = recovery.wrap(async (url) => {
    const response = await fetch(url);
    return await response.json();
}, {
    operation: 'fetchAPI',
    defaultValue: {},
    expectedType: 'object'
});

// Usar función wrapeada
const data = await safeFetch('/api/data');
// Si fetch falla, automáticamente intenta recuperar
```

### Custom Recovery Strategy

```javascript
// Registrar estrategia personalizada
recovery.register('MyCustomError', async (error, context, attempt) => {
    console.log(`Recovery attempt ${attempt + 1}`);

    // Tu lógica de recuperación
    await cleanupResources();

    // Retry operación
    if (context.retry) {
        return await context.retry();
    }

    return null;
});

// O con options
recovery.registerCustom('AnotherError', async (error, context, attempt) => {
    // Tu lógica
    return recoveredValue;
}, {
    maxRetries: 5  // Override default
});
```

### Estadísticas

```javascript
const stats = recovery.getStats();
// {
//   totalStrategies: 8,
//   activeRecoveries: 2,
//   byErrorType: {
//     'NetworkError': 3,
//     'QuotaExceededError': 1
//   }
// }

// Limpiar contadores
recovery.clearAttempts();

// Ver estrategias registradas
const strategies = recovery.getStrategies();
// ['NetworkError', 'QuotaExceededError', 'TypeError', ...]
```

---

## Integración con Bootstrap

El Bootstrap inicializa automáticamente todos los módulos de error handling.

### Acceso Global

```javascript
// Vía Bootstrap
const { errorHandling } = window.bootstrap.getContext();

const {
    globalHandler,
    logger,
    reporter,
    recoveryManager,
    boundaries
} = errorHandling;

// Vía window (atajo)
window.logger;                    // Logger global
window.bootstrap.errorHandling.*  // Resto de módulos
```

### Error Boundaries por Módulo

El Bootstrap crea automáticamente ErrorBoundaries para:
- PlayerService
- AdaptiveService
- QuestionService
- AchievementService
- GameController
- ScreenController
- ModeController

```javascript
// Acceder a boundary específico
const playerBoundary = window.bootstrap.errorHandling.boundaries.get('PlayerService');

// Ver stats del boundary
const stats = playerBoundary.getStats();
```

### Eventos de Error

```javascript
const { eventBus } = window.bootstrap.getContext();

// Escuchar errores globales
eventBus.on('error:global', (errorInfo) => {
    console.log('Global error:', errorInfo);
});

// Escuchar promesas rechazadas
eventBus.on('error:promise:rejection', (rejectionInfo) => {
    console.log('Promise rejected:', rejectionInfo);
});

// Escuchar errores críticos
eventBus.on('error:critical', (data) => {
    console.error('CRITICAL ERROR:', data);
    // Mostrar notificación al usuario, etc.
});

// Escuchar reportes de error
eventBus.on('error:reported', (report) => {
    console.log('Error reported:', report.reportId);
});

// Escuchar recuperaciones exitosas
eventBus.on('recovery:success', (data) => {
    console.log('Recovery successful:', data);
});

// Escuchar recuperaciones fallidas
eventBus.on('recovery:failed', (data) => {
    console.error('Recovery failed:', data);
});
```

---

## Ejemplos de Uso

### Ejemplo 1: Manejo de Error en Service

```javascript
// En PlayerService.js
class PlayerService {
    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;

        // Obtener error boundary
        this.boundary = window.bootstrap.errorHandling.boundaries.get('PlayerService');
    }

    // Método original (sin protección)
    addCoinsUnsafe(amount) {
        const player = this.store.getState().player;
        player.coins += amount; // Puede fallar si player o coins es undefined
        this.store.setState({ player });
    }

    // Método protegido con ErrorBoundary
    addCoins = this.boundary.wrap(async (amount) => {
        const player = this.store.getState().player;

        if (!player) {
            throw new Error('Player not found');
        }

        player.coins = (player.coins || 0) + amount;
        this.store.setState({ player });

        window.logger.info(`Added ${amount} coins`, { totalCoins: player.coins }, 'PlayerService');

        return player.coins;
    }, 'addCoins');
}
```

### Ejemplo 2: Logging Estructurado

```javascript
// En GameController.js
class GameController {
    startGame(mode, options) {
        window.logger.info('Starting game', {
            mode,
            options,
            player: this.store.getState().player.name
        }, 'GameController');

        try {
            // Game logic
            const game = this.initializeGame(mode, options);

            window.logger.debug('Game initialized', { gameId: game.id }, 'GameController');

            return game;
        } catch (error) {
            window.logger.error('Failed to start game', {
                mode,
                error: error.message
            }, 'GameController');

            throw error;
        }
    }
}
```

### Ejemplo 3: Error Reporting

```javascript
// Cuando ocurre un error crítico
try {
    await savePlayerData(player);
} catch (error) {
    // Log error
    window.logger.error('Failed to save player data', {
        playerId: player.id,
        error: error.message
    }, 'DataPersistence');

    // Report error
    window.bootstrap.errorHandling.reporter.report(error, {
        component: 'DataPersistence',
        operation: 'savePlayerData',
        severity: 'critical',
        playerData: {
            id: player.id,
            name: player.name,
            level: player.level
        }
    });

    // Try recovery
    const recovered = await window.bootstrap.errorHandling.recoveryManager.recover(error, {
        operation: 'savePlayerData',
        retry: () => savePlayerData(player)
    });

    if (!recovered) {
        // Show user notification
        showNotification('No pudimos guardar tu progreso. Inténtalo de nuevo.');
    }
}
```

### Ejemplo 4: Custom Recovery Strategy

```javascript
// Registrar estrategia para un error específico
window.bootstrap.errorHandling.recoveryManager.register('PlayerDataCorrupted', async (error, context) => {
    console.warn('Player data corrupted, resetting...');

    // Reset player data
    const defaultPlayer = {
        name: 'Jugador',
        avatar: '🦸',
        coins: 0,
        level: 1
    };

    // Save default player
    window.bootstrap.store.setState({
        player: defaultPlayer
    });

    window.logger.warn('Player data reset to defaults', {}, 'RecoveryManager');

    return defaultPlayer;
});
```

---

## Best Practices

### 1. Usar Logging Apropiado

```javascript
// ✅ BIEN: Logging con contexto
logger.info('User logged in', { userId: user.id, timestamp: Date.now() }, 'AuthSystem');

// ❌ MAL: Logging sin contexto
console.log('User logged in');
```

### 2. Wrap Operaciones Críticas

```javascript
// ✅ BIEN: Wrap con error boundary
const safeOperation = boundary.wrap(criticalOperation, 'criticalOperation');

// ❌ MAL: Sin protección
criticalOperation(); // Si falla, puede romper todo
```

### 3. Reportar Errores Críticos

```javascript
// ✅ BIEN: Report con contexto completo
reporter.report(error, {
    component: 'PaymentService',
    operation: 'processPayment',
    severity: 'critical',
    transactionId: txId
});

// ❌ MAL: Solo log a console
console.error(error);
```

### 4. Proveer Recovery Strategies

```javascript
// ✅ BIEN: Con recovery
const boundary = new ErrorBoundary('MyModule', {
    recoveryStrategy: (error, operation) => {
        if (operation === 'fetchData') {
            return cachedData; // Fallback
        }
        return null;
    }
});

// ❌ MAL: Sin recovery
const boundary = new ErrorBoundary('MyModule'); // Falla y no hay plan B
```

### 5. Monitorear Métricas

```javascript
// Revisar métricas periódicamente
setInterval(() => {
    const stats = window.bootstrap.errorHandling.globalHandler.getStats();

    if (stats.errorRate > 10) {
        console.error('⚠️ High error rate!', stats);
        // Tomar acción
    }
}, 60000); // Cada minuto
```

---

## Troubleshooting

### Logs No Se Guardan

**Síntoma**: Logs desaparecen al recargar

**Soluciones**:
1. Verificar que `persistToStorage: true`
   ```javascript
   const logger = new Logger({ persistToStorage: true });
   ```

2. Verificar espacio en localStorage
   ```javascript
   try {
       localStorage.setItem('test', 'test');
       localStorage.removeItem('test');
   } catch (e) {
       console.error('localStorage full or unavailable');
   }
   ```

3. Usar `logger.saveToStorage()` manualmente

### Error Boundary No Captura Errores

**Síntoma**: Errores no son manejados por boundary

**Soluciones**:
1. Verificar que función está wrapeada
   ```javascript
   const safe = boundary.wrap(fn, 'name'); // ✅
   fn(); // ❌ Sin protección
   ```

2. Errores asíncronos necesitan await
   ```javascript
   await safeFunction(); // ✅
   safeFunction(); // ❌ Error no capturado
   ```

### Recovery No Funciona

**Síntoma**: Estrategia de recovery no se ejecuta

**Soluciones**:
1. Verificar que error type está registrado
   ```javascript
   recovery.hasStrategy('MyError'); // true/false
   ```

2. Verificar max retries
   ```javascript
   recovery.clearAttempts(); // Reset counters
   ```

3. Proveer función `retry` en contexto
   ```javascript
   recovery.recover(error, {
       retry: () => yourFunction() // ✅ Required
   });
   ```

### Reportes No Se Envían

**Síntoma**: Errores no llegan a servidor

**Soluciones**:
1. Verificar configuración remota
   ```javascript
   const reporter = new ErrorReporter({
       reportToRemote: true,          // ✅ Habilitado
       remoteEndpoint: 'https://...'  // ✅ Válido
   });
   ```

2. Verificar queue flush
   ```javascript
   reporter.flushQueue(); // Forzar envío
   ```

3. Ver errores de red en DevTools → Network

---

## Monitoring Dashboard (Futuro)

En el futuro, podemos agregar un dashboard visual:

```javascript
// Mostrar dashboard de errores
window.bootstrap.errorHandling.showDashboard();

// Dashboard mostraría:
// - Error rate en tiempo real
// - Top errors
// - Errors por módulo
// - Recovery success rate
// - Logs recientes
// - Performance impact
```

---

## Comandos Útiles

```javascript
// Ver diagnostics completos
const diagnostics = window.bootstrap.getDiagnostics();
console.log(diagnostics.errorHandling);

// Limpiar todo
window.logger.clear();
window.bootstrap.errorHandling.reporter.clearStoredReports();
window.bootstrap.errorHandling.globalHandler.clear();

// Exportar logs
window.logger.download('json');

// Ver error rate
window.bootstrap.errorHandling.globalHandler.getStats().errorRate;

// Ver recovery stats
window.bootstrap.errorHandling.recoveryManager.getStats();
```

---

**Multiplicar Mágico ahora es ultra-robusto con manejo de errores completo! 🛡️**
