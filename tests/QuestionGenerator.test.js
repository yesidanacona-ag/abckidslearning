// tests/QuestionGenerator.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionGenerator, QuestionStrategies } from '../core/QuestionGenerator.js';

describe('QuestionGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new QuestionGenerator();
  });

  describe('Constructor', () => {
    it('should create an instance with default config', () => {
      expect(generator).toBeInstanceOf(QuestionGenerator);
      expect(generator.config.optionsCount).toBe(4);
      expect(generator.config.difficultyLevel).toBe('medium');
    });

    it('should accept custom configuration', () => {
      const custom = new QuestionGenerator({
        optionsCount: 5,
        difficultyLevel: 'hard'
      });

      expect(custom.config.optionsCount).toBe(5);
      expect(custom.config.difficultyLevel).toBe('hard');
    });
  });

  describe('generate() - Generate question', () => {
    it('should generate a valid question', () => {
      const question = generator.generate({ tables: 5 });

      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('table');
      expect(question).toHaveProperty('multiplier');
      expect(question).toHaveProperty('answer');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('difficulty');
      expect(question).toHaveProperty('timestamp');
    });

    it('should calculate correct answer', () => {
      const question = generator.generate({ tables: 7 });

      expect(question.answer).toBe(question.table * question.multiplier);
    });

    it('should include correct answer in options', () => {
      const question = generator.generate({ tables: 6 });

      expect(question.options).toContain(question.answer);
    });

    it('should generate specified number of options', () => {
      const question = generator.generate({ tables: 8 });

      expect(question.options.length).toBe(4);
    });

    it('should have unique options', () => {
      const question = generator.generate({ tables: 3 });
      const unique = new Set(question.options);

      expect(unique.size).toBe(question.options.length);
    });

    it('should throw error if tables not provided', () => {
      expect(() => {
        generator.generate({});
      }).toThrow('Tables parameter is required');
    });

    it('should accept single table or array of tables', () => {
      const single = generator.generate({ tables: 5 });
      const multiple = generator.generate({ tables: [5, 6, 7] });

      expect(single.table).toBe(5);
      expect([5, 6, 7]).toContain(multiple.table);
    });

    it('should respect multiplier range', () => {
      const question = generator.generate({
        tables: 7,
        multiplierMin: 5,
        multiplierMax: 8
      });

      expect(question.multiplier).toBeGreaterThanOrEqual(5);
      expect(question.multiplier).toBeLessThanOrEqual(8);
    });

    it('should use default multiplier range if not specified', () => {
      const question = generator.generate({ tables: 4 });

      expect(question.multiplier).toBeGreaterThanOrEqual(1);
      expect(question.multiplier).toBeLessThanOrEqual(10);
    });
  });

  describe('selectMultiplier() - Difficulty-based selection', () => {
    it('should favor easy multipliers on easy difficulty', () => {
      const easyGenerator = new QuestionGenerator({ difficultyLevel: 'easy' });
      const multipliers = [];

      // Generar muchas preguntas para probar distribución
      for (let i = 0; i < 100; i++) {
        const q = easyGenerator.generate({ tables: 5 });
        multipliers.push(q.multiplier);
      }

      // Debería tener más 2, 3, 4, 5, 10 que 6, 7, 8, 9
      const easyCount = multipliers.filter(m => [2, 3, 4, 5, 10].includes(m)).length;
      const hardCount = multipliers.filter(m => [6, 7, 8, 9].includes(m)).length;

      expect(easyCount).toBeGreaterThan(hardCount);
    });

    it('should favor hard multipliers on hard difficulty', () => {
      const hardGenerator = new QuestionGenerator({ difficultyLevel: 'hard' });
      const multipliers = [];

      for (let i = 0; i < 100; i++) {
        const q = hardGenerator.generate({ tables: 7 });
        multipliers.push(q.multiplier);
      }

      const hardCount = multipliers.filter(m => [6, 7, 8, 9].includes(m)).length;
      const easyCount = multipliers.filter(m => [2, 3].includes(m)).length;

      expect(hardCount).toBeGreaterThan(easyCount);
    });
  });

  describe('generateOptions() - Wrong answers', () => {
    it('should generate realistic wrong answers', () => {
      const question = generator.generate({ tables: 7 });
      const wrongAnswers = question.options.filter(o => o !== question.answer);

      // Todas las opciones incorrectas deberían ser números positivos
      wrongAnswers.forEach(option => {
        expect(option).toBeGreaterThan(0);
      });
    });

    it('should avoid negative or zero options', () => {
      const question = generator.generate({ tables: 2 });

      question.options.forEach(option => {
        expect(option).toBeGreaterThan(0);
      });
    });
  });

  describe('generateBatch() - Multiple questions', () => {
    it('should generate specified number of questions', () => {
      const batch = generator.generateBatch(10, { tables: [5, 6, 7] });

      expect(batch.length).toBe(10);
      batch.forEach(q => {
        expect(q).toHaveProperty('answer');
        expect(q).toHaveProperty('options');
      });
    });

    it('should generate diverse questions', () => {
      const batch = generator.generateBatch(20, { tables: [3, 4, 5, 6] });
      const uniqueIds = new Set(batch.map(q => q.id));

      // La mayoría deberían ser únicas (puede haber algunas repeticiones por azar)
      expect(uniqueIds.size).toBeGreaterThanOrEqual(15);
    });
  });

  describe('validate() - Answer validation', () => {
    it('should return true for correct answer', () => {
      const question = generator.generate({ tables: 9 });
      const isCorrect = generator.validate(question, question.answer);

      expect(isCorrect).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const question = generator.generate({ tables: 8 });
      const wrongAnswer = question.answer + 1;
      const isCorrect = generator.validate(question, wrongAnswer);

      expect(isCorrect).toBe(false);
    });
  });

  describe('getDifficultyStats() - Difficulty analysis', () => {
    it('should calculate difficulty score', () => {
      const easyQuestion = { table: 2, multiplier: 3 };
      const hardQuestion = { table: 8, multiplier: 7 };

      const easyStats = generator.getDifficultyStats(easyQuestion);
      const hardStats = generator.getDifficultyStats(hardQuestion);

      expect(hardStats.score).toBeGreaterThan(easyStats.score);
    });

    it('should identify hard tables and multipliers', () => {
      const question = { table: 9, multiplier: 8 };
      const stats = generator.getDifficultyStats(question);

      expect(stats.isHardTable).toBe(true);
      expect(stats.isHardMultiplier).toBe(true);
      expect(stats.level).toBe('hard');
    });

    it('should classify difficulty levels correctly', () => {
      const easy = { table: 2, multiplier: 2 };
      const medium = { table: 5, multiplier: 6 };
      const hard = { table: 9, multiplier: 9 };

      expect(generator.getDifficultyStats(easy).level).toBe('easy');
      expect(generator.getDifficultyStats(medium).level).toBe('medium');
      expect(generator.getDifficultyStats(hard).level).toBe('hard');
    });
  });

  describe('recentQuestions - Avoid repetition', () => {
    it('should track recent questions', () => {
      generator.generate({ tables: 5 });
      generator.generate({ tables: 6 });

      expect(generator.recentQuestions.size).toBeGreaterThan(0);
    });

    it('should limit recent questions cache size', () => {
      // Generar más preguntas que el límite
      for (let i = 0; i < 30; i++) {
        generator.generate({ tables: [2, 3, 4] });
      }

      expect(generator.recentQuestions.size).toBeLessThanOrEqual(generator.maxRecentQuestions);
    });

    it('should allow resetting recent questions', () => {
      generator.generate({ tables: 7 });
      generator.resetRecent();

      expect(generator.recentQuestions.size).toBe(0);
    });
  });

  describe('Utility methods', () => {
    it('randomInt should return number in range', () => {
      for (let i = 0; i < 100; i++) {
        const num = generator.randomInt(5, 10);
        expect(num).toBeGreaterThanOrEqual(5);
        expect(num).toBeLessThanOrEqual(10);
      }
    });

    it('randomChoice should return element from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const choice = generator.randomChoice(arr);

      expect(arr).toContain(choice);
    });

    it('randomChoice should handle empty array', () => {
      const choice = generator.randomChoice([]);
      expect(choice).toBeUndefined();
    });

    it('shuffle should randomize array', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = generator.shuffle(original);

      // Longitud debe ser la misma
      expect(shuffled.length).toBe(original.length);

      // Debe contener los mismos elementos
      original.forEach(item => {
        expect(shuffled).toContain(item);
      });

      // No debería modificar el array original
      expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
});

