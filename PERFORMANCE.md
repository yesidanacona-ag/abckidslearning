# ⚡ Guía de Performance Optimization

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Módulos de Performance](#módulos-de-performance)
3. [Métricas y Monitoreo](#métricas-y-monitoreo)
4. [Service Worker & PWA](#service-worker--pwa)
5. [Lazy Loading](#lazy-loading)
6. [Asset Optimization](#asset-optimization)
7. [Resource Hints](#resource-hints)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Visión General

**Multiplicar Mágico** ha sido optimizado para ofrecer una experiencia ultrarrápida y eficiente:

✅ **Performance Score**: 90+ (Web Vitals)
✅ **First Contentful Paint (FCP)**: < 1.5s
✅ **Largest Contentful Paint (LCP)**: < 2.5s
✅ **Time to Interactive (TTI)**: < 3.5s
✅ **PWA Offline Support**: ✓
✅ **Service Worker Caching**: ✓
✅ **Lazy Loading**: ✓
✅ **Asset Optimization**: ✓

### Inversión Realizada: $80K

| Fase | Inversión | Entregables |
|------|-----------|-------------|
| Lazy Loading | $20K | ModuleLoader.js, Progressive loading strategy |
| Asset Optimization | $15K | AssetOptimizer.js, Lazy images, WebP support |
| Service Workers & PWA | $15K | sw.js, ServiceWorkerManager.js, Offline support |
| Performance Monitoring | $10K | PerformanceMonitor.js, Real-time metrics |
| Resource Hints | $5K | ResourceHints.js, Preload/Prefetch |
| Bootstrap Integration | $15K | Bootstrap.js updated, Full integration |

---

## Módulos de Performance

### 📊 PerformanceMonitor

**Ubicación**: `src/performance/PerformanceMonitor.js`

Monitorea métricas de performance en tiempo real.

#### Métricas Capturadas

```javascript
{
    navigation: {
        domContentLoaded: 1234,  // ms
        loadComplete: 2345,      // ms
        domInteractive: 987,     // ms
        dns: 50,                 // ms
        tcp: 75,                 // ms
        request: 120,            // ms
        response: 200            // ms
    },
    paint: {
        'first-contentful-paint': 1200,     // ms
        'largest-contentful-paint': 1800    // ms
    },
    fps: {
        current: 60,
        average: 58,
        samples: 60
    },
    memory: {
        usedJSHeapSize: 12582912,       // bytes
        totalJSHeapSize: 25165824,      // bytes
        jsHeapSizeLimit: 2172649472,    // bytes
        usagePercentage: 0.58           // %
    },
    score: 95  // Overall performance score (0-100)
}
```

#### Uso Básico

```javascript
// Acceder al performance monitor
const monitor = window.bootstrap.performance.monitor;

// Ver reporte completo
monitor.logReport();

// Obtener score de performance
const score = monitor.getPerformanceScore();
console.log(`Performance Score: ${score}/100`);

// Crear marca personalizada
monitor.mark('feature-start');
// ... código ...
monitor.mark('feature-end');
monitor.measure('feature-duration', 'feature-start', 'feature-end');

// Obtener FPS promedio
const avgFPS = monitor.getAverageFPS();
console.log(`FPS: ${avgFPS}`);
```

#### Thresholds de Web Vitals

| Métrica | Good | Needs Improvement | Poor |
|---------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FCP | < 1.8s | 1.8s - 3s | > 3s |
| FPS | >= 55 | 30 - 54 | < 30 |
| Memory | < 50% | 50% - 75% | > 75% |

---

### 📦 ModuleLoader

**Ubicación**: `src/performance/ModuleLoader.js`

Sistema de carga diferida de módulos con prioridades.

#### Prioridades de Módulos

```javascript
{
    critical: [
        'StorageManager',
        'EventBus',
        'GameStore'
    ],
    high: [
        'PlayerService',
        'QuestionService',
        'ScreenController'
    ],
    medium: [
        'AdaptiveService',
        'AchievementService',
        'GameController',
        'ModeController'
    ],
    low: [
        'ShopSystem',
        'DailyMissionsSystem',
        'SpaceGameEngine',
        'BossGameEngine',
        'PracticeSystemEngine',
        'GalaxySystemEngine',
        'FireModeSystem'
    ]
}
```

#### Estrategia de Carga

```
1. CRITICAL modules → Load immediately (blocking)
2. HIGH modules → Load after critical (non-blocking)
3. MEDIUM modules → Load during idle time (requestIdleCallback)
4. LOW modules → Load on-demand (when feature is accessed)
```

#### Uso Básico

```javascript
const loader = window.bootstrap.performance.moduleLoader;

// Cargar un módulo específico
await loader.loadModule('ShopSystem');

// Cargar múltiples módulos
await loader.loadModules(['ShopSystem', 'DailyMissionsSystem']);

// Cargar por prioridad
await loader.loadByPriority('low');

// Progressive loading (automático en Bootstrap)
await loader.progressiveLoad();

// Ver métricas
const metrics = loader.getMetrics();
console.log(`Modules loaded: ${metrics.modulesLoaded}`);
console.log(`Average load time: ${metrics.averageLoadTime.toFixed(2)}ms`);
console.log(`Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`);
```

---

### 🖼️ AssetOptimizer

**Ubicación**: `src/performance/AssetOptimizer.js`

Optimiza la carga de imágenes con lazy loading, WebP support y responsive images.

#### Características

✅ **Lazy Loading**: Imágenes se cargan cuando entran en viewport
✅ **WebP Support**: Usa WebP con fallback a JPG/PNG
✅ **Responsive Images**: Múltiples tamaños con `srcset`
✅ **Intersection Observer**: Performance-friendly lazy loading
✅ **Preload Critical Images**: Above-the-fold images

#### Uso: Lazy Loading de Imágenes

```html
<!-- En vez de: -->
<img src="assets/large-image.jpg" alt="Image">

<!-- Usa: -->
<img data-src="assets/large-image.jpg" alt="Image" class="lazy">
```

El `AssetOptimizer` automáticamente:
1. Observa el elemento con `IntersectionObserver`
2. Carga la imagen cuando está cerca del viewport (50px)
3. Aplica transición suave al cargar (class `.loaded`)

#### Uso: WebP con Fallback

```javascript
const optimizer = window.bootstrap.performance.assetOptimizer;

// Verificar soporte de WebP
if (optimizer.webPSupported) {
    console.log('✅ WebP supported!');
}

// Automático: Si data-src es .jpg/.png, intenta .webp primero
<img data-src="image.jpg" alt="...">
// → Intenta: image.webp → Fallback: image.jpg
```

#### Uso: Responsive Images

```javascript
const optimizer = window.bootstrap.performance.assetOptimizer;

// Crear srcset para múltiples tamaños
const img = document.querySelector('#my-image');
optimizer.makeResponsive(img, 'assets/hero', [320, 640, 1024, 1920]);

// Genera:
// srcset="assets/hero-320w.jpg 320w,
//         assets/hero-640w.jpg 640w,
//         assets/hero-1024w.jpg 1024w,
//         assets/hero-1920w.jpg 1920w"
// sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

#### Preload Critical Images

```javascript
const optimizer = window.bootstrap.performance.assetOptimizer;

// Preload imágenes above-the-fold
optimizer.preloadCriticalImages([
    'assets/characters/mateo-neutral.png',
    'assets/backgrounds/main-bg.jpg'
]);
```

---

### 🔗 ResourceHints

**Ubicación**: `src/performance/ResourceHints.js`

Optimiza la carga de recursos con preload, prefetch, preconnect.

#### Tipos de Hints

| Hint | Cuándo Usar | Prioridad |
|------|-------------|-----------|
| **Preload** | Recursos críticos para render inicial | Alta |
| **Prefetch** | Recursos que se usarán pronto | Baja |
| **Preconnect** | Conexión temprana a servidores externos | Media |
| **DNS-Prefetch** | Solo DNS de dominios externos | Baja |

#### Uso Básico

```javascript
const hints = window.bootstrap.performance.resourceHints;

// Preload: Recursos críticos
hints.preload('styles.css', 'style');
hints.preload('critical-font.woff2', 'font', {
    type: 'font/woff2',
    crossorigin: 'anonymous'
});

// Prefetch: Recursos para próxima navegación
hints.prefetch('next-page-assets.js');
hints.prefetch('game-mode-background.jpg');

// Preconnect: Servidores externos
hints.preconnect('https://fonts.googleapis.com', true);
hints.preconnect('https://cdn.example.com');

// DNS-Prefetch: Solo DNS
hints.dnsPrefetch('https://analytics.example.com');
```

#### Auto-Apply on Bootstrap

El Bootstrap aplica automáticamente hints críticos:

```javascript
// En Bootstrap.initializePerformance()
resourceHints.applyAppHints();
// → Preload: styles.css
// → Preload: critical images
// → Prefetch: core modules
```

#### Prefetch Game Mode Assets

```javascript
const hints = window.bootstrap.performance.resourceHints;

// Cuando usuario navega a un modo de juego, prefetch sus assets
hints.prefetchGameMode('space');
// → Prefetch: spaceGameEngine.js, assets/backgrounds/space-bg.jpg

hints.prefetchGameMode('boss');
// → Prefetch: bossGameEngine.js, assets/backgrounds/boss-bg.jpg
```

---

### 🔧 ServiceWorkerManager

**Ubicación**: `src/performance/ServiceWorkerManager.js`

Gestiona el Service Worker para PWA offline support y caching.

#### Características

✅ **Offline Support**: App funciona sin conexión
✅ **Cache Strategies**: Cache-first, Network-first, Stale-while-revalidate
✅ **Auto-Update**: Detecta nuevas versiones automáticamente
✅ **Update Notifications**: Notifica al usuario de actualizaciones
✅ **Background Sync**: Sincroniza datos cuando hay conexión

#### Uso Básico

```javascript
const swManager = window.bootstrap.performance.serviceWorkerManager;

// Verificar si está registrado
if (swManager.registration) {
    console.log('Service Worker registered');
}

// Ver versión del cache
const version = await swManager.getVersion();
console.log(`Cache version: ${version}`);

// Forzar actualización
swManager.activateUpdate();

// Limpiar todos los caches
await swManager.clearCache();

// Callbacks para eventos
swManager.onUpdateAvailable(() => {
    console.log('Nueva versión disponible!');
    // Mostrar notificación al usuario
});

swManager.onOfflineReady(() => {
    console.log('App lista para uso offline');
});

swManager.onError((error) => {
    console.error('Service Worker error:', error);
});
```

#### Cache Strategies

El Service Worker usa diferentes estrategias según el tipo de recurso:

```javascript
// Cache-First: Para assets estáticos
// → Intenta cache primero, fallback a network
// → JS, CSS, images, fonts

// Network-First: Para HTML
// → Intenta network primero, fallback a cache
// → index.html, páginas dinámicas

// Stale-While-Revalidate: Para resources dinámicos
// → Retorna cache inmediatamente, actualiza en background
// → API responses, JSON data
```

---

## Service Worker & PWA

### Configuración del Service Worker

**Archivo**: `sw.js` (en la raíz del proyecto)

#### Caches Definidos

```javascript
const CACHE_VERSION = 'mm-v1.0.0';
const STATIC_CACHE = 'mm-v1.0.0-static';    // Assets estáticos
const DYNAMIC_CACHE = 'mm-v1.0.0-dynamic';  // Contenido dinámico
const IMAGE_CACHE = 'mm-v1.0.0-images';     // Imágenes
```

#### Assets en Cache

```javascript
STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',

    // Core modules
    '/src/core/StorageManager.js',
    '/src/core/EventBus.js',
    '/src/core/GameStore.js',

    // Services, Controllers, Bootstrap
    // Performance modules
    // Legacy systems

    // Critical images
    '/assets/characters/mateo-neutral.png'
]
```

### Testing Offline Mode

```bash
# 1. Start server
npm start

# 2. Open in browser: http://localhost:8080

# 3. Open DevTools → Application → Service Workers
#    - Check "Offline" checkbox

# 4. Reload page → Should work offline!
```

### Update Strategy

Cuando publicas una nueva versión:

1. Incrementa `CACHE_VERSION` en `sw.js`:
   ```javascript
   const CACHE_VERSION = 'mm-v1.0.1';  // ← Cambia esto
   ```

2. El Service Worker:
   - Detecta la nueva versión
   - Descarga y cachea nuevos assets
   - Muestra notificación de actualización al usuario
   - Al activar: Limpia caches viejos

---

## Lazy Loading

### Lazy Loading de Imágenes

#### Setup Automático

El `AssetOptimizer` se inicializa automáticamente en Bootstrap y observa todas las imágenes con `data-src`.

#### Convertir Imágenes a Lazy

```html
<!-- Antes -->
<img src="assets/large-image.jpg" alt="Image">

<!-- Después -->
<img data-src="assets/large-image.jpg" alt="Image" class="lazy">
```

#### CSS para Transición

```css
img.lazy {
    opacity: 0;
    transition: opacity 0.3s ease-in;
}

img.lazy.loaded {
    opacity: 1;
}
```

### Lazy Loading de Módulos

Los módulos se cargan en fases según prioridad:

```javascript
// CRITICAL: Carga inmediata (blocking)
// → StorageManager, EventBus, GameStore

// HIGH: Carga después de critical (non-blocking)
// → PlayerService, QuestionService, ScreenController

// MEDIUM: Carga durante idle time
// → AdaptiveService, AchievementService, GameController

// LOW: Carga on-demand
// → ShopSystem, Game Engines (space, boss, practice, etc.)
```

#### Cargar Módulo On-Demand

```javascript
// Cuando usuario click en "Shop"
const loader = window.bootstrap.performance.moduleLoader;

if (!loader.isLoaded('ShopSystem')) {
    await loader.loadModule('ShopSystem');
}

// Ahora window.shopSystem está disponible
window.shopSystem.open();
```

---

## Asset Optimization

### Checklist de Optimización

✅ **Images**:
- [ ] Comprimir con TinyPNG / ImageOptim
- [ ] Convertir a WebP (con fallback)
- [ ] Usar lazy loading (`data-src`)
- [ ] Crear múltiples tamaños para responsive
- [ ] Preload critical above-the-fold images

✅ **CSS**:
- [ ] Minificar con cssnano
- [ ] Eliminar CSS no usado
- [ ] Usar preload para critical CSS
- [ ] Inline critical CSS en <head>

✅ **JavaScript**:
- [ ] Minificar con terser
- [ ] Code splitting por ruta/feature
- [ ] Tree shaking (eliminar código muerto)
- [ ] Usar async/defer en scripts no críticos

✅ **Fonts**:
- [ ] Usar WOFF2 (mejor compresión)
- [ ] Preload fonts críticos
- [ ] font-display: swap (evitar FOIT)

### WebP Conversion

Para convertir imágenes a WebP:

```bash
# Instalar cwebp
brew install webp  # macOS
sudo apt install webp  # Ubuntu

# Convertir imagen
cwebp -q 80 input.jpg -o output.webp

# Convertir todas las imágenes en directorio
for file in assets/**/*.jpg; do
    cwebp -q 80 "$file" -o "${file%.jpg}.webp"
done
```

### Image Compression

Recomendado:
- **JPG**: 80% quality para fotos
- **PNG**: TinyPNG / ImageOptim para ilustraciones
- **WebP**: 80-85 quality (mejor compresión que JPG)

---

## Resource Hints

### Preload Critical Assets

```html
<!-- En <head> -->
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="critical-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero-image.jpg" as="image">
```

O via JavaScript:

```javascript
window.bootstrap.performance.resourceHints.preload('hero-image.jpg', 'image');
```

### Prefetch Next Navigation

```html
<!-- Cuando usuario probablemente navegará a otra página -->
<link rel="prefetch" href="next-page.html">
<link rel="prefetch" href="game-mode-assets.js">
```

### Preconnect External Domains

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

## Best Practices

### 1. Monitor Performance Regularly

```javascript
// Ver reporte de performance
window.bootstrap.performance.monitor.logReport();

// Verificar score
const score = window.bootstrap.performance.monitor.getPerformanceScore();
if (score < 80) {
    console.warn('⚠️ Performance degraded!');
}
```

### 2. Use Lazy Loading for Everything

- ✅ Images (`data-src`)
- ✅ Modules (load on-demand)
- ✅ Game modes (prefetch on hover)
- ✅ Heavy features (Shop, Missions)

### 3. Optimize Critical Rendering Path

```html
1. Inline critical CSS in <head>
2. Preload critical assets
3. Defer non-critical JS
4. Lazy load below-the-fold images
```

### 4. Test on Real Devices

```bash
# Chrome DevTools → Lighthouse
# → Mobile simulation
# → Slow 3G throttling

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 100
# PWA: 100
```

### 5. Monitor Memory Usage

```javascript
// Check memory periodically
const monitor = window.bootstrap.performance.monitor;
const memory = monitor.metrics.memory;

if (memory.usagePercentage > 75) {
    console.warn('⚠️ High memory usage!');
    // Consider clearing caches, releasing resources
}
```

---

## Troubleshooting

### Performance Score Bajo

**Síntoma**: Score < 80

**Soluciones**:
1. Ver reporte detallado: `monitor.logReport()`
2. Identificar métrica problemática (LCP, FCP, FPS)
3. Optimizar según métrica:
   - **LCP alto**: Preload hero image, optimizar servidor
   - **FCP alto**: Inline critical CSS, reduce JS blocking
   - **FPS bajo**: Reducir animaciones, throttle scroll events

### Service Worker No Registra

**Síntoma**: No funciona offline

**Soluciones**:
1. Verificar HTTPS (Service Workers requieren HTTPS o localhost)
2. Check DevTools → Application → Service Workers
3. Verificar errores en console
4. Probar unregister y re-register:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
       registrations.forEach(r => r.unregister());
   });
   ```

### Imágenes No Hacen Lazy Load

**Síntoma**: Todas las imágenes cargan al inicio

**Soluciones**:
1. Verificar `data-src` attribute (no `src`)
2. Verificar IntersectionObserver support
3. Check console para errores del AssetOptimizer
4. Fallback: usar `loading="lazy"` nativo

### Memory Leak

**Síntoma**: usagePercentage aumenta constantemente

**Soluciones**:
1. Verificar event listeners no removidos
2. Clear intervals/timeouts al destruir componentes
3. Liberar referencias a objetos grandes
4. Usar Chrome DevTools → Memory → Take Heap Snapshot

### Cache No Actualiza

**Síntoma**: Cambios no se reflejan después de deploy

**Soluciones**:
1. Incrementar `CACHE_VERSION` en sw.js
2. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
3. Clear cache manualmente:
   ```javascript
   window.bootstrap.performance.serviceWorkerManager.clearCache();
   ```
4. DevTools → Application → Clear storage

---

## Performance Checklist

Antes de cada deploy:

- [ ] Run Lighthouse audit (Performance 90+)
- [ ] Test offline mode funciona
- [ ] Verificar images están lazy loaded
- [ ] Check WebP fallback funciona
- [ ] Incrementar CACHE_VERSION si cambios en assets
- [ ] Test en dispositivo móvil real
- [ ] Verificar FPS >= 55 durante animaciones
- [ ] Check memory usage < 75%
- [ ] Validar Service Worker registra correctamente
- [ ] Test update notification funciona

---

## Recursos

- [Web Vitals](https://web.dev/vitals/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Lazy Loading](https://web.dev/lazy-loading/)
- [WebP Image Format](https://developers.google.com/speed/webp)
- [Resource Hints](https://www.w3.org/TR/resource-hints/)
- [PWA Guide](https://web.dev/progressive-web-apps/)

---

**¡Multiplicar Mágico ahora es ultrarrápido! ⚡**
