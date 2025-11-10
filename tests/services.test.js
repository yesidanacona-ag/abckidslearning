// ================================
// TESTS: Services Layer
// PlayerService, AchievementService, QuestionService, AdaptiveService
// ================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Importar módulos
import '../src/core/StorageManager.js';
import '../src/core/EventBus.js';
import '../src/core/GameStore.js';
import '../src/services/PlayerService.js';
import '../src/services/AdaptiveService.js';
import '../src/services/QuestionService.js';
import '../src/services/AchievementService.js';

const { StorageManager, EventBus, GameStore, PlayerService, AdaptiveService, QuestionService, AchievementService } = window;

// ================================
// PlayerService Tests
// ================================

describe('PlayerService', () => {
    let storage, eventBus, store, playerService;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
        playerService = new PlayerService(store, eventBus);
    });

    describe('createNewPlayer', () => {
        it('debe crear jugador con valores iniciales correctos', () => {
            const player = playerService.createNewPlayer('Juan', '🦸');

            expect(player.name).toBe('Juan');
            expect(player.avatar).toBe('🦸');
            expect(player.coins).toBe(0);
            expect(player.streak).toBe(0);
            expect(player.achievements).toEqual([]);
            expect(player.stats.totalQuestions).toBe(0);
        });

        it('debe usar avatar por defecto si no se proporciona', () => {
            const player = playerService.createNewPlayer('Ana');
            expect(player.avatar).toBe('🦸');
        });
    });

    describe('addCoins', () => {
        it('debe agregar monedas correctamente', () => {
            const initialCoins = store.getState().player.coins;
            playerService.addCoins(50);
            expect(store.getState().player.coins).toBe(initialCoins + 50);
        });

        it('debe emitir evento player:coins:added', (done) => {
            eventBus.once('player:coins:added', (data) => {
                expect(data.amount).toBe(25);
                done();
            });
            playerService.addCoins(25);
        });

        it('no debe agregar monedas si amount es 0 o negativo', () => {
            const initialCoins = store.getState().player.coins;
            playerService.addCoins(0);
            playerService.addCoins(-10);
            expect(store.getState().player.coins).toBe(initialCoins);
        });
    });

    describe('spendCoins', () => {
        beforeEach(() => {
            store.addCoins(100);
        });

        it('debe gastar monedas si hay suficientes', () => {
            const result = playerService.spendCoins(30);
            expect(result).toBe(true);
            expect(store.getState().player.coins).toBe(70);
        });

        it('no debe gastar si no hay suficientes monedas', () => {
            const result = playerService.spendCoins(150);
            expect(result).toBe(false);
            expect(store.getState().player.coins).toBe(100);
        });
    });

    describe('incrementStreak', () => {
        it('debe incrementar racha', () => {
            playerService.incrementStreak();
            playerService.incrementStreak();
            expect(store.getState().player.streak).toBe(2);
        });

        it('debe actualizar bestStreak si supera el actual', () => {
            playerService.incrementStreak();
            playerService.incrementStreak();
            playerService.incrementStreak();
            expect(store.getState().player.bestStreak).toBe(3);
        });
    });

    describe('resetStreak', () => {
        it('debe resetear racha a 0', () => {
            playerService.incrementStreak();
            playerService.incrementStreak();
            playerService.resetStreak();
            expect(store.getState().player.streak).toBe(0);
        });
    });

    describe('purchaseItem', () => {
        beforeEach(() => {
            store.addCoins(200);
        });

        it('debe comprar item si hay suficientes monedas', () => {
            const result = playerService.purchaseItem('rocket', 100);
            expect(result).toBe(true);
            expect(store.getState().player.coins).toBe(100);
            expect(store.getState().player.purchasedItems).toContain('rocket');
        });

        it('no debe comprar si no hay monedas', () => {
            const result = playerService.purchaseItem('expensive', 300);
            expect(result).toBe(false);
            expect(store.getState().player.purchasedItems).not.toContain('expensive');
        });

        it('no debe comprar item ya comprado', () => {
            playerService.purchaseItem('rocket', 100);
            const result = playerService.purchaseItem('rocket', 100);
            expect(result).toBe(false);
            expect(store.getState().player.coins).toBe(100); // No se gastan más monedas
        });

        it('debe emitir evento player:item:purchased', (done) => {
            eventBus.once('player:item:purchased', (data) => {
                expect(data.itemId).toBe('sword');
                expect(data.price).toBe(50);
                done();
            });
            playerService.purchaseItem('sword', 50);
        });
    });

    describe('equipItem', () => {
        beforeEach(() => {
            store.addCoins(200);
            playerService.purchaseItem('rocket', 100);
        });

        it('debe equipar item comprado', () => {
            const result = playerService.equipItem('ships', 'rocket');
            expect(result).toBe(true);
            expect(store.getState().player.equippedItems.ships).toBe('rocket');
        });

        it('debe permitir equipar items default sin comprar', () => {
            const result = playerService.equipItem('avatars', '🦸');
            expect(result).toBe(true);
        });

        it('no debe equipar item no comprado', () => {
            const result = playerService.equipItem('weapons', 'laser');
            expect(result).toBe(false);
        });
    });

    describe('calculateGlobalMastery', () => {
        it('debe retornar 0 si no hay datos', () => {
            const mastery = playerService.calculateGlobalMastery();
            expect(mastery).toBe(0);
        });

        it('debe calcular promedio correctamente', () => {
            store.updateTableMastery(2, { mastery: 50 });
            store.updateTableMastery(3, { mastery: 70 });
            store.updateTableMastery(4, { mastery: 80 });

            const mastery = playerService.calculateGlobalMastery();
            expect(mastery).toBeGreaterThan(0);
            expect(mastery).toBeLessThanOrEqual(100);
        });
    });

    describe('event listeners', () => {
        it('debe responder a game:answer:correct', () => {
            const initialQuestions = store.getState().player.stats.totalQuestions;

            eventBus.emit('game:answer:correct', {
                question: { table: 7, multiplier: 8, answer: 56 },
                responseTime: 2000
            });

            expect(store.getState().player.stats.totalQuestions).toBe(initialQuestions + 1);
            expect(store.getState().player.stats.correctAnswers).toBeGreaterThan(0);
        });

        it('debe responder a game:answer:wrong', () => {
            const initialIncorrect = store.getState().player.stats.incorrectAnswers;

            eventBus.emit('game:answer:wrong', {
                question: { table: 7, multiplier: 8, answer: 56 }
            });

            expect(store.getState().player.stats.incorrectAnswers).toBe(initialIncorrect + 1);
        });
    });
});

