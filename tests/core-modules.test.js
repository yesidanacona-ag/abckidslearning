// ================================
// TESTS: Core Modules
// StorageManager, EventBus, GameStore
// ================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Importar módulos
import '../src/core/StorageManager.js';
import '../src/core/EventBus.js';
import '../src/core/GameStore.js';

const { StorageManager, EventBus, GameStore } = window;

// ================================
// StorageManager Tests
// ================================

describe('StorageManager', () => {
    let storage;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
    });

    it('debe crear una instancia', () => {
        expect(storage).toBeInstanceOf(StorageManager);
    });

    it('debe guardar y recuperar valores', () => {
        storage.set('key1', 'value1');
        expect(storage.get('key1')).toBe('value1');
    });

    it('debe guardar objetos complejos', () => {
        const obj = { name: 'Test', value: 42, nested: { a: 1 } };
        storage.set('obj', obj);
        expect(storage.get('obj')).toEqual(obj);
    });

    it('debe retornar defaultValue si no existe', () => {
        expect(storage.get('nonexistent', 'default')).toBe('default');
    });

    it('debe verificar existencia de claves', () => {
        storage.set('exists', 'yes');
        expect(storage.has('exists')).toBe(true);
        expect(storage.has('notexists')).toBe(false);
    });

    it('debe eliminar claves', () => {
        storage.set('remove', 'me');
        expect(storage.has('remove')).toBe(true);
        storage.remove('remove');
        expect(storage.has('remove')).toBe(false);
    });

    it('debe listar claves con prefijo', () => {
        storage.set('a', 1);
        storage.set('b', 2);
        const keys = storage.keys();
        expect(keys).toContain('a');
        expect(keys).toContain('b');
    });

    it('debe limpiar solo claves con prefijo', () => {
        storage.set('keep', 'this');
        localStorage.setItem('other_key', 'other');
        storage.clear();
        expect(storage.has('keep')).toBe(false);
        expect(localStorage.getItem('other_key')).toBe('other');
    });

    it('debe calcular tamaño', () => {
        storage.set('data', 'x'.repeat(100));
        expect(storage.getSize()).toBeGreaterThan(0);
    });

    it('debe exportar/importar datos', () => {
        storage.set('a', 1);
        storage.set('b', 2);
        const exported = storage.export();

        storage.clear();
        expect(storage.has('a')).toBe(false);

        storage.import(exported);
        expect(storage.get('a')).toBe(1);
        expect(storage.get('b')).toBe(2);
    });
});

// ================================
// EventBus Tests
// ================================

