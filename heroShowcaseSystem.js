// ================================
// ESCAPARATE DEL HÉROE - HERO SHOWCASE
// Pantalla visual para mostrar el personaje equipado
// ================================

class HeroShowcaseSystem {
    constructor() {
        this.modal = null;
        this.createModal();
        console.log('👑 Sistema Escaparate del Héroe inicializado');
    }

    // ================================
    // CREAR MODAL
    // ================================

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'heroShowcaseModal';
        this.modal.className = 'hero-showcase-modal';
        this.modal.style.display = 'none';

        this.modal.innerHTML = `
            <div class="hero-showcase-overlay"></div>
            <div class="hero-showcase-content">
                <!-- Botón cerrar -->
                <button class="hero-showcase-close" id="heroShowcaseClose">✕</button>

                <!-- Header -->
                <div class="hero-showcase-header">
                    <h2 class="hero-showcase-title">⚔️ ESCAPARATE DEL HÉROE</h2>
                    <p class="hero-showcase-subtitle">Tu personaje y logros</p>
                </div>

                <!-- Área principal dividida en 2 columnas -->
                <div class="hero-showcase-main">
                    <!-- Columna izquierda: Personaje 3D -->
                    <div class="hero-showcase-character">
                        <div class="hero-stage">
                            <!-- Pedestal -->
                            <div class="hero-pedestal">
                                <div class="hero-name" id="heroName">Martín</div>
                            </div>

                            <!-- Avatar central GRANDE -->
                            <div class="hero-avatar-large" id="heroAvatarLarge">
                                🦸
                            </div>

                            <!-- Items equipados flotantes alrededor -->
                            <div class="hero-equipped-items">
                                <!-- Nave (arriba izquierda) -->
                                <div class="hero-equipped-slot" style="top: 10%; left: 10%;">
                                    <div class="equipped-slot-label">Nave</div>
                                    <div class="equipped-slot-icon" id="heroEquippedShip">🚀</div>
                                </div>

                                <!-- Arma (arriba derecha) -->
                                <div class="hero-equipped-slot" style="top: 10%; right: 10%;">
                                    <div class="equipped-slot-label">Arma</div>
                                    <div class="equipped-slot-icon" id="heroEquippedWeapon">⚔️</div>
                                </div>

                                <!-- Auto (abajo izquierda) -->
                                <div class="hero-equipped-slot" style="bottom: 15%; left: 10%;">
                                    <div class="equipped-slot-label">Auto</div>
                                    <div class="equipped-slot-icon" id="heroEquippedCar">🏎️</div>
                                </div>

                                <!-- Tema (abajo derecha) -->
                                <div class="hero-equipped-slot" style="bottom: 15%; right: 10%;">
                                    <div class="equipped-slot-label">Tema</div>
                                    <div class="equipped-slot-icon" id="heroEquippedTheme">🎨</div>
                                </div>
                            </div>

                            <!-- Efecto de brillo rotatorio -->
                            <div class="hero-glow"></div>
                        </div>
                    </div>

                    <!-- Columna derecha: Estadísticas y Logros -->
                    <div class="hero-showcase-stats">
                        <!-- Maestría Global -->
                        <div class="hero-stat-card mastery-card">
                            <div class="stat-card-icon">🌟</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Maestría Global</div>
                                <div class="stat-card-value" id="heroMastery">0%</div>
                                <div class="stat-card-bar">
                                    <div class="stat-card-fill" id="heroMasteryBar"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Monedas -->
                        <div class="hero-stat-card coins-card">
                            <div class="stat-card-icon">💰</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Monedas</div>
                                <div class="stat-card-value" id="heroCoins">0</div>
                            </div>
                        </div>

                        <!-- Trofeos -->
                        <div class="hero-stat-card trophies-card">
                            <div class="stat-card-icon">🏆</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Trofeos</div>
                                <div class="stat-card-value" id="heroTrophies">0</div>
                            </div>
                        </div>

                        <!-- Mejor Racha -->
                        <div class="hero-stat-card streak-card">
                            <div class="stat-card-icon">🔥</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Mejor Racha</div>
                                <div class="stat-card-value" id="heroBestStreak">0</div>
                            </div>
                        </div>

                        <!-- Preguntas Totales -->
                        <div class="hero-stat-card questions-card">
                            <div class="stat-card-icon">📊</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Preguntas Respondidas</div>
                                <div class="stat-card-value" id="heroTotalQuestions">0</div>
                            </div>
                        </div>

                        <!-- Precisión -->
                        <div class="hero-stat-card accuracy-card">
                            <div class="stat-card-icon">🎯</div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Precisión</div>
                                <div class="stat-card-value" id="heroAccuracy">0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logros Destacados (Abajo) -->
                <div class="hero-showcase-achievements">
                    <h3 class="achievements-title">🏅 Logros Desbloqueados</h3>
                    <div class="achievements-grid" id="heroAchievementsGrid">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Event listeners
        document.getElementById('heroShowcaseClose')?.addEventListener('click', () => this.close());
        this.modal.querySelector('.hero-showcase-overlay')?.addEventListener('click', () => this.close());
    }

    // ================================
    // ABRIR ESCAPARATE
    // ================================

    open(playerData) {
        if (!playerData) {
            console.error('⚠️ No hay datos de jugador para mostrar');
            return;
        }

        // Mostrar modal
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);

        // Llenar datos
        this.populateData(playerData);

        // Sonido épico
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }

        console.log('👑 Escaparate del Héroe abierto');
    }

    // ================================
    // LLENAR DATOS
    // ================================

    populateData(player) {
        // Nombre del héroe
        const heroNameEl = document.getElementById('heroName');
        if (heroNameEl) {
            heroNameEl.textContent = player.name || 'Héroe';
        }

        // Avatar central
        const heroAvatarEl = document.getElementById('heroAvatarLarge');
        if (heroAvatarEl) {
            const avatar = window.shopSystem ? window.shopSystem.getEquipped('avatars') : player.avatar;
            heroAvatarEl.textContent = avatar || '🦸';
        }

        // Items equipados
        if (window.shopSystem) {
            const ship = window.shopSystem.getEquipped('ships') || '🚀';
            const weapon = window.shopSystem.getEquipped('weapons') || '⚔️';
            const car = window.shopSystem.getEquipped('cars') || '🏎️';
            const theme = window.shopSystem.getEquipped('themes') || 'default';

            document.getElementById('heroEquippedShip').textContent = ship;
            document.getElementById('heroEquippedWeapon').textContent = weapon;
            document.getElementById('heroEquippedCar').textContent = car;
            document.getElementById('heroEquippedTheme').textContent = theme === 'default' ? '🎨' : '🌈';
        }

        // Maestría Global
        const mastery = window.app ? window.app.calculateGlobalMastery() : 0;
        const masteryEl = document.getElementById('heroMastery');
        const masteryBarEl = document.getElementById('heroMasteryBar');
        if (masteryEl) masteryEl.textContent = mastery + '%';
        if (masteryBarEl) masteryBarEl.style.width = mastery + '%';

        // Monedas
        const coins = player.coins || (window.coinSystem ? window.coinSystem.getStars() : 0);
        const coinsEl = document.getElementById('heroCoins');
        if (coinsEl) coinsEl.textContent = coins.toLocaleString();

        // Trofeos
        const trophies = window.coinSystem ? window.coinSystem.getTrophies() : 0;
        const trophiesEl = document.getElementById('heroTrophies');
        if (trophiesEl) trophiesEl.textContent = trophies;

        // Mejor Racha
        const bestStreak = player.bestStreak || 0;
        const bestStreakEl = document.getElementById('heroBestStreak');
        if (bestStreakEl) bestStreakEl.textContent = bestStreak;

        // Preguntas Totales
        const totalQuestions = player.stats?.totalQuestions || 0;
        const totalQuestionsEl = document.getElementById('heroTotalQuestions');
        if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions.toLocaleString();

        // Precisión
        const accuracy = this.calculateAccuracy(player);
        const accuracyEl = document.getElementById('heroAccuracy');
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';

        // Logros
        this.populateAchievements(player);
    }

    calculateAccuracy(player) {
        if (!player.stats) return 0;
        const total = player.stats.correctAnswers + player.stats.incorrectAnswers;
        if (total === 0) return 0;
        return Math.round((player.stats.correctAnswers / total) * 100);
    }

    populateAchievements(player) {
        const grid = document.getElementById('heroAchievementsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Obtener logros desbloqueados
        const unlockedAchievements = player.achievements || [];

        if (unlockedAchievements.length === 0) {
            grid.innerHTML = '<p class="no-achievements">Aún no has desbloqueado logros. ¡Sigue jugando!</p>';
            return;
        }

        // Mostrar máximo 6 logros más recientes
        const recentAchievements = unlockedAchievements.slice(-6).reverse();

        recentAchievements.forEach(achievementId => {
            const achievement = this.getAchievementData(achievementId);
            if (!achievement) return;

            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-badge';
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;

            grid.appendChild(achievementEl);
        });
    }

    getAchievementData(achievementId) {
        // Lista simplificada de logros (debería venir de app.js)
        const achievements = {
            'first_steps': { icon: '👶', name: 'Primeros Pasos', desc: '10 preguntas' },
            'apprentice': { icon: '📚', name: 'Aprendiz', desc: '50 preguntas' },
            'scholar': { icon: '🎓', name: 'Estudiante', desc: '100 preguntas' },
            'master': { icon: '🧙‍♂️', name: 'Maestro', desc: '500 preguntas' },
            'legend': { icon: '👑', name: 'Leyenda', desc: '1000 preguntas' },
            'perfect_game': { icon: '💎', name: 'Perfección', desc: '10 sin errores' },
            'sniper': { icon: '🎯', name: 'Francotirador', desc: '95% precisión' },
            'streak_5': { icon: '🔥', name: 'Racha Ardiente', desc: 'Racha de 5' },
            'streak_10': { icon: '⚡', name: 'Imparable', desc: 'Racha de 10' },
            'mastery_25': { icon: '⭐', name: 'Aprendiz', desc: '25% maestría' },
            'mastery_50': { icon: '🌟', name: 'Estudiante', desc: '50% maestría' },
            'mastery_75': { icon: '💫', name: 'Experto', desc: '75% maestría' },
            'mastery_90': { icon: '🎖️', name: 'Maestro', desc: '90% maestría' },
            'mastery_100': { icon: '👑', name: 'Gran Maestro', desc: '100% maestría' }
        };

        return achievements[achievementId];
    }

    // ================================
    // CERRAR MODAL
    // ================================

    close() {
        this.modal.classList.remove('active');

        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);

        console.log('👑 Escaparate del Héroe cerrado');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.heroShowcase = new HeroShowcaseSystem();

console.log('👑 Sistema Escaparate del Héroe listo');
