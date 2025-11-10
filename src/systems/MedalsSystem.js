// =================================
// SISTEMA DE MEDALLAS
// Recompensas por logros específicos
// =================================

class MedalsSystem {
    constructor() {
        this.medals = this.defineMedals();
        this.init();
    }

    defineMedals() {
        return [
            // Medallas de Descubrimiento
            { id: 'first_table', name: '🎓 Primera Tabla', description: 'Completa tu primera tabla', type: 'discovery', condition: (stats) => stats.discoveredTables >= 1 },
            { id: 'five_tables', name: '🌟 Explorador', description: 'Descubre 5 tablas', type: 'discovery', condition: (stats) => stats.discoveredTables >= 5 },
            { id: 'all_tables', name: '👑 Maestro Total', description: 'Descubre todas las tablas', type: 'discovery', condition: (stats) => stats.discoveredTables >= 9 },
            
            // Medallas de Velocidad
            { id: 'speed_10', name: '⚡ Relámpago', description: 'Responde 10 preguntas en menos de 30 segundos', type: 'speed', condition: (stats) => stats.fastest30Questions >= 10 },
            
            // Medallas de Precisión
            { id: 'perfect_table', name: '💎 Perfección', description: 'Completa una tabla con 100% de acierto', type: 'precision', condition: (stats) => stats.perfectTables >= 1 },
            
            // Medallas de Racha
            { id: 'streak_20', name: '🔥 Racha de Fuego', description: '20 respuestas correctas seguidas', type: 'streak', condition: (stats) => stats.bestStreak >= 20 },
            { id: 'streak_50', name: '🌋 Imparable', description: '50 respuestas correctas seguidas', type: 'streak', condition: (stats) => stats.bestStreak >= 50 }
        ];
    }

    init() {
        console.log('🏅 Sistema de Medallas inicializado');
    }

    checkMedals(playerStats) {
        const unlockedMedals = [];
        
        this.medals.forEach(medal => {
            if (medal.condition(playerStats)) {
                if (!this.hasMedal(medal.id)) {
                    unlockedMedals.push(medal);
                    this.unlockMedal(medal);
                }
            }
        });

        return unlockedMedals;
    }

    unlockMedal(medal) {
        const player = window.bootstrap?.services?.player?.getPlayer();
        if (!player) return;

        if (!player.medals) player.medals = [];
        
        if (!player.medals.includes(medal.id)) {
            player.medals.push(medal.id);
            window.bootstrap.services.player.savePlayer();

            // Celebración
            this.celebrateMedal(medal);

            console.log(`🏅 Medalla desbloqueada: ${medal.name}`);
        }
    }

    hasMedal(medalId) {
        const player = window.bootstrap?.services?.player?.getPlayer();
        return player?.medals?.includes(medalId) || false;
    }

    celebrateMedal(medal) {
        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }

        // Mateo celebra
        if (window.mateoMascot) {
            window.mateoMascot.show('celebrating', 
                `¡Medalla desbloqueada! ${medal.name} - ${medal.description}`, 5000);
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showSuccess(`🏅 ${medal.name}`);
        }
    }

    getMedalsCount() {
        const player = window.bootstrap?.services?.player?.getPlayer();
        return player?.medals?.length || 0;
    }

    getAllMedals() {
        return this.medals;
    }

    getUnlockedMedals() {
        const player = window.bootstrap?.services?.player?.getPlayer();
        const unlockedIds = player?.medals || [];
        return this.medals.filter(m => unlockedIds.includes(m.id));
    }

    getLockedMedals() {
        const player = window.bootstrap?.services?.player?.getPlayer();
        const unlockedIds = player?.medals || [];
        return this.medals.filter(m => !unlockedIds.includes(m.id));
    }
}

// Exponer globalmente
window.medalsSystem = new MedalsSystem();
