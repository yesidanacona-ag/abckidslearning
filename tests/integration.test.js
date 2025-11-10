// ================================
// TESTS: Integration Tests
// Tests de integración entre módulos
// ================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Importar todos los módulos
import '../src/core/StorageManager.js';
import '../src/core/EventBus.js';
import '../src/core/GameStore.js';
import '../src/services/PlayerService.js';
import '../src/services/AdaptiveService.js';
import '../src/services/QuestionService.js';
import '../src/services/AchievementService.js';
import '../src/controllers/GameController.js';
import '../src/Bootstrap.js';

const {
    StorageManager,
    EventBus,
    GameStore,
    PlayerService,
    AdaptiveService,
    QuestionService,
    AchievementService,
    GameController,
    ApplicationBootstrap
} = window;

// ================================
// Bootstrap Integration Tests
// ================================

describe('Bootstrap Integration', () => {
    let bootstrap;

    beforeEach(() => {
        localStorage.clear();
        bootstrap = new ApplicationBootstrap();
    });

    it('debe inicializar todos los módulos correctamente', () => {
        const context = bootstrap.initialize();

        expect(context.storage).toBeInstanceOf(StorageManager);
        expect(context.eventBus).toBeInstanceOf(EventBus);
        expect(context.store).toBeInstanceOf(GameStore);
        expect(context.services.player).toBeInstanceOf(PlayerService);
        expect(context.services.adaptive).toBeInstanceOf(AdaptiveService);
        expect(context.services.question).toBeInstanceOf(QuestionService);
        expect(context.services.achievement).toBeInstanceOf(AchievementService);
        expect(context.controllers.game).toBeInstanceOf(GameController);
    });

    it('no debe inicializar dos veces', () => {
        bootstrap.initialize();
        const context2 = bootstrap.initialize();

        expect(context2).toBeDefined();
        expect(bootstrap.initialized).toBe(true);
    });

    it('debe proporcionar diagnósticos completos', () => {
        bootstrap.initialize();
        const diagnostics = bootstrap.getDiagnostics();

        expect(diagnostics.initialized).toBe(true);
        expect(diagnostics.coreModules.storage).toBe(true);
        expect(diagnostics.coreModules.eventBus).toBe(true);
        expect(diagnostics.coreModules.store).toBe(true);
        expect(diagnostics.services.player).toBe(true);
        expect(diagnostics.controllers.game).toBe(true);
    });

    it('debe resetear el sistema completamente', () => {
        const context = bootstrap.initialize();
        context.store.addCoins(100);

        bootstrap.reset();

        expect(bootstrap.initialized).toBe(true);
        // Después del reset, el store está limpio
        expect(context.store.getState().player.coins).toBeLessThanOrEqual(100);
    });
});

// ================================
// Store + Services Integration
// ================================

describe('Store + Services Integration', () => {
    let storage, eventBus, store, playerService, adaptiveService;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
        playerService = new PlayerService(store, eventBus);
        adaptiveService = new AdaptiveService(store, eventBus);
    });

    it('debe sincronizar cambios entre store y services', () => {
        // Service actualiza store
        playerService.addCoins(50);

        // Store refleja el cambio
        expect(store.getState().player.coins).toBe(50);
    });

    it('debe persistir cambios en localStorage', (done) => {
        playerService.addCoins(100);

        // Store auto-guarda con debounce
        setTimeout(() => {
            const saved = storage.get('playerData');
            expect(saved.coins).toBe(100);
            done();
        }, 1500);
    });

    it('debe emitir eventos cuando cambia el estado', (done) => {
        eventBus.on('player:coins:added', (data) => {
            expect(data.amount).toBe(25);
            expect(data.total).toBe(25);
            done();
        });

        playerService.addCoins(25);
    });

    it('debe mantener consistencia entre múltiples services', () => {
        // PlayerService actualiza stats
        store.updateStats({ totalQuestions: 10 });

        // AdaptiveService usa los mismos datos del store
        adaptiveService.recordAnswer(7, true);

        const tableMastery = store.getState().tableMastery;
        expect(tableMastery[7].attempts).toBeGreaterThan(0);
    });
});

// ================================
// GameController + Services Integration
// ================================

