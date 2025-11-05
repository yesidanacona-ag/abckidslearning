// ================================
// TRUCOS MNEMOTÉCNICOS - MULTIPLICAR MÁGICO
// Consejos y trucos para cada tabla
// ================================

const mnemonicTricks = {
    2: {
        title: "Tabla del 2 - ¡El Doble!",
        emoji: "👯",
        color: "#10b981",
        tips: [
            "Es sumar el número 2 veces: 2×5 = 5+5 = 10",
            "Cuenta de 2 en 2: 2, 4, 6, 8, 10...",
            "Todos los resultados son números PARES",
            "¿Cuántas ruedas tienen 3 bicicletas? 3×2 = 6"
        ],
        tricks: [
            { question: "2 × 5", tip: "5 + 5 = 10 🚲🚲", visual: "👫 + 👫 + 👫 + 👫 + 👫 = 10 personas" },
            { question: "2 × 8", tip: "8 + 8 = 16 👟👟", visual: "4 personas tienen 8 pies" },
            { question: "2 × 9", tip: "9 + 9 = 18 🖐🖐", visual: "Dos manos con dedos extras" }
        ]
    },

    3: {
        title: "Tabla del 3 - ¡El Triángulo!",
        emoji: "🔺",
        color: "#3b82f6",
        tips: [
            "Suma el número 3 veces: 3×4 = 4+4+4 = 12",
            "Cuenta de 3 en 3: 3, 6, 9, 12, 15...",
            "Los triángulos tienen 3 lados 🔺",
            "Si sumas los dígitos del resultado y el resultado es 3, 6 o 9, ¡es divisible por 3!"
        ],
        tricks: [
            { question: "3 × 3", tip: "Una cuadrícula de 3×3 = 9 cuadros 📦", visual: "🔲🔲🔲\n🔲🔲🔲\n🔲🔲🔲" },
            { question: "3 × 6", tip: "3 cajas de 6 huevos = 18 huevos 🥚", visual: "🥚🥚🥚🥚🥚🥚 × 3 = 18" },
            { question: "3 × 9", tip: "27 = 2+7 = 9 (suma de dígitos)", visual: "✨ Truco mágico del 3" }
        ]
    },

    4: {
        title: "Tabla del 4 - ¡El Cuadrado!",
        emoji: "🟦",
        color: "#8b5cf6",
        tips: [
            "Es el DOBLE del doble: 4×5 = (5+5)+(5+5) = 20",
            "Todos los autos tienen 4 ruedas 🚗",
            "Cuenta de 4 en 4: 4, 8, 12, 16, 20...",
            "Los cuadrados tienen 4 lados iguales 🟦"
        ],
        tricks: [
            { question: "4 × 4", tip: "Un cuadrado 4×4 = 16 cuadros", visual: "🟦🟦🟦🟦 = 16 en total" },
            { question: "4 × 5", tip: "5 autos = 20 ruedas 🚗", visual: "🚗🚗🚗🚗🚗 = 20 ruedas" },
            { question: "4 × 8", tip: "Doble de 8 = 16, y otro doble = 32", visual: "8 → 16 → 32" }
        ]
    },

    5: {
        title: "Tabla del 5 - ¡La Mano!",
        emoji: "🖐",
        color: "#f59e0b",
        tips: [
            "¡LA MÁS FÁCIL! Cuenta tus dedos 🖐",
            "Todos terminan en 5 o en 0",
            "5×número par = termina en 0",
            "5×número impar = termina en 5"
        ],
        tricks: [
            { question: "5 × 6", tip: "6 manos = 30 dedos 🖐🖐🖐🖐🖐🖐", visual: "Par → termina en 0" },
            { question: "5 × 7", tip: "7 manos = 35 dedos 🖐", visual: "Impar → termina en 5" },
            { question: "5 × 9", tip: "45 = casi 50 (10 dedos menos 5)", visual: "5 × 10 = 50, luego resta 5" }
        ]
    },

    6: {
        title: "Tabla del 6 - ¡La Media Docena!",
        emoji: "🥚",
        color: "#ec4899",
        tips: [
            "Medio cartón de huevos = 6 huevos 🥚",
            "6 es 5 + 1: Si sabes el 5, suma el número una vez más",
            "6×4 = 24 (dos docenas = 24 huevos)",
            "Los números pares × 6 terminan en el mismo dígito: 6×2=12, 6×4=24, 6×6=36, 6×8=48"
        ],
        tricks: [
            { question: "6 × 5", tip: "5×5=25, luego suma 5 más = 30", visual: "25 + 5 = 30" },
            { question: "6 × 6", tip: "Una caja de 36 huevos 🥚", visual: "6 filas de 6 = 36" },
            { question: "6 × 8", tip: "48 = casi 50 (fácil de recordar)", visual: "6×8 = 🔢48" }
        ]
    },

    7: {
        title: "Tabla del 7 - ¡La Semana!",
        emoji: "📅",
        color: "#06b6d4",
        tips: [
            "7 días tiene la semana 📅",
            "¡LA MÁS DIFÍCIL! Pero con práctica se domina",
            "7×8=56 es la más olvidada (5-6-7-8 en secuencia)",
            "Cuenta de 7 en 7: 7, 14, 21, 28, 35..."
        ],
        tricks: [
            { question: "7 × 7", tip: "49 = 7×7 (¡cuadrado perfecto!) 🟦", visual: "Una semana tiene 7 días × 7 = 49" },
            { question: "7 × 8", tip: "56 = 5-6-7-8 (números en secuencia)", visual: "5️⃣6️⃣ = 7️⃣×8️⃣" },
            { question: "7 × 9", tip: "63 = 9×7 (voltea los números)", visual: "7×9 o 9×7 = 63" }
        ]
    },

    8: {
        title: "Tabla del 8 - ¡El Doble del 4!",
        emoji: "🕷",
        color: "#ef4444",
        tips: [
            "Es el DOBLE del 4: Si sabes 4×6=24, entonces 8×6=48",
            "Las arañas tienen 8 patas 🕷",
            "Cuenta de 8 en 8: 8, 16, 24, 32, 40...",
            "8×8=64 (como 8 veces 8 autos con 8 ruedas cada uno)"
        ],
        tricks: [
            { question: "8 × 5", tip: "Doble de 4×5=20 → 40", visual: "20 + 20 = 40" },
            { question: "8 × 7", tip: "56 = 8×7 (7×8 volteado)", visual: "5-6-7-8 en secuencia" },
            { question: "8 × 8", tip: "64 = El cuadrado del 8 🟦", visual: "8 filas × 8 columnas" }
        ]
    },

    9: {
        title: "Tabla del 9 - ¡El Truco de los Dedos!",
        emoji: "🖐",
        color: "#a855f7",
        tips: [
            "¡TRUCO MÁGICO! 9×5: Baja el 5to dedo. A la izquierda (4) y derecha (5) = 45 🖐",
            "La suma de los dígitos SIEMPRE da 9: 9×7=63 → 6+3=9 ✨",
            "9 es casi 10: 9×5 = (10×5) - 5 = 50 - 5 = 45",
            "El primer dígito siempre es uno menos: 9×6=54 (5 es 6-1)"
        ],
        tricks: [
            { question: "9 × 5", tip: "45: Baja el 5to dedo 🖐 = 4 a la izq, 5 a la der", visual: "🖐⬇🖐 = 45" },
            { question: "9 × 6", tip: "54: 5 es (6-1), y 5+4=9 ✨", visual: "6-1=5, luego 54" },
            { question: "9 × 9", tip: "81: 8 es (9-1), y 8+1=9 ✨", visual: "9-1=8, luego 81" }
        ]
    },

    10: {
        title: "Tabla del 10 - ¡La Más Fácil!",
        emoji: "🔟",
        color: "#10b981",
        tips: [
            "¡LA MÁS FÁCIL DE TODAS! Solo agrega un 0",
            "10×5 = 50 (cinco con un cero)",
            "Tenemos 10 dedos en total (manos + pies)",
            "Sistema decimal: todo gira alrededor del 10"
        ],
        tricks: [
            { question: "10 × 6", tip: "60 = 6 con un 0 al final", visual: "6 → 60 ✨" },
            { question: "10 × 8", tip: "80 = 8 con un 0 al final", visual: "8 → 80 ✨" },
            { question: "10 × 10", tip: "100 = ¡UNA CENTENA! 💯", visual: "1 seguido de dos ceros" }
        ]
    }
};