// ================================
// AdaptiveService Tests
// ================================

describe('AdaptiveService', () => {
    let storage, eventBus, store, adaptiveService;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
        adaptiveService = new AdaptiveService(store, eventBus);
    });

    describe('initTableMastery', () => {
        it('debe inicializar tablas 2-10', () => {
            const tableMastery = store.getState().tableMastery;
            expect(Object.keys(tableMastery).length).toBeGreaterThan(0);
        });
    });

    describe('recordAnswer', () => {
        it('debe incrementar maestría con respuesta correcta', () => {
            const initialMastery = adaptiveService.getTableMastery(7);
            adaptiveService.recordAnswer(7, true, 2000);
            const newMastery = adaptiveService.getTableMastery(7);
            expect(newMastery).toBeGreaterThan(initialMastery);
        });

        it('debe decrementar maestría con respuesta incorrecta', () => {
            // Primero incrementar para tener algo que decrementar
            adaptiveService.recordAnswer(7, true);
            const midMastery = adaptiveService.getTableMastery(7);

            adaptiveService.recordAnswer(7, false);
            const finalMastery = adaptiveService.getTableMastery(7);

            expect(finalMastery).toBeLessThan(midMastery);
        });

        it('debe dar bonus por velocidad', () => {
            adaptiveService.recordAnswer(7, true, 2000); // Lento
            const slowMastery = adaptiveService.getTableMastery(7);

            store.updateTableMastery(8, { mastery: 0, attempts: 0, correct: 0 });
            adaptiveService.recordAnswer(8, true, 1000); // Rápido
            const fastMastery = adaptiveService.getTableMastery(8);

            expect(fastMastery).toBeGreaterThan(slowMastery);
        });

        it('debe mantener maestría entre 0-100', () => {
            // Muchos errores
            for (let i = 0; i < 20; i++) {
                adaptiveService.recordAnswer(7, false);
            }
            expect(adaptiveService.getTableMastery(7)).toBeGreaterThanOrEqual(0);

            // Muchos aciertos
            for (let i = 0; i < 50; i++) {
                adaptiveService.recordAnswer(8, true, 1000);
            }
            expect(adaptiveService.getTableMastery(8)).toBeLessThanOrEqual(100);
        });
    });

    describe('getSuggestedTables', () => {
        it('debe sugerir tablas con baja maestría', () => {
            store.updateTableMastery(2, { mastery: 10 });
            store.updateTableMastery(3, { mastery: 90 });
            store.updateTableMastery(4, { mastery: 15 });

            const suggested = adaptiveService.getSuggestedTables(2);
            expect(suggested).toContain(2);
            expect(suggested).toContain(4);
            expect(suggested).not.toContain(3);
        });

        it('debe sugerir tablas no practicadas recientemente', () => {
            const now = Date.now();
            store.updateTableMastery(2, { mastery: 50, lastPracticed: now - 8 * 24 * 60 * 60 * 1000 }); // 8 días
            store.updateTableMastery(3, { mastery: 50, lastPracticed: now }); // Hoy

            const suggested = adaptiveService.getSuggestedTables(3);
            expect(suggested.indexOf(2)).toBeLessThan(suggested.indexOf(3));
        });
    });

    describe('getTableWeights', () => {
        it('debe dar más peso a tablas con menos maestría', () => {
            store.updateTableMastery(2, { mastery: 10 });
            store.updateTableMastery(3, { mastery: 90 });

            const weights = adaptiveService.getTableWeights([2, 3]);
            expect(weights[0]).toBeGreaterThan(weights[1]);
        });

        it('debe dar peso mínimo de 0.1', () => {
            store.updateTableMastery(2, { mastery: 100 });
            const weights = adaptiveService.getTableWeights([2]);
            expect(weights[0]).toBeGreaterThanOrEqual(0.1);
        });
    });

    describe('needsUrgentReview', () => {
        it('debe marcar tabla nunca practicada como urgente', () => {
            const needs = adaptiveService.needsUrgentReview(7);
            expect(needs).toBe(true);
        });

        it('debe marcar tabla con maestría baja como urgente', () => {
            store.updateTableMastery(7, { mastery: 20 });
            const needs = adaptiveService.needsUrgentReview(7);
            expect(needs).toBe(true);
        });

        it('no debe marcar tabla bien practicada como urgente', () => {
            store.updateTableMastery(7, { mastery: 80, lastPracticed: Date.now() });
            const needs = adaptiveService.needsUrgentReview(7);
            expect(needs).toBe(false);
        });
    });

    describe('getStats', () => {
        it('debe calcular estadísticas correctas', () => {
            store.updateTableMastery(2, { mastery: 50, attempts: 10, correct: 7 });
            store.updateTableMastery(3, { mastery: 95, attempts: 20, correct: 19 });

            const stats = adaptiveService.getStats();
            expect(stats).toHaveProperty('averageMastery');
            expect(stats).toHaveProperty('globalAccuracy');
            expect(stats).toHaveProperty('masteredTables');
            expect(stats.masteredTables).toBeGreaterThanOrEqual(0);
        });
    });
});