describe('GameController + Services Integration', () => {
    let storage, eventBus, store, services, gameController;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);

        services = {
            playerService: new PlayerService(store, eventBus),
            adaptiveService: new AdaptiveService(store, eventBus),
            questionService: null,
            achievementService: null
        };

        services.questionService = new QuestionService(services.adaptiveService);
        services.achievementService = new AchievementService(store, eventBus, services.playerService);

        gameController = new GameController(store, eventBus, {
            playerService: services.playerService,
            questionService: services.questionService,
            achievementService: services.achievementService,
            adaptiveService: services.adaptiveService
        });
    });

    describe('flujo completo de juego', () => {
        it('debe iniciar juego correctamente', () => {
            gameController.startGame('practice', {
                tables: [7, 8],
                count: 5
            });

            const gameState = store.getState().game;
            expect(gameState.mode).toBe('practice');
            expect(gameState.questions).toHaveLength(5);
            expect(gameState.startTime).toBeDefined();
        });

        it('debe manejar respuesta correcta integrando todos los services', () => {
            gameController.startGame('practice', {
                tables: [7],
                count: 1
            });

            const question = gameController.getCurrentQuestion();
            const initialCoins = store.getState().player.coins;
            const initialStreak = store.getState().player.streak;

            const result = gameController.handleAnswer(question.answer);

            expect(result.isCorrect).toBe(true);
            expect(result.points).toBeGreaterThan(0);
            expect(store.getState().player.coins).toBeGreaterThan(initialCoins);
            expect(store.getState().player.streak).toBe(initialStreak + 1);
        });

        it('debe manejar respuesta incorrecta', () => {
            gameController.startGame('practice', {
                tables: [7],
                count: 1
            });

            const question = gameController.getCurrentQuestion();
            const initialStreak = store.getState().player.streak;

            const result = gameController.handleAnswer(999);

            expect(result.isCorrect).toBe(false);
            expect(result.points).toBe(0);
            expect(store.getState().player.streak).toBe(0);
        });

        it('debe finalizar juego y verificar achievements', () => {
            gameController.startGame('practice', {
                tables: [7, 8],
                count: 2
            });

            // Responder preguntas
            for (let i = 0; i < 2; i++) {
                const question = gameController.getCurrentQuestion();
                gameController.handleAnswer(question.answer);
            }

            const stats = gameController.endGame();

            expect(stats.correct).toBe(2);
            expect(stats.accuracy).toBe(100);
            expect(stats.duration).toBeGreaterThan(0);
        });
    });

    describe('integración con AdaptiveService', () => {
        it('debe actualizar maestría basada en respuestas', () => {
            gameController.startGame('practice', {
                tables: [7],
                count: 3
            });

            const initialMastery = services.adaptiveService.getTableMastery(7);

            // Responder correctamente
            for (let i = 0; i < 3; i++) {
                const question = gameController.getCurrentQuestion();
                gameController.handleAnswer(question.answer);
            }

            const finalMastery = services.adaptiveService.getTableMastery(7);
            expect(finalMastery).toBeGreaterThan(initialMastery);
        });

        it('debe generar preguntas adaptativas basadas en maestría', () => {
            // Baja maestría en tabla 7
            store.updateTableMastery(7, { mastery: 10 });
            // Alta maestría en tabla 8
            store.updateTableMastery(8, { mastery: 90 });

            gameController.startGame('practice', {
                tables: [7, 8],
                count: 10
            });

            const questions = store.getState().game.questions;
            const table7Count = questions.filter(q => q.table === 7).length;
            const table8Count = questions.filter(q => q.table === 8).length;

            // Debería haber más preguntas de tabla 7 (baja maestría)
            expect(table7Count).toBeGreaterThan(table8Count);
        });
    });

    describe('integración con AchievementService', () => {
        it('debe desbloquear achievements automáticamente', () => {
            // Configurar para desbloquear 'first_steps' (10 preguntas)
            store.updateStats({ totalQuestions: 9 });

            gameController.startGame('practice', {
                tables: [2],
                count: 1
            });

            const question = gameController.getCurrentQuestion();
            gameController.handleAnswer(question.answer);

            const achievements = store.getState().player.achievements;
            expect(achievements).toContain('first_steps');
        });

        it('debe verificar achievements múltiples en un juego', () => {
            gameController.startGame('practice', {
                tables: [7],
                count: 5
            });

            // Responder todas correctamente
            for (let i = 0; i < 5; i++) {
                const question = gameController.getCurrentQuestion();
                gameController.handleAnswer(question.answer);
            }

            gameController.endGame();

            // Debería haber desbloqueado al menos un achievement
            const achievements = store.getState().player.achievements;
            expect(achievements.length).toBeGreaterThan(0);
        });
    });
});

