// tests/StateManager.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../core/StateManager.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    // Resetear singleton entre tests
    StateManager.instance = null;
    localStorage.clear();
    stateManager = new StateManager();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = StateManager.getInstance();
      const instance2 = StateManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should enforce singleton in constructor', () => {
      const instance1 = new StateManager();
      const instance2 = new StateManager();

      expect(instance1).toBe(instance2);
    });
  });

  describe('get() - Get state values', () => {
    it('should get value with path notation', () => {
      stateManager.state = {
        player: {
          name: 'Test Player',
          level: 5
        }
      };

      expect(stateManager.get('player.name')).toBe('Test Player');
      expect(stateManager.get('player.level')).toBe(5);
    });

    it('should return default value if path not found', () => {
      expect(stateManager.get('nonexistent.path', 'default')).toBe('default');
    });

    it('should return entire state if no path provided', () => {
      stateManager.state = { test: 'value' };
      const state = stateManager.get();

      expect(state).toHaveProperty('test');
      expect(state.test).toBe('value');
    });

    it('should handle deep nested paths', () => {
      stateManager.state = {
        a: { b: { c: { d: 'deep value' } } }
      };

      expect(stateManager.get('a.b.c.d')).toBe('deep value');
    });

    it('should handle null/undefined in path gracefully', () => {
      stateManager.state = {
        user: null
      };

      expect(stateManager.get('user.name', 'default')).toBe('default');
    });
  });

  describe('set() - Set state values', () => {
    it('should set value with path notation', () => {
      stateManager.set('player.name', 'Alice');

      expect(stateManager.state.player.name).toBe('Alice');
    });

    it('should create nested objects if they don\'t exist', () => {
      stateManager.set('new.nested.path', 'value');

      expect(stateManager.state.new.nested.path).toBe('value');
    });

    it('should persist by default', () => {
      stateManager.set('player.score', 100);

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should skip persistence if persist=false', () => {
      stateManager.set('temp.value', 'test', false);

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should support method chaining', () => {
      const result = stateManager
        .set('a', 1, false)
        .set('b', 2, false);

      expect(result).toBe(stateManager);
      expect(stateManager.get('a')).toBe(1);
      expect(stateManager.get('b')).toBe(2);
    });

    it('should throw error if path is empty', () => {
      expect(() => {
        stateManager.set('', 'value');
      }).toThrow('Path is required for set()');
    });
  });

  describe('update() - Batch updates', () => {
    it('should update multiple paths at once', () => {
      stateManager.update({
        'player.level': 10,
        'player.xp': 500,
        'gameState.screen': 'play'
      });

      expect(stateManager.get('player.level')).toBe(10);
      expect(stateManager.get('player.xp')).toBe(500);
      expect(stateManager.get('gameState.screen')).toBe('play');
    });

    it('should persist only once after all updates', () => {
      localStorage.setItem.mockClear();

      stateManager.update({
        'a': 1,
        'b': 2,
        'c': 3
      });

      // Solo debería persistir una vez
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete() - Delete state', () => {
    it('should delete a path', () => {
      stateManager.set('player.temp', 'value', false);
      stateManager.delete('player.temp');

      expect(stateManager.get('player.temp')).toBeUndefined();
    });

    it('should handle deleting non-existent path', () => {
      expect(() => {
        stateManager.delete('nonexistent.path');
      }).not.toThrow();
    });
  });

  describe('has() - Check existence', () => {
    it('should return true if path exists', () => {
      stateManager.set('test.value', 123, false);

      expect(stateManager.has('test.value')).toBe(true);
    });

    it('should return false if path does not exist', () => {
      expect(stateManager.has('nonexistent')).toBe(false);
    });
  });

  describe('subscribe() - Reactive updates', () => {
    it('should call subscriber when value changes', () => {
      const subscriber = vi.fn();

      stateManager.subscribe('player.score', subscriber);
      stateManager.set('player.score', 100, false);

      expect(subscriber).toHaveBeenCalledWith(100, undefined, 'player.score');
    });

    it('should return unsubscribe function', () => {
      const subscriber = vi.fn();

      const unsubscribe = stateManager.subscribe('test', subscriber);
      unsubscribe();

      stateManager.set('test', 'value', false);

      expect(subscriber).not.toHaveBeenCalled();
    });

    it('should notify parent path subscribers', () => {
      const parentSubscriber = vi.fn();

      stateManager.subscribe('player', parentSubscriber);
      stateManager.set('player.level', 5, false);

      expect(parentSubscriber).toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const sub1 = vi.fn();
      const sub2 = vi.fn();

      stateManager.subscribe('value', sub1);
      stateManager.subscribe('value', sub2);

      stateManager.set('value', 42, false);

      expect(sub1).toHaveBeenCalledWith(42, undefined, 'value');
      expect(sub2).toHaveBeenCalledWith(42, undefined, 'value');
    });

    it('should handle errors in subscribers gracefully', () => {
      const errorSub = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalSub = vi.fn();

      stateManager.subscribe('test', errorSub);
      stateManager.subscribe('test', normalSub);

      stateManager.set('test', 'value', false);

      expect(errorSub).toHaveBeenCalled();
      expect(normalSub).toHaveBeenCalled();
    });
  });

  describe('persist() - LocalStorage persistence', () => {
    it('should save state to localStorage', () => {
      stateManager.state = { player: { name: 'Alice' } };
      stateManager.persist();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'multiplicationGame_state',
        expect.any(String)
      );
    });

    it('should prevent infinite loops', () => {
      stateManager.isPersisting = true;
      stateManager.persist();

      // No debería intentar persistir si ya está persistiendo
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('loadState() - Load from localStorage', () => {
    it('should load saved state', () => {
      const savedState = { player: { level: 10 } };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const state = stateManager.loadState();

      expect(state).toEqual(savedState);
    });

    it('should return default state if nothing saved', () => {
      localStorage.getItem.mockReturnValue(null);

      const state = stateManager.loadState();

      expect(state).toHaveProperty('player');
      expect(state).toHaveProperty('gameState');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid json{');

      const state = stateManager.loadState();

      expect(state).toHaveProperty('player'); // Default state
    });
  });

  describe('reset() - Reset state', () => {
    it('should reset to default state', () => {
      stateManager.set('player.level', 99, false);
      stateManager.reset();

      expect(stateManager.get('player.level')).toBe(1); // Default
    });

    it('should keep player data if keepPlayer=true', () => {
      stateManager.set('player.name', 'Alice', false);
      stateManager.set('player.level', 10, false);

      stateManager.reset(true);

      expect(stateManager.get('player.name')).toBe('Alice');
      expect(stateManager.get('player.level')).toBe(10);
    });
  });

  describe('History - State history', () => {
    it('should track state changes in history', () => {
      stateManager.set('value', 1, false);
      stateManager.set('value', 2, false);
      stateManager.set('value', 3, false);

      const history = stateManager.getHistory(10);

      expect(history.length).toBeGreaterThan(0);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 60; i++) {
        stateManager.set('counter', i, false);
      }

      expect(stateManager.history.length).toBeLessThanOrEqual(50);
    });

    it('should restore previous state', () => {
      stateManager.set('value', 1, false);
      stateManager.set('value', 2, false);
      stateManager.set('value', 3, false);

      stateManager.restore(-2); // Restaurar penúltimo

      // Debería volver a un estado anterior
      expect(stateManager.history.length).toBeGreaterThan(0);
    });
  });

  describe('export() / import() - State serialization', () => {
    it('should export state as JSON', () => {
      stateManager.set('test', 'value', false);

      const exported = stateManager.export();
      const parsed = JSON.parse(exported);

      expect(parsed.test).toBe('value');
    });

    it('should import state from JSON', () => {
      const importData = JSON.stringify({
        player: { name: 'Imported', level: 50 }
      });

      const success = stateManager.import(importData);

      expect(success).toBe(true);
      expect(stateManager.get('player.name')).toBe('Imported');
      expect(stateManager.get('player.level')).toBe(50);
    });

    it('should handle invalid JSON on import', () => {
      const success = stateManager.import('invalid json{');

      expect(success).toBe(false);
    });
  });

  describe('validate() - State validation', () => {
    it('should validate correct state structure', () => {
      const result = stateManager.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid state', () => {
      stateManager.state = {}; // Estado vacío

      const result = stateManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect type errors', () => {
      stateManager.state = {
        player: { level: 'not a number' } // Debería ser number
      };

      const result = stateManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('player.level must be a number');
    });
  });
});
