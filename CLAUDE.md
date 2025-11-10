# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Multiplicar Mágico** is an educational Progressive Web App (PWA) for teaching multiplication tables (2-10) to children aged 7-12 through gamification. The app features 8 game modes, adaptive learning algorithms, a virtual economy with shop, achievements, and progress visualization.

## Commands

### Development
```bash
npm start              # Start local server on port 3000
npm test               # Run tests in watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Generate coverage report (target: >80%)
npm run test:ui        # Open Vitest UI
```

### Running the App
- Open `index.html` directly in browser, OR
- Run `npm start` and visit http://localhost:3000
- No build step required - vanilla JavaScript

## Architecture

### Recent Refactoring (Nov 2025)

The codebase was recently refactored from a monolithic 3,765-line `app.js` into a professional modular architecture. **Key insight**: The project is in a **transitional state** - new modular components exist alongside the legacy monolithic system.

### Directory Structure

```
abckidslearning/
├── core/                    # NEW: Modern modular components
│   ├── EventBus.js         # Observer pattern for decoupled communication
│   ├── QuestionGenerator.js # Factory for creating questions with smart options
│   └── StateManager.js     # Singleton for centralized state management
│
├── systems/                 # NEW: Extracted systems from app.js
│   ├── AdaptiveSystem.js   # Learning algorithm (spaced repetition, mastery tracking)
│   └── TutorialSystem.js   # Interactive onboarding with spotlight effects
│
├── services/               # NEW: Infrastructure services
│   └── StorageService.js   # localStorage abstraction with versioning/TTL
│
├── tests/                  # Vitest unit tests
│   ├── EventBus.test.js    # 50+ tests
│   ├── QuestionGenerator.test.js # 80+ tests
│   └── StateManager.test.js # 50+ tests
│
├── app.js                  # LEGACY: Main game class (still ~3.7K lines)
│                           # Contains MultiplicationGame, some UI logic
│
├── *GameEngine.js files:   # Game mode implementations
│   ├── spaceGameEngine.js     # Space shooter with Canvas
│   ├── bossGameEngine.js      # Turn-based RPG battles
│   ├── galaxySystemEngine.js  # 3D solar system progress visualization
│   └── practiceSystemEngine.js # Diagnostic + adaptive practice mode
│
├── *System.js files:       # Feature systems
│   ├── coinSystem.js          # Economy/currency management
│   ├── shopSystem.js          # Item purchasing (avatars, ships, weapons)
│   ├── dailyMissionsSystem.js # Quest system
│   ├── fireModeSystem.js      # Combo multiplier mode
│   └── feedbackSystem.js      # Visual feedback animations
│
├── mateo.js                # Mascot assistant character
├── mnemonicTricks.js       # Memory tricks for each multiplication table
├── pauseMenu.js            # In-game pause overlay
├── sounds.js               # Audio system
└── server.js               # Simple static file server
```

### Key Architectural Patterns

1. **Observer Pattern (EventBus)**
   - Used for decoupling components
   - Events like `'answer:correct'`, `'level:up'`, `'achievement:unlocked'`
   - New modules use this; legacy code still uses `window.*` globals

2. **Factory Pattern (QuestionGenerator)**
   - Centralizes question generation logic
   - Generates realistic incorrect options (8 different strategies)
   - Supports difficulty levels and adaptive strategies
   - **Not yet integrated** into game engines (still duplicated code)

3. **Singleton Pattern (StateManager)**
   - Single source of truth for app state
   - Path-based get/set: `state.set('player.level', 5)`
   - Auto-persists to localStorage
   - **Not yet integrated** with legacy code (still uses `this.player`, `localStorage` directly)

4. **Module Pattern**
   - Each system is an ES6 class with clear responsibilities
   - Currently loaded via `<script>` tags (no bundler)

## Integration Status

### ✅ Completed
- Core modules created and tested (223 tests passing)
- Professional patterns implemented
- Test infrastructure with Vitest + happy-dom

