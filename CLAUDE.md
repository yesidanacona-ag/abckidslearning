# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Multiplicar Mágico** is an educational Progressive Web App (PWA) designed to teach multiplication tables to children through gamification and adaptive learning. The app is built with vanilla JavaScript and runs entirely client-side with no backend dependencies.

## Development Commands

```bash
# Start development server (required - don't open index.html directly due to CORS)
npm start                    # Starts server at http://localhost:8080

# Testing
npm test                     # Run all tests once
npm run test:run             # Alternative: run tests once
npm run test:ui              # Run tests in watch mode with UI
npm run test:coverage        # Generate coverage report

# Server alternatives (if npm start doesn't work)
python -m http.server 8080   # Python 3
```

**Important**: Never open `index.html` directly in browser - always use a local server to avoid CORS errors with assets, manifest, and other resources.

## Architecture Overview

### Module Loading System

The app uses a **modular script-based architecture** where independent engine/system modules are loaded via `<script>` tags in `index.html` before the main `app.js`:

```
sounds.js → mnemonicTricks.js → mateo.js → pauseMenu.js → coinSystem.js
→ feedbackSystem.js → fireModeSystem.js → shopSystem.js → dailyMissionsSystem.js
→ spaceGameEngine.js → bossGameEngine.js → practiceSystemEngine.js
→ galaxySystemEngine.js → app.js
```

Each module exposes global classes that `MultiplicationGame` (in `app.js`) instantiates and orchestrates.

### Core Systems

**Main Controller** (`app.js`):
- `MultiplicationGame` - Central game controller, manages all systems
- `AdaptiveSystem` - Analyzes player performance and adjusts difficulty
- `TutorialSystem` - First-time user onboarding

**Game Engines** (separate files):
- `SpaceGameEngine` - Space adventure mode with Canvas-based rendering
- `BossGameEngine` - Boss battle mode with epic fights
- `PracticeSystemEngine` - Adaptive practice mode
- `GalaxySystemEngine` - Galaxy exploration mode with planets
- `FireModeSystem` - Fast-paced fire mode

**Support Systems** (separate files):
- `SoundSystem` (`sounds.js`) - Audio management with user preferences
- `MateoMascot` (`mateo.js`) - Interactive mascot with expressions and speech
- `MnemonicSystem` (`mnemonicTricks.js`) - Memory tricks for multiplication
- `CoinSystem` - Virtual economy and rewards
- `ShopSystem` - In-game store for customization items
- `DailyMissionsSystem` - Daily challenges
- `FeedbackSystem` - Visual feedback for user actions
- `PauseMenu` - Global pause functionality

### Data Architecture

**All data is stored in browser LocalStorage**:
- Player profile (name, avatar, XP, level, coins)
- Statistics (questions answered, accuracy, best streak)
- Table mastery progress (0-100% per table)
- Achievements unlocked
- Purchased items from shop
- Settings (sound enabled, tutorial completed)

**Key**: `playerData` contains the entire player state as JSON.

### State Management

State is managed through the `MultiplicationGame.player` object, which is:
1. Loaded from `localStorage` on app initialization
2. Updated in-memory during gameplay
3. Persisted via `savePlayer()` after significant actions
4. Accessed by all subsystems through the main game instance

## Code Patterns and Conventions

### Commit Message Style

Uses emoji-based semantic commits following this pattern:
- `✨ NUEVA SECCIÓN:` - New feature/section
- `🐛 FIX:` - Bug fix
- `🐛 FIX CRÍTICO:` - Critical bug fix
- `🎨 MEJORA:` - Improvement/enhancement
- `🌌 FASE X COMPLETADA:` - Phase completion
- `📚 FASE X COMPLETADA:` - Documentation phase completion

### Testing Practices

- Framework: **Vitest** with **happy-dom** environment
- Location: `tests/` directory
- Coverage: 135 tests across 3 files
- Setup: `tests/setup.js` provides global mocks (localStorage, Audio, SpeechSynthesis, requestAnimationFrame)
- Run tests before commits for significant changes
- Write test first when fixing bugs to prevent regression

### Module Pattern

Each system/engine follows this pattern:
```javascript
class SystemName {
    constructor(dependencies) {
        // Initialize state
        this.init();
    }

    init() {
        // Setup event listeners, DOM elements, etc.
    }

    // Public methods
}

// Global instantiation (if standalone) or instantiated by MultiplicationGame
```

### DOM Manipulation

- Uses vanilla JavaScript (no framework)
- Direct DOM queries via `getElementById`, `querySelector`
- Event delegation for dynamic elements
- Manual show/hide of screens via `classList.add/remove('active')`

## Working with Game Modes

Each game mode is self-contained in its engine file:

1. **Practice Mode** (`practiceSystemEngine.js`): Table selection → adaptive questions → progress tracking
2. **Space Adventure** (`spaceGameEngine.js`): Canvas-based rendering, planet progression, lives system
3. **Boss Battles** (`bossGameEngine.js`): Turn-based combat, boss HP, special attacks
4. **Galaxy Mode** (`galaxySystemEngine.js`): Planet visualization, click handlers for navigation
5. **Fire Mode** (`fireModeSystem.js`): Speed-based challenges

