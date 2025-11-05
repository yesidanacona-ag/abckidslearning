// ================================
// SISTEMA DE MONEDAS Y ECONOMÍA
// ================================

class CoinSystem {
    constructor() {
        // Monedas
        this.stars = 0;        // ⭐ Estrellas (moneda principal)
        this.trophies = 0;     // 🏆 Trofeos (logros)
        this.streak = 0;       // 🔥 Racha (días consecutivos)
        this.totalStars = 0;   // Total histórico

        // Estado
        this.lastPlayDate = null;
        this.achievements = [];

        // Referencias DOM
        this.hud = null;
        this.starCounter = null;
        this.trophyCounter = null;
        this.streakCounter = null;

        this.loadData();
        this.createHUD();
        this.updateStreak();
    }

    // =============================
    // PERSISTENCIA
    // =============================

    loadData() {
        try {
            const saved = localStorage.getItem('coinSystemData');
            if (saved) {
                const data = JSON.parse(saved);
                this.stars = data.stars || 0;
                this.trophies = data.trophies || 0;
                this.streak = data.streak || 0;
                this.totalStars = data.totalStars || 0;
                this.lastPlayDate = data.lastPlayDate || null;
                this.achievements = data.achievements || [];
            }
        } catch (error) {
            console.error('❌ Error cargando datos del sistema de monedas:', error);
        }
    }