### ⚠️ In Progress
- Legacy `app.js` still uses old patterns:
  - Direct `localStorage` calls instead of `StorageService`
  - `window.*` globals instead of `EventBus`
  - Inline question generation instead of `QuestionGenerator`
- Game engines have duplicated question generation logic

### 🔜 Next Steps (per REFACTORING_COMPLETED.md)
1. Migrate `app.js` to use EventBus for communication
2. Replace game engine question generation with `QuestionGenerator`
3. Migrate state management to `StateManager`
4. Implement dependency injection instead of `window.*` globals

## Key Systems

### Adaptive Learning System
Located in `systems/AdaptiveSystem.js` and parts of `app.js`:
- Tracks mastery per table (0-100%)
- Spaced repetition algorithm
- Analyzes error patterns and response times
- Suggests tables needing practice
- `recordAnswer(table, isCorrect, responseTime)` - main method
- `getSuggestedTables(count)` - returns prioritized tables

### Question Generation
**Legacy**: Each game engine has its own generation logic
**New**: `core/QuestionGenerator.js` provides:
```javascript
const gen = new QuestionGenerator({
  optionsCount: 4,
  difficultyLevel: 'medium' // easy/medium/hard
});

const question = gen.generate({
  tables: [7, 8, 9],
  multiplierMin: 2,
  multiplierMax: 10
});
// Returns: { id, table, multiplier, answer, options, difficulty }
```

### Storage Architecture
**Legacy**: Direct `localStorage.setItem('multiplicationGamePlayer', JSON.stringify(player))`
**New**: `services/StorageService.js` with namespacing, versioning, TTL

### State Management
**Legacy**: State scattered across `this.player`, `this.gameState`, direct localStorage
**New**: Centralized `StateManager.getInstance()` with reactive subscriptions

## Game Modes

Each mode has its own engine file:

1. **Practice Mode** (`practiceSystemEngine.js`)
   - 15-question diagnostic
   - Visual mastery map (circular chart)
   - Table selection with recommendations
   - Zero time pressure

2. **Quick Challenge** (in `app.js`)
   - 60-second timer
   - Combo multipliers (x2, x3, x4)
   - Fire Mode at 5+ streak

3. **Space Adventure** (`spaceGameEngine.js`)
   - Canvas-based space shooter
   - Mouse/keyboard controls
   - Power-ups (shield, lives, points, boost)
   - Progressive difficulty

4. **Math Race** (in `app.js`)
   - 4 runners (player + 3 AI)
   - Speed-based progression
   - 5 laps to win

5. **Boss Battle** (`bossGameEngine.js`)
   - Turn-based RPG combat
   - 9 bosses (one per table 2-10)
   - HP scales with player mastery
   - Super-attack charging system

6. **Galaxy Progress** (`galaxySystemEngine.js`)
   - 3D solar system visualization
   - Planets represent tables
   - Colors indicate mastery level
   - Clickable for detailed stats

7. **Daily Missions** (`dailyMissionsSystem.js`)
8. **Shop/Inventory** (`shopSystem.js`)

## Testing

### Framework
- **Vitest** with `happy-dom` environment
- Target coverage: >80% (see `vitest.config.js`)

### Current Coverage
- Core modules: >90% coverage, 223/231 tests passing
- Legacy code: Minimal/no coverage
- 8 tests fail in old test files that test pre-refactoring code

### Running Tests
```bash
npm test                # Watch mode
npm run test:coverage   # Generate coverage HTML report
npm run test:ui         # Visual UI for debugging
```

### Test Structure
- Tests use global `describe`, `it`, `expect` (via vitest globals)
- Setup file: `tests/setup.js`
- Mock localStorage/DOM as needed with happy-dom

## Important Conventions

### State Persistence
- **Key**: `'multiplicationGamePlayer'` in localStorage
- Auto-saves after: answers, purchases, achievements, screen changes
- Structure: `{ player, tableMastery, inventory, equipped, achievements, settings }`

