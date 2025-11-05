// ================================
// MOTOR DE JUEGO ESPACIAL INTERACTIVO
// Aventura Espacial con Gameplay Unificado
// ================================

class SpaceGameEngine {
    constructor(canvasId, onCorrectAnswer, onWrongAnswer, onGameOver) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Callbacks
        this.onCorrectAnswer = onCorrectAnswer || (() => {});
        this.onWrongAnswer = onWrongAnswer || (() => {});
        this.onGameOver = onGameOver || (() => {});

        // Estado del juego
        this.isRunning = false;
        this.isPaused = false;
        this.level = 1;
        this.lives = 3;
        this.score = 0;
        this.questionsAnswered = 0;

        // Pregunta actual
        this.currentQuestion = null;

        // Entidades
        this.ship = null;
        this.asteroids = [];
        this.powerups = [];
        this.particles = [];
        this.lasers = [];

        // Configuración
        this.config = {
            shipSpeed: 5,
            asteroidSpeed: 2,
            laserSpeed: 10,
            particleLifetime: 60,
            powerupChance: 0.15,
            difficultyScale: 1.2
        };

        // Estado de entrada
        this.input = {
            mouse: { x: 0, y: 0 },
            touch: { x: 0, y: 0 },
            isTouch: false
        };

        this.setupEventListeners();
        console.log('🚀 Motor de juego espacial inicializado');
    }

    // =============================
    // INICIALIZACIÓN
    // =============================

    init() {
        this.createShip();
        this.lives = 3;
        this.score = 0;
        this.questionsAnswered = 0;
        this.asteroids = [];
        this.powerups = [];
        this.particles = [];
        this.lasers = [];
        this.isRunning = true;
        this.isPaused = false;

        console.log('🎮 Juego inicializado');
    }

    createShip() {
        const shipIcon = window.shopSystem ? window.shopSystem.getEquipped('ship') : '🚀';

        this.ship = {
            x: this.width / 2,
            y: this.height - 100,
            width: 50,
            height: 50,
            icon: shipIcon,
            vx: 0,
            vy: 0,
            shield: false,
            boost: false,
            boostTimer: 0,
            shakeTimer: 0,
            invulnerable: 0
        };
    }

    // =============================
    // GAME LOOP
    // =============================

    start() {
        this.init();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            this.update();
            this.render();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (!this.ship) return;

        // Actualizar nave
        this.updateShip();

        // Actualizar asteroides
        this.updateAsteroids();

        // Actualizar power-ups
        this.updatePowerups();

        // Actualizar láseres
        this.updateLasers();

        // Actualizar partículas
        this.updateParticles();

        // Actualizar timers
        this.updateTimers();

        // Verificar colisiones
        this.checkCollisions();

        // Generar nuevos asteroides si no hay pregunta activa
        if (this.asteroids.length === 0 && this.currentQuestion) {
            this.spawnAsteroids();
        }
    }

    render() {
        // Limpiar canvas
        this.ctx.fillStyle = this.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Renderizar estrellas de fondo
        this.renderStars();

        // Renderizar partículas
        this.particles.forEach(p => this.renderParticle(p));

        // Renderizar láseres
        this.lasers.forEach(l => this.renderLaser(l));

        // Renderizar asteroides
        this.asteroids.forEach(a => this.renderAsteroid(a));

        // Renderizar power-ups
        this.powerups.forEach(p => this.renderPowerup(p));

        // Renderizar nave
        if (this.ship) {
            this.renderShip();
        }

        // Renderizar UI
        this.renderUI();
    }

    // =============================
    // ACTUALIZACIÓN DE ENTIDADES
    // =============================

    updateShip() {
        // Movimiento suave hacia el cursor/touch
        const targetX = this.input.isTouch ? this.input.touch.x : this.input.mouse.x;
        const dx = targetX - this.ship.x;

        this.ship.vx = dx * 0.1;
        this.ship.x += this.ship.vx;

        // Límites de pantalla
        this.ship.x = Math.max(25, Math.min(this.width - 25, this.ship.x));

        // Decrementar timers
        if (this.ship.boostTimer > 0) this.ship.boostTimer--;
        if (this.ship.shakeTimer > 0) this.ship.shakeTimer--;
        if (this.ship.invulnerable > 0) this.ship.invulnerable--;
    }

    updateAsteroids() {
        this.asteroids = this.asteroids.filter(asteroid => {
            // Movimiento
            asteroid.y += asteroid.speed;
            asteroid.rotation += asteroid.rotationSpeed;

            // Eliminar si sale de pantalla
            if (asteroid.y > this.height + 50) {
                return false;
            }

            return true;
        });
    }

    updatePowerups() {
        this.powerups = this.powerups.filter(powerup => {
            // Movimiento
            powerup.y += powerup.speed;
            powerup.rotation += 0.05;

            // Eliminar si sale de pantalla
            if (powerup.y > this.height + 50) {
                return false;
            }

            return true;
        });
    }

    updateLasers() {
        this.lasers = this.lasers.filter(laser => {
            laser.y -= laser.speed;

            // Eliminar si sale de pantalla
            if (laser.y < -10) {
                return false;
            }

            return true;
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / this.config.particleLifetime;

            return particle.life > 0;
        });
    }

    updateTimers() {
        if (this.ship.boostTimer <= 0) {
            this.ship.boost = false;
        }
    }

    // =============================
    // COLISIONES
    // =============================

    checkCollisions() {
        if (!this.ship) return;

        // Colisiones nave-power-ups
        this.powerups.forEach((powerup, index) => {
            if (this.checkCircleCollision(
                this.ship.x, this.ship.y, 25,
                powerup.x, powerup.y, 20
            )) {
                this.collectPowerup(powerup);
                this.powerups.splice(index, 1);
            }
        });

        // Colisiones láser-asteroides
        this.lasers.forEach((laser, laserIndex) => {
            this.asteroids.forEach((asteroid, asteroidIndex) => {
                if (this.checkCircleCollision(
                    laser.x, laser.y, 5,
                    asteroid.x, asteroid.y, asteroid.radius
                )) {
                    // Disparo al asteroide
                    this.hitAsteroid(asteroid);
                    this.lasers.splice(laserIndex, 1);
                    this.asteroids.splice(asteroidIndex, 1);
                }
            });
        });

        // Colisiones nave-asteroides (daño)
        if (this.ship.invulnerable <= 0) {
            this.asteroids.forEach((asteroid, index) => {
                if (this.checkCircleCollision(
                    this.ship.x, this.ship.y, 25,
                    asteroid.x, asteroid.y, asteroid.radius
                )) {
                    if (!this.ship.shield) {
                        this.loseLife();
                        this.ship.invulnerable = 60; // 1 segundo de invulnerabilidad
                    } else {
                        // Escudo bloqueó
                        this.ship.shield = false;
                        this.createExplosion(asteroid.x, asteroid.y, '#4ECDC4');
                    }
                    this.asteroids.splice(index, 1);
                }
            });
        }
    }

    checkCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }

    // =============================
    // SPAWN DE ENTIDADES
    // =============================

    spawnAsteroids() {
        if (!this.currentQuestion) return;

        const { answer, options } = this.currentQuestion;

        options.forEach((value, index) => {
            const x = (this.width / (options.length + 1)) * (index + 1);
            const y = -50 - (index * 100); // Escalonar aparición

            this.asteroids.push({
                x: x,
                y: y,
                radius: 35,
                value: value,
                isCorrect: value === answer,
                speed: this.config.asteroidSpeed * (1 + (this.level * 0.1)),
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                color: value === answer ? '#10B981' : '#94A3B8'
            });
        });

        // Chance de spawn power-up
        if (Math.random() < this.config.powerupChance) {
            this.spawnPowerup();
        }

        console.log(`🌠 ${this.asteroids.length} asteroides spawneados`);
    }

    spawnPowerup() {
        const types = [
            { icon: '❤️', type: 'life', color: '#EF4444' },
            { icon: '🛡️', type: 'shield', color: '#4ECDC4' },
            { icon: '⭐', type: 'points', color: '#FFD700' },
            { icon: '⚡', type: 'boost', color: '#F59E0B' }
        ];

        const powerup = types[Math.floor(Math.random() * types.length)];

        this.powerups.push({
            x: Math.random() * (this.width - 100) + 50,
            y: -50,
            icon: powerup.icon,
            type: powerup.type,
            color: powerup.color,
            speed: 1.5,
            rotation: 0
        });
    }

    // =============================
    // EVENTOS DE JUEGO
    // =============================

    hitAsteroid(asteroid) {
        // Crear explosión
        this.createExplosion(asteroid.x, asteroid.y, asteroid.color);

        // Verificar si es correcto
        if (asteroid.isCorrect) {
            this.handleCorrectHit(asteroid);
        } else {
            this.handleWrongHit(asteroid);
        }
    }

    handleCorrectHit(asteroid) {
        console.log('✅ ¡Asteroide correcto destruido!');

        // Bonus de puntos
        const points = 10 + (this.level * 2);
        this.score += points;
        this.questionsAnswered++;

        // Boost visual
        this.ship.boost = true;
        this.ship.boostTimer = 30;

        // Limpiar asteroides restantes
        this.asteroids = [];

        // Callback que generará la siguiente pregunta en app.js
        console.log('📞 Llamando callback onCorrectAnswer...');
        this.onCorrectAnswer(points);

        // NOTA: app.js se encargará de llamar a setQuestion() con la siguiente pregunta
        // No llamamos a nextQuestion() aquí para evitar race conditions
    }

    handleWrongHit(asteroid) {
        console.log('❌ Asteroide incorrecto');

        // Shake de nave
        this.ship.shakeTimer = 30;

        // Perder vida si no tiene escudo
        if (!this.ship.shield) {
            this.loseLife();
        } else {
            this.ship.shield = false;
        }

        // Callback
        this.onWrongAnswer(asteroid.value, this.currentQuestion.answer);

        // Resaltar asteroide correcto
        this.asteroids.forEach(a => {
            if (a.isCorrect) {
                a.color = '#10B981';
                a.glow = true;
            }
        });

        // Auto-destruir correcto después de 2 segundos
        setTimeout(() => {
            const correctAsteroid = this.asteroids.find(a => a.isCorrect);
            if (correctAsteroid) {
                this.createExplosion(correctAsteroid.x, correctAsteroid.y, '#10B981');
            }
            this.asteroids = [];

            setTimeout(() => {
                this.nextQuestion();
            }, 500);
        }, 2000);
    }

    collectPowerup(powerup) {
        console.log(`💎 Power-up recogido: ${powerup.type}`);

        this.createExplosion(powerup.x, powerup.y, powerup.color);

        switch (powerup.type) {
            case 'life':
                this.lives = Math.min(5, this.lives + 1);
                break;
            case 'shield':
                this.ship.shield = true;
                break;
            case 'points':
                if (window.coinSystem) {
                    window.coinSystem.addStars(10);
                }
                break;
            case 'boost':
                this.ship.boost = true;
                this.ship.boostTimer = 180; // 3 segundos
                break;
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playPowerup();
        }
    }

    loseLife() {
        this.lives--;
        console.log(`💔 Vida perdida. Vidas restantes: ${this.lives}`);

        if (this.lives <= 0) {
            this.gameOver();
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }
    }

    gameOver() {
        this.isRunning = false;
        console.log('💀 Game Over');

        // Callback
        this.onGameOver(this.score, this.questionsAnswered);
    }

    // =============================
    // PREGUNTAS
    // =============================

    setQuestion(table, multiplier, options) {
        this.currentQuestion = {
            table: table,
            multiplier: multiplier,
            answer: table * multiplier,
            options: options
        };

        console.log(`❓ Nueva pregunta: ${table} × ${multiplier} = ${this.currentQuestion.answer}`);
        console.log(`📋 Opciones:`, options);

        this.spawnAsteroids();
    }

    nextQuestion() {
        // Limpiar pregunta actual
        this.currentQuestion = null;

        // La app.js llamará setQuestion con la siguiente pregunta
    }

    // =============================
    // EFECTOS VISUALES
    // =============================

    createExplosion(x, y, color) {
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 3 + 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: this.config.particleLifetime,
                alpha: 1,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    shootLaser(targetX, targetY) {
        if (!this.ship) return;

        this.lasers.push({
            x: this.ship.x,
            y: this.ship.y - 30,
            targetX: targetX,
            targetY: targetY,
            speed: this.config.laserSpeed
        });

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playClick();
        }

        console.log('🔫 Láser disparado');
    }

    // =============================
    // RENDERIZADO
    // =============================

    getBackgroundColor() {
        // Colores de fondo según nivel
        if (this.level <= 3) return '#0F172A'; // Oscuro
        if (this.level <= 6) return '#1E293B'; // Gris oscuro
        if (this.level <= 9) return '#312E81'; // Púrpura
        return '#000000'; // Negro (agujero negro)
    }

    renderStars() {
        // Estrellas estáticas de fondo (simplificado)
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.width; // Patrón pseudo-aleatorio
            const y = (i * 73.3) % this.height;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    renderShip() {
        const ship = this.ship;
        this.ctx.save();

        this.ctx.translate(ship.x, ship.y);

        // Shake effect
        if (ship.shakeTimer > 0) {
            this.ctx.translate(
                Math.sin(ship.shakeTimer * 0.5) * 5,
                Math.cos(ship.shakeTimer * 0.5) * 5
            );
        }

        // Estela si tiene boost
        if (ship.boost) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💨', 0, 20);
            this.ctx.globalAlpha = 1;
        }

        // Escudo
        if (ship.shield) {
            this.ctx.strokeStyle = '#4ECDC4';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 35, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Nave
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Parpadeo si invulnerable
        if (ship.invulnerable > 0 && ship.invulnerable % 10 < 5) {
            this.ctx.globalAlpha = 0.5;
        }

        this.ctx.fillText(ship.icon, 0, 0);

        this.ctx.restore();
    }

    renderAsteroid(asteroid) {
        this.ctx.save();

        this.ctx.translate(asteroid.x, asteroid.y);
        this.ctx.rotate(asteroid.rotation);

        // Glow si es correcto y está resaltado
        if (asteroid.glow) {
            this.ctx.shadowColor = asteroid.color;
            this.ctx.shadowBlur = 20;
        }

        // Círculo del asteroide
        this.ctx.fillStyle = asteroid.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Número de respuesta
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(asteroid.value, 0, 0);

        this.ctx.restore();
    }

    renderPowerup(powerup) {
        this.ctx.save();

        this.ctx.translate(powerup.x, powerup.y);
        this.ctx.rotate(powerup.rotation);

        // Glow
        this.ctx.shadowColor = powerup.color;
        this.ctx.shadowBlur = 15;

        // Ícono
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(powerup.icon, 0, 0);

        this.ctx.restore();
    }

    renderLaser(laser) {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.shadowColor = '#00FF00';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(laser.x - 2, laser.y, 4, 20);
        this.ctx.shadowBlur = 0;
    }

    renderParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        this.ctx.globalAlpha = 1;
    }

    renderUI() {
        // Vidas (en la esquina superior izquierda)
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#EF4444';
        this.ctx.fillText('❤️'.repeat(this.lives), 20, 30);

        // Score (esquina superior derecha)
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`⭐ ${this.score}`, this.width - 20, 30);

        // Pregunta actual (GRANDE Y CENTRADA)
        if (this.currentQuestion) {
            // Fondo semitransparente para la pregunta
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 50, this.width, 80);

            // Borde decorativo
            this.ctx.strokeStyle = '#8B5CF6';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(0, 50, this.width, 80);

            // Texto de la pregunta - MUY GRANDE
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Sombra para el texto
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            // Texto principal
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillText(
                `${this.currentQuestion.table} × ${this.currentQuestion.multiplier} = ?`,
                this.width / 2,
                90
            );

            // Resetear sombra
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Instrucción
            this.ctx.fillStyle = '#A78BFA';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Toca el asteroide con la respuesta correcta', this.width / 2, 140);
        }
    }

    // =============================
    // EVENT LISTENERS
    // =============================

    setupEventListeners() {
        // Click del mouse
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.handleShoot(x, y);
        });

        // Mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = e.clientX - rect.left;
            this.input.mouse.y = e.clientY - rect.top;
            this.input.isTouch = false;
        });

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            this.input.touch.x = x;
            this.input.touch.y = y;
            this.input.isTouch = true;

            this.handleShoot(x, y);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.input.touch.x = touch.clientX - rect.left;
            this.input.touch.y = touch.clientY - rect.top;
            this.input.isTouch = true;
        });

        // Integración con sistema de pausa global
        document.addEventListener('gamePaused', () => {
            this.pause();
        });

        document.addEventListener('gameResumed', () => {
            this.resume();
        });
    }

    handleShoot(x, y) {
        if (!this.isRunning || this.isPaused) return;

        // Verificar si tocó un asteroide
        let hitAsteroid = null;
        this.asteroids.forEach(asteroid => {
            const dx = x - asteroid.x;
            const dy = y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.radius) {
                hitAsteroid = asteroid;
            }
        });

        if (hitAsteroid) {
            // Disparar láser hacia el asteroide
            this.shootLaser(hitAsteroid.x, hitAsteroid.y);

            // Pequeño delay antes de procesar el hit
            setTimeout(() => {
                const index = this.asteroids.indexOf(hitAsteroid);
                if (index !== -1) {
                    this.hitAsteroid(hitAsteroid);
                    this.asteroids.splice(index, 1);
                }
            }, 100);
        }
    }

    // =============================
    // CONTROL
    // =============================

    pause() {
        this.isPaused = true;
        console.log('⏸️ Juego pausado');
    }

    resume() {
        this.isPaused = false;
        console.log('▶️ Juego reanudado');
    }

    stop() {
        this.isRunning = false;
        console.log('⏹️ Juego detenido');
    }
}

// ================================
// EXPORT
// ================================

window.SpaceGameEngine = SpaceGameEngine;

console.log('🚀 Motor de juego espacial cargado');
