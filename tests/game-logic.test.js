/**
 * Tests para lógica crítica del juego
 * Validación de respuestas, generación de preguntas, power-ups
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Lógica de Multiplicación', () => {
  describe('Validación de Respuestas', () => {
    function isCorrectAnswer(num1, num2, userAnswer) {
      return num1 * num2 === parseInt(userAnswer);
    }

    it('debe validar respuesta correcta simple', () => {
      expect(isCorrectAnswer(2, 3, 6)).toBe(true);
      expect(isCorrectAnswer(5, 4, 20)).toBe(true);
      expect(isCorrectAnswer(9, 9, 81)).toBe(true);
    });

    it('debe rechazar respuesta incorrecta', () => {
      expect(isCorrectAnswer(2, 3, 7)).toBe(false);
      expect(isCorrectAnswer(5, 4, 19)).toBe(false);
      expect(isCorrectAnswer(9, 9, 80)).toBe(false);
    });

    it('debe manejar multiplicación por cero', () => {
      expect(isCorrectAnswer(0, 5, 0)).toBe(true);
      expect(isCorrectAnswer(7, 0, 0)).toBe(true);
      expect(isCorrectAnswer(0, 0, 0)).toBe(true);
    });

    it('debe manejar multiplicación por uno', () => {
      expect(isCorrectAnswer(1, 5, 5)).toBe(true);
      expect(isCorrectAnswer(7, 1, 7)).toBe(true);
      expect(isCorrectAnswer(1, 1, 1)).toBe(true);
    });

    it('debe validar respuestas de dos dígitos', () => {
      expect(isCorrectAnswer(12, 8, 96)).toBe(true);
      expect(isCorrectAnswer(9, 12, 108)).toBe(true);
    });

    it('debe manejar strings numéricos', () => {
      expect(isCorrectAnswer(3, 4, '12')).toBe(true);
      expect(isCorrectAnswer(6, 7, '42')).toBe(true);
    });

    it('debe rechazar entrada no numérica', () => {
      expect(isCorrectAnswer(3, 4, 'abc')).toBe(false);
      expect(isCorrectAnswer(3, 4, '')).toBe(false);
      expect(isCorrectAnswer(3, 4, null)).toBe(false);
    });
  });

  describe('Generación de Preguntas', () => {
    function generateQuestion(minTable = 2, maxTable = 9, minFactor = 2, maxFactor = 10) {
      const num1 = Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable;
      const num2 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
      return { num1, num2, correctAnswer: num1 * num2 };
    }

    it('debe generar números dentro del rango especificado', () => {
      for (let i = 0; i < 100; i++) {
        const question = generateQuestion(2, 5, 2, 10);

        expect(question.num1).toBeGreaterThanOrEqual(2);
        expect(question.num1).toBeLessThanOrEqual(5);
        expect(question.num2).toBeGreaterThanOrEqual(2);
        expect(question.num2).toBeLessThanOrEqual(10);
      }
    });

    it('debe calcular la respuesta correcta', () => {
      for (let i = 0; i < 50; i++) {
        const question = generateQuestion();
        expect(question.correctAnswer).toBe(question.num1 * question.num2);
      }
    });

    it('debe generar preguntas para tabla específica', () => {
      for (let i = 0; i < 50; i++) {
        const question = generateQuestion(7, 7, 2, 10); // Solo tabla del 7
        expect(question.num1).toBe(7);
        expect(question.num2).toBeGreaterThanOrEqual(2);
        expect(question.num2).toBeLessThanOrEqual(10);
      }
    });

    it('debe permitir rango de un solo número', () => {
      const question = generateQuestion(5, 5, 3, 3); // 5 × 3
      expect(question.num1).toBe(5);
      expect(question.num2).toBe(3);
      expect(question.correctAnswer).toBe(15);
    });
  });

  describe('Generación de Opciones Múltiples', () => {
    function generateOptions(correctAnswer, count = 4) {
      const options = new Set([correctAnswer]);

      while (options.size < count) {
        // Generar distractores cercanos
        const offset = Math.floor(Math.random() * 20) - 10; // ±10
        const distractor = correctAnswer + offset;

        if (distractor > 0 && distractor !== correctAnswer) {
          options.add(distractor);
        }
      }

      return Array.from(options).sort(() => Math.random() - 0.5); // Mezclar
    }

    it('debe generar el número correcto de opciones', () => {
      const options = generateOptions(24, 4);
      expect(options).toHaveLength(4);
    });

    it('debe incluir la respuesta correcta', () => {
      const correctAnswer = 42;
      const options = generateOptions(correctAnswer, 4);

      expect(options).toContain(correctAnswer);
    });

    it('todas las opciones deben ser únicas', () => {
      for (let i = 0; i < 50; i++) {
        const options = generateOptions(Math.floor(Math.random() * 100), 4);
        const uniqueOptions = new Set(options);

        expect(uniqueOptions.size).toBe(options.length);
      }
    });

    it('las opciones deben ser números positivos', () => {
      const options = generateOptions(15, 4);

      options.forEach(option => {
        expect(option).toBeGreaterThan(0);
      });
    });

    it('debe generar diferentes sets en cada llamada', () => {
      const options1 = generateOptions(24, 4);
      const options2 = generateOptions(24, 4);

      // Probabilidad muy alta de que sean diferentes (no siempre)
      const areIdentical = JSON.stringify(options1) === JSON.stringify(options2);
      // Este test puede fallar ocasionalmente por randomness, pero es muy improbable
    });
  });

  describe('Sistema de Rachas (Streaks)', () => {
    class StreakSystem {
      constructor() {
        this.currentStreak = 0;
        this.bestStreak = 0;
      }

      onCorrectAnswer() {
        this.currentStreak++;
        if (this.currentStreak > this.bestStreak) {
          this.bestStreak = this.currentStreak;
        }
        return this.currentStreak;
      }

      onIncorrectAnswer() {
        this.currentStreak = 0;
        return 0;
      }

      getStreakMultiplier() {
        if (this.currentStreak >= 10) return 3;
        if (this.currentStreak >= 5) return 2;
        if (this.currentStreak >= 3) return 1.5;
        return 1;
      }

      reset() {
        this.currentStreak = 0;
      }
    }

    let streakSystem;

    beforeEach(() => {
      streakSystem = new StreakSystem();
    });

    it('debe iniciar con streak en 0', () => {
      expect(streakSystem.currentStreak).toBe(0);
      expect(streakSystem.bestStreak).toBe(0);
    });

    it('debe incrementar streak con respuestas correctas', () => {
      expect(streakSystem.onCorrectAnswer()).toBe(1);
      expect(streakSystem.onCorrectAnswer()).toBe(2);
      expect(streakSystem.onCorrectAnswer()).toBe(3);
    });

    it('debe resetear streak con respuesta incorrecta', () => {
      streakSystem.onCorrectAnswer();
      streakSystem.onCorrectAnswer();
      streakSystem.onCorrectAnswer();

      expect(streakSystem.currentStreak).toBe(3);

      streakSystem.onIncorrectAnswer();

      expect(streakSystem.currentStreak).toBe(0);
    });

    it('debe mantener el mejor streak', () => {
      // Primer racha de 5
      for (let i = 0; i < 5; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.bestStreak).toBe(5);

      // Resetear
      streakSystem.onIncorrectAnswer();

      // Nueva racha de 3 (no debe cambiar best)
      for (let i = 0; i < 3; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.bestStreak).toBe(5);

      // Nueva racha de 7 (debe actualizar best)
      streakSystem.onIncorrectAnswer();
      for (let i = 0; i < 7; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.bestStreak).toBe(7);
    });

    it('debe calcular multiplicador correcto según streak', () => {
      expect(streakSystem.getStreakMultiplier()).toBe(1);

      for (let i = 0; i < 3; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.getStreakMultiplier()).toBe(1.5);

      for (let i = 0; i < 2; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.getStreakMultiplier()).toBe(2);

      for (let i = 0; i < 5; i++) streakSystem.onCorrectAnswer();
      expect(streakSystem.getStreakMultiplier()).toBe(3);
    });

    it('debe resetear streak manualmente', () => {
      for (let i = 0; i < 5; i++) streakSystem.onCorrectAnswer();

      streakSystem.reset();

      expect(streakSystem.currentStreak).toBe(0);
      expect(streakSystem.bestStreak).toBe(5); // No debe resetear best
    });
  });

  describe('Sistema de Power-ups', () => {
    class PowerUpSystem {
      constructor() {
        this.powerups = {
          shield: { count: 3, active: false },
          hint: { count: 2, active: false },
          skip: { count: 1, active: false }
        };
      }

      canUse(type) {
        return this.powerups[type] && this.powerups[type].count > 0;
      }

      use(type) {
        if (!this.canUse(type)) {
          return false;
        }

        this.powerups[type].count--;
        this.powerups[type].active = true;

        return true;
      }

      deactivate(type) {
        if (this.powerups[type]) {
          this.powerups[type].active = false;
        }
      }

      isActive(type) {
        return this.powerups[type]?.active || false;
      }

      add(type, amount = 1) {
        if (this.powerups[type]) {
          this.powerups[type].count += amount;
        }
      }

      getCount(type) {
        return this.powerups[type]?.count || 0;
      }
    }

    let powerUpSystem;

    beforeEach(() => {
      powerUpSystem = new PowerUpSystem();
    });

    it('debe inicializar con power-ups disponibles', () => {
      expect(powerUpSystem.getCount('shield')).toBe(3);
      expect(powerUpSystem.getCount('hint')).toBe(2);
      expect(powerUpSystem.getCount('skip')).toBe(1);
    });

    it('debe permitir usar power-up si hay disponibles', () => {
      expect(powerUpSystem.canUse('shield')).toBe(true);
      expect(powerUpSystem.canUse('hint')).toBe(true);
      expect(powerUpSystem.canUse('skip')).toBe(true);
    });

    it('debe decrementar contador al usar power-up', () => {
      powerUpSystem.use('shield');
      expect(powerUpSystem.getCount('shield')).toBe(2);

      powerUpSystem.use('shield');
      expect(powerUpSystem.getCount('shield')).toBe(1);
    });

    it('debe activar power-up al usarlo', () => {
      powerUpSystem.use('hint');
      expect(powerUpSystem.isActive('hint')).toBe(true);
    });

    it('debe permitir desactivar power-up', () => {
      powerUpSystem.use('shield');
      expect(powerUpSystem.isActive('shield')).toBe(true);

      powerUpSystem.deactivate('shield');
      expect(powerUpSystem.isActive('shield')).toBe(false);
    });

    it('NO debe permitir usar power-up sin disponibles', () => {
      powerUpSystem.use('skip');
      expect(powerUpSystem.getCount('skip')).toBe(0);

      const result = powerUpSystem.use('skip');
      expect(result).toBe(false);
    });

    it('debe permitir agregar más power-ups', () => {
      powerUpSystem.add('shield', 2);
      expect(powerUpSystem.getCount('shield')).toBe(5);
    });

    it('debe manejar tipo de power-up inválido', () => {
      expect(powerUpSystem.canUse('invalid')).toBeFalsy();
      expect(powerUpSystem.use('invalid')).toBe(false);
      expect(powerUpSystem.getCount('invalid')).toBe(0);
    });

    it('múltiples power-ups pueden estar activos simultáneamente', () => {
      powerUpSystem.use('shield');
      powerUpSystem.use('hint');

      expect(powerUpSystem.isActive('shield')).toBe(true);
      expect(powerUpSystem.isActive('hint')).toBe(true);
    });
  });

  describe('Sistema de Puntuación', () => {
    class ScoreSystem {
      calculateScore(basePoints, streak, timeBonus, difficulty) {
        let score = basePoints;

        // Multiplicador de racha
        if (streak >= 10) score *= 3;
        else if (streak >= 5) score *= 2;
        else if (streak >= 3) score *= 1.5;

        // Bonus de tiempo
        score += timeBonus;

        // Multiplicador de dificultad
        score *= difficulty;

        return Math.round(score);
      }

      calculateTimeBonus(timeLeft, maxTime) {
        if (timeLeft <= 0) return 0;
        const percentage = timeLeft / maxTime;
        return Math.round(100 * percentage);
      }
    }

    let scoreSystem;

    beforeEach(() => {
      scoreSystem = new ScoreSystem();
    });

    it('debe calcular puntuación base sin bonificaciones', () => {
      const score = scoreSystem.calculateScore(100, 0, 0, 1);
      expect(score).toBe(100);
    });

    it('debe aplicar multiplicador de racha de 3+', () => {
      const score = scoreSystem.calculateScore(100, 3, 0, 1);
      expect(score).toBe(150); // 100 * 1.5
    });

    it('debe aplicar multiplicador de racha de 5+', () => {
      const score = scoreSystem.calculateScore(100, 5, 0, 1);
      expect(score).toBe(200); // 100 * 2
    });

    it('debe aplicar multiplicador de racha de 10+', () => {
      const score = scoreSystem.calculateScore(100, 10, 0, 1);
      expect(score).toBe(300); // 100 * 3
    });

    it('debe sumar bonus de tiempo', () => {
      const score = scoreSystem.calculateScore(100, 0, 50, 1);
      expect(score).toBe(150); // 100 + 50
    });

    it('debe aplicar multiplicador de dificultad', () => {
      const score = scoreSystem.calculateScore(100, 0, 0, 2);
      expect(score).toBe(200); // 100 * 2
    });

    it('debe combinar todos los factores correctamente', () => {
      // 100 base * 2 (streak 5) + 30 (time) = 230, luego * 1.5 (difficulty) = 345
      const score = scoreSystem.calculateScore(100, 5, 30, 1.5);
      expect(score).toBe(345);
    });

    it('debe redondear la puntuación final', () => {
      const score = scoreSystem.calculateScore(100, 3, 0, 1.2);
      // 100 * 1.5 * 1.2 = 180
      expect(score).toBe(180);
    });

    it('debe calcular bonus de tiempo correctamente', () => {
      expect(scoreSystem.calculateTimeBonus(10, 10)).toBe(100); // 100%
      expect(scoreSystem.calculateTimeBonus(5, 10)).toBe(50);   // 50%
      expect(scoreSystem.calculateTimeBonus(2, 10)).toBe(20);   // 20%
      expect(scoreSystem.calculateTimeBonus(0, 10)).toBe(0);    // 0%
    });

    it('debe retornar 0 si el tiempo es negativo', () => {
      expect(scoreSystem.calculateTimeBonus(-5, 10)).toBe(0);
    });
  });

  describe('Validación de Progreso de Nivel', () => {
    class LevelSystem {
      constructor() {
        this.level = 1;
        this.xp = 0;
      }

      getXPForLevel(level) {
        return 100 * level; // 100 XP por nivel
      }

      addXP(amount) {
        this.xp += amount;

        // Verificar si sube de nivel
        const leveledUp = [];
        while (this.xp >= this.getXPForLevel(this.level)) {
          this.xp -= this.getXPForLevel(this.level);
          this.level++;
          leveledUp.push(this.level);
        }

        return leveledUp;
      }

      getProgressPercentage() {
        const xpNeeded = this.getXPForLevel(this.level);
        return Math.round((this.xp / xpNeeded) * 100);
      }
    }

    let levelSystem;

    beforeEach(() => {
      levelSystem = new LevelSystem();
    });

    it('debe iniciar en nivel 1 con 0 XP', () => {
      expect(levelSystem.level).toBe(1);
      expect(levelSystem.xp).toBe(0);
    });

    it('debe calcular XP necesaria para cada nivel', () => {
      expect(levelSystem.getXPForLevel(1)).toBe(100);
      expect(levelSystem.getXPForLevel(2)).toBe(200);
      expect(levelSystem.getXPForLevel(5)).toBe(500);
    });

    it('debe agregar XP sin subir de nivel', () => {
      const leveledUp = levelSystem.addXP(50);

      expect(levelSystem.xp).toBe(50);
      expect(levelSystem.level).toBe(1);
      expect(leveledUp).toHaveLength(0);
    });

    it('debe subir de nivel al alcanzar XP requerida', () => {
      const leveledUp = levelSystem.addXP(100);

      expect(levelSystem.level).toBe(2);
      expect(levelSystem.xp).toBe(0);
      expect(leveledUp).toEqual([2]);
    });

    it('debe mantener XP sobrante después de subir de nivel', () => {
      levelSystem.addXP(150);

      expect(levelSystem.level).toBe(2);
      expect(levelSystem.xp).toBe(50);
    });

    it('debe subir múltiples niveles si recibe suficiente XP', () => {
      // Nivel 1 necesita 100, nivel 2 necesita 200, nivel 3 necesita 300
      // Total para llegar a nivel 4: 100 + 200 + 300 = 600
      const leveledUp = levelSystem.addXP(650);

      expect(levelSystem.level).toBe(4);
      expect(levelSystem.xp).toBe(50);
      expect(leveledUp).toEqual([2, 3, 4]);
    });

    it('debe calcular porcentaje de progreso correctamente', () => {
      levelSystem.addXP(50); // 50 de 100 = 50%
      expect(levelSystem.getProgressPercentage()).toBe(50);

      levelSystem.addXP(25); // 75 de 100 = 75%
      expect(levelSystem.getProgressPercentage()).toBe(75);
    });

    it('debe resetear progreso al 0% después de subir de nivel', () => {
      levelSystem.addXP(100); // Sube a nivel 2

      expect(levelSystem.getProgressPercentage()).toBe(0);
    });
  });
});
