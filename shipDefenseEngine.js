// ================================
// DEFENSA DE LA NAVE - SHIP DEFENSE ENGINE
// Identifica múltiplos y defiende tu nave
// ================================

class ShipDefenseEngine {
    constructor() {
        this.isActive = false;
        this.selectedTable = null;
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.asteroidsDestroyed = 0;
        this.asteroidsTotal = 0;

        // Asteroides activos en pantalla
        this.asteroids = [];
        this.nextAsteroidId = 0;

        // Configuración del juego
        this.config = {
            asteroidSpeed: 2,
            asteroidSpawnInterval: 2000, // ms
            maxAsteroidsOnScreen: 4,
            asteroidsPerWave: 15,
            multiplesPercentage: 0.4 // 40% son múltiplos
        };

        // Intervalos y animación
        this.spawnInterval = null;
        this.gameLoopInterval = null;

        console.log('🛸 Sistema de Defensa de Nave inicializado');
    }

    // ================================
    // INICIAR JUEGO
    // ================================

    start(tableNumber = null) {
        this.selectedTable = tableNumber || this.promptTableSelection();
        if (!this.selectedTable) return;

        this.resetGame();
        this.isActive = true;

        // Mostrar pantalla
        this.showScreen();
        this.updateUI();

        // Iniciar spawning y game loop
        this.startSpawning();
        this.startGameLoop();

        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        console.log(`🛸 Defensa de Nave iniciada - Tabla del ${this.selectedTable}`);
    }

    promptTableSelection() {
        // Esto será llamado desde app.js con UI apropiada
        // Por ahora retornar una tabla por defecto
        return 7;
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.asteroidsDestroyed = 0;
        this.asteroidsTotal = 0;
        this.asteroids = [];
        this.nextAsteroidId = 0;
    }

    // ================================
    // PANTALLA Y UI
    // ================================

    showScreen() {
        if (window.app) {
            window.app.showScreen('shipDefenseScreen');
        }
    }

    updateUI() {
        // Actualizar tabla seleccionada
        const tableEl = document.getElementById('defenseTable');
        if (tableEl) {
            tableEl.textContent = `Tabla del ${this.selectedTable}`;
        }

        // Actualizar stats
        const scoreEl = document.getElementById('defenseScore');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }

        const livesEl = document.getElementById('defenseLives');
        if (livesEl) {
            livesEl.innerHTML = '❤️'.repeat(this.lives);
        }

        const waveEl = document.getElementById('defenseWave');
        if (waveEl) {
            waveEl.textContent = this.wave;
        }