// ================================
// QuestionService Tests
// ================================

describe('QuestionService', () => {
    let storage, eventBus, store, adaptiveService, questionService;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
        adaptiveService = new AdaptiveService(store, eventBus);
        questionService = new QuestionService(adaptiveService);
    });

    describe('generateQuestion', () => {
        it('debe generar pregunta con estructura correcta', () => {
            const question = questionService.generateQuestion(7, 0.5);

            expect(question).toHaveProperty('table');
            expect(question).toHaveProperty('multiplier');
            expect(question).toHaveProperty('answer');
            expect(question).toHaveProperty('difficulty');
            expect(question.table).toBe(7);
            expect(question.answer).toBe(question.table * question.multiplier);
        });

        it('debe respetar nivel de dificultad', () => {
            // Dificultad baja = multiplicadores bajos
            const easyQ = questionService.generateQuestion(7, 0.1);
            expect(easyQ.multiplier).toBeLessThanOrEqual(5);

            // Dificultad alta = multiplicadores variados
            const hardQ = questionService.generateQuestion(7, 0.9);
            expect(hardQ.multiplier).toBeGreaterThanOrEqual(1);
            expect(hardQ.multiplier).toBeLessThanOrEqual(10);
        });
    });

    describe('generateQuestions', () => {
        it('debe generar cantidad correcta de preguntas', () => {
            const questions = questionService.generateQuestions([2, 3, 4], 10);
            expect(questions).toHaveLength(10);
        });

        it('debe usar tablas proporcionadas', () => {
            const questions = questionService.generateQuestions([7, 8], 10);
            questions.forEach(q => {
                expect([7, 8]).toContain(q.table);
            });
        });

        it('debe funcionar sin adaptiveService', () => {
            const questionServiceNoAdaptive = new QuestionService(null);
            const questions = questionServiceNoAdaptive.generateQuestions([2, 3], 5);
            expect(questions).toHaveLength(5);
        });
    });

    describe('generateOptions', () => {
        it('debe generar cantidad correcta de opciones', () => {
            const question = { table: 7, multiplier: 8, answer: 56 };
            const options = questionService.generateOptions(question, 4);
            expect(options).toHaveLength(4);
        });

        it('debe incluir respuesta correcta', () => {
            const question = { table: 7, multiplier: 8, answer: 56 };
            const options = questionService.generateOptions(question);
            expect(options).toContain(56);
        });

        it('debe generar opciones únicas', () => {
            const question = { table: 7, multiplier: 8, answer: 56 };
            const options = questionService.generateOptions(question);
            const unique = new Set(options);
            expect(unique.size).toBe(options.length);
        });

        it('no debe generar opciones negativas o muy grandes', () => {
            const question = { table: 2, multiplier: 2, answer: 4 };
            const options = questionService.generateOptions(question);
            options.forEach(opt => {
                expect(opt).toBeGreaterThan(0);
                expect(opt).toBeLessThanOrEqual(200);
            });
        });
    });

    describe('validateAnswer', () => {
        it('debe validar respuesta correcta', () => {
            const question = { table: 7, multiplier: 8, answer: 56 };
            expect(questionService.validateAnswer(question, 56)).toBe(true);
        });

        it('debe rechazar respuesta incorrecta', () => {
            const question = { table: 7, multiplier: 8, answer: 56 };
            expect(questionService.validateAnswer(question, 55)).toBe(false);
        });
    });

    describe('calculatePoints', () => {
        it('debe retornar 0 para respuesta incorrecta', () => {
            const question = { table: 7, multiplier: 8, answer: 56, difficulty: 0.5 };
            const points = questionService.calculatePoints(question, false, 2000);
            expect(points).toBe(0);
        });

        it('debe dar puntos base para respuesta correcta', () => {
            const question = { table: 7, multiplier: 8, answer: 56, difficulty: 0.5 };
            const points = questionService.calculatePoints(question, true, 3000);
            expect(points).toBeGreaterThanOrEqual(10);
        });

        it('debe dar bonus por dificultad', () => {
            const easyQ = { table: 2, multiplier: 2, answer: 4, difficulty: 0.1 };
            const hardQ = { table: 9, multiplier: 9, answer: 81, difficulty: 0.9 };

            const easyPoints = questionService.calculatePoints(easyQ, true, 3000);
            const hardPoints = questionService.calculatePoints(hardQ, true, 3000);

            expect(hardPoints).toBeGreaterThan(easyPoints);
        });

        it('debe dar bonus por velocidad', () => {
            const question = { table: 7, multiplier: 8, answer: 56, difficulty: 0.5 };
            const slowPoints = questionService.calculatePoints(question, true, 4000);
            const fastPoints = questionService.calculatePoints(question, true, 1000);

            expect(fastPoints).toBeGreaterThan(slowPoints);
        });
    });

    describe('modos especiales', () => {
        it('generateChallengeQuestion debe funcionar', () => {
            const question = questionService.generateChallengeQuestion([7, 8, 9]);
            expect(question).toHaveProperty('table');
            expect([7, 8, 9]).toContain(question.table);
        });

        it('generateBossQuestion debe incrementar dificultad por nivel', () => {
            const boss1 = questionService.generateBossQuestion(1);
            const boss5 = questionService.generateBossQuestion(5);

            expect(boss5.table).toBeGreaterThanOrEqual(boss1.table);
        });

        it('generateProgressiveSequence debe crear secuencia correcta', () => {
            const questions = questionService.generateProgressiveSequence(2, 4, 3);
            expect(questions).toHaveLength(9); // 3 tablas × 3 preguntas
            expect(questions[0].table).toBe(2);
            expect(questions[8].table).toBe(4);
        });
    });
});