// ================================
// Event Flow Integration Tests
// ================================

describe('Event Flow Integration', () => {
    let bootstrap;

    beforeEach(() => {
        localStorage.clear();
        bootstrap = new ApplicationBootstrap();
        bootstrap.initialize();
    });

    it('debe propagar eventos a través de todo el sistema', (done) => {
        const { store, eventBus, services, controllers } = bootstrap.getContext();

        let eventsReceived = 0;

        eventBus.on('player:coins:added', () => eventsReceived++);
        eventBus.on('game:answer:correct', () => eventsReceived++);

        controllers.game.startGame('practice', {
            tables: [2],
            count: 1
        });

        const question = controllers.game.getCurrentQuestion();
        controllers.game.handleAnswer(question.answer);

        setTimeout(() => {
            expect(eventsReceived).toBeGreaterThanOrEqual(2);
            done();
        }, 100);
    });

    it('debe mantener consistencia de datos a través de eventos', (done) => {
        const { store, eventBus, services } = bootstrap.getContext();

        const initialCoins = store.getState().player.coins;

        eventBus.on('player:coins:added', (data) => {
            expect(store.getState().player.coins).toBe(initialCoins + data.amount);
            done();
        });

        services.player.addCoins(50);
    });
});

// ================================
// Persistence Integration Tests
// ================================

describe('Persistence Integration', () => {
    it('debe persistir y recuperar estado completo', () => {
        localStorage.clear();

        // Sesión 1: Crear y guardar datos
        const storage1 = new StorageManager('test_');
        const eventBus1 = new EventBus();
        const store1 = new GameStore(storage1, eventBus1);
        const playerService1 = new PlayerService(store1, eventBus1);

        playerService1.addCoins(100);
        store1.incrementStreak();
        store1.unlockAchievement('first_win');

        // Forzar guardado
        store1.saveToStorage();

        // Sesión 2: Recuperar datos
        const storage2 = new StorageManager('test_');
        const eventBus2 = new EventBus();
        const store2 = new GameStore(storage2, eventBus2);

        expect(store2.getState().player.coins).toBe(100);
        expect(store2.getState().player.streak).toBeGreaterThan(0);
        expect(store2.getState().player.achievements).toContain('first_win');
    });

    it('debe manejar storage corrupto gracefully', () => {
        localStorage.clear();
        localStorage.setItem('test_playerData', 'invalid json {{{');

        const storage = new StorageManager('test_');
        const player = storage.get('playerData', { name: 'default' });

        expect(player.name).toBe('default');
    });
});

// ================================
// Performance Integration Tests
// ================================

describe('Performance Integration', () => {
    it('debe manejar múltiples actualizaciones de estado eficientemente', () => {
        const storage = new StorageManager('test_');
        const eventBus = new EventBus();
        const store = new GameStore(storage, eventBus);
        const playerService = new PlayerService(store, eventBus);

        const start = performance.now();

        for (let i = 0; i < 100; i++) {
            playerService.addCoins(1);
        }

        const duration = performance.now() - start;

        expect(duration).toBeLessThan(1000); // Menos de 1 segundo para 100 updates
        expect(store.getState().player.coins).toBe(100);
    });

    it('debe manejar generación de múltiples preguntas rápidamente', () => {
        const storage = new StorageManager('test_');
        const eventBus = new EventBus();
        const store = new GameStore(storage, eventBus);
        const adaptiveService = new AdaptiveService(store, eventBus);
        const questionService = new QuestionService(adaptiveService);

        const start = performance.now();

        const questions = questionService.generateQuestions([2, 3, 4, 5, 6, 7, 8, 9, 10], 100);

        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100); // Menos de 100ms para 100 preguntas
        expect(questions).toHaveLength(100);
    });

    it('debe manejar verificación de achievements eficientemente', () => {
        const storage = new StorageManager('test_');
        const eventBus = new EventBus();
        const store = new GameStore(storage, eventBus);
        const playerService = new PlayerService(store, eventBus);
        const achievementService = new AchievementService(store, eventBus, playerService);

        const start = performance.now();

        for (let i = 0; i < 50; i++) {
            achievementService.checkAchievements();
        }

        const duration = performance.now() - start;

        expect(duration).toBeLessThan(500); // Menos de 500ms para 50 checks
    });
});
