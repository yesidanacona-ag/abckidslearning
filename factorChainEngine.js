// ================================
// CADENA DE FACTORES - FACTOR CHAIN PUZZLE
// Descompone números en sus factores multiplicativos
// ================================

class FactorChainEngine {
    constructor() {
        this.isActive = false;
        this.targetNumber = null;
        this.factorChain = [];
        this.score = 0;
        this.level = 1;
        this.factorsFound = 0;
        this.hints = 3;

        // Números primos hasta 20
        this.primes = [2, 3, 5, 7, 11, 13, 17, 19];

        console.log('🧩 Motor de Cadena de Factores inicializado');
    }

    // ================================
    // INICIAR JUEGO
    // ================================

    start(startLevel = 1) {
        this.level = startLevel;
        this.score = 0;
        this.isActive = true;

        this.showScreen();
        this.startLevel();

        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        console.log(`🧩 Cadena de Factores iniciada - Nivel ${this.level}`);
    }

    showScreen() {
        if (window.app) {
            window.app.showScreen('factorChainScreen');
        }
    }

    startLevel() {
        // Generar número objetivo según nivel
        this.targetNumber = this.generateTargetNumber(this.level);
        this.factorChain = [this.targetNumber];
        this.factorsFound = 0;
        this.hints = 3;

        this.updateUI();
        this.renderChain();
        this.generateDivisorOptions();

        // Mateo da instrucciones
        if (window.mateo && this.level === 1) {
            window.mateo.show('happy');
            window.mateo.speak('¡Encuentra los factores del número! 🧩', 3000);
        }
    }

    generateTargetNumber(level) {
        // Generar números con complejidad creciente
        let number;

        if (level <= 3) {
            // Niveles fáciles: números hasta 50 con 2-3 factores
            const options = [12, 18, 24, 30, 36, 40, 45, 48];
            number = options[Math.floor(Math.random() * options.length)];
        } else if (level <= 6) {
            // Niveles medios: números hasta 100 con más factores
            const options = [60, 72, 80, 84, 90, 96, 100];
            number = options[Math.floor(Math.random() * options.length)];
        } else if (level <= 10) {
            // Niveles avanzados: números más complejos
            const options = [120, 144, 150, 180, 200, 240];
            number = options[Math.floor(Math.random() * options.length)];
        } else {
            // Niveles expertos: números grandes
            number = 100 + Math.floor(Math.random() * 200);
            // Asegurar que sea divisible por algo
            if (number % 2 !== 0 && number % 3 !== 0 && number % 5 !== 0) {
                number = number + 1;
            }
        }

        return number;
    }

    // ================================
    // UI Y RENDERIZADO
    // ================================

    updateUI() {
        // Actualizar número objetivo
        const targetEl = document.getElementById('factorTarget');
        if (targetEl) {
            targetEl.textContent = this.targetNumber;
        }

        // Actualizar score
        const scoreEl = document.getElementById('factorScore');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }

        // Actualizar nivel
        const levelEl = document.getElementById('factorLevel');
        if (levelEl) {
            levelEl.textContent = this.level;
        }