// ================================
// AchievementService Tests
// ================================

describe('AchievementService', () => {
    let storage, eventBus, store, playerService, achievementService;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
        playerService = new PlayerService(store, eventBus);
        achievementService = new AchievementService(store, eventBus, playerService);
    });

    describe('defineAchievements', () => {
        it('debe tener 34+ achievements definidos', () => {
            expect(achievementService.achievements.length).toBeGreaterThanOrEqual(34);
        });

        it('todos los achievements deben tener estructura correcta', () => {
            achievementService.achievements.forEach(achievement => {
                expect(achievement).toHaveProperty('id');
                expect(achievement).toHaveProperty('name');
                expect(achievement).toHaveProperty('desc');
                expect(achievement).toHaveProperty('icon');
                expect(achievement).toHaveProperty('check');
                expect(typeof achievement.check).toBe('function');
            });
        });

        it('todos los ids deben ser únicos', () => {
            const ids = achievementService.achievements.map(a => a.id);
            const unique = new Set(ids);
            expect(unique.size).toBe(ids.length);
        });
    });

    describe('unlockAchievement', () => {
        it('debe desbloquear achievement correctamente', () => {
            const result = achievementService.unlockAchievement('first_steps');
            expect(result).toBe(true);
            expect(store.getState().player.achievements).toContain('first_steps');
        });

        it('no debe desbloquear achievement ya desbloqueado', () => {
            achievementService.unlockAchievement('first_steps');
            const result = achievementService.unlockAchievement('first_steps');
            expect(result).toBe(false);
        });

        it('debe emitir evento cuando se desbloquea', (done) => {
            eventBus.once('player:achievement:unlocked', (data) => {
                expect(data.achievementId).toBe('first_steps');
                done();
            });
            achievementService.unlockAchievement('first_steps');
        });
    });

    describe('checkAchievements', () => {
        it('debe verificar y desbloquear achievements automáticamente', () => {
            // Simular 10 preguntas respondidas
            store.updateStats({ totalQuestions: 10 });

            const unlocked = achievementService.checkAchievements();
            expect(unlocked).toBeGreaterThan(0);
            expect(store.getState().player.achievements).toContain('first_steps');
        });

        it('no debe desbloquear achievements ya desbloqueados', () => {
            store.updateStats({ totalQuestions: 10 });
            achievementService.checkAchievements();

            const unlocked = achievementService.checkAchievements();
            expect(unlocked).toBe(0);
        });
    });

    describe('getAchievementById', () => {
        it('debe encontrar achievement por id', () => {
            const achievement = achievementService.getAchievementById('first_steps');
            expect(achievement).toBeDefined();
            expect(achievement.id).toBe('first_steps');
        });

        it('debe retornar null si no existe', () => {
            const achievement = achievementService.getAchievementById('nonexistent');
            expect(achievement).toBeNull();
        });
    });

    describe('getUnlockedAchievements', () => {
        it('debe retornar lista de achievements desbloqueados', () => {
            achievementService.unlockAchievement('first_steps');
            achievementService.unlockAchievement('streak_5');

            const unlocked = achievementService.getUnlockedAchievements();
            expect(unlocked).toHaveLength(2);
            expect(unlocked.some(a => a.id === 'first_steps')).toBe(true);
        });
    });

    describe('getLockedAchievements', () => {
        it('debe retornar achievements bloqueados', () => {
            achievementService.unlockAchievement('first_steps');

            const locked = achievementService.getLockedAchievements();
            expect(locked.length).toBe(achievementService.achievements.length - 1);
            expect(locked.every(a => a.id !== 'first_steps')).toBe(true);
        });
    });

    describe('getStats', () => {
        it('debe calcular estadísticas correctamente', () => {
            achievementService.unlockAchievement('first_steps');
            achievementService.unlockAchievement('streak_5');

            const stats = achievementService.getStats();
            expect(stats.unlocked).toBe(2);
            expect(stats.total).toBe(achievementService.achievements.length);
            expect(stats.percentage).toBeGreaterThan(0);
            expect(stats.locked).toBe(stats.total - 2);
        });
    });

    describe('event listeners', () => {
        it('debe verificar achievements en cada respuesta correcta', (done) => {
            store.updateStats({ totalQuestions: 9 });

            // La siguiente respuesta debería desbloquear 'first_steps'
            eventBus.emit('game:answer:correct', {});

            setTimeout(() => {
                const achievements = store.getState().player.achievements;
                expect(achievements).toContain('first_steps');
                done();
            }, 100);
        });
    });
});
