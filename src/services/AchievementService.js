// ================================
// ACHIEVEMENT SERVICE
// Sistema de logros con definiciones y verificación
// ================================

class AchievementService {
    constructor(store, eventBus, playerService) {
        this.store = store;
        this.eventBus = eventBus;
        this.playerService = playerService;

        // Definición de todos los achievements
        this.achievements = this.defineAchievements();

        // Escuchar eventos relevantes para chequear logros
        if (this.eventBus) {
            this.eventBus.on('game:answer:correct', () => this.checkAchievements());
            this.eventBus.on('game:mode:ended', () => this.checkAchievements());
            this.eventBus.on('player:coins:added', () => this.checkAchievements());
        }
    }

    /**
     * Define todos los achievements del juego
     * @returns {Array} Array de achievement objects
     */
    defineAchievements() {
        return [
            // Logros básicos
            {
                id: 'first_steps',
                name: 'Primeros Pasos',
                desc: 'Responde 10 preguntas',
                icon: '👶',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.stats.totalQuestions >= 10;
                }
            },
            {
                id: 'apprentice',
                name: 'Aprendiz',
                desc: 'Responde 50 preguntas',
                icon: '📚',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.stats.totalQuestions >= 50;
                }
            },
            {
                id: 'scholar',
                name: 'Estudiante',
                desc: 'Responde 100 preguntas',
                icon: '🎓',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.stats.totalQuestions >= 100;
                }
            },
            {
                id: 'master',
                name: 'Maestro',
                desc: 'Responde 500 preguntas',
                icon: '🧙‍♂️',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.stats.totalQuestions >= 500;
                }
            },
            {
                id: 'legend',
                name: 'Leyenda',
                desc: 'Responde 1000 preguntas',
                icon: '👑',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.stats.totalQuestions >= 1000;
                }
            },

            // Logros de precisión
            {
                id: 'perfect_game',
                name: 'Perfección',
                desc: 'Responde 10 preguntas sin errores',
                icon: '💎',
                check: () => {
                    const gameState = this.store.getState().game;
                    return gameState.incorrect === 0 && gameState.correct >= 10;
                }
            },
            {
                id: 'sniper',
                name: 'Francotirador',
                desc: 'Logra 95% de precisión en 20 preguntas',
                icon: '🎯',
                check: () => {
                    const player = this.playerService.getPlayer();
                    const total = player.stats.correctAnswers + player.stats.incorrectAnswers;
                    return total >= 20 && (player.stats.correctAnswers / total) >= 0.95;
                }
            },
            {
                id: 'sharp_mind',
                name: 'Mente Aguda',
                desc: 'Responde 100 preguntas con 90% precisión',
                icon: '🧠',
                check: () => {
                    const player = this.playerService.getPlayer();
                    const total = player.stats.correctAnswers + player.stats.incorrectAnswers;
                    return total >= 100 && (player.stats.correctAnswers / total) >= 0.90;
                }
            },

            // Logros de racha
            {
                id: 'streak_5',
                name: 'Racha Ardiente',
                desc: 'Logra racha de 5',
                icon: '🔥',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.streak >= 5;
                }
            },
            {
                id: 'streak_10',
                name: 'Imparable',
                desc: 'Logra racha de 10',
                icon: '⚡',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.streak >= 10;
                }
            },
            {
                id: 'streak_20',
                name: 'Fenómeno',
                desc: 'Logra racha de 20',
                icon: '💫',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.streak >= 20;
                }
            },
            {
                id: 'streak_50',
                name: 'Imbatible',
                desc: 'Logra racha de 50',
                icon: '🌟',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.streak >= 50;
                }
            },

            // Logros de maestría global
            {
                id: 'mastery_25',
                name: 'Aprendiz Global',
                desc: 'Alcanza 25% de maestría global',
                icon: '⬆️',
                check: () => this.playerService.calculateGlobalMastery() >= 25
            },
            {
                id: 'mastery_50',
                name: 'Estudiante Global',
                desc: 'Alcanza 50% de maestría global',
                icon: '🏆',
                check: () => this.playerService.calculateGlobalMastery() >= 50
            },
            {
                id: 'mastery_75',
                name: 'Experto Global',
                desc: 'Alcanza 75% de maestría global',
                icon: '💪',
                check: () => this.playerService.calculateGlobalMastery() >= 75
            },
            {
                id: 'mastery_90',
                name: 'Maestro Global',
                desc: 'Alcanza 90% de maestría global',
                icon: '⚡',
                check: () => this.playerService.calculateGlobalMastery() >= 90
            },
            {
                id: 'mastery_100',
                name: 'Gran Maestro Global',
                desc: 'Alcanza 100% de maestría global',
                icon: '👑',
                check: () => this.playerService.calculateGlobalMastery() >= 100
            },

            // Logros de maestría por tabla
            {
                id: 'table_master_1',
                name: 'Maestro de una Tabla',
                desc: 'Domina 100% una tabla',
                icon: '🎖️',
                check: () => {
                    const tableMastery = this.store.getState().tableMastery;
                    return Object.values(tableMastery).some(m => m.mastery >= 100);
                }
            },
            {
                id: 'table_master_5',
                name: 'Maestro de 5 Tablas',
                desc: 'Domina 5 tablas al 100%',
                icon: '🏅',
                check: () => {
                    const tableMastery = this.store.getState().tableMastery;
                    const mastered = Object.values(tableMastery).filter(m => m.mastery >= 100).length;
                    return mastered >= 5;
                }
            },
            {
                id: 'table_master_all',
                name: 'Gran Maestro de Tablas',
                desc: 'Domina todas las tablas al 100%',
                icon: '👑',
                check: () => {
                    const tableMastery = this.store.getState().tableMastery;
                    let count = 0;
                    for (let i = 2; i <= 10; i++) {
                        if (tableMastery[i] && tableMastery[i].mastery >= 100) {
                            count++;
                        }
                    }
                    return count === 9; // Tablas 2-10
                }
            },

            // Logros de modos especiales
            {
                id: 'speed_demon',
                name: 'Demonio de Velocidad',
                desc: 'Responde 50 preguntas en el Desafío Rápido',
                icon: '💨',
                check: () => {
                    const gameState = this.store.getState().game;
                    return gameState.mode === 'challenge' && gameState.correct >= 50;
                }
            },
            {
                id: 'space_explorer',
                name: 'Explorador Espacial',
                desc: 'Completa la Aventura Espacial',
                icon: '🚀',
                check: () => {
                    const gameState = this.store.getState().game;
                    return gameState.mode === 'adventure' && gameState.planet > 10;
                }
            },
            {
                id: 'racer',
                name: 'Piloto Campeón',
                desc: 'Gana 10 carreras',
                icon: '🏁',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.achievements.filter(a => a === 'racer_win').length >= 10;
                }
            },
            {
                id: 'boss_slayer',
                name: 'Cazador de Jefes',
                desc: 'Derrota a todos los jefes',
                icon: '⚔️',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.achievements.includes('all_bosses_defeated');
                }
            },
            {
                id: 'power_user',
                name: 'Estratega',
                desc: 'Usa 20 power-ups',
                icon: '🎮',
                check: () => {
                    const player = this.playerService.getPlayer();
                    const powerups = player.powerups || {};
                    const used = (2 - (powerups.shield || 0)) +
                                 (3 - (powerups.hint || 0)) +
                                 (1 - (powerups.skip || 0));
                    return used >= 20;
                }
            },

            // Logros de dedicación
            {
                id: 'dedicated',
                name: 'Dedicado',
                desc: 'Juega 7 días seguidos',
                icon: '📅',
                check: () => false // Requeriría tracking de días
            },
            {
                id: 'night_owl',
                name: 'Búho Nocturno',
                desc: 'Juega después de las 10 PM',
                icon: '🦉',
                check: () => {
                    const hour = new Date().getHours();
                    return hour >= 22 || hour < 6;
                }
            },
            {
                id: 'early_bird',
                name: 'Madrugador',
                desc: 'Juega antes de las 7 AM',
                icon: '🌅',
                check: () => new Date().getHours() < 7
            },

            // Logros de monedas
            {
                id: 'coin_collector_100',
                name: 'Coleccionista de Monedas',
                desc: 'Acumula 100 monedas',
                icon: '💰',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.coins >= 100;
                }
            },
            {
                id: 'coin_collector_500',
                name: 'Tesorero',
                desc: 'Acumula 500 monedas',
                icon: '💎',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.coins >= 500;
                }
            },
            {
                id: 'coin_collector_1000',
                name: 'Millonario',
                desc: 'Acumula 1000 monedas',
                icon: '🤑',
                check: () => {
                    const player = this.playerService.getPlayer();
                    return player.coins >= 1000;
                }
            }
        ];
    }

    /**
     * Verifica todos los achievements y desbloquea los nuevos
     * @returns {number} Número de achievements desbloqueados
     */
    checkAchievements() {
        const player = this.playerService.getPlayer();
        let newAchievements = 0;

        this.achievements.forEach(achievement => {
            // Solo verificar si no está desbloqueado
            if (!player.achievements.includes(achievement.id)) {
                try {
                    if (achievement.check()) {
                        this.unlockAchievement(achievement.id);
                        newAchievements++;
                    }
                } catch (error) {
                    console.error(`❌ Error al verificar achievement '${achievement.id}':`, error);
                }
            }
        });

        return newAchievements;
    }

    /**
     * Desbloquea un achievement específico
     * @param {string} achievementId - ID del achievement
     * @returns {boolean} true si se desbloqueó exitosamente
     */
    unlockAchievement(achievementId) {
        const player = this.playerService.getPlayer();

        // Verificar que no esté ya desbloqueado
        if (player.achievements.includes(achievementId)) {
            return false;
        }

        // Obtener datos del achievement
        const achievement = this.getAchievementById(achievementId);
        if (!achievement) {
            console.error(`❌ Achievement '${achievementId}' no encontrado`);
            return false;
        }

        // Desbloquear en el store
        this.store.unlockAchievement(achievementId);

        // Notificar UI
        if (typeof window !== 'undefined' && window.app) {
            window.app.showNotification(
                `¡Logro desbloqueado: ${achievement.name} ${achievement.icon}!`,
                'success'
            );
        }

        // Reproducir sonido
        if (typeof window !== 'undefined' && window.soundSystem) {
            window.soundSystem.playVictory();
        }

        // Emitir evento (ya se emite desde GameStore)

        return true;
    }

    /**
     * Obtiene un achievement por ID
     * @param {string} achievementId - ID del achievement
     * @returns {Object|null} Achievement object
     */
    getAchievementById(achievementId) {
        return this.achievements.find(a => a.id === achievementId) || null;
    }

    /**
     * Obtiene todos los achievements desbloqueados
     * @returns {Array} Array de achievement objects
     */
    getUnlockedAchievements() {
        const player = this.playerService.getPlayer();
        return this.achievements.filter(a => player.achievements.includes(a.id));
    }

    /**
     * Obtiene achievements bloqueados
     * @returns {Array} Array de achievement objects
     */
    getLockedAchievements() {
        const player = this.playerService.getPlayer();
        return this.achievements.filter(a => !player.achievements.includes(a.id));
    }

    /**
     * Obtiene progreso de un achievement específico
     * @param {string} achievementId - ID del achievement
     * @returns {Object} {current, target, percentage, unlocked}
     */
    getProgress(achievementId) {
        const achievement = this.getAchievementById(achievementId);
        if (!achievement) return null;

        const player = this.playerService.getPlayer();
        const unlocked = player.achievements.includes(achievementId);

        // Progreso depende del tipo de achievement
        // Por ahora retornamos básico
        return {
            unlocked,
            achievement: achievement
        };
    }

    /**
     * Obtiene estadísticas de achievements
     * @returns {Object} Stats de achievements
     */
    getStats() {
        const player = this.playerService.getPlayer();
        const unlocked = this.getUnlockedAchievements().length;
        const total = this.achievements.length;
        const percentage = Math.round((unlocked / total) * 100);

        return {
            unlocked,
            total,
            percentage,
            locked: total - unlocked
        };
    }
}

// Exportar como global para compatibilidad
if (typeof window !== 'undefined') {
    window.AchievementService = AchievementService;
}