describe('EventBus', () => {
    let bus;

    beforeEach(() => {
        bus = new EventBus();
    });

    it('debe crear una instancia', () => {
        expect(bus).toBeInstanceOf(EventBus);
    });

    it('debe suscribir y emitir eventos', () => {
        const handler = vi.fn();
        bus.on('test', handler);
        bus.emit('test', { data: 'value' });
        expect(handler).toHaveBeenCalledWith({ data: 'value' });
    });

    it('debe desuscribir eventos', () => {
        const handler = vi.fn();
        const unsubscribe = bus.on('test', handler);
        unsubscribe();
        bus.emit('test');
        expect(handler).not.toHaveBeenCalled();
    });

    it('debe ejecutar handler solo una vez con once()', () => {
        const handler = vi.fn();
        bus.once('test', handler);
        bus.emit('test');
        bus.emit('test');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('debe ejecutar handlers por prioridad', () => {
        const order = [];
        bus.on('test', () => order.push('low'), { priority: 1 });
        bus.on('test', () => order.push('high'), { priority: 10 });
        bus.on('test', () => order.push('medium'), { priority: 5 });
        bus.emit('test');
        expect(order).toEqual(['high', 'medium', 'low']);
    });

    it('debe manejar múltiples handlers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        bus.on('test', handler1);
        bus.on('test', handler2);
        bus.emit('test');
        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('debe retornar false si no hay handlers', () => {
        const result = bus.emit('nonexistent');
        expect(result).toBe(false);
    });

    it('debe mantener historial de eventos', () => {
        bus.emit('event1', { data: 1 });
        bus.emit('event2', { data: 2 });
        const history = bus.getHistory();
        expect(history).toHaveLength(2);
        expect(history[0].event).toBe('event1');
        expect(history[1].event).toBe('event2');
    });

    it('debe filtrar historial por evento', () => {
        bus.emit('event1', { data: 1 });
        bus.emit('event2', { data: 2 });
        bus.emit('event1', { data: 3 });
        const history = bus.getHistory('event1');
        expect(history).toHaveLength(2);
    });

    it('debe esperar eventos con waitFor()', async () => {
        setTimeout(() => {
            bus.emit('delayed', { value: 42 });
        }, 10);

        const data = await bus.waitFor('delayed', 1000);
        expect(data.value).toBe(42);
    });

    it('debe rechazar timeout en waitFor()', async () => {
        await expect(bus.waitFor('never', 10)).rejects.toThrow('Timeout');
    });

    it('debe contar handlers por evento', () => {
        bus.on('test', () => {});
        bus.on('test', () => {});
        expect(bus.getHandlerCount('test')).toBe(2);
    });

    it('debe limpiar todos los handlers de un evento', () => {
        bus.on('test', () => {});
        bus.on('test', () => {});
        bus.offAll('test');
        expect(bus.getHandlerCount('test')).toBe(0);
    });
});

// ================================
// GameStore Tests
// ================================

describe('GameStore', () => {
    let store;
    let storage;
    let eventBus;

    beforeEach(() => {
        localStorage.clear();
        storage = new StorageManager('test_');
        eventBus = new EventBus();
        store = new GameStore(storage, eventBus);
    });

    it('debe crear una instancia con estado inicial', () => {
        expect(store).toBeInstanceOf(GameStore);
        const state = store.getState();
        expect(state.player).toBeDefined();
        expect(state.game).toBeDefined();
        expect(state.ui).toBeDefined();
    });

    it('debe actualizar estado con setState()', () => {
        store.setState({ player: { ...store.getState().player, name: 'Test' } });
        expect(store.getState().player.name).toBe('Test');
    });

    it('debe actualizar estado con función updater', () => {
        store.setState(state => ({
            ...state,
            player: { ...state.player, coins: 200 }
        }));
        expect(store.getState().player.coins).toBe(200);
    });

    it('debe agregar monedas', () => {
        const initialCoins = store.getState().player.coins;
        store.addCoins(50);
        expect(store.getState().player.coins).toBe(initialCoins + 50);
    });

    it('debe emitir evento al agregar monedas', () => {
        const handler = vi.fn();
        eventBus.on('player:coins:added', handler);
        store.addCoins(10);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 10 })
        );
    });

    it('debe incrementar racha', () => {
        store.incrementStreak();
        store.incrementStreak();
        expect(store.getState().player.streak).toBe(2);
    });

    it('debe actualizar mejor racha', () => {
        store.incrementStreak();
        store.incrementStreak();
        store.incrementStreak();
        expect(store.getState().player.bestStreak).toBe(3);
    });

    it('debe resetear racha', () => {
        store.incrementStreak();
        store.resetStreak();
        expect(store.getState().player.streak).toBe(0);
    });

    it('debe desbloquear logros', () => {
        store.unlockAchievement('first_win');
        expect(store.getState().player.achievements).toContain('first_win');
    });

    it('no debe duplicar logros', () => {
        store.unlockAchievement('first_win');
        store.unlockAchievement('first_win');
        const achievements = store.getState().player.achievements;
        expect(achievements.filter(a => a === 'first_win')).toHaveLength(1);
    });

    it('debe cambiar modo de juego', () => {
        store.setGameMode('practice');
        expect(store.getState().game.mode).toBe('practice');
    });

    it('debe cambiar pantalla', () => {
        store.setScreen('mainScreen');
        expect(store.getState().ui.currentScreen).toBe('mainScreen');
        expect(store.getState().ui.previousScreen).toBe('welcomeScreen');
    });

    it('debe suscribir listeners', () => {
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);
        store.addCoins(10);
        expect(listener).toHaveBeenCalled();
        unsubscribe();
    });

    it('debe usar selector', () => {
        const coins = store.select(state => state.player.coins);
        expect(typeof coins).toBe('number');
    });

    it('debe guardar en storage automáticamente', (done) => {
        store.autoSaveDelay = 50; // Reducir delay para test
        store.addCoins(10);

        setTimeout(() => {
            const saved = storage.get('playerData');
            expect(saved.coins).toBeGreaterThan(100);
            done();
        }, 100);
    });

    it('debe cargar desde storage', () => {
        storage.set('playerData', { name: 'Loaded', coins: 500 });
        const newStore = new GameStore(storage, eventBus);
        expect(newStore.getState().player.name).toBe('Loaded');
        expect(newStore.getState().player.coins).toBe(500);
    });

    it('debe actualizar maestría de tabla', () => {
        store.updateTableMastery(2, { mastery: 75, correctCount: 10 });
        const mastery = store.getState().tableMastery[2];
        expect(mastery.mastery).toBe(75);
        expect(mastery.correctCount).toBe(10);
        expect(mastery.lastPracticed).toBeDefined();
    });

    it('debe mantener historial de cambios', () => {
        store.addCoins(10);
        store.addCoins(20);
        const history = store.getHistory();
        expect(history.length).toBeGreaterThan(0);
    });

    it('debe aplicar middlewares', () => {
        const middleware = vi.fn();
        store.use(middleware);
        store.addCoins(10);
        expect(middleware).toHaveBeenCalled();
    });

    it('debe equipar items', () => {
        store.equipItem('avatars', '🧑‍🚀');
        expect(store.getState().player.equippedItems.avatars).toBe('🧑‍🚀');
    });

    it('debe comprar items', () => {
        store.purchaseItem('item_123');
        expect(store.getState().player.purchasedItems).toContain('item_123');
    });
});