### Player Object
```javascript
{
  name: string,
  avatar: string (emoji),
  level: number,
  xp: number,
  stars: number,           // Currency
  trophies: { gold, silver, bronze },
  streak: number,          // Consecutive days
  lastPlayedDate: string,
  equipped: { avatar, ship, car, weapon }
}
```

### Table Mastery Tracking
```javascript
tableMastery[table] = {
  mastery: 0.0-1.0,      // Percentage as decimal
  attempts: number,
  correct: number,
  incorrect: number,
  avgResponseTime: number,
  lastPracticed: timestamp
}
```

### Event Naming
EventBus events use namespaced format:
- `'answer:correct'`, `'answer:incorrect'`
- `'level:up'`, `'level:progress'`
- `'achievement:unlocked'`
- `'coin:earned'`, `'item:purchased'`

### DOM IDs
Key screens use these container IDs:
- `#welcomeScreen` - Initial name/avatar selection
- `#mainScreen` - Main menu with 8 mode cards
- `#playScreen` - Active gameplay
- `#resultsScreen` - Post-game stats
- `#shopScreen` - Item purchasing
- `#galaxyScreen` - Progress visualization

## Common Tasks

### Adding a New Game Mode
1. Create `*GameEngine.js` file with class
2. Add mode card to `index.html` main screen grid
3. Add click handler in `app.js` `setupEventListeners()`
4. Implement: `start()`, `showQuestion()`, `checkAnswer()`, `endGame()`
5. Use `QuestionGenerator` from core (once integrated)
6. Emit events via `EventBus` for scoring/achievements

### Modifying the Adaptive Algorithm
- Primary logic in `systems/AdaptiveSystem.js`
- Backup logic still in `app.js` `AdaptiveSystem` class
- Key method: `recordAnswer(table, isCorrect, responseTime)`
- Mastery formula: `(correct / (correct + incorrect)) * recencyFactor`
- Spaced repetition: prioritizes tables by (low mastery + time since practice)

### Adding Shop Items
1. Add item data to `shopSystem.js` category arrays
2. Update `renderShop()` to display new category if needed
3. Add purchase logic in `purchaseItem(item)`
4. Handle equipment in `equipItem(item)` if applicable

### Debugging State Issues
- Check browser DevTools → Application → Local Storage → `multiplicationGamePlayer`
- Use `StateManager.getInstance().export()` for new modules
- Player data loads in `MultiplicationGame` constructor via `loadPlayer()`
- Call `savePlayer()` to persist changes

## Progressive Web App (PWA)

- `manifest.json` defines app metadata
- Installable on mobile/desktop
- Works offline (all assets are local)
- No service worker currently (could be added)

## Browser Compatibility

Targets modern browsers with ES6+ support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS/Android)

No transpilation or polyfills - uses native ES6 classes, arrow functions, template literals, etc.

## Documentation Files

- `RESUMEN_FUNCIONAL_APP.md` - Complete functional specification (30 pages)
- `REFACTORING_COMPLETED.md` - Refactoring report with architecture details
- `ARQUITECTURA_ANALISIS.md` - Original architecture analysis that led to refactoring
- `TESTING.md` - Testing guide
- `README.md` - User-facing documentation

When making changes to game logic, consult `RESUMEN_FUNCIONAL_APP.md` for the intended behavior and mechanics.

## Performance Notes

- Animations use `requestAnimationFrame` where possible
- Canvas rendering in space/galaxy modes
- Particle system can be heavy on older devices
- No lazy loading yet - all scripts load upfront
- LocalStorage operations are synchronous (consider debouncing saves)

## Sound System

- `sounds.js` manages audio
- Toggle via `window.soundSystem.toggle()`
- Categories: UI clicks, correct/incorrect answers, achievements
- Currently uses Web Audio API with oscillator (no audio files)
- Can be extended with actual audio files if needed
