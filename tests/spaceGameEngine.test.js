/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SpaceGameEngine', () => {
    let canvas;
    let engine;
    let mockOnCorrectAnswer;
    let mockOnWrongAnswer;
    let mockOnGameOver;

    beforeEach(() => {
        // Setup canvas en el DOM
        canvas = document.createElement('canvas');
        canvas.id = 'testCanvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);

        // Mock callbacks
        mockOnCorrectAnswer = vi.fn();
        mockOnWrongAnswer = vi.fn();
        mockOnGameOver = vi.fn();

        // Mock window.soundSystem
        global.window.soundSystem = {
            playClick: vi.fn(),
            playCorrect: vi.fn(),
            playWrong: vi.fn(),
            playExplosion: vi.fn()
        };

        // Mock window.shopSystem
        global.window.shopSystem = {
            getEquipped: vi.fn(() => '🚀')
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Constructor', () => {
        it('debe inicializar correctamente con canvas válido', () => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.canvas).toBe(canvas);
            expect(engine.ctx).toBeDefined();
            expect(engine.hasError).toBe(false);
            expect(engine.width).toBe(800);
            expect(engine.height).toBe(600);
            expect(engine.onCorrectAnswer).toBe(mockOnCorrectAnswer);
            expect(engine.onWrongAnswer).toBe(mockOnWrongAnswer);
            expect(engine.onGameOver).toBe(mockOnGameOver);
        });

        it('debe manejar canvas no encontrado', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.SpaceGameEngine('nonExistentCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('❌ Canvas no encontrado:', 'nonExistentCanvas');
        });

        it('debe manejar contexto 2D no disponible', () => {
            const mockCanvas = {
                getContext: vi.fn(() => null)
            };
            vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas);

            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('❌ No se pudo obtener contexto 2D del canvas');
        });

        it('debe manejar excepciones en el constructor', () => {
            vi.spyOn(document, 'getElementById').mockImplementation(() => {
                throw new Error('DOM error');
            });

            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('init', () => {
        beforeEach(() => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);
        });

        it('debe inicializar el estado del juego correctamente', () => {
            engine.init();

            expect(engine.lives).toBe(3);
            expect(engine.score).toBe(0);
            expect(engine.questionsAnswered).toBe(0);
            expect(engine.isRunning).toBe(true);
            expect(engine.isPaused).toBe(false);
            expect(engine.asteroids).toEqual([]);
            expect(engine.powerups).toEqual([]);
            expect(engine.particles).toEqual([]);
            expect(engine.lasers).toEqual([]);
        });

        it('debe crear la nave del jugador', () => {
            engine.init();

            expect(engine.ship).toBeDefined();
            expect(engine.ship.x).toBe(400); // width/2
            expect(engine.ship.y).toBe(500); // height - 100
            expect(engine.ship.icon).toBe('🚀');
        });
    });

    describe('render', () => {
        beforeEach(() => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);
            engine.init();
        });

        it('debe renderizar sin errores', () => {
            expect(() => engine.render()).not.toThrow();
        });

        it('no debe renderizar si hasError es true', () => {
            engine.hasError = true;
            const consoleSpy = vi.spyOn(console, 'warn');

            engine.render();

            expect(consoleSpy).toHaveBeenCalledWith('⚠️ No se puede renderizar: contexto no disponible');
        });

        it('no debe renderizar si ctx es null', () => {
            engine.ctx = null;
            const consoleSpy = vi.spyOn(console, 'warn');

            engine.render();

            expect(consoleSpy).toHaveBeenCalledWith('⚠️ No se puede renderizar: contexto no disponible');
        });

        it('debe manejar errores durante renderizado', () => {
            // Forzar error en fillRect
            vi.spyOn(engine.ctx, 'fillRect').mockImplementation(() => {
                throw new Error('Canvas rendering error');
            });

            const consoleSpy = vi.spyOn(console, 'error');
            engine.render();

            expect(consoleSpy).toHaveBeenCalled();
            expect(engine.hasError).toBe(true);
            expect(engine.isRunning).toBe(false);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);
            engine.init();
        });

        it('debe actualizar el estado del juego', () => {
            expect(() => engine.update()).not.toThrow();
        });

        it('no debe actualizar si ship es null', () => {
            engine.ship = null;
            expect(() => engine.update()).not.toThrow();
        });
    });

    describe('pause/resume/stop', () => {
        beforeEach(() => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);
            engine.init();
        });

        it('debe pausar el juego', () => {
            engine.pause();
            expect(engine.isPaused).toBe(true);
        });

        it('debe reanudar el juego', () => {
            engine.pause();
            engine.resume();
            expect(engine.isPaused).toBe(false);
        });

        it('debe detener el juego', () => {
            engine.stop();
            expect(engine.isRunning).toBe(false);
        });
    });

    describe('handleRenderError', () => {
        beforeEach(() => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);
        });

        it('debe marcar hasError como true', () => {
            const error = new Error('Test error');
            engine.handleRenderError(error);

            expect(engine.hasError).toBe(true);
            expect(engine.isRunning).toBe(false);
        });

        it('debe llamar al callback onGameOver', () => {
            const error = new Error('Test error');
            engine.handleRenderError(error);

            expect(mockOnGameOver).toHaveBeenCalled();
        });

        it('debe mostrar mensaje de error en canvas', () => {
            const error = new Error('Test error');
            const fillTextSpy = vi.spyOn(engine.ctx, 'fillText');

            engine.handleRenderError(error);

            expect(fillTextSpy).toHaveBeenCalled();
        });

        it('debe manejar error al mostrar mensaje de error', () => {
            const error = new Error('Test error');
            vi.spyOn(engine.ctx, 'fillText').mockImplementation(() => {
                throw new Error('Another error');
            });

            const consoleSpy = vi.spyOn(console, 'error');
            engine.handleRenderError(error);

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('Coverage 100%', () => {
        it('debe tener todas las propiedades inicializadas', () => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.isRunning).toBe(false);
            expect(engine.isPaused).toBe(false);
            expect(engine.level).toBe(1);
            expect(engine.lives).toBe(3);
            expect(engine.score).toBe(0);
            expect(engine.questionsAnswered).toBe(0);
            expect(engine.currentQuestion).toBe(null);
            expect(engine.asteroids).toEqual([]);
            expect(engine.powerups).toEqual([]);
            expect(engine.particles).toEqual([]);
            expect(engine.lasers).toEqual([]);
            expect(engine.config).toBeDefined();
            expect(engine.input).toBeDefined();
        });

        it('debe tener config con valores correctos', () => {
            engine = new window.SpaceGameEngine('testCanvas', mockOnCorrectAnswer, mockOnWrongAnswer, mockOnGameOver);

            expect(engine.config.shipSpeed).toBe(5);
            expect(engine.config.asteroidSpeed).toBe(2);
            expect(engine.config.laserSpeed).toBe(10);
            expect(engine.config.particleLifetime).toBe(60);
            expect(engine.config.powerupChance).toBe(0.15);
            expect(engine.config.difficultyScale).toBe(1.2);
        });
    });
});
