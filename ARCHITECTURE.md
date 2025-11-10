# 🏗️ Arquitectura de Multiplicar Mágico

## 📊 Estado Actual

### Problemas Identificados
- **app.js**: 3,967 líneas, 368+ funciones/métodos
- **Responsabilidades mezcladas**: UI, lógica de negocio, persistencia, eventos
- **Acoplamiento fuerte**: Módulos dependen directamente de `window` globals
- **Sin gestión de estado centralizada**: Estado distribuido en múltiples objetos
- **Repetición de código**: Múltiples `savePlayer()`, checks de `window.X`
- **Testing difícil**: Imposible testear componentes aislados

### Estructura Actual
```
app.js (3,967 líneas)
├── MultiplicationGame (clase monolítica)
│   ├── Player management (create, load, save)
│   ├── UI management (showScreen, updateHeader)
│   ├── Achievement system
│   ├── Question generation
│   ├── Answer handling
│   ├── Game mode controllers
│   ├── Event listeners (100+ listeners)
│   └── Adaptive system integration
│
├── AdaptiveSystem (dentro de app.js)
│   ├── Performance tracking
│   ├── Question generation
│   └── Difficulty adjustment
│
└── TutorialSystem (dentro de app.js)
    ├── Step management
    ├── Overlay control
    └── Progress tracking
```

---

## 🎯 Nueva Arquitectura Propuesta

### Principios de Diseño
1. **Separación de Responsabilidades** (Single Responsibility)
2. **Desacoplamiento** (Dependency Injection, Event-Driven)
3. **Testabilidad** (Módulos pequeños, inyección de dependencias)
4. **Mantenibilidad** (Módulos <300 líneas)
5. **Escalabilidad** (Fácil agregar nuevos modos/features)

### Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────┐
│                    UI LAYER (React-like)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ GameScreen   │  │ ShopScreen   │  │ HeroShowcase │  │
│  │ Components   │  │ Components   │  │ Component    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (Orchestration)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Game      │  │    Screen    │  │    Mode      │  │
│  │  Controller  │  │  Controller  │  │  Controller  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│           SERVICE LAYER (Business Logic)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Player     │  │ Achievement  │  │  Question    │  │
│  │  Service     │  │   Service    │  │  Generator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Adaptive    │  │   Reward     │  │   Progress   │  │
│  │  Service     │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│          STATE LAYER (Centralized Store)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │              GameStore (Zustand-like)             │  │
│  │  - playerState                                    │  │
│  │  - gameState                                      │  │
│  │  - uiState                                        │  │
│  │  - actions (addCoins, updateMastery, etc)        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│       INFRASTRUCTURE LAYER (Persistence/Events)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Storage     │  │   EventBus   │  │   Logger     │  │
│  │  Manager     │  │   (PubSub)   │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos Propuestos

### Core Infrastructure (`/src/core/`)

#### 1. `GameStore.js` (~250 líneas)
**Responsabilidad**: State management centralizado
```javascript
class GameStore {
  constructor() {
    this.state = {
      player: {},
      game: {},
      ui: {}
    }
    this.listeners = new Set()
  }

  getState()
  setState(updater)
  subscribe(listener)
  // Actions
  addCoins(amount)
  updateMastery(table, value)
  unlockAchievement(id)
}
```

#### 2. `EventBus.js` (~150 líneas)
**Responsabilidad**: Comunicación desacoplada entre módulos
```javascript
class EventBus {
  on(event, handler)
  off(event, handler)
  emit(event, data)
  once(event, handler)
}

// Eventos del sistema:
// - 'player:coins:added'
// - 'player:achievement:unlocked'
// - 'game:answer:correct'
// - 'game:answer:wrong'
// - 'game:mode:changed'
// - 'ui:screen:changed'
```

#### 3. `StorageManager.js` (~100 líneas)
**Responsabilidad**: Abstracción de localStorage con error handling
```javascript
class StorageManager {
  get(key)
  set(key, value)
  remove(key)
  clear()
  // Manejo de errores (quota exceeded, etc)
}
```

---

### Services (`/src/services/`)

#### 4. `PlayerService.js` (~200 líneas)
**Responsabilidad**: Lógica de jugador (CRUD, coins, stats)
```javascript
class PlayerService {
  createPlayer(name, avatar)
  loadPlayer()
  savePlayer(player)
  addCoins(player, amount)
  updateStats(player, stats)
  calculateGlobalMastery(player)
}
```

