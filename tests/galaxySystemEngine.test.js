/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GalaxySystemEngine', () => {
    let canvas;
    let engine;

    beforeEach(() => {
        // Setup canvas en el DOM
        canvas = document.createElement('canvas');
        canvas.id = 'testCanvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Constructor', () => {
        it('debe inicializar correctamente con canvas válido', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.canvas).toBe(canvas);
            expect(engine.ctx).toBeDefined();
            expect(engine.hasError).toBe(false);
            expect(engine.width).toBe(800);
            expect(engine.height).toBe(600);
            expect(engine.centerX).toBe(400);
            expect(engine.centerY).toBe(300);
        });

        it('debe manejar canvas no encontrado', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.GalaxySystemEngine('nonExistent');

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('❌ Canvas no encontrado:', 'nonExistent');
        });

        it('debe manejar contexto 2D no disponible', () => {
            const mockCanvas = {
                getContext: vi.fn(() => null),
                width: 800,
                height: 600
            };
            vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas);

            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('❌ No se pudo obtener contexto 2D del canvas');
        });

        it('debe manejar excepciones en el constructor', () => {
            vi.spyOn(document, 'getElementById').mockImplementation(() => {
                throw new Error('DOM error');
            });

            const consoleSpy = vi.spyOn(console, 'error');
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.hasError).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('debe inicializar el sol central', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.sun).toBeDefined();
            expect(engine.sun.x).toBe(400);
            expect(engine.sun.y).toBe(300);
            expect(engine.sun.radius).toBe(40);
            expect(engine.sun.pulsePhase).toBe(0);
        });

        it('debe inicializar los planetas', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.planets).toBeDefined();
            expect(Array.isArray(engine.planets)).toBe(true);
            expect(engine.planets.length).toBe(9); // Tablas 2-10
        });

        it('debe inicializar la nave nodriza', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.motherShip).toBeDefined();
            expect(engine.motherShip.x).toBe(100);
            expect(engine.motherShip.y).toBe(100);
            expect(engine.motherShip.size).toBe(40);
            expect(engine.motherShip.angle).toBe(0);
        });

        it('debe inicializar el cometa de racha', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.streakComet).toBeDefined();
            expect(engine.streakComet.angle).toBe(0);
            expect(engine.streakComet.distance).toBe(120);
            expect(engine.streakComet.streak).toBe(0);
        });

        it('debe inicializar estrellas de fondo', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.stars).toBeDefined();
            expect(Array.isArray(engine.stars)).toBe(true);
            expect(engine.stars.length).toBe(100);
        });

        it('debe inicializar propiedades de interacción', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine.hoveredPlanet).toBe(null);
            expect(engine.selectedPlanet).toBe(null);
            expect(engine.animationFrame).toBe(0);
            expect(engine.isRunning).toBe(false);
        });
    });

    describe('render', () => {
        beforeEach(() => {
            engine = new window.GalaxySystemEngine('testCanvas');
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

    describe('handleRenderError', () => {
        beforeEach(() => {
            engine = new window.GalaxySystemEngine('testCanvas');
        });

        it('debe marcar hasError como true', () => {
            const error = new Error('Test error');
            engine.handleRenderError(error);

            expect(engine.hasError).toBe(true);
            expect(engine.isRunning).toBe(false);
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

    describe('start/stop', () => {
        beforeEach(() => {
            engine = new window.GalaxySystemEngine('testCanvas');
        });

        it('debe iniciar la animación', () => {
            engine.start();
            expect(engine.isRunning).toBe(true);
        });

        it('debe detener la animación', () => {
            engine.start();
            engine.stop();
            expect(engine.isRunning).toBe(false);
        });
    });

    describe('Coverage 100%', () => {
        it('debe tener todas las propiedades inicializadas', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(engine).toHaveProperty('canvas');
            expect(engine).toHaveProperty('ctx');
            expect(engine).toHaveProperty('width');
            expect(engine).toHaveProperty('height');
            expect(engine).toHaveProperty('centerX');
            expect(engine).toHaveProperty('centerY');
            expect(engine).toHaveProperty('sun');
            expect(engine).toHaveProperty('planets');
            expect(engine).toHaveProperty('motherShip');
            expect(engine).toHaveProperty('streakComet');
            expect(engine).toHaveProperty('stars');
            expect(engine).toHaveProperty('hoveredPlanet');
            expect(engine).toHaveProperty('selectedPlanet');
            expect(engine).toHaveProperty('animationFrame');
            expect(engine).toHaveProperty('isRunning');
            expect(engine).toHaveProperty('hasError');
        });

        it('debe tener todos los métodos requeridos', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            expect(typeof engine.render).toBe('function');
            expect(typeof engine.handleRenderError).toBe('function');
            expect(typeof engine.start).toBe('function');
            expect(typeof engine.stop).toBe('function');
            expect(typeof engine.animate).toBe('function');
            expect(typeof engine.update).toBe('function');
        });

        it('debe crear planetas con propiedades correctas', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            engine.planets.forEach((planet, index) => {
                expect(planet).toHaveProperty('table');
                expect(planet).toHaveProperty('angle');
                expect(planet).toHaveProperty('distance');
                expect(planet).toHaveProperty('radius');
                expect(planet).toHaveProperty('appearance');
                expect(planet.table).toBe(index + 2); // Tables 2-10
            });
        });

        it('debe crear estrellas con propiedades correctas', () => {
            engine = new window.GalaxySystemEngine('testCanvas');

            engine.stars.forEach(star => {
                expect(star).toHaveProperty('x');
                expect(star).toHaveProperty('y');
                expect(star).toHaveProperty('size');
                expect(star).toHaveProperty('brightness');
            });
        });
    });
});
