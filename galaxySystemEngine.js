// ================================
// GALAXIA DEL DOMINIO
// Sistema solar interactivo que visualiza el progreso
// ================================

class GalaxySystemEngine {
    constructor(canvasId) {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                console.error('❌ Canvas no encontrado:', canvasId);
                this.hasError = true;
                return;
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('❌ No se pudo obtener contexto 2D del canvas');
                this.hasError = true;
                return;
            }

            this.hasError = false;

            // Dimensiones
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;
        } catch (error) {
            console.error('❌ Error al inicializar GalaxySystemEngine:', error);
            this.hasError = true;
        }

        // Sol central
        this.sun = {
            x: this.centerX,
            y: this.centerY,
            radius: 40,
            pulsePhase: 0
        };

        // Planetas (uno por tabla 2-10)
        this.planets = this.createPlanets();

        // Nave Nodriza
        this.motherShip = {
            x: 100,
            y: 100,
            size: 40,
            angle: 0
        };

        // Cometa de racha
        this.streakComet = {
            angle: 0,
            distance: 120,
            streak: 0
        };

        // Partículas decorativas
        this.stars = this.createStars(100);

        // Interacción
        this.hoveredPlanet = null;
        this.selectedPlanet = null;

        // Animación
        this.animationFrame = 0;
        this.isRunning = false;

        this.setupEvents();
    }

    createPlanets() {
        const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        const planets = [];

        tables.forEach((table, index) => {
            const angle = (index / tables.length) * Math.PI * 2;
            const distance = 150 + (index % 3) * 40; // Órbitas variadas

            planets.push({
                table: table,
                name: `Planeta del ${table}`,
                angle: angle,
                baseDistance: distance,
                distance: distance,
                orbitSpeed: 0.0005 + (index * 0.0001),
                radius: 25,
                mastery: 0, // 0-100
                hoverScale: 1,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });

        return planets;
    }

    createStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                brightness: Math.random(),
                twinkleSpeed: 0.02 + Math.random() * 0.03
            });
        }
        return stars;
    }

    // =============================
    // ACTUALIZACIÓN DE DATOS
    // =============================

    updateMasteryData(tableMastery) {
        // tableMastery = { 2: 41, 3: 80, 7: 10, ... }
        this.planets.forEach(planet => {
            planet.mastery = tableMastery[planet.table] || 0;
        });
    }

    updateStats(stats) {
        // stats = { totalQuestions, correctAnswers, accuracy, bestStreak }
        this.motherShip.totalQuestions = stats.totalQuestions || 0;
        this.motherShip.correctAnswers = stats.correctAnswers || 0;
        this.motherShip.accuracy = stats.accuracy || 0;
        this.streakComet.streak = stats.bestStreak || 0;
    }

    // =============================
    // RENDERIZADO
    // =============================

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        this.animationFrame++;
        this.update();
        this.render();

        requestAnimationFrame(() => this.animate());
    }

    update() {
        // Actualizar ángulos de órbita
        this.planets.forEach(planet => {
            planet.angle += planet.orbitSpeed;
            planet.pulsePhase += 0.05;
        });

        // Actualizar sol
        this.sun.pulsePhase += 0.02;

        // Actualizar cometa
        this.streakComet.angle += 0.01;

        // Actualizar nave
        this.motherShip.angle += 0.005;

        // Actualizar estrellas (twinkle)
        this.stars.forEach(star => {
            star.brightness += Math.sin(this.animationFrame * star.twinkleSpeed) * 0.01;
            star.brightness = Math.max(0.3, Math.min(1, star.brightness));
        });
    }

    render() {
        try {
            // Validar que tenemos contexto
            if (!this.ctx || this.hasError) {
                console.warn('⚠️ No se puede renderizar: contexto no disponible');
                return;
            }

            // Fondo espacial
            this.ctx.fillStyle = '#0a0e27';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Estrellas de fondo
            this.renderStars();

            // Órbitas (líneas sutiles)
            this.renderOrbits();

            // Sol central
            this.renderSun();

            // Planetas
            this.renderPlanets();

            // Nave Nodriza
            this.renderMotherShip();

            // Cometa de racha
            this.renderStreakComet();

            // Tooltip si hover
            if (this.hoveredPlanet) {
                this.renderTooltip(this.hoveredPlanet);
            }
        } catch (error) {
            console.error('❌ Error en render():', error);
            this.handleRenderError(error);
        }
    }

    renderStars() {
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    renderOrbits() {
        const uniqueDistances = [...new Set(this.planets.map(p => p.baseDistance))];

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        uniqueDistances.forEach(distance => {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, distance, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    renderSun() {
        const pulse = Math.sin(this.sun.pulsePhase) * 5;
        const radius = this.sun.radius + pulse;

        // Glow exterior
        const gradient = this.ctx.createRadialGradient(
            this.sun.x, this.sun.y, 0,
            this.sun.x, this.sun.y, radius * 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 180, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.sun.x, this.sun.y, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Sol central
        const sunGradient = this.ctx.createRadialGradient(
            this.sun.x, this.sun.y, 0,
            this.sun.x, this.sun.y, radius
        );
        sunGradient.addColorStop(0, '#fff5e6');
        sunGradient.addColorStop(0.7, '#ffcc00');
        sunGradient.addColorStop(1, '#ff9900');

        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.sun.x, this.sun.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Texto central
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('☀️', this.sun.x, this.sun.y);
    }

    renderPlanets() {
        this.planets.forEach(planet => {
            // Calcular posición
            const x = this.centerX + Math.cos(planet.angle) * planet.distance;
            const y = this.centerY + Math.sin(planet.angle) * planet.distance;

            // Escala de hover
            const scale = planet.hoverScale;
            const radius = planet.radius * scale;

            // Determinar apariencia según mastery
            const appearance = this.getPlanetAppearance(planet.mastery);

            // Glow si dominado
            if (planet.mastery >= 100) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = appearance.glowColor;
            }

            // Dibujar planeta
            if (planet.mastery >= 100) {
                this.renderCrystalStar(x, y, radius, planet.pulsePhase);
            } else {
                this.renderPlanetBody(x, y, radius, appearance, planet.mastery);
            }

            // Reset shadow
            this.ctx.shadowBlur = 0;

            // Número de tabla
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(planet.table, x, y);

            // Porcentaje debajo
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText(planet.mastery + '%', x, y + radius + 15);
        });
    }

    getPlanetAppearance(mastery) {
        if (mastery >= 100) {
            return {
                type: 'crystal_star',
                color1: '#FFD700',
                color2: '#FFA500',
                glowColor: '#FFD700'
            };
        } else if (mastery >= 91) {
            return {
                type: 'ringed',
                color1: '#4ECDC4',
                color2: '#44A08D',
                glowColor: '#4ECDC4'
            };
        } else if (mastery >= 51) {
            return {
                type: 'vibrant',
                color1: '#10B981',
                color2: '#059669'
            };
        } else if (mastery >= 21) {
            return {
                type: 'young',
                color1: '#F59E0B',
                color2: '#D97706'
            };
        } else {
            return {
                type: 'asteroid',
                color1: '#6B7280',
                color2: '#4B5563'
            };
        }
    }

    renderPlanetBody(x, y, radius, appearance, mastery) {
        // Gradiente según tipo
        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, appearance.color1);
        gradient.addColorStop(1, appearance.color2);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Detalles según tipo
        if (appearance.type === 'vibrant') {
            // Continentes/océanos
            this.ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x + radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (appearance.type === 'young') {
            // Nubes/atmósfera
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.9, 0, Math.PI);
            this.ctx.stroke();
        } else if (appearance.type === 'asteroid') {
            // Cráteres
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x + radius * 0.3, y, radius * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x - radius * 0.2, y + radius * 0.3, radius * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Anillos si >= 91%
        if (mastery >= 91 && mastery < 100) {
            this.ctx.strokeStyle = appearance.glowColor;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, radius * 1.5, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }

    renderCrystalStar(x, y, radius, pulsePhase) {
        const pulse = Math.sin(pulsePhase) * 5;
        const r = radius + pulse;

        // Estrella de 8 puntas
        const spikes = 8;
        const innerRadius = r * 0.5;

        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();

        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? r : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }

        this.ctx.closePath();
        this.ctx.fill();

        // Brillo central
        const centerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, r * 0.5);
        centerGradient.addColorStop(0, '#FFF');
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderMotherShip() {
        const x = this.motherShip.x;
        const y = this.motherShip.y;
        const size = this.motherShip.size;

        // Nave triangular
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.motherShip.angle);

        // Cuerpo
        this.ctx.fillStyle = '#6366F1';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size / 2);
        this.ctx.lineTo(-size / 3, size / 2);
        this.ctx.lineTo(size / 3, size / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Ventana
        this.ctx.fillStyle = '#60A5FA';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();

        // Emoji nave
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚀', x, y);
    }

    renderStreakComet() {
        if (this.streakComet.streak === 0) return;

        const angle = this.streakComet.angle;
        const distance = this.streakComet.distance;
        const x = this.motherShip.x + Math.cos(angle) * distance;
        const y = this.motherShip.y + Math.sin(angle) * distance;

        // Color según racha
        const color = this.streakComet.streak >= 10 ? '#FF6B6B' : '#FFA500';

        // Cabeza del cometa
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Cola
        const tailLength = 30;
        const gradient = this.ctx.createLinearGradient(
            x, y,
            x - Math.cos(angle) * tailLength,
            y - Math.sin(angle) * tailLength
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - Math.cos(angle) * tailLength,
            y - Math.sin(angle) * tailLength
        );
        this.ctx.stroke();

        // Emoji cometa
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('☄️', x, y);
    }

    renderTooltip(planet) {
        const x = this.centerX + Math.cos(planet.angle) * planet.distance;
        const y = this.centerY + Math.sin(planet.angle) * planet.distance;

        const tooltipX = x + 40;
        const tooltipY = y - 40;

        // Fondo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(tooltipX, tooltipY, 150, 60);

        // Texto
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(planet.name, tooltipX + 10, tooltipY + 20);

        this.ctx.font = '12px Arial';
        const status = this.getPlanetStatus(planet.mastery);
        this.ctx.fillStyle = status.color;
        this.ctx.fillText(`${status.emoji} ${status.text}`, tooltipX + 10, tooltipY + 40);
    }

    getPlanetStatus(mastery) {
        if (mastery >= 100) return { emoji: '⭐', text: 'Dominado', color: '#FFD700' };
        if (mastery >= 91) return { emoji: '💫', text: 'Casi Perfecto', color: '#4ECDC4' };
        if (mastery >= 51) return { emoji: '🌍', text: 'Vibrante', color: '#10B981' };
        if (mastery >= 21) return { emoji: '🌑', text: 'En Formación', color: '#F59E0B' };
        return { emoji: '☄️', text: 'Inexplorado', color: '#6B7280' };
    }

    // =============================
    // INTERACCIÓN
    // =============================

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let hovering = false;

        this.planets.forEach(planet => {
            const x = this.centerX + Math.cos(planet.angle) * planet.distance;
            const y = this.centerY + Math.sin(planet.angle) * planet.distance;

            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

            if (distance < planet.radius) {
                planet.hoverScale = 1.2;
                this.hoveredPlanet = planet;
                hovering = true;
                this.canvas.style.cursor = 'pointer';
            } else {
                planet.hoverScale = 1;
            }
        });

        if (!hovering) {
            this.hoveredPlanet = null;
            this.canvas.style.cursor = 'default';
        }
    }

    handleClick(e) {
        if (this.hoveredPlanet) {
            this.onPlanetClick(this.hoveredPlanet);
        }
    }

    onPlanetClick(planet) {
        // Callback para abrir modal
        console.log('Planeta clickeado:', planet);
    }

    // =============================
    // ERROR HANDLING
    // =============================

    handleRenderError(error) {
        console.error('🔴 Error crítico en renderizado de galaxia:', error);
        this.hasError = true;
        this.isRunning = false;

        // Intentar mostrar mensaje al usuario
        if (this.ctx) {
            try {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#FF0000';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Error al mostrar la galaxia', this.width / 2, this.height / 2);
                this.ctx.fillText('Por favor recarga la página', this.width / 2, this.height / 2 + 30);
            } catch (e) {
                console.error('❌ No se pudo mostrar mensaje de error:', e);
            }
        }
    }
}

// Exportar
window.GalaxySystemEngine = GalaxySystemEngine;