#### 5. `AchievementService.js` (~250 líneas)
**Responsabilidad**: Sistema de logros
```javascript
class AchievementService {
  constructor(achievements)
  checkAchievement(player, achievementId)
  unlockAchievement(player, achievementId)
  getUnlockedAchievements(player)
  getProgress(player, achievementId)
}
```

#### 6. `QuestionService.js` (~200 líneas)
**Responsabilidad**: Generación de preguntas
```javascript
class QuestionService {
  generateQuestion(table, difficulty)
  generateOptions(correctAnswer)
  validateAnswer(question, answer)
}
```

#### 7. `AdaptiveService.js` (~300 líneas)
**Responsabilidad**: Sistema adaptativo (actualmente en app.js)
```javascript
class AdaptiveService {
  getNextQuestion(performance)
  adjustDifficulty(table, accuracy)
  getTableMastery(table)
  recommendTables()
}
```

#### 8. `RewardService.js` (~150 líneas)
**Responsabilidad**: Cálculo y distribución de recompensas
```javascript
class RewardService {
  calculateReward(correctAnswers, streak)
  showRewardFlow(rewards)
  distributeReward(player, reward)
}
```

---

### Controllers (`/src/controllers/`)

#### 9. `GameController.js` (~300 líneas)
**Responsabilidad**: Orquestación del flujo principal del juego
```javascript
class GameController {
  constructor(store, eventBus, services)

  init()
  startGame()
  endGame()
  handleAnswer(answer)

  // Coordina PlayerService, QuestionService, AchievementService
}
```

#### 10. `ScreenController.js` (~250 líneas)
**Responsabilidad**: Navegación entre pantallas
```javascript
class ScreenController {
  showScreen(screenId)
  showMainScreen()
  showWelcomeScreen()
  updateHeader()

  // Maneja transiciones, historial
}
```

#### 11. `ModeController.js` (~250 líneas)
**Responsabilidad**: Gestión de modos de juego
```javascript
class ModeController {
  startMode(modeName, config)
  endMode()
  switchMode(newMode)

  // Coordina con game engines externos
}
```

---

### UI Components (`/src/ui/`)

#### 12. `EventListenerManager.js` (~200 líneas)
**Responsabilidad**: Setup y cleanup de event listeners
```javascript
class EventListenerManager {
  registerListeners(element, listeners)
  removeListeners(element)
  cleanup()
}
```

---

## 🔄 Flujo de Datos

### Ejemplo: Usuario responde pregunta correctamente

```
1. UI (button click)
        ↓
2. GameController.handleAnswer(answer)
        ↓
3. QuestionService.validateAnswer() → true
        ↓
4. EventBus.emit('game:answer:correct', {question, answer})
        ↓
5. Múltiples listeners responden:
   - PlayerService → addCoins()
   - AchievementService → checkAchievements()
   - AdaptiveService → updatePerformance()
   - RewardService → calculateReward()
        ↓
6. Cada service actualiza el Store:
   - store.addCoins(5)
   - store.unlockAchievement('first_correct')
   - store.updateMastery(2, 75)
        ↓
7. Store notifica a subscribers (UI components):
   - CoinSystem actualiza display
   - MateoMascot celebra
   - RewardFlow muestra animación
        ↓
8. StorageManager persiste cambios (debounced)
```

---

## 🧪 Beneficios para Testing

### Antes (Monolítico)
```javascript
// Imposible testear aisladamente
const game = new MultiplicationGame()
// Requiere DOM completo, localStorage, todos los módulos
```

### Después (Modular)
```javascript
// Testear PlayerService aislado
const mockStorage = new MockStorage()
const playerService = new PlayerService(mockStorage)
playerService.addCoins(player, 10)
expect(player.coins).toBe(110)

// Testear GameController con mocks
const mockStore = new MockStore()
const mockEventBus = new MockEventBus()
const controller = new GameController(mockStore, mockEventBus, mockServices)
```

---

## 📈 Plan de Migración (Estrategia Incremental)

### Fase 1: Fundamentos (1-2 días)
- ✅ Crear GameStore (state management)
- ✅ Crear EventBus (pub/sub)
- ✅ Crear StorageManager
- ✅ Tests unitarios para cada uno

### Fase 2: Services (2-3 días)
- ✅ Extraer PlayerService
- ✅ Extraer AchievementService
- ✅ Extraer QuestionService
- ✅ Extraer AdaptiveService
- ✅ Tests unitarios para cada service

### Fase 3: Controllers (2-3 días)
- ✅ Crear GameController
- ✅ Crear ScreenController
- ✅ Crear ModeController
- ✅ Tests de integración

