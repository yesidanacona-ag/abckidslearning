// ================================
// E2E TESTS: Achievements & Adaptive Learning
// Testing achievement unlocking and adaptive system
// ================================

import { test, expect } from '@playwright/test';

test.describe('Achievement System E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('debe desbloquear achievement "Primeros Pasos" (10 preguntas)', async ({ page }) => {
        await page.goto('/');

        // Setup jugador con 9 preguntas respondidas
        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Achiever',
                avatar: '🦸',
                stats: {
                    totalQuestions: 9,
                    correctAnswers: 7,
                    incorrectAnswers: 2
                },
                achievements: []
            }));
        });
        await page.reload();

        // Simular responder una pregunta más (total 10)
        const achievementUnlocked = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Simular pregunta correcta
                services.player.updateStats({
                    totalQuestions: 10,
                    correctAnswers: 8
                });

                // Verificar achievements
                services.achievement.checkAchievements();

                // Retornar achievements del jugador
                return store.getState().player.achievements;
            }
            return [];
        });

        // Verificar que se desbloqueó 'first_steps'
        expect(achievementUnlocked).toContain('first_steps');
    });

    test('debe desbloquear achievement de racha', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Streaker',
                avatar: '🦸',
                streak: 0,
                achievements: []
            }));
        });
        await page.reload();

        // Simular racha de 5
        const unlockedAchievements = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Incrementar racha 5 veces
                for (let i = 0; i < 5; i++) {
                    services.player.incrementStreak();
                }

                // Verificar achievements
                services.achievement.checkAchievements();

                return {
                    streak: store.getState().player.streak,
                    achievements: store.getState().player.achievements
                };
            }
            return { streak: 0, achievements: [] };
        });

        expect(unlockedAchievements.streak).toBe(5);
        expect(unlockedAchievements.achievements).toContain('streak_5');
    });

    test('debe desbloquear achievement de monedas', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Rich',
                avatar: '🦸',
                coins: 50,
                achievements: []
            }));
        });
        await page.reload();

        // Agregar 50 monedas más (total 100)
        const result = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                services.player.addCoins(50);
                services.achievement.checkAchievements();

                return {
                    coins: store.getState().player.coins,
                    achievements: store.getState().player.achievements
                };
            }
            return { coins: 0, achievements: [] };
        });

        expect(result.coins).toBeGreaterThanOrEqual(100);
        expect(result.achievements).toContain('coin_collector_100');
    });

    test('debe listar achievements desbloqueados y bloqueados', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Player',
                avatar: '🦸',
                achievements: ['first_steps', 'streak_5']
            }));
        });
        await page.reload();

        const achievementStats = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services } = window.bootstrap.getContext();

                return {
                    unlocked: services.achievement.getUnlockedAchievements().length,
                    locked: services.achievement.getLockedAchievements().length,
                    total: services.achievement.achievements.length,
                    stats: services.achievement.getStats()
                };
            }
            return null;
        });

        expect(achievementStats).toBeTruthy();
        expect(achievementStats.unlocked).toBe(2);
        expect(achievementStats.total).toBeGreaterThan(30); // Hay 34+ achievements
        expect(achievementStats.stats.percentage).toBeGreaterThan(0);
    });
});