    saveData() {
        try {
            const data = {
                stars: this.stars,
                trophies: this.trophies,
                streak: this.streak,
                totalStars: this.totalStars,
                lastPlayDate: this.lastPlayDate,
                achievements: this.achievements
            };
            localStorage.setItem('coinSystemData', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error guardando datos del sistema de monedas:', error);
        }
    }

    // =============================
    // CREACIÓN DEL HUD
    // =============================

    createHUD() {
        // Eliminar HUD existente si existe
        const existingHud = document.getElementById('gameHUD');
        if (existingHud) {
            existingHud.remove();
        }

        // Crear HUD
        this.hud = document.createElement('div');
        this.hud.id = 'gameHUD';
        this.hud.className = 'game-hud';
        this.hud.style.display = 'none'; // Oculto por defecto

        this.hud.innerHTML = `
            <div class="hud-container">
                <!-- Estrellas -->
                <div class="hud-item hud-stars">
                    <div class="hud-icon">⭐</div>
                    <div class="hud-value" id="hudStarValue">0</div>
                    <div class="hud-label">Estrellas</div>
                </div>

                <!-- Trofeos -->
                <div class="hud-item hud-trophies">
                    <div class="hud-icon">🏆</div>
                    <div class="hud-value" id="hudTrophyValue">0</div>
                    <div class="hud-label">Trofeos</div>
                </div>

                <!-- Racha -->
                <div class="hud-item hud-streak">
                    <div class="hud-icon">🔥</div>
                    <div class="hud-value" id="hudStreakValue">0</div>
                    <div class="hud-label">Días</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.hud);

        // Guardar referencias
        this.starCounter = document.getElementById('hudStarValue');
        this.trophyCounter = document.getElementById('hudTrophyValue');
        this.streakCounter = document.getElementById('hudStreakValue');

        // Actualizar valores iniciales
        this.updateDisplay();

        console.log('⭐ Sistema de monedas: HUD creado');
    }

    // =============================
    // MOSTRAR/OCULTAR HUD
    // =============================

    show() {
        if (this.hud) {
            this.hud.style.display = 'block';
            // Animación de entrada
            setTimeout(() => {
                this.hud.classList.add('hud-visible');
            }, 10);
        }
    }

    hide() {
        if (this.hud) {
            this.hud.classList.remove('hud-visible');
            setTimeout(() => {
                this.hud.style.display = 'none';
            }, 300);
        }
    }

    // =============================
    // GANAR MONEDAS
    // =============================

    addStars(amount, sourceElement = null) {
        this.stars += amount;
        this.totalStars += amount;

        console.log(`⭐ +${amount} estrellas (Total: ${this.stars})`);

        // Animación de moneda volando
        if (sourceElement) {
            this.animateCoinFly(amount, sourceElement);
        } else {
            // Si no hay elemento fuente, animar desde el centro
            this.animateCoinFly(amount, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }

        // Actualizar display con animación
        this.updateDisplay(true);

        // Guardar
        this.saveData();

        // Reproducir sonido
        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        return this.stars;
    }

    addTrophies(amount) {
        this.trophies += amount;
        console.log(`🏆 +${amount} trofeos (Total: ${this.trophies})`);
        this.updateDisplay(true);
        this.saveData();
        return this.trophies;
    }

    // =============================
    // ANIMACIÓN DE MONEDA VOLANDO
    // =============================

    animateCoinFly(amount, source) {
        // Determinar posición de origen
        let startX, startY;

        if (source instanceof HTMLElement) {
            const rect = source.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        } else if (source && typeof source === 'object') {
            startX = source.x;
            startY = source.y;
        } else {
            startX = window.innerWidth / 2;
            startY = window.innerHeight / 2;
        }

        // Crear elemento de moneda
        const coin = document.createElement('div');
        coin.className = 'flying-coin';
        coin.innerHTML = `
            <div class="flying-coin-icon">⭐</div>
            <div class="flying-coin-text">+${amount}</div>
        `;
        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;

        document.body.appendChild(coin);

        // Obtener posición del contador
        const starItem = document.querySelector('.hud-stars');
        if (starItem) {
            const targetRect = starItem.getBoundingClientRect();
            const targetX = targetRect.left + targetRect.width / 2;
            const targetY = targetRect.top + targetRect.height / 2;

            // Animar hacia el contador
            coin.style.setProperty('--target-x', `${targetX - startX}px`);
            coin.style.setProperty('--target-y', `${targetY - startY}px`);

            coin.classList.add('flying');
        }

        // Eliminar después de la animación
        setTimeout(() => {
            coin.remove();
        }, 1000);
    }

    // =============================
    // ACTUALIZAR DISPLAY
    // =============================

    updateDisplay(animate = false) {
        if (this.starCounter) {
            this.animateValue(this.starCounter, this.stars, animate);
        }
        if (this.trophyCounter) {
            this.animateValue(this.trophyCounter, this.trophies, animate);
        }
        if (this.streakCounter) {
            this.animateValue(this.streakCounter, this.streak, animate);
        }
    }

    animateValue(element, value, animate = false) {
        if (animate) {
            // Animación de pulso
            element.parentElement.classList.add('hud-item-pulse');
            setTimeout(() => {
                element.parentElement.classList.remove('hud-item-pulse');
            }, 600);
        }

        // Actualizar valor
        element.textContent = value;
    }

    // =============================
    // SISTEMA DE RACHA
    // =============================

    updateStreak() {
        const today = new Date().toDateString();

        if (this.lastPlayDate === today) {
            // Ya jugó hoy, mantener racha
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (this.lastPlayDate === yesterdayStr) {
            // Jugó ayer, incrementar racha
            this.streak++;
            console.log(`🔥 ¡Racha de ${this.streak} días!`);
        } else if (this.lastPlayDate !== null) {
            // No jugó ayer, perder racha
            console.log(`💔 Racha perdida (era ${this.streak} días)`);
            this.streak = 1;
        } else {
            // Primera vez
            this.streak = 1;
        }

        this.lastPlayDate = today;
        this.saveData();
        this.updateDisplay();
    }

    // =============================
    // LOGROS
    // =============================

    checkAchievement(id) {
        return this.achievements.includes(id);
    }

    unlockAchievement(id, name, reward = 0) {
        if (this.checkAchievement(id)) {
            return false; // Ya desbloqueado
        }

        this.achievements.push(id);
        this.addTrophies(1);

        if (reward > 0) {
            this.addStars(reward);
        }

        console.log(`🏆 ¡Logro desbloqueado! ${name}`);

        // Mostrar notificación
        this.showAchievementNotification(name);

        this.saveData();
        return true;
    }

    showAchievementNotification(name) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">¡Logro Desbloqueado!</div>
                <div class="achievement-name">${name}</div>
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
            }, 300);
        }, 3000);
    }

    // =============================
    // GASTAR MONEDAS
    // =============================

    spendStars(amount) {
        if (this.stars >= amount) {
            this.stars -= amount;
            console.log(`⭐ Gastadas ${amount} estrellas (Quedan: ${this.stars})`);
            this.updateDisplay();
            this.saveData();
            return true;
        }
        console.log(`❌ No hay suficientes estrellas (Necesitas: ${amount}, Tienes: ${this.stars})`);
        return false;
    }

    // =============================
    // GETTERS
    // =============================

    getStars() {
        return this.stars;
    }

    getTrophies() {
        return this.trophies;
    }

    getStreak() {
        return this.streak;
    }

    getTotalStars() {
        return this.totalStars;
    }

    // =============================
    // RESET (para testing)
    // =============================

    reset() {
        this.stars = 0;
        this.trophies = 0;
        this.streak = 0;
        this.totalStars = 0;
        this.lastPlayDate = null;
        this.achievements = [];
        this.saveData();
        this.updateDisplay();
        console.log('🔄 Sistema de monedas reseteado');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

// Crear instancia global del sistema de monedas
window.coinSystem = new CoinSystem();

console.log('⭐ Sistema de monedas inicializado');
console.log(`   Estrellas: ${window.coinSystem.getStars()}`);
console.log(`   Trofeos: ${window.coinSystem.getTrophies()}`);
console.log(`   Racha: ${window.coinSystem.getStreak()} días`);
