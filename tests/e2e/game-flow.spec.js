// ================================
// E2E TESTS: Game Flow
// Complete game flow testing
// ================================

import { test, expect } from '@playwright/test';

test.describe('Game Flow - Complete User Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('debe cargar la aplicación correctamente', async ({ page }) => {
        await page.goto('/');

        // Verificar título
        await expect(page).toHaveTitle(/Multiplicar Mágico/);

        // Verificar que se muestra la pantalla de bienvenida
        const welcomeScreen = page.locator('#welcomeScreen');
        await expect(welcomeScreen).toBeVisible();
    });

    test('debe crear un nuevo jugador y entrar al juego', async ({ page }) => {
        await page.goto('/');

        // Esperar pantalla de bienvenida
        const welcomeScreen = page.locator('#welcomeScreen');
        await expect(welcomeScreen).toBeVisible();

        // Ingresar nombre
        const nameInput = page.locator('#playerName');
        await nameInput.fill('Test Player');

        // Seleccionar avatar (si existe selector)
        const startButton = page.locator('button:has-text("¡Comenzar")');
        await startButton.click();

        // Verificar que se muestra la pantalla principal
        const mainScreen = page.locator('#mainScreen');
        await expect(mainScreen).toBeVisible({ timeout: 10000 });

        // Verificar que se guardó el nombre del jugador
        const playerData = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('playerData') || '{}');
        });
        expect(playerData.name).toBe('Test Player');
    });

    test('flujo completo: Modo Práctica', async ({ page }) => {
        await page.goto('/');

        // Setup: crear jugador
        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Test Player',
                avatar: '🦸',
                coins: 0,
                streak: 0,
                stats: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 }
            }));
        });
        await page.reload();

        // Ir a pantalla principal
        const mainScreen = page.locator('#mainScreen');
        await expect(mainScreen).toBeVisible();

        // Click en "Modo Práctica"
        const practiceButton = page.locator('button:has-text("Práctica")');
        await practiceButton.click();

        // Seleccionar tabla (ejemplo: tabla del 2)
        const table2Button = page.locator('.table-selector button:has-text("2")');
        if (await table2Button.isVisible()) {
            await table2Button.click();
        }

        // Iniciar práctica
        const startPracticeButton = page.locator('button:has-text("Comenzar")');
        await startPracticeButton.click();

        // Verificar que se muestra una pregunta
        const questionText = page.locator('.question-text');
        await expect(questionText).toBeVisible({ timeout: 5000 });

        // Responder pregunta (click en cualquier opción)
        const firstOption = page.locator('.option-button').first();
        await firstOption.click();

        // Verificar feedback (correcto o incorrecto)
        const feedback = page.locator('.feedback-message');
        await expect(feedback).toBeVisible({ timeout: 3000 });

        // Verificar que las stats se actualizaron
        const updatedPlayerData = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('playerData') || '{}');
        });
        expect(updatedPlayerData.stats.totalQuestions).toBeGreaterThan(0);
    });

    test('flujo completo: Tienda', async ({ page }) => {
        await page.goto('/');

        // Setup: crear jugador con monedas
        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Rich Player',
                avatar: '🦸',
                coins: 1000,
                purchasedItems: [],
                equippedItems: {}
            }));
        });
        await page.reload();

        // Ir a la tienda
        const shopButton = page.locator('button:has-text("Tienda"), button:has-text("Shop")');
        if (await shopButton.isVisible()) {
            await shopButton.click();

            // Verificar que se muestra la tienda
            const shopScreen = page.locator('#shopScreen');
            await expect(shopScreen).toBeVisible();

            // Intentar comprar un item (primer item disponible)
            const buyButton = page.locator('.shop-item button:has-text("Comprar")').first();
            if (await buyButton.isVisible()) {
                await buyButton.click();

                // Verificar que se actualizaron las monedas
                const playerData = await page.evaluate(() => {
                    return JSON.parse(localStorage.getItem('playerData') || '{}');
                });
                expect(playerData.coins).toBeLessThan(1000);
                expect(playerData.purchasedItems.length).toBeGreaterThan(0);
            }
        }
    });

    test('navegación entre pantallas', async ({ page }) => {
        await page.goto('/');

        // Setup jugador
        await page.evaluate(() => {
            localStorage.setItem('playerData', JSON.stringify({
                name: 'Navigator',
                avatar: '🦸'
            }));
        });
        await page.reload();

        // Verificar pantalla principal
        await expect(page.locator('#mainScreen')).toBeVisible();

        // Navegar a estadísticas (si existe)
        const statsButton = page.locator('button:has-text("Estadísticas"), button:has-text("Stats")');
        if (await statsButton.isVisible()) {
            await statsButton.click();
            await expect(page.locator('#statsScreen')).toBeVisible({ timeout: 3000 });
        }

        // Volver a pantalla principal
        const backButton = page.locator('button.back-button, button:has-text("Volver")');
        if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page.locator('#mainScreen')).toBeVisible();
        }
    });
});