// ================================
// SISTEMA DE CONSEJOS INTELIGENTE
// ================================

class MnemonicSystem {
    constructor() {
        this.shownTips = new Set(); // Tips ya mostrados para no repetir
    }

    // Obtener consejo para una tabla específica
    getTipsForTable(table) {
        return mnemonicTricks[table] || null;
    }

    // Obtener un truco específico para una pregunta
    getTrickForQuestion(table, multiplier) {
        const tableData = mnemonicTricks[table];
        if (!tableData) return null;

        const trick = tableData.tricks.find(t =>
            t.question === `${table} × ${multiplier}` ||
            t.question === `${multiplier} × ${table}`
        );

        return trick || null;
    }

    // Obtener un tip aleatorio para una tabla
    getRandomTip(table) {
        const tableData = mnemonicTricks[table];
        if (!tableData || !tableData.tips) return null;

        const availableTips = tableData.tips.filter((tip, index) =>
            !this.shownTips.has(`${table}-${index}`)
        );

        if (availableTips.length === 0) {
            // Si ya mostramos todos, resetear
            this.shownTips.clear();
            return tableData.tips[0];
        }

        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
        const tipIndex = tableData.tips.indexOf(randomTip);
        this.shownTips.add(`${table}-${tipIndex}`);

        return randomTip;
    }

    // Obtener info completa de una tabla (para modal de ayuda)
    getTableInfo(table) {
        return mnemonicTricks[table] || null;
    }

    // Verificar si una tabla tiene trucos disponibles
    hasTricks(table) {
        return mnemonicTricks.hasOwnProperty(table);
    }

    // Obtener todas las tablas con trucos
    getAllTables() {
        return Object.keys(mnemonicTricks).map(Number);
    }
}

// ================================
// CREAR INSTANCIA GLOBAL
// ================================
window.mnemonicSystem = new MnemonicSystem();

console.log('📚 Sistema de trucos mnemotécnicos cargado');
