// ================================
// SISTEMA DE MISIONES DIARIAS
// ================================

class DailyMissionsSystem {
    constructor() {
        // Estado de misiones
        this.missions = [];
        this.completedToday = [];
        this.lastResetDate = null;

        // Progreso de tracking
        this.progress = {
            practiceMinutes: 0,
            bossWins: 0,
            correctAnswers: 0,
            challengePlayed: false
        };

        // Referencias DOM
        this.panel = null;

        this.loadData();
        this.checkDailyReset();
        this.generateDailyMissions();
        this.createMissionsPanel();

        console.log('🎯 Sistema de misiones diarias inicializado');
    }

    // =============================
    // PERSISTENCIA
    // =============================

    loadData() {
        try {
            const saved = localStorage.getItem('dailyMissionsData');
            if (saved) {
                const data = JSON.parse(saved);
                this.missions = data.missions || [];
                this.completedToday = data.completedToday || [];
                this.lastResetDate = data.lastResetDate || null;
                this.progress = data.progress || this.progress;
            }
        } catch (error) {
            console.error('❌ Error cargando misiones:', error);
        }
    }

    saveData() {
        try {
            const data = {
                missions: this.missions,
                completedToday: this.completedToday,
                lastResetDate: this.lastResetDate,
                progress: this.progress
            };
            localStorage.setItem('dailyMissionsData', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error guardando misiones:', error);
        }
    }

    // =============================
    // RESET DIARIO
    // =============================

    checkDailyReset() {
        const today = new Date().toDateString();

        if (this.lastResetDate !== today) {
            console.log('🔄 Nuevo día detectado, reseteando misiones');
            this.resetDaily();
            this.lastResetDate = today;
            this.saveData();
        }
    }

    resetDaily() {
        this.completedToday = [];
        this.progress = {
            practiceMinutes: 0,
            bossWins: 0,
            correctAnswers: 0,
            challengePlayed: false
        };
        this.generateDailyMissions();
    }

    // =============================
    // GENERACIÓN DE MISIONES
    // =============================

    generateDailyMissions() {
        // Plantillas de misiones disponibles
        const missionTemplates = [
            {
                id: 'practice_time',
                icon: '📚',
                title: 'Practica 10 minutos',
                description: 'Completa 10 minutos en modo práctica',
                reward: 50,
                type: 'time',
                target: 10,
                trackKey: 'practiceMinutes'
            },
            {
                id: 'boss_win',
                icon: '⚔️',
                title: 'Gana una Batalla de Jefe',
                description: 'Derrota a un jefe en batalla',
                reward: 100,
                type: 'count',
                target: 1,
                trackKey: 'bossWins'
            },
            {
                id: 'correct_50',
                icon: '✨',
                title: 'Responde 50 correctas',
                description: '50 respuestas correctas en total',
                reward: 75,
                type: 'count',
                target: 50,
                trackKey: 'correctAnswers'
            },
            {
                id: 'challenge',
                icon: '⏱️',
                title: 'Usa el Desafío Rápido',
                description: 'Completa una partida de desafío rápido',
                reward: 25,
                type: 'boolean',
                trackKey: 'challengePlayed'
            }
        ];

        // Seleccionar 4 misiones aleatorias (o todas si hay menos de 4)
        this.missions = this.shuffleArray([...missionTemplates]).slice(0, 4);

        console.log(`🎯 ${this.missions.length} misiones generadas para hoy`);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // =============================
    // TRACKING DE PROGRESO
    // =============================

    trackPracticeTime(minutes) {
        this.progress.practiceMinutes += minutes;
        this.checkMission('practice_time');
        this.saveData();
        this.updatePanel();
    }

    trackBossWin() {
        this.progress.bossWins++;
        this.checkMission('boss_win');
        this.saveData();
        this.updatePanel();
    }

    trackCorrectAnswer() {
        this.progress.correctAnswers++;
        this.checkMission('correct_50');
        this.saveData();
        this.updatePanel();
    }

    trackChallengePlayed() {
        this.progress.challengePlayed = true;
        this.checkMission('challenge');
        this.saveData();
        this.updatePanel();
    }

    // =============================
    // COMPLETAR MISIONES
    // =============================

    checkMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || this.completedToday.includes(missionId)) return;

        let isComplete = false;

        switch (mission.type) {
            case 'time':
            case 'count':
                isComplete = this.progress[mission.trackKey] >= mission.target;
                break;
            case 'boolean':
                isComplete = this.progress[mission.trackKey] === true;
                break;
        }

        if (isComplete) {
            this.completeMission(missionId);
        }
    }

    completeMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || this.completedToday.includes(missionId)) return;

        this.completedToday.push(missionId);

        // Dar recompensa
        if (window.coinSystem) {
            window.coinSystem.addStars(mission.reward, {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }

        // Notificación
        this.showMissionComplete(mission);

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playLevelComplete();
        }

        // Confeti
        if (window.feedbackSystem) {
            window.feedbackSystem.triggerConfetti();
        }

        console.log(`🎯 ¡Misión completada! ${mission.title} → +${mission.reward} ⭐`);

        this.saveData();
        this.updatePanel();

        // Verificar si todas las misiones están completas
        if (this.completedToday.length === this.missions.length) {
            this.showAllMissionsComplete();
        }
    }

    showMissionComplete(mission) {
        const notification = document.createElement('div');
        notification.className = 'mission-complete-notification';

        notification.innerHTML = `
            <div class="mission-complete-icon">${mission.icon}</div>
            <div class="mission-complete-text">
                <div class="mission-complete-title">¡Misión Completada!</div>
                <div class="mission-complete-name">${mission.title}</div>
                <div class="mission-complete-reward">+${mission.reward} ⭐</div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 4000);
    }

    showAllMissionsComplete() {
        const bonus = 50; // Bonus por completar todas

        if (window.coinSystem) {
            window.coinSystem.addStars(bonus, {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }

        const notification = document.createElement('div');
        notification.className = 'mission-all-complete-notification';

        notification.innerHTML = `
            <div class="mission-all-complete-icon">🏆</div>
            <div class="mission-all-complete-text">
                <div class="mission-all-complete-title">¡TODAS LAS MISIONES COMPLETADAS!</div>
                <div class="mission-all-complete-bonus">Bonus: +${bonus} ⭐</div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    // =============================
    // PANEL DE MISIONES
    // =============================

    createMissionsPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'missionsPanel';
        this.panel.className = 'missions-panel';
        this.panel.style.display = 'none';

        this.panel.innerHTML = `
            <div class="missions-header">
                <h3 class="missions-title">🎯 MISIONES DE HOY</h3>
                <button class="missions-close" id="missionsCloseBtn">✕</button>
            </div>
            <div class="missions-list" id="missionsList">
                <!-- Se llena dinámicamente -->
            </div>
            <div class="missions-footer">
                <div class="missions-progress">
                    <span id="missionsCompleted">0</span>/<span id="missionsTotal">0</span> completadas
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);

        // Event listeners
        document.getElementById('missionsCloseBtn').addEventListener('click', () => this.close());

        this.updatePanel();

        console.log('🎯 Panel de misiones creado');
    }

    updatePanel() {
        if (!this.panel) return;

        const listContainer = document.getElementById('missionsList');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        this.missions.forEach(mission => {
            const isComplete = this.completedToday.includes(mission.id);
            const currentProgress = this.getCurrentProgress(mission);

            const missionEl = document.createElement('div');
            missionEl.className = `mission-item ${isComplete ? 'completed' : ''}`;

            missionEl.innerHTML = `
                <div class="mission-checkbox ${isComplete ? 'checked' : ''}">
                    ${isComplete ? '✓' : ''}
                </div>
                <div class="mission-icon">${mission.icon}</div>
                <div class="mission-info">
                    <div class="mission-name">${mission.title}</div>
                    <div class="mission-desc">${mission.description}</div>
                    ${!isComplete && mission.type !== 'boolean' ? `
                        <div class="mission-progress-bar">
                            <div class="mission-progress-fill" style="width: ${(currentProgress / mission.target) * 100}%"></div>
                            <div class="mission-progress-text">${currentProgress}/${mission.target}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="mission-reward ${isComplete ? 'claimed' : ''}">
                    ${isComplete ? '✓' : `+${mission.reward} ⭐`}
                </div>
            `;

            listContainer.appendChild(missionEl);
        });

        // Actualizar contador
        document.getElementById('missionsCompleted').textContent = this.completedToday.length;
        document.getElementById('missionsTotal').textContent = this.missions.length;
    }

    getCurrentProgress(mission) {
        switch (mission.type) {
            case 'time':
            case 'count':
                return this.progress[mission.trackKey] || 0;
            case 'boolean':
                return this.progress[mission.trackKey] ? 1 : 0;
            default:
                return 0;
        }
    }

    // =============================
    // MOSTRAR/OCULTAR PANEL
    // =============================

    open() {
        if (!this.panel) return;

        this.updatePanel();
        this.panel.style.display = 'flex';

        setTimeout(() => {
            this.panel.classList.add('missions-panel-open');
        }, 10);

        console.log('🎯 Panel de misiones abierto');
    }

    close() {
        if (!this.panel) return;

        this.panel.classList.remove('missions-panel-open');

        setTimeout(() => {
            this.panel.style.display = 'none';
        }, 300);

        console.log('🎯 Panel de misiones cerrado');
    }

    toggle() {
        if (this.panel && this.panel.style.display === 'none') {
            this.open();
        } else {
            this.close();
        }
    }

    // =============================
    // RACHA DIARIA
    // =============================

    getStreakReward(streak) {
        const rewards = {
            1: { stars: 10, trophies: 0, message: '¡Primer día!' },
            3: { stars: 30, trophies: 0, message: '¡3 días seguidos!' },
            7: { stars: 100, trophies: 1, message: '¡Una semana completa! 🏆' },
            14: { stars: 200, trophies: 2, message: '¡2 semanas! ¡Increíble!' },
            30: { stars: 500, trophies: 5, message: '¡Un mes completo! ¡LEGENDARIO! 🌟' }
        };

        return rewards[streak] || null;
    }

    checkStreakReward() {
        if (!window.coinSystem) return;

        const streak = window.coinSystem.getStreak();
        const reward = this.getStreakReward(streak);

        if (reward) {
            // Dar recompensa
            window.coinSystem.addStars(reward.stars);
            if (reward.trophies > 0) {
                window.coinSystem.addTrophies(reward.trophies);
            }

            // Notificación especial
            this.showStreakReward(streak, reward);

            console.log(`🔥 Recompensa de racha (${streak} días): +${reward.stars} ⭐`);
        }
    }

    showStreakReward(streak, reward) {
        const notification = document.createElement('div');
        notification.className = 'streak-reward-notification';

        notification.innerHTML = `
            <div class="streak-reward-icon">🔥</div>
            <div class="streak-reward-text">
                <div class="streak-reward-title">¡${streak} DÍAS DE RACHA!</div>
                <div class="streak-reward-message">${reward.message}</div>
                <div class="streak-reward-prizes">
                    <span>+${reward.stars} ⭐</span>
                    ${reward.trophies > 0 ? `<span>+${reward.trophies} 🏆</span>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);

        // Confeti masivo
        if (window.feedbackSystem) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    window.feedbackSystem.triggerConfetti();
                }, i * 200);
            }
        }
    }

    // =============================
    // GETTERS
    // =============================

    getMissionsProgress() {
        return {
            completed: this.completedToday.length,
            total: this.missions.length,
            percentage: (this.completedToday.length / this.missions.length) * 100
        };
    }

    getAllMissions() {
        return this.missions.map(mission => ({
            ...mission,
            completed: this.completedToday.includes(mission.id),
            progress: this.getCurrentProgress(mission)
        }));
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.dailyMissionsSystem = new DailyMissionsSystem();

console.log('🎯 Sistema de misiones listo');
console.log(`   Misiones de hoy: ${window.dailyMissionsSystem.missions.length}`);
console.log(`   Completadas: ${window.dailyMissionsSystem.completedToday.length}`);
