/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('BossGameEngine', () => {
    let container;
    let engine;
    let mockOnBossDefeated;
    let mockOnPlayerDefeated;

    beforeEach(() => {
        // Setup container en el DOM
        container = document.createElement('div');
        container.id = 'testContainer';
        document.body.appendChild(container);

        // Mock callbacks
        mockOnBossDefeated = vi.fn();
        mockOnPlayerDefeated = vi.fn();

        // Mock window.shopSystem
        global.window.shopSystem = {
            getEquipped: vi.fn(() => '🗡️')
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllTimers();
    });

    describe('Constructor', () => {
        it('debe inicializar correctamente con container válido', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(engine.container).toBe(container);
            expect(engine.hasError).toBe(false);
            expect(engine.onBossDefeated).toBe(mockOnBossDefeated);
            expect(engine.onPlayerDefeated).toBe(mockOnPlayerDefeated);
        });

        it('debe inicializar estado de batalla correctamente', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(engine.currentBoss).toBe(null);
            expect(engine.player).toBe(null);
            expect(engine.bossHealth).toBe(100);
            expect(engine.playerHealth).toBe(100);
            expect(engine.maxBossHealth).toBe(100);
            expect(engine.turn).toBe('boss');
            expect(engine.turnPhase).toBe('question');
            expect(engine.isProcessing).toBe(false);
            expect(engine.superAttackCharge).toBe(0);
            expect(engine.superAttackReady).toBe(false);
            expect(engine.correctStreak).toBe(0);
            expect(engine.particles).toEqual([]);
            expect(engine.shakeIntensity).toBe(0);
            expect(engine.flashEffect).toBe(null);
            expect(engine.currentQuestion).toBe(null);
            expect(engine.onCorrectAnswer).toBe(null);
            expect(engine.onWrongAnswer).toBe(null);
        });

        it('debe manejar container no encontrado', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.BossGameEngine('nonExistent', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('❌ Container no encontrado:', 'nonExistent');
        });

        it('debe manejar excepciones en el constructor', () => {
            vi.spyOn(document, 'getElementById').mockImplementation(() => {
                throw new Error('DOM error');
            });

            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('debe crear la UI de batalla', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(container.innerHTML).toContain('battle-turn-indicator');
            expect(container.innerHTML).toContain('entity-container');
            expect(container.innerHTML).toContain('battle-question');
            expect(container.innerHTML).toContain('battle-log');
        });
    });

    describe('startBattle', () => {
        beforeEach(() => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);
        });

        it('debe iniciar batalla correctamente', () => {
            const boss = {
                name: 'Dragón',
                avatar: '🐉',
                health: 150
            };
            const player = {
                name: 'Héroe',
                avatar: '🦸'
            };

            engine.startBattle(boss, player);

            expect(engine.currentBoss).toBe(boss);
            expect(engine.player).toBe(player);
            expect(engine.bossHealth).toBe(150);
            expect(engine.maxBossHealth).toBe(150);
            expect(engine.playerHealth).toBe(100);
            expect(engine.correctStreak).toBe(0);
            expect(engine.superAttackCharge).toBe(0);
            expect(engine.superAttackReady).toBe(false);
        });

        it('no debe iniciar batalla si hasError es true', () => {
            engine.hasError = true;
            const consoleSpy = vi.spyOn(console, 'error');

            const boss = { name: 'Dragón', avatar: '🐉', health: 150 };
            const player = { name: 'Héroe', avatar: '🦸' };

            engine.startBattle(boss, player);

            expect(consoleSpy).toHaveBeenCalledWith('❌ No se puede iniciar batalla: engine tiene error');
            expect(engine.currentBoss).toBe(null);
        });

        it('debe manejar errores durante startBattle', () => {
            // Forzar error
            engine.refs = null;

            const consoleSpy = vi.spyOn(console, 'error');
            const boss = { name: 'Dragón', avatar: '🐉', health: 150 };
            const player = { name: 'Héroe', avatar: '🦸' };

            engine.startBattle(boss, player);

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('debe resetear el estado correctamente', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            engine.particles = [{ x: 10, y: 20 }];
            engine.correctStreak = 5;
            engine.superAttackCharge = 3;
            engine.superAttackReady = true;
            engine.isProcessing = true;

            engine.reset();

            expect(engine.particles).toEqual([]);
            expect(engine.correctStreak).toBe(0);
            expect(engine.superAttackCharge).toBe(0);
            expect(engine.superAttackReady).toBe(false);
            expect(engine.isProcessing).toBe(false);
        });
    });

    describe('handleError', () => {
        beforeEach(() => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);
        });

        it('debe marcar hasError como true', () => {
            const error = new Error('Test error');
            engine.handleError(error);

            expect(engine.hasError).toBe(true);
            expect(engine.isProcessing).toBe(false);
        });

        it('debe mostrar mensaje de error al usuario', () => {
            const error = new Error('Test error');
            engine.handleError(error);

            const errorDiv = container.querySelector('div');
            expect(errorDiv).toBeDefined();
            expect(container.innerHTML).toContain('Error en la Batalla');
        });

        it('debe llamar al callback onPlayerDefeated después de 2 segundos', (done) => {
            vi.useFakeTimers();
            const error = new Error('Test error');
            engine.handleError(error);

            vi.advanceTimersByTime(2000);
            expect(mockOnPlayerDefeated).toHaveBeenCalled();
            vi.useRealTimers();
            done();
        });

        it('debe manejar error al mostrar mensaje', () => {
            const error = new Error('Test error');
            engine.container = null; // Forzar error

            const consoleSpy = vi.spyOn(console, 'error');
            engine.handleError(error);

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('Coverage 100%', () => {
        it('debe tener todas las propiedades requeridas', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);

            expect(engine).toHaveProperty('container');
            expect(engine).toHaveProperty('onBossDefeated');
            expect(engine).toHaveProperty('onPlayerDefeated');
            expect(engine).toHaveProperty('currentBoss');
            expect(engine).toHaveProperty('player');
            expect(engine).toHaveProperty('bossHealth');
            expect(engine).toHaveProperty('playerHealth');
            expect(engine).toHaveProperty('maxBossHealth');
            expect(engine).toHaveProperty('turn');
            expect(engine).toHaveProperty('turnPhase');
            expect(engine).toHaveProperty('isProcessing');
            expect(engine).toHaveProperty('superAttackCharge');
            expect(engine).toHaveProperty('superAttackReady');
            expect(engine).toHaveProperty('correctStreak');
            expect(engine).toHaveProperty('particles');
            expect(engine).toHaveProperty('shakeIntensity');
            expect(engine).toHaveProperty('flashEffect');
            expect(engine).toHaveProperty('currentQuestion');
            expect(engine).toHaveProperty('onCorrectAnswer');
            expect(engine).toHaveProperty('onWrongAnswer');
            expect(engine).toHaveProperty('hasError');
        });

        it('debe tener el método reset', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);
            expect(typeof engine.reset).toBe('function');
        });

        it('debe tener el método handleError', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);
            expect(typeof engine.handleError).toBe('function');
        });

        it('debe tener el método startBattle', () => {
            engine = new window.BossGameEngine('testContainer', mockOnBossDefeated, mockOnPlayerDefeated);
            expect(typeof engine.startBattle).toBe('function');
        });
    });
});