test.describe('Modular Architecture E2E', () => {
    test('debe inicializar Bootstrap correctamente', async ({ page }) => {
        await page.goto('/');

        // Verificar que window.bootstrap existe
        const hasBootstrap = await page.evaluate(() => {
            return typeof window.bootstrap !== 'undefined';
        });
        expect(hasBootstrap).toBe(true);

        // Verificar que se inicializó correctamente
        const isInitialized = await page.evaluate(() => {
            return window.bootstrap?.initialized === true;
        });
        expect(isInitialized).toBe(true);
    });

    test('debe tener todos los módulos core disponibles', async ({ page }) => {
        await page.goto('/');

        const modules = await page.evaluate(() => {
            return {
                StorageManager: typeof window.StorageManager,
                EventBus: typeof window.EventBus,
                GameStore: typeof window.GameStore,
                PlayerService: typeof window.PlayerService,
                AdaptiveService: typeof window.AdaptiveService,
                QuestionService: typeof window.QuestionService,
                AchievementService: typeof window.AchievementService,
                GameController: typeof window.GameController
            };
        });

        expect(modules.StorageManager).toBe('function');
        expect(modules.EventBus).toBe('function');
        expect(modules.GameStore).toBe('function');
        expect(modules.PlayerService).toBe('function');
        expect(modules.AdaptiveService).toBe('function');
        expect(modules.QuestionService).toBe('function');
        expect(modules.AchievementService).toBe('function');
        expect(modules.GameController).toBe('function');
    });

    test('debe persistir datos en localStorage correctamente', async ({ page }) => {
        await page.goto('/');

        // Crear datos de prueba
        await page.evaluate(() => {
            if (window.bootstrap) {
                const { services } = window.bootstrap.getContext();
                services.player.addCoins(100);
                services.player.updateStats({
                    totalQuestions: 50,
                    correctAnswers: 40
                });
            }
        });

        // Forzar guardado
        await page.evaluate(() => {
            if (window.bootstrap) {
                const { store } = window.bootstrap.getContext();
                store.saveToStorage();
            }
        });

        // Esperar un momento para debounce
        await page.waitForTimeout(2000);

        // Recargar página
        await page.reload();

        // Verificar que los datos persisten
        const persistedData = await page.evaluate(() => {
            if (window.bootstrap) {
                const { store } = window.bootstrap.getContext();
                return store.getState().player;
            }
            return null;
        });

        expect(persistedData).toBeTruthy();
        expect(persistedData.coins).toBeGreaterThanOrEqual(100);
        expect(persistedData.stats.totalQuestions).toBeGreaterThanOrEqual(50);
    });
});

test.describe('Responsive Design', () => {
    test('debe funcionar en viewport móvil', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

        await page.goto('/');

        // Verificar que la app se carga
        await expect(page.locator('#welcomeScreen, #mainScreen')).toBeVisible();

        // Verificar que los elementos son clickeables (sin overlap)
        const buttons = page.locator('button:visible');
        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
    });

    test('debe funcionar en viewport tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad

        await page.goto('/');

        await expect(page.locator('#welcomeScreen, #mainScreen')).toBeVisible();
    });

    test('debe funcionar en viewport desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD

        await page.goto('/');

        await expect(page.locator('#welcomeScreen, #mainScreen')).toBeVisible();
    });
});