When adding/modifying a game mode:
- The engine handles its own UI, rendering, and game logic
- Communicates back to `MultiplicationGame` for scoring, XP, coins
- Uses `AdaptiveSystem` for question generation
- Triggers `MateoMascot` for feedback
- Plays sounds via `window.soundSystem`

## Common Development Tasks

### Adding a New Achievement

1. Add achievement definition to `app.js` in the achievements array
2. Add check logic in relevant method (e.g., `checkAnswer()`, `endGame()`)
3. Call `unlockAchievement(achievementId)` when condition met
4. Test with `localStorage.clear()` to reset progress

### Modifying Adaptive Learning

The `AdaptiveSystem` class uses:
- **Performance tracking**: Accuracy per table, recent mistakes
- **Spaced repetition**: Prioritizes weak tables
- **Difficulty adjustment**: Changes question complexity based on mastery

Edit `AdaptiveSystem.getNextQuestion()` to change selection algorithm.

### Adding Shop Items

1. Add item to `ShopSystem.items` array with properties: `id`, `name`, `description`, `price`, `icon`, `type`
2. Item types: `avatar`, `background`, `power-up`, etc.
3. Purchase logic automatically handles coins and `player.purchasedItems`
4. Add visual representation in the respective UI section

### Debugging Tutorial Issues

The `TutorialSystem` has extensive console logging:
- Clear localStorage: `localStorage.clear()` in browser console
- Reload page to trigger tutorial
- Check F12 console for "🚀 Tutorial:" logs
- Verify `pointer-events` restoration on `mainScreen` if clicks don't work

## File Organization

```
/
├── index.html              # Main HTML, loads all modules in order
├── app.js                  # Main game controller (3300+ lines)
├── styles.css              # All styles, animations, responsive design
├── server.js               # Development HTTP server
├── vitest.config.mjs       # Test configuration
├── package.json            # Scripts and dependencies
│
├── Game Engines
│   ├── spaceGameEngine.js
│   ├── bossGameEngine.js
│   ├── practiceSystemEngine.js
│   ├── galaxySystemEngine.js
│   └── fireModeSystem.js
│
├── Core Systems
│   ├── mateo.js
│   ├── sounds.js
│   ├── mnemonicTricks.js
│   ├── coinSystem.js
│   ├── shopSystem.js
│   ├── dailyMissionsSystem.js
│   ├── feedbackSystem.js
│   └── pauseMenu.js
│
├── tests/
│   ├── setup.js            # Global test setup and mocks
│   ├── mateo.test.js       # Mateo mascot tests (42 tests)
│   ├── tutorial.test.js    # Tutorial system tests (44 tests)
│   └── game-logic.test.js  # Core game logic tests (49 tests)
│
├── assets/
│   ├── achievements/
│   ├── backgrounds/
│   └── characters/
│
└── Documentation
    ├── README.md               # User-facing documentation
    ├── TESTING.md              # Complete testing guide
    ├── INSTRUCCIONES.md        # Spanish setup instructions
    └── AUDITORIA_*.md          # Design audits and analysis
```

## Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Uses: ES6+, Canvas API, LocalStorage, PWA features
- No transpilation - runs native ES6 in browser

## Performance Considerations

- Canvas rendering for space mode is performance-sensitive
- Particle systems should be throttled on slower devices
- LocalStorage has ~5-10MB limit - player data is small but monitor growth
- Animations use CSS transforms for GPU acceleration
- `requestAnimationFrame` for smooth game loops

## Localization

Currently Spanish only (`lang="es"`). Text is hardcoded in:
- HTML elements in `index.html`
- String literals in JavaScript files
- Achievement/feedback messages in `app.js`

To add another language, consider extracting strings to a constants object.

## Key Technical Gotchas

1. **Module Load Order Matters**: `app.js` must load last as it depends on all other classes being defined globally
2. **CORS Requirement**: Must use HTTP server; `file://` protocol breaks asset loading
3. **LocalStorage Sync**: Changes to `player` object in memory don't persist until `savePlayer()` is called
4. **Tutorial Blocking**: TutorialSystem modifies `pointer-events` on `mainScreen` - must be restored on completion
5. **Canvas Cleanup**: Game engines with Canvas must clear state when switching modes to prevent memory leaks
6. **Event Listener Duplication**: When reinitializing UI, remove old listeners before adding new ones

## Recent Development History

The app was developed in phases:
- **FASE 0**: Global pause system
- **FASE 1**: Coins, feedback, fire mode
- **FASE 2**: Economy, shop, daily missions
- **FASE 3**: Space adventure with Canvas
- **FASE 4**: Boss battles
- **FASE 5**: Adaptive practice mode
- **FASE 6**: Galaxy exploration

Recent focus has been on UI improvements and bug fixes for game modes.