        // Actualizar hints
        const hintsEl = document.getElementById('factorHints');
        if (hintsEl) {
            hintsEl.textContent = '💡'.repeat(this.hints);
        }
    }

    renderChain() {
        const chainContainer = document.getElementById('factorChainContainer');
        if (!chainContainer) return;

        chainContainer.innerHTML = '';

        // Mostrar cadena de factores
        this.factorChain.forEach((factor, index) => {
            const factorEl = document.createElement('div');
            factorEl.className = 'factor-node';

            // Marcar como primo si es primo
            if (this.isPrime(factor)) {
                factorEl.classList.add('prime-factor');
            }

            // Marcar como activo si es el último (seleccionable)
            if (index === this.factorChain.length - 1 && factor > 1 && !this.isPrime(factor)) {
                factorEl.classList.add('active-factor');
                factorEl.setAttribute('data-factor', factor);
                factorEl.style.cursor = 'pointer';
            }

            factorEl.innerHTML = `
                <div class="factor-value">${factor}</div>
                ${this.isPrime(factor) ? '<div class="factor-badge">Primo</div>' : ''}
            `;

            chainContainer.appendChild(factorEl);

            // Agregar símbolo × entre factores
            if (index < this.factorChain.length - 1) {
                const multiplySymbol = document.createElement('div');
                multiplySymbol.className = 'factor-multiply';
                multiplySymbol.textContent = '×';
                chainContainer.appendChild(multiplySymbol);
            }
        });
    }

    generateDivisorOptions() {
        const currentFactor = this.factorChain[this.factorChain.length - 1];

        // Si es primo o 1, no hay opciones
        if (this.isPrime(currentFactor) || currentFactor === 1) {
            this.checkLevelComplete();
            return;
        }

        const divisors = this.findDivisors(currentFactor);
        const optionsContainer = document.getElementById('divisorOptions');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        // Mezclar divisores y tomar hasta 6
        const shuffled = divisors.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(6, divisors.length));

        selected.forEach(divisor => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'divisor-option';
            optionBtn.textContent = divisor;
            optionBtn.addEventListener('click', () => this.selectDivisor(divisor));
            optionsContainer.appendChild(optionBtn);
        });
    }

    findDivisors(number) {
        const divisors = [];

        // Encontrar todos los divisores excepto 1 y el número mismo
        for (let i = 2; i <= Math.sqrt(number); i++) {
            if (number % i === 0) {
                divisors.push(i);
                if (i !== number / i) {
                    divisors.push(number / i);
                }
            }
        }

        return divisors.sort((a, b) => a - b);
    }

    // ================================
    // LÓGICA DEL JUEGO
    // ================================

    selectDivisor(divisor) {
        const currentFactor = this.factorChain[this.factorChain.length - 1];

        // Verificar si es divisor válido
        if (currentFactor % divisor !== 0) {
            this.handleWrongDivisor();
            return;
        }

        // Divisor correcto
        this.handleCorrectDivisor(divisor, currentFactor);
    }

    handleCorrectDivisor(divisor, currentFactor) {
        const quotient = currentFactor / divisor;

        // Remover el último factor y agregar los dos nuevos
        this.factorChain.pop();
        this.factorChain.push(divisor);
        this.factorChain.push(quotient);

        this.factorsFound++;

        // Puntos
        const points = divisor * 5;
        this.score += points;

        // Bonus si encontró un primo
        if (this.isPrime(divisor)) {
            this.score += 20;
            if (window.feedbackSystem) {
                window.feedbackSystem.showFloatingText('¡Factor Primo! +20', 'bonus');
            }
        }

        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showSuccess();
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playCorrect();
        }

        // Actualizar UI
        this.updateUI();
        this.renderChain();
        this.generateDivisorOptions();

        // Verificar si completó el nivel
        this.checkLevelComplete();
    }

    handleWrongDivisor() {
        // Feedback visual
        if (window.feedbackSystem) {
            window.feedbackSystem.showError();
        }

        // Sonido
        if (window.soundSystem) {
            window.soundSystem.playError();
        }

        // Mateo da feedback
        if (window.mateo) {
            window.mateo.speak('¡Ese no es divisor! Intenta otro', 2000);
            window.mateo.showExpression('sad');
        }
    }

    checkLevelComplete() {
        // Verificar si todos los factores son primos
        const allPrime = this.factorChain.every(factor => this.isPrime(factor) || factor === 1);

        if (allPrime) {
            this.completeLevel();
        }
    }

    completeLevel() {
        // Bonus por completar nivel
        const levelBonus = this.level * 50;
        this.score += levelBonus;

        // Mostrar recompensa épica
        if (window.rewardFlow) {
            window.rewardFlow.show({
                message: `¡Nivel ${this.level} Completado!`,
                items: [
                    {
                        icon: '🧩',
                        value: `Nivel ${this.level}`,
                        label: 'Factorizado'
                    },
                    {
                        icon: '⭐',
                        value: `+${levelBonus}`,
                        label: 'Puntos Bonus'
                    },
                    {
                        icon: '🎯',
                        value: this.factorsFound,
                        label: 'Factores Encontrados'
                    }
                ]
            });
        }

        // Esperar antes de siguiente nivel
        setTimeout(() => {
            this.level++;
            this.startLevel();
        }, 3000);

        // Sonido de victoria
        if (window.soundSystem) {
            window.soundSystem.playSuccess();
        }

        // Mateo celebra
        if (window.mateo) {
            window.mateo.showExpression('excited');
            window.mateo.speak('¡Increíble! ¡Descompusiste el número! 🎉', 3000);
        }

        // Agregar monedas
        if (window.app) {
            window.app.addCoins(levelBonus / 10);
        }

        // Confetti
        if (window.feedbackSystem) {
            window.feedbackSystem.showConfetti();
        }
    }

    // ================================
    // SISTEMA DE PISTAS
    // ================================

    useHint() {
        if (this.hints <= 0) {
            if (window.mateo) {
                window.mateo.speak('No tienes más pistas disponibles', 2000);
            }
            return;
        }

        const currentFactor = this.factorChain[this.factorChain.length - 1];

        if (this.isPrime(currentFactor) || currentFactor === 1) {
            if (window.mateo) {
                window.mateo.speak('Este número ya es primo', 2000);
            }
            return;
        }

        // Encontrar el divisor primo más pequeño
        let smallestPrimeDivisor = null;
        for (let prime of this.primes) {
            if (currentFactor % prime === 0) {
                smallestPrimeDivisor = prime;
                break;
            }
        }

        if (smallestPrimeDivisor) {
            this.hints--;

            if (window.mateo) {
                window.mateo.speak(`Pista: Intenta dividir por ${smallestPrimeDivisor} 💡`, 3000);
                window.mateo.showExpression('happy');
            }

            // Resaltar el botón correcto
            const buttons = document.querySelectorAll('.divisor-option');
            buttons.forEach(btn => {
                if (parseInt(btn.textContent) === smallestPrimeDivisor) {
                    btn.classList.add('hint-highlight');
                    setTimeout(() => {
                        btn.classList.remove('hint-highlight');
                    }, 2000);
                }
            });

            this.updateUI();
        }
    }

    // ================================
    // UTILIDADES
    // ================================

    isPrime(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;

        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }

        return true;
    }

    stop() {
        this.isActive = false;
        console.log('🧩 Cadena de Factores detenida');
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.factorChainEngine = new FactorChainEngine();

console.log('🧩 Motor de Cadena de Factores listo');
