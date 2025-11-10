// ================================
// TECLADO NUMÉRICO ADAPTATIVO
// Componente reutilizable para modos de recordación pura
// ================================

class NumericKeyboard {
    constructor() {
        this.value = '';
        this.maxDigits = 3; // Máximo 3 dígitos (hasta 12×12 = 144)
        this.onSubmit = null; // Callback cuando se presiona Enter
        this.onChange = null; // Callback cuando cambia el valor

        this.keyboard = null;
        this.display = null;

        this.createKeyboard();
        console.log('⌨️ Teclado Numérico Adaptativo inicializado');
    }

    // =============================
    // CREAR TECLADO
    // =============================

    createKeyboard() {
        // Crear contenedor del teclado
        this.keyboard = document.createElement('div');
        this.keyboard.id = 'numericKeyboard';
        this.keyboard.className = 'numeric-keyboard hidden';

        this.keyboard.innerHTML = `
            <div class="keyboard-display">
                <div class="keyboard-value" id="keyboardValue">_</div>
            </div>
            <div class="keyboard-grid">
                <button class="key-btn" data-value="7">7</button>
                <button class="key-btn" data-value="8">8</button>
                <button class="key-btn" data-value="9">9</button>

                <button class="key-btn" data-value="4">4</button>
                <button class="key-btn" data-value="5">5</button>
                <button class="key-btn" data-value="6">6</button>

                <button class="key-btn" data-value="1">1</button>
                <button class="key-btn" data-value="2">2</button>
                <button class="key-btn" data-value="3">3</button>

                <button class="key-btn key-backspace" data-action="backspace">
                    <span class="key-icon">←</span>
                </button>
                <button class="key-btn" data-value="0">0</button>
                <button class="key-btn key-enter" data-action="enter">
                    <span class="key-icon">✓</span>
                </button>
            </div>
        `;

        document.body.appendChild(this.keyboard);

        this.display = document.getElementById('keyboardValue');

        this.setupEventListeners();
    }

    // =============================
    // EVENT LISTENERS
    // =============================

    setupEventListeners() {
        // Click en teclas
        this.keyboard.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                if (window.soundSystem) {
                    window.soundSystem.playClick();
                }

                const value = btn.dataset.value;
                const action = btn.dataset.action;

                if (value) {
                    this.addDigit(value);
                } else if (action === 'backspace') {
                    this.backspace();
                } else if (action === 'enter') {
                    this.submit();
                }
            });
        });

        // Prevenir teclado físico cuando el teclado virtual está visible
        document.addEventListener('keydown', (e) => {
            if (!this.keyboard.classList.contains('hidden')) {
                // Solo permitir estas teclas
                if (e.key >= '0' && e.key <= '9') {
                    e.preventDefault();
                    this.addDigit(e.key);
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    this.backspace();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submit();
                }
            }
        });
    }

    // =============================
    // MÉTODOS DE ENTRADA
    // =============================

    addDigit(digit) {
        if (this.value.length < this.maxDigits) {
            this.value += digit;
            this.updateDisplay();

            if (this.onChange) {
                this.onChange(this.value);
            }
        }
    }

    backspace() {
        if (this.value.length > 0) {
            this.value = this.value.slice(0, -1);
            this.updateDisplay();

            if (this.onChange) {
                this.onChange(this.value);
            }
        }
    }

    submit() {
        if (this.value.length > 0 && this.onSubmit) {
            const numericValue = parseInt(this.value, 10);
            this.onSubmit(numericValue);
        }
    }

    // =============================
    // MÉTODOS PÚBLICOS
    // =============================

    show() {
        this.keyboard.classList.remove('hidden');
    }

    hide() {
        this.keyboard.classList.add('hidden');
    }

    clear() {
        this.value = '';
        this.updateDisplay();
    }

    getValue() {
        return this.value.length > 0 ? parseInt(this.value, 10) : null;
    }

    setValue(value) {
        this.value = value.toString();
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.value || '_';
            this.display.classList.toggle('has-value', this.value.length > 0);
        }
    }

    // =============================
    // SETTERS DE CALLBACKS
    // =============================

    setOnSubmit(callback) {
        this.onSubmit = callback;
    }

    setOnChange(callback) {
        this.onChange = callback;
    }

    // =============================
    // UTILIDADES
    // =============================

    enable() {
        this.keyboard.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    disable() {
        this.keyboard.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    shake() {
        this.keyboard.classList.add('shake');
        setTimeout(() => {
            this.keyboard.classList.remove('shake');
        }, 500);
    }

    flash(color = 'correct') {
        this.display.classList.add(`flash-${color}`);
        setTimeout(() => {
            this.display.classList.remove(`flash-${color}`);
        }, 300);
    }
}

// Instanciar globalmente
window.numericKeyboard = new NumericKeyboard();