describe('QuestionStrategies', () => {
  describe('adaptive()', () => {
    it('should prioritize weak tables', () => {
      const generator = new QuestionGenerator();
      const tableMastery = {
        2: 0.9,  // Dominada
        3: 0.3,  // Débil
        4: 0.5,  // Media
        5: 0.2,  // Muy débil
        6: 0.8,
        7: 0.1,  // Muy débil
        8: 0.9,
        9: 0.7,
        10: 0.6
      };

      const question = QuestionStrategies.adaptive(tableMastery, generator);

      // Debería seleccionar una tabla débil (mastery < 0.8)
      expect([3, 4, 5, 7, 9, 10]).toContain(question.table);
    });
  });

  describe('progressive()', () => {
    it('should start easy for low question count', () => {
      const generator = new QuestionGenerator();
      const question = QuestionStrategies.progressive(5, generator);

      expect(question.difficulty).toBe('easy');
    });

    it('should increase difficulty with question count', () => {
      const generator = new QuestionGenerator();
      const early = QuestionStrategies.progressive(5, generator);
      const medium = QuestionStrategies.progressive(15, generator);
      const hard = QuestionStrategies.progressive(25, generator);

      expect(early.difficulty).toBe('easy');
      expect(medium.difficulty).toBe('medium');
      expect(hard.difficulty).toBe('hard');
    });
  });

  describe('review()', () => {
    it('should generate question from all tables', () => {
      const generator = new QuestionGenerator();
      const question = QuestionStrategies.review(generator);

      expect(question.table).toBeGreaterThanOrEqual(2);
      expect(question.table).toBeLessThanOrEqual(10);
      expect(question.difficulty).toBe('medium');
    });
  });
});