        const progressEl = document.getElementById('defenseProgress');
        if (progressEl) {
            const progress = Math.min(100, (this.asteroidsTotal / this.config.asteroidsPerWave) * 100);
            progressEl.style.width = progress + '%';
        }
    }

    // ================================
    // GENERACIÓN DE ASTEROIDES
    // ================================

    startSpawning() {
        this.spawnInterval = setInterval(() => {
            if (this.asteroids.length < this.config.maxAsteroidsOnScreen && this.asteroidsTotal < this.config.asteroidsPerWave) {
                this.spawnAsteroid();
            }

            // Si completamos la oleada
            if (this.asteroidsTotal >= this.config.asteroidsPerWave && this.asteroids.length === 0) {
                this.completeWave();
            }
        }, this.config.asteroidSpawnInterval);
    }

    spawnAsteroid() {
        const isMultiple = Math.random() < this.config.multiplesPercentage;
        const number = this.generateNumber(isMultiple);

        const asteroid = {
            id: this.nextAsteroidId++,
            number: number,
            isMultiple: isMultiple,
            y: -50, // Empieza fuera de la pantalla
            x: Math.random() * 80 + 10, // 10% - 90% del ancho
            destroyed: false
        };

        this.asteroids.push(asteroid);
        this.asteroidsTotal++;
        this.renderAsteroid(asteroid);

        console.log(`🌑 Asteroide spawneado: ${number} (${isMultiple ? 'MÚLTIPLO' : 'NO múltiplo'})`);
    }

    generateNumber(isMultiple) {
        if (isMultiple) {
            // Generar un múltiplo de la tabla seleccionada
            const multiplier = Math.floor(Math.random() * 10) + 1; // 1-10
            return this.selectedTable * multiplier;
        } else {
            // Generar un número que NO sea múltiplo
            let number;
            do {
                number = Math.floor(Math.random() * 100) + 1;
            } while (number % this.selectedTable === 0);
            return number;
        }
    }

    renderAsteroid(asteroid) {
        const container = document.getElementById('asteroidsContainer');
        if (!container) return;

        const asteroidEl = document.createElement('div');
        asteroidEl.className = 'asteroid';
        asteroidEl.id = `asteroid-${asteroid.id}`;
        asteroidEl.style.left = asteroid.x + '%';
        asteroidEl.style.top = asteroid.y + 'px';
        asteroidEl.innerHTML = `
            <div class="asteroid-icon">☄️</div>
            <div class="asteroid-number">${asteroid.number}</div>
        `;

        // Event listener para hacer clic (disparar)
        asteroidEl.addEventListener('click', () => {
            this.shootAsteroid(asteroid.id);
        });

        container.appendChild(asteroidEl);
    }

    // ================================
    // GAME LOOP
    // ================================

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            this.updateAsteroids();
        }, 50); // 20 FPS
    }

    updateAsteroids() {
        this.asteroids.forEach(asteroid => {
            if (asteroid.destroyed) return;

            // Mover hacia abajo
            asteroid.y += this.config.asteroidSpeed;

            // Actualizar posición DOM
            const asteroidEl = document.getElementById(`asteroid-${asteroid.id}`);
            if (asteroidEl) {
                asteroidEl.style.top = asteroid.y + 'px';
            }

            // Verificar si salió de la pantalla (alcanzó el fondo)
            if (asteroid.y > 600) {
                this.asteroidEscaped(asteroid.id);
            }
        });
    }

    // ================================
    // INTERACCIONES
    // ================================

    shootAsteroid(asteroidId) {
        const asteroid = this.asteroids.find(a => a.id === asteroidId);
        if (!asteroid || asteroid.destroyed) return;

        asteroid.destroyed = true;

        // Evaluar si era múltiplo
        if (asteroid.isMultiple) {
            // ✅ CORRECTO: Destruiste un múltiplo
            this.handleCorrectShot(asteroid);
        } else {
            // ❌ ERROR: Destruiste un NO múltiplo
            this.handleWrongShot(asteroid);
        }

        // Remover del array y DOM
        setTimeout(() => {
            this.removeAsteroid(asteroidId);
        }, 500);
    }

    asteroidEscaped(asteroidId) {
        const asteroid = this.asteroids.find(a => a.id === asteroidId);
        if (!asteroid || asteroid.destroyed) return;

        asteroid.destroyed = true;

        // Evaluar si era múltiplo
        if (asteroid.isMultiple) {
            // ❌ ERROR: Dejaste pasar un múltiplo
            this.handleMissedMultiple(asteroid);
        } else {
            // ✅ CORRECTO: Dejaste pasar un NO múltiplo
            this.handleCorrectPass(asteroid);
        }

        this.removeAsteroid(asteroidId);
    }

    // ================================
    // LÓGICA DE RESPUESTAS
    // ================================

    handleCorrectShot(asteroid) {
        this.score += 10;
        this.asteroidsDestroyed++;

        // Feedback visual
        const asteroidEl = document.getElementById(`asteroid-${asteroid.id}`);
        if (asteroidEl) {
            asteroidEl.classList.add('explode-correct');
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        // Mateo feliz
        if (window.mateo) {
            window.mateo.showExpression('happy');
        }

        this.updateUI();
    }

    handleWrongShot(asteroid) {
        this.lives--;

        // Feedback visual
        const asteroidEl = document.getElementById(`asteroid-${asteroid.id}`);
        if (asteroidEl) {
            asteroidEl.classList.add('explode-wrong');
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        // Mateo triste
        if (window.mateo) {
            window.mateo.speak(`¡${asteroid.number} NO es múltiplo de ${this.selectedTable}!`);
            window.mateo.showExpression('sad');
        }

        this.updateUI();

        // Game Over?
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    handleMissedMultiple(asteroid) {
        this.lives--;

        // Feedback visual en área de nave
        this.showDamageEffect();

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        // Mateo avisa
        if (window.mateo) {
            window.mateo.speak(`¡Dejaste pasar ${asteroid.number}! Es ${this.selectedTable} × ${asteroid.number / this.selectedTable}`);
            window.mateo.showExpression('surprised');
        }

        this.updateUI();

        // Game Over?
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    handleCorrectPass(asteroid) {
        // Silencioso, es correcto pero no da puntos
        // Solo remover el asteroide
    }

    showDamageEffect() {
        const ship = document.getElementById('defenseShip');
        if (ship) {
            ship.classList.add('ship-damage');
            setTimeout(() => {
                ship.classList.remove('ship-damage');
            }, 500);
        }
    }

    // ================================
    // ASTEROIDES - MANEJO
    // ================================

    removeAsteroid(asteroidId) {
        // Remover del DOM
        const asteroidEl = document.getElementById(`asteroid-${asteroidId}`);
        if (asteroidEl) {
            asteroidEl.remove();
        }

        // Remover del array
        this.asteroids = this.asteroids.filter(a => a.id !== asteroidId);
    }

    // ================================
    // OLEADAS
    // ================================

    completeWave() {
        this.wave++;
        this.asteroidsTotal = 0;

        // Bonus por completar oleada
        const bonus = 50;
        this.score += bonus;

        // Aumentar dificultad
        this.config.asteroidSpeed += 0.3;
        this.config.asteroidSpawnInterval = Math.max(1000, this.config.asteroidSpawnInterval - 200);

        // Feedback
        if (window.mateo) {
            window.mateo.speak(`¡Oleada ${this.wave - 1} completada! +${bonus} puntos`);
            window.mateo.showExpression('excited');
        }

        if (window.feedbackSystem) {
            window.feedbackSystem.showConfetti();
        }

        this.updateUI();

        console.log(`🌊 Oleada ${this.wave} iniciada`);
    }

    // ================================
    // FIN DEL JUEGO
    // ================================

    gameOver() {
        this.stop();

        // Mostrar modal de resultados
        this.showResults();

        console.log(`💀 Game Over - Puntaje final: ${this.score}`);
    }

    showResults() {
        // Guardar estadísticas
        if (window.app && window.app.player) {
            window.app.player.stats.shipDefenseScore = Math.max(
                window.app.player.stats.shipDefenseScore || 0,
                this.score
            );
        }

        // Mostrar modal (similar a otros modos)
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content results-modal">
                <h2>🛸 MISIÓN TERMINADA</h2>
                <div class="results-stats">
                    <div class="stat-item">
                        <span class="stat-label">Puntaje Final</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Oleadas Completadas</span>
                        <span class="stat-value">${this.wave - 1}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Asteroides Destruidos</span>
                        <span class="stat-value">${this.asteroidsDestroyed}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="window.shipDefense.restart()">🔄 Reintentar</button>
                    <button class="btn-secondary" onclick="window.shipDefense.exit()">🏠 Menú Principal</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    restart() {
        // Cerrar modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }

        // Reiniciar juego
        this.start(this.selectedTable);
    }

    exit() {
        // Cerrar modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }

        // Volver al menú principal
        if (window.app) {
            window.app.showScreen('mainScreen');
        }
    }

    stop() {
        this.isActive = false;

        // Limpiar intervalos
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }

        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }

        // Limpiar asteroides
        this.asteroids.forEach(asteroid => {
            this.removeAsteroid(asteroid.id);
        });
        this.asteroids = [];

        console.log('🛸 Defensa de Nave detenida');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.shipDefense = new ShipDefenseEngine();

console.log('🛸 Ship Defense Engine cargado y listo');
