// tests/EventBus.test.js
import { describe, it, expect, vi } from 'vitest';
import { EventBus, GameEvents } from '../core/EventBus.js';

describe('EventBus', () => {
  describe('Constructor', () => {
    it('should create an instance', () => {
      const eventBus = new EventBus();
      expect(eventBus).toBeInstanceOf(EventBus);
    });

    it('should initialize empty events map', () => {
      const eventBus = new EventBus();
      expect(eventBus.events).toBeInstanceOf(Map);
      expect(eventBus.events.size).toBe(0);
    });
  });

  describe('on() - Subscribe to events', () => {
    it('should subscribe a handler to an event', () => {
      const eventBus = new EventBus();
      const handler = vi.fn();

      eventBus.on('test:event', handler);

      expect(eventBus.listenerCount('test:event')).toBe(1);
    });

    it('should return an unsubscribe function', () => {
      const eventBus = new EventBus();
      const handler = vi.fn();

      const unsubscribe = eventBus.on('test:event', handler);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(eventBus.listenerCount('test:event')).toBe(0);
    });

    it('should throw error if handler is not a function', () => {
      const eventBus = new EventBus();

      expect(() => {
        eventBus.on('test:event', 'not a function');
      }).toThrow(TypeError);
    });

    it('should allow multiple handlers for same event', () => {
      const eventBus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);

      expect(eventBus.listenerCount('test:event')).toBe(2);
    });
  });

  describe('emit() - Emit events', () => {
    it('should call all subscribed handlers', () => {
      const eventBus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);

      eventBus.emit('test:event', 'arg1', 'arg2');

      expect(handler1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(handler2).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should not throw if event has no listeners', () => {
      const eventBus = new EventBus();

      expect(() => {
        eventBus.emit('nonexistent:event');
      }).not.toThrow();
    });

    it('should handle errors in handlers gracefully', () => {
      const eventBus = new EventBus();
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      eventBus.on('test:event', errorHandler);
      eventBus.on('test:event', normalHandler);

      eventBus.emit('test:event');

      // Ambos deberían haber sido llamados
      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
    });

    it('should add event to history', () => {
      const eventBus = new EventBus();
      eventBus.emit('test:event', 'data');

      const history = eventBus.getHistory('test:event');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].args).toEqual(['data']);
    });
  });

  describe('once() - Subscribe once', () => {
    it('should execute handler only once', () => {
      const eventBus = new EventBus();
      const handler = vi.fn();

      eventBus.once('test:event', handler);

      eventBus.emit('test:event');
      eventBus.emit('test:event');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should automatically unsubscribe after execution', () => {
      const eventBus = new EventBus();
      const handler = vi.fn();

      eventBus.once('test:event', handler);
      eventBus.emit('test:event');

      expect(eventBus.listenerCount('test:event')).toBe(0);
    });
  });

  describe('off() - Unsubscribe', () => {
    it('should remove specific handler', () => {
      const eventBus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);

      eventBus.off('test:event', handler1);

      expect(eventBus.listenerCount('test:event')).toBe(1);

      eventBus.emit('test:event');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should clean up event if no handlers remain', () => {
      const eventBus = new EventBus();
      const handler = vi.fn();

      eventBus.on('test:event', handler);
      eventBus.off('test:event', handler);

      expect(eventBus.events.has('test:event')).toBe(false);
    });
  });

  describe('clear() - Clear events', () => {
    it('should clear all handlers for specific event', () => {
      const eventBus = new EventBus();

      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());

      eventBus.clear('event1');

      expect(eventBus.listenerCount('event1')).toBe(0);
      expect(eventBus.listenerCount('event2')).toBe(1);
    });

    it('should clear all events if no event specified', () => {
      const eventBus = new EventBus();

      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());

      eventBus.clear();

      expect(eventBus.events.size).toBe(0);
    });
  });

  describe('emitAsync() - Async emit', () => {
    it('should wait for all async handlers to complete', async () => {
      const eventBus = new EventBus();
      const results = [];

      const handler1 = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push('handler1');
      };

      const handler2 = async () => {
        results.push('handler2');
      };

      eventBus.on('test:async', handler1);
      eventBus.on('test:async', handler2);

      await eventBus.emitAsync('test:async');

      expect(results).toContain('handler1');
      expect(results).toContain('handler2');
    });

    it('should handle async errors gracefully', async () => {
      const eventBus = new EventBus();
      const errorHandler = vi.fn(async () => {
        throw new Error('Async error');
      });
      const normalHandler = vi.fn(async () => {
        return 'success';
      });

      eventBus.on('test:async', errorHandler);
      eventBus.on('test:async', normalHandler);

      await expect(eventBus.emitAsync('test:async')).resolves.not.toThrow();

      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
    });
  });

  describe('eventNames() - Get event names', () => {
    it('should return all active event names', () => {
      const eventBus = new EventBus();

      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());
      eventBus.on('event3', vi.fn());

      const names = eventBus.eventNames();

      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names).toContain('event3');
      expect(names.length).toBe(3);
    });
  });

  describe('getHistory() - Event history', () => {
    it('should return recent event history', () => {
      const eventBus = new EventBus();

      eventBus.emit('test:event', 'data1');
      eventBus.emit('test:event', 'data2');
      eventBus.emit('test:event', 'data3');

      const history = eventBus.getHistory('test:event');

      expect(history.length).toBe(3);
      expect(history[0].args).toEqual(['data1']);
      expect(history[2].args).toEqual(['data3']);
    });

    it('should limit history size', () => {
      const eventBus = new EventBus();

      // Emitir más eventos que el límite de history
      for (let i = 0; i < 110; i++) {
        eventBus.emit('test:event', i);
      }

      const history = eventBus.getHistory('test:event', 200);

      // No debería exceder maxHistorySize (100)
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });
});

describe('GameEvents', () => {
  it('should export predefined game events', () => {
    expect(GameEvents.PLAYER_CREATED).toBe('player:created');
    expect(GameEvents.ANSWER_CORRECT).toBe('answer:correct');
    expect(GameEvents.LEVEL_UP).toBe('player:levelUp');
    expect(GameEvents.GAME_STARTED).toBe('game:started');
  });

  it('should have all expected event types', () => {
    const eventKeys = Object.keys(GameEvents);

    expect(eventKeys.length).toBeGreaterThan(20);
    expect(eventKeys).toContain('PLAYER_CREATED');
    expect(eventKeys).toContain('QUESTION_GENERATED');
    expect(eventKeys).toContain('STARS_EARNED');
    expect(eventKeys).toContain('BOSS_DEFEATED');
  });
});