### Fase 4: Refactorizar app.js (1-2 días)
- ✅ Convertir app.js en "bootstrap" delgado
- ✅ Instanciar y conectar todos los módulos
- ✅ Eliminar código duplicado
- ✅ app.js debería quedar en ~200-300 líneas

### Fase 5: Testing & Validación (1-2 días)
- ✅ Tests E2E completos
- ✅ Validar funcionalidad completa
- ✅ Performance testing
- ✅ Documentación

**Total estimado**: 7-12 días de trabajo

---

## 🎨 Ejemplo de Código: Antes vs Después

### ANTES (app.js monolítico)
```javascript
class MultiplicationGame {
  handleCorrectAnswer() {
    this.player.correct++;
    this.player.coins += 5;
    this.player.streak++;

    if (this.player.streak > this.player.bestStreak) {
      this.player.bestStreak = this.player.streak;
    }

    this.savePlayer();

    if (window.coinSystem) {
      window.coinSystem.updateDisplay(this.player.coins);
    }

    if (window.soundSystem) {
      if (this.gameState.streak >= 3) {
        window.soundSystem.playSuccess();
      } else {
        window.soundSystem.playCorrect();
      }
    }

    if (window.mateoMascot) {
      const messages = ['¡Excelente!', '¡Muy bien!', '¡Correcto!'];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      window.mateoMascot.speak(msg);
    }

    // Check achievements...
    if (this.player.correct === 10) {
      this.unlockAchievement('first_ten');
    }
    // ... 50 líneas más
  }
}
```

### DESPUÉS (Modular)
```javascript
// GameController.js
class GameController {
  async handleCorrectAnswer(question, answer) {
    // 1. Validar respuesta
    const isValid = this.questionService.validate(question, answer)
    if (!isValid) return

    // 2. Emitir evento
    this.eventBus.emit('game:answer:correct', {
      question,
      answer,
      timestamp: Date.now()
    })

    // 3. Actualizar store (los services escuchan y reaccionan)
    this.store.incrementStreak()
  }
}

// PlayerService.js (escucha eventos)
class PlayerService {
  constructor(store, eventBus) {
    this.store = store
    this.eventBus = eventBus

    // Subscribirse a eventos
    this.eventBus.on('game:answer:correct', this.onCorrectAnswer.bind(this))
  }

  onCorrectAnswer(data) {
    const player = this.store.getState().player

    // Lógica de negocio encapsulada
    const reward = this.calculateReward(player.streak)
    this.store.addCoins(reward)
    this.store.updateStats({ correct: player.correct + 1 })
  }
}

// AchievementService.js (escucha eventos)
class AchievementService {
  constructor(store, eventBus) {
    this.eventBus = eventBus
    this.eventBus.on('game:answer:correct', this.checkAchievements.bind(this))
  }

  checkAchievements() {
    const player = this.store.getState().player
    if (player.correct === 10) {
      this.unlock('first_ten')
    }
  }
}
```

**Resultado**:
- Lógica separada por responsabilidades
- Fácil de testear cada pieza
- Fácil agregar nuevas features (nuevo listener)
- No más `if (window.X)` checks

---

## 🔍 Métricas de Éxito

### Código
- ✅ Ningún archivo > 300 líneas
- ✅ app.js reducido 90% (400 líneas → <300)
- ✅ 0 referencias directas a `window.X` (usar DI)
- ✅ 0 `console.log` en producción

### Testing
- ✅ Cobertura de tests: 10% → 80%+
- ✅ Tests unitarios: 135 → 500+
- ✅ Tests de integración: 0 → 50+

### Mantenibilidad
- ✅ Tiempo para agregar nuevo modo: 3 días → 1 día
- ✅ Tiempo para onboarding nuevo dev: 1 semana → 1 día
- ✅ Bugs por release: Reducir 70%

---

## 📚 Referencias de Arquitectura

### Patrones Aplicados
1. **MVC** (Model-View-Controller)
2. **Service Layer Pattern**
3. **Repository Pattern** (StorageManager)
4. **Observer Pattern** (EventBus)
5. **Dependency Injection**
6. **Single Responsibility Principle**

### Inspiración
- Redux (state management)
- Zustand (lightweight store)
- Angular Services (service layer)
- EventEmitter pattern (Node.js)

---

**Última actualización**: 2025-11-09
**Autor**: Claude Code + Yesid
**Estado**: 🚧 En desarrollo (Fase 1)