test.describe('Adaptive Learning System E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('debe aumentar maestría con respuestas correctas', async ({ page }) => {
        await page.goto('/');

        const masteryProgress = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Estado inicial de tabla 7
                const initialMastery = services.adaptive.getTableMastery(7);

                // Simular 5 respuestas correctas de tabla 7
                for (let i = 0; i < 5; i++) {
                    services.adaptive.recordAnswer(7, true, 2000);
                }

                const finalMastery = services.adaptive.getTableMastery(7);

                return {
                    initial: initialMastery,
                    final: finalMastery,
                    improvement: finalMastery - initialMastery
                };
            }
            return null;
        });

        expect(masteryProgress).toBeTruthy();
        expect(masteryProgress.final).toBeGreaterThan(masteryProgress.initial);
        expect(masteryProgress.improvement).toBeGreaterThan(0);
    });

    test('debe disminuir maestría con respuestas incorrectas', async ({ page }) => {
        await page.goto('/');

        const masteryChange = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Inicializar con algo de maestría
                store.updateTableMastery(7, { mastery: 50 });

                const initialMastery = services.adaptive.getTableMastery(7);

                // Simular 3 respuestas incorrectas
                for (let i = 0; i < 3; i++) {
                    services.adaptive.recordAnswer(7, false, 5000);
                }

                const finalMastery = services.adaptive.getTableMastery(7);

                return {
                    initial: initialMastery,
                    final: finalMastery,
                    decreased: initialMastery > finalMastery
                };
            }
            return null;
        });

        expect(masteryChange).toBeTruthy();
        expect(masteryChange.decreased).toBe(true);
    });

    test('debe sugerir tablas débiles para practicar', async ({ page }) => {
        await page.goto('/');

        const suggestions = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Setup: tabla 7 con baja maestría, tabla 8 con alta maestría
                store.updateTableMastery(7, { mastery: 20 });
                store.updateTableMastery(8, { mastery: 90 });

                const suggested = services.adaptive.getSuggestedTables();

                return {
                    suggested,
                    includesWeakTable: suggested.includes(7),
                    excludesStrongTable: !suggested.includes(8) || suggested.indexOf(7) < suggested.indexOf(8)
                };
            }
            return null;
        });

        expect(suggestions).toBeTruthy();
        expect(suggestions.includesWeakTable).toBe(true);
    });

    test('debe generar preguntas adaptativas basadas en maestría', async ({ page }) => {
        await page.goto('/');

        const adaptiveQuestions = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Setup maestría desigual
                store.updateTableMastery(2, { mastery: 10 }); // Muy baja
                store.updateTableMastery(9, { mastery: 95 }); // Muy alta

                // Generar 20 preguntas adaptativas
                const questions = services.question.generateQuestions([2, 9], 20);

                // Contar distribución
                const table2Count = questions.filter(q => q.table === 2).length;
                const table9Count = questions.filter(q => q.table === 9).length;

                return {
                    total: questions.length,
                    table2: table2Count,
                    table9: table9Count,
                    favorsWeakTable: table2Count > table9Count
                };
            }
            return null;
        });

        expect(adaptiveQuestions).toBeTruthy();
        expect(adaptiveQuestions.total).toBe(20);
        // Debería generar más preguntas de la tabla débil
        expect(adaptiveQuestions.favorsWeakTable).toBe(true);
    });

    test('debe detectar tablas que necesitan revisión urgente', async ({ page }) => {
        await page.goto('/');

        const urgentReview = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Setup tabla 7 con baja maestría y última práctica hace 8+ días
                const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
                store.updateTableMastery(7, {
                    mastery: 30,
                    lastPracticed: eightDaysAgo
                });

                const needsReview = services.adaptive.needsUrgentReview(7);

                return {
                    needsReview,
                    mastery: services.adaptive.getTableMastery(7)
                };
            }
            return null;
        });

        expect(urgentReview).toBeTruthy();
        expect(urgentReview.needsReview).toBe(true);
    });

    test('debe calcular maestría global correctamente', async ({ page }) => {
        await page.goto('/');

        const globalMastery = await page.evaluate(() => {
            if (window.bootstrap) {
                const { services, store } = window.bootstrap.getContext();

                // Setup maestría conocida
                for (let i = 2; i <= 10; i++) {
                    store.updateTableMastery(i, { mastery: 50 });
                }

                const global = services.player.calculateGlobalMastery();

                return {
                    globalMastery: global,
                    expectedRange: global >= 40 && global <= 60 // Debería ser ~50
                };
            }
            return null;
        });

        expect(globalMastery).toBeTruthy();
        expect(globalMastery.globalMastery).toBeGreaterThanOrEqual(0);
        expect(globalMastery.globalMastery).toBeLessThanOrEqual(100);
        expect(globalMastery.expectedRange).toBe(true);
    });
});

test.describe('Event System Integration', () => {
    test('debe emitir y recibir eventos correctamente', async ({ page }) => {
        await page.goto('/');

        const eventFlow = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (window.bootstrap) {
                    const { eventBus, services } = window.bootstrap.getContext();

                    let eventsReceived = [];

                    // Escuchar eventos
                    eventBus.on('player:coins:added', (data) => {
                        eventsReceived.push({ event: 'coins:added', data });
                    });

                    eventBus.on('player:streak:increased', (data) => {
                        eventsReceived.push({ event: 'streak:increased', data });
                    });

                    // Disparar acciones
                    services.player.addCoins(25);
                    services.player.incrementStreak();

                    // Dar tiempo para que se procesen eventos
                    setTimeout(() => {
                        resolve({
                            eventsReceived: eventsReceived.length,
                            events: eventsReceived.map(e => e.event)
                        });
                    }, 100);
                } else {
                    resolve({ eventsReceived: 0, events: [] });
                }
            });
        });

        expect(eventFlow.eventsReceived).toBeGreaterThan(0);
        expect(eventFlow.events).toContain('coins:added');
    });

    test('debe mantener historial de eventos', async ({ page }) => {
        await page.goto('/');

        const history = await page.evaluate(() => {
            if (window.bootstrap) {
                const { eventBus, services } = window.bootstrap.getContext();

                // Disparar varios eventos
                services.player.addCoins(10);
                services.player.addCoins(20);
                services.player.incrementStreak();

                // Obtener historial
                const fullHistory = eventBus.getHistory();
                const coinsHistory = eventBus.getHistory('player:coins:added');

                return {
                    totalEvents: fullHistory.length,
                    coinsEvents: coinsHistory.length
                };
            }
            return null;
        });

        expect(history).toBeTruthy();
        expect(history.totalEvents).toBeGreaterThan(0);
        expect(history.coinsEvents).toBeGreaterThanOrEqual(2);
    });
});
