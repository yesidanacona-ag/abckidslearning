# MULTIPLICAR MÁGICO - RESUMEN FUNCIONAL
## Aplicación Educativa Gamificada para Aprendizaje de Tablas de Multiplicar

---

## 📋 ÍNDICE

1. [Visión General](#1-visión-general)
2. [Flujo de Usuario](#2-flujo-de-usuario)
3. [Pantallas Principales](#3-pantallas-principales)
4. [Modos de Juego](#4-modos-de-juego)
5. [Sistemas de Progresión](#5-sistemas-de-progresión)
6. [Sistema de Economía](#6-sistema-de-economía)
7. [Sistema de Tienda](#7-sistema-de-tienda)
8. [Sistema de Logros](#8-sistema-de-logros)
9. [Características Especiales](#9-características-especiales)
10. [Sistema Adaptativo](#10-sistema-adaptativo)
11. [Experiencia de Usuario](#11-experiencia-de-usuario)
12. [Arquitectura Técnica](#12-arquitectura-técnica)

---

## 1. VISIÓN GENERAL

### 1.1 Concepto
"Multiplicar Mágico" es una plataforma educativa gamificada diseñada para que niños de 7-12 años aprendan las tablas de multiplicar (2-10) de forma divertida y efectiva a través de:
- **8 modos de juego** diferentes
- **Sistema de progresión** multinivel
- **Aprendizaje adaptativo** basado en IA
- **Economía virtual** con tienda de items
- **Visualización de progreso** tipo sistema solar

### 1.2 Objetivo Pedagógico
Transformar la memorización de tablas de multiplicar en una experiencia de juego donde el niño:
- Practica sin darse cuenta que está estudiando
- Recibe retroalimentación inmediata
- Progresa a su propio ritmo
- Se motiva con recompensas virtuales
- Desarrolla confianza matemática

### 1.3 Público Objetivo
- **Edad:** 7-12 años
- **Nivel:** Primaria (2° a 6° grado)
- **Conocimientos:** Desde principiante hasta avanzado
- **Dispositivos:** Desktop, Tablet, Móvil

---

## 2. FLUJO DE USUARIO

### 2.1 Primera Vez (Onboarding)

```
PASO 1: Pantalla de Bienvenida
┌─────────────────────────────────┐
│  🎮 ¡Bienvenido a              │
│     Multiplicar Mágico!        │
│                                │
│  Nombre: [_____________]       │
│                                │
│  Elige tu avatar:              │
│  [👦] [👧] [🦸] [🧙]          │
│  [🥷] [🤖] [👽] [🐉]          │
│                                │
│     [Comenzar Aventura]        │
└─────────────────────────────────┘
        ↓
PASO 2: Tutorial Interactivo (5 pasos)
        ↓
PASO 3: Pantalla Principal
```

**Categorías de Avatares:**
1. **Personajes:** 👦 Martín, 👧 Sofía
2. **Animales:** 🦊 Zorro, 🐼 Panda, 🦁 León
3. **Fantasía:** 🦸 Superhéroe, 🧙 Mago, 🥷 Ninja
4. **Deportes:** ⚽ Futbolista, 🏀 Basquetbolista

### 2.2 Flujo Normal de Juego

```
Pantalla Principal
    ↓
Seleccionar Modo
    ↓
Configuración (si aplica)
    ↓
Jugar Partida
    ↓
Pantalla de Resultados
    ↓
Recompensas (⭐ Estrellas, 🏆 Trofeos)
    ↓
[Volver] o [Jugar Otro Modo]
```

### 2.3 Ciclo de Progresión

```
Jugar → Ganar Estrellas → Comprar Items
   ↑                            ↓
   └──────── Mejorar Stats ─────┘

Practicar → Dominar Tablas → Desbloquear Planetas
    ↑                              ↓
    └───── Ver Progreso Galaxy ────┘
```

---

## 3. PANTALLAS PRINCIPALES

### 3.1 Pantalla Principal (Main Screen)

**Layout:**
```
┌────────────────────────────────────────────────┐
│ 👦 Martín    Nivel 5 ━━━━━━╸ 450/500 XP      │
│ ⭐ 1,250    🏆 12    🔥 3 días                │
├────────────────────────────────────────────────┤
│                                                │
│  [📚 Práctica]     [⚡ Desafío]              │
│  Adaptativa         Contra el reloj           │
│                                                │
│  [🚀 Aventura]     [🏁 Carrera]              │
│  Espacial          Matemática                 │
│                                                │
│  [👾 Batalla]      [📊 Progreso]             │
│  de Jefes          Mi Galaxy                  │
│                                                │
│  [🛒 Tienda]       [🎯 Misiones]             │
│  Items             Diarias                    │
│                                                │
├────────────────────────────────────────────────┤
│ 🎒 MI EQUIPAMIENTO                            │
│  👦 Martín  🚀 Nave   🏎️ Auto  ⚔️ Espada    │
└────────────────────────────────────────────────┘
```

**Elementos del Header:**
- **Avatar + Nombre:** Personalización visual
- **Nivel + Barra XP:** Progreso general
- **Estrellas:** Moneda principal
- **Trofeos:** Logros conseguidos
- **Racha de Fuego:** Días consecutivos jugando

**Grid de Modos:**
8 tarjetas interactivas con hover effects y descripción breve

**Sección Equipamiento:**
Muestra visualmente los 4 items equipados actualmente

### 3.2 Pantalla de Resultados

**Layout:**
```
┌────────────────────────────────┐
│        🎉 ¡VICTORIA!          │
│                                │
│   Puntuación: 1,250            │
│   Correctas: 18/20  (90%)      │
│   Tiempo: 02:34                │
│   Racha Máxima: 8              │
│                                │
│   RECOMPENSAS:                 │
│   +150 ⭐                      │
│   +1 🏆 (Oro)                 │
│   +200 XP                      │
│                                │
│  [Volver]  [Jugar de Nuevo]   │
└────────────────────────────────┘
```

**Tipos de Resultados:**
- 🎉 Victoria (80%+)
- 😊 Buen Intento (60-79%)
- 😕 Sigue Practicando (<60%)
- 💀 Derrota (Batalla de Jefes)

### 3.3 Pantalla de Progreso (Galaxy)

**Visualización Sistema Solar:**
```
         ⭐
    🌍      ☀️      🔴
  (Tabla 3)  Sol  (Tabla 7)
         🟢
      (Tabla 2)

    🛸 NAVE MADRE
    ⭐ 1,250 Estrellas
    🏆 12 Trofeos
    📊 85% Victoria
    🔥 3 días racha
```

**Estados de Planetas:**
- 🔴 Inexplorado (0-20% maestría)
- 🟡 En Desarrollo (21-50%)
- 🟠 En Progreso (51-90%)
- 🟢 Dominado (91-100%)

**Click en Planeta:**
Abre modal con:
- Estadísticas detalladas de esa tabla
- Recomendaciones
- Botón "Practicar Esta Tabla"

---

## 4. MODOS DE JUEGO

### 4.1 Modo Práctica (📚)

**Características:**
- **Diagnóstico inicial** de 15 preguntas
- **Mapa de dominio** visual por niveles
- **Ritmo libre** sin presión de tiempo
- **Feedback educativo** inmediato
- **Selección de tablas** personalizada

**Flujo:**
```
1. Evaluación Diagnóstica
   ├─ 15 preguntas (todas las tablas)
   ├─ 10 segundos por pregunta
   └─ Resultados por tabla

2. Mapa de Dominio
   ├─ Visualización circular
   ├─ 3 niveles (Básico, Intermedio, Avanzado)
   └─ Recomendación personalizada

3. Selector de Tablas
   ├─ Checkboxes por tabla
   ├─ "Practicar Recomendadas"
   └─ "Practicar Todas"

4. Sesión de Práctica
   ├─ Sin tiempo límite
   ├─ Retroalimentación inmediata
   ├─ Trucos mnemotécnicos accesibles
   └─ Mateo da consejos
```

**Pantalla de Juego:**
```
┌──────────────────────────────────┐
│  Pregunta 5/20      📚 Práctica  │
├──────────────────────────────────┤
│                                  │
│        7 × 8 = ?                 │
│                                  │
│    [  54  ]    [  56  ]         │
│    [  63  ]    [  48  ]         │
│                                  │
│  💡 Pista  📚 Trucos  ⏭️ Saltar │
│                                  │
│  Correctas: 4/5  ⭐ 40           │
└──────────────────────────────────┘
```

### 4.2 Desafío Rápido (⚡)

**Mecánica:**
- **60 segundos** de tiempo límite
- **Sistema de Combos** (multiplicador)
- **Modo Fuego** activable (5 seguidas)
- **Leaderboard** de puntuación
- **Dificultad progresiva**

**Sistema de Puntuación:**
```
Respuesta Correcta Base: +100 puntos

MULTIPLICADORES:
- Combo x2 (3 seguidas): +200
- Combo x3 (5 seguidas): +300
- Combo x4 (7 seguidas): +400
- Modo Fuego activo: x2 adicional

BONUS:
- Velocidad (<3s): +50
- Perfección (sin errores): +500
```

**Modo Fuego:**
```
ACTIVACIÓN: 5 respuestas correctas consecutivas
DURACIÓN: 30 segundos
EFECTO: Puntos x2, overlay de llamas
VISUAL: Bordes con efecto fuego
```

**Pantalla:**
```
┌──────────────────────────────────┐
│  ⏱️ 0:42    COMBO x3    🔥 ON   │
│  Score: 2,450                    │
├──────────────────────────────────┤
│                                  │
│         9 × 6 = ?                │
│                                  │
│     [54]  [56]  [63]  [48]      │
│                                  │
│  ━━━━━━━━━━━━━━ 70% ━━━━━       │
│                                  │
│  ✓ 12  ✗ 2  🔥 8 racha          │
└──────────────────────────────────┘
```

### 4.3 Aventura Espacial (🚀)

**Descripción:**
Juego tipo "Space Shooter" donde el jugador debe disparar al asteroide con la respuesta correcta.

**Mecánica:**
1. Nave del jugador en la parte inferior
2. Pregunta mostrada arriba (ej: "7 × 8 = ?")
3. Asteroides caen con números (opciones)
4. Jugador dispara al asteroide correcto
5. Power-ups aparecen aleatoriamente

**Controles:**
- **Ratón:** Mover nave
- **Click:** Disparar
- **Teclado:** A/D mover, Espacio disparar

**Power-ups:**
```
❤️ VIDA EXTRA
   - +1 vida
   - Máximo 5 vidas

🛡️ ESCUDO
   - Inmunidad temporal 5s
   - Brilla con aura azul

⭐ PUNTOS
   - +50 puntos instantáneos
   - Efecto de estrellas

⚡ BOOST
   - Velocidad +50% por 8s
   - Estela de luz
```

**Vidas:**
- Inicial: 3 ❤️❤️❤️
- Pierde 1 por error
- Game Over a 0 vidas
- Puede ganar con power-up

**Dificultad Progresiva:**
- Velocidad de asteroides aumenta
- Más asteroides simultáneos
- Menos tiempo entre preguntas

### 4.4 Carrera Matemática (🏁)

**Concepto:**
4 corredores (jugador + 3 IA) compiten respondiendo preguntas. El que responda primero avanza más.

**Pantalla:**
```
┌────────────────────────────────────┐
│  🏁 CARRERA - Vuelta 3/5          │
├────────────────────────────────────┤
│                                    │
│  👦 Tú      ▓▓▓▓▓▓▓▓▓░░░░ 70%    │
│  🤖 Bot1    ▓▓▓▓▓▓▓░░░░░░░ 60%    │
│  🥷 Bot2    ▓▓▓▓▓▓▓▓░░░░░░ 65%    │
│  🦊 Bot3    ▓▓▓▓▓▓░░░░░░░░ 55%    │
│                                    │
├────────────────────────────────────┤
│         6 × 7 = ?                  │
│                                    │
│    [42]  [48]  [36]  [54]         │
└────────────────────────────────────┘
```

**Mecánica:**
1. Pregunta aparece para todos
2. El más rápido en responder avanza
3. Respuesta incorrecta = penalización
4. 5 vueltas para ganar
5. Primer lugar = victoria

**IA de Oponentes:**
- **Tiempo de respuesta:** 2-5 segundos (aleatorio)
- **Precisión:** 70-90% según dificultad
- **Velocidad de avance:** Proporcional a racha

**Recompensas por Posición:**
```
🥇 1er lugar: +200⭐ + 🏆 Oro
🥈 2do lugar: +100⭐ + 🏆 Plata
🥉 3er lugar: +50⭐ + 🏆 Bronce
4to lugar: +25⭐
```

### 4.5 Batalla de Jefes (👾)

**Concepto:**
Sistema de combate por turnos RPG-style contra 10 jefes, uno por cada tabla (2-10).

**Jefes:**
```
👾 Jefe del 2  - HP: 100  "El Duplicador"
🦹 Jefe del 3  - HP: 150  "El Triplicador"
🤖 Jefe del 4  - HP: 200  "Cuadro-Bot"
👹 Jefe del 5  - HP: 250  "Quintus"
🧛 Jefe del 6  - HP: 300  "Hexa-Vampiro"
🧟 Jefe del 7  - HP: 350  "Siete Vidas"
👺 Jefe del 8  - HP: 400  "Octo-Demonio"
🐉 Jefe del 9  - HP: 450  "Dragón Noveno"
💀 Jefe del 10 - HP: 500  "Decimus Rex"
```

**Sistema de Turnos:**
```
TURNO JUGADOR:
1. Aparece pregunta de la tabla del jefe
2. 4 opciones de respuesta
3. Respuesta correcta → Ataque (15 HP daño)
4. Respuesta incorrecta → Pierde turno

TURNO JEFE:
1. Jefe ataca (10-20 HP según nivel)
2. 30% chance de bloqueo automático
3. Visual de ataque enemigo

MECÁNICAS ESPECIALES:
- Súper-Ataque (carga con respuestas correctas)
- Defensa temporal
- Críticos (20% chance, x2 daño)
```

**Súper-Ataque:**
```
CARGA: +10% por respuesta correcta
ACTIVACIÓN: Al llegar a 100%
DAÑO: 50 HP (triple del normal)
VISUAL: ⚡ Rayo épico con animación
USOS: 1 por batalla
```

**Pantalla de Batalla:**
```
┌─────────────────────────────────────┐
│  👾 JEFE DEL 7                      │
│  ❤️❤️❤️❤️❤️❤️░░░░  HP: 210/350   │
├─────────────────────────────────────┤
│                                     │
│  👦 TÚ                              │
│  ❤️❤️❤️❤️❤️  HP: 50/100           │
│  ⚡━━━━━━━━━━ 80% Súper-Ataque     │
│                                     │
├─────────────────────────────────────┤
│  ¡Tu turno de atacar!               │
│                                     │
│         7 × 8 = ?                   │
│                                     │
│    [54]  [56]  [63]  [49]          │
│                                     │
│  [⚡ USAR SÚPER-ATAQUE]            │
└─────────────────────────────────────┘
```

**Log de Batalla:**
Sidebar con historial de acciones:
```
✓ ¡Ataque exitoso! -15 HP
💥 ¡El jefe te golpeó! -15 HP
🛡️ ¡Bloqueaste el ataque!
⚡ ¡SÚPER-ATAQUE! -50 HP
```

**Recompensas:**
- Victoria: +300⭐ + 🏆 Oro + Desbloqueo de tabla
- Derrota: +50⭐ (consolación)

---

## 5. SISTEMAS DE PROGRESIÓN

### 5.1 Sistema de Niveles

**Mecánica:**
```
XP GANADO:
- Respuesta correcta: +100 XP
- Respuesta incorrecta: +50 XP
- Completar partida: +200 XP bonus
- Logro desbloqueado: +500 XP

NIVELES:
Nivel 1: 0 XP
Nivel 2: 100 XP
Nivel 3: 200 XP
Nivel N: (N-1) × 100 XP

MÁXIMO: Nivel 50
```

**Beneficios por Nivel:**
```
Nivel 5:  🔓 Desafío Rápido
Nivel 10: 🔓 Carrera Matemática
Nivel 15: 🔓 Batalla de Jefes
Nivel 20: 🔓 Galaxia Completa
Nivel 25: 🔓 Items Legendarios
Nivel 50: 👑 Status de Leyenda
```

**Visual:**
Barra de progreso animada con % y XP actual/necesario

### 5.2 Sistema de Maestría por Tabla

**Tracking Individual:**
Cada tabla (2-10) tiene su propia estadística:

```
TABLA 7 - MAESTRÍA: 65%
├─ Intentos: 45
├─ Correctas: 32 (71%)
├─ Incorrectas: 13 (29%)
├─ Tiempo Promedio: 4.2s
├─ Racha Máxima: 8
├─ Último Uso: Hace 2 días
└─ Multiplicadores Problemáticos:
   └─ 7×7 (3 errores)
   └─ 7×8 (4 errores)
```

**Clasificación:**
```
🟢 DOMINADA (80-100%)
   - Color verde
   - Check mark ✓
   - Bonus +10⭐ por uso

🟡 EN PROGRESO (50-79%)
   - Color amarillo
   - En desarrollo...
   - Recomendada para práctica

🔴 NECESITA PRÁCTICA (0-49%)
   - Color rojo
   - Prioridad alta
   - Mateo sugiere trucos
```

### 5.3 Sistema de Racha (Streak)

**Contador de Días Consecutivos:**
```
DÍA 1: 🔥
DÍA 2: 🔥🔥
DÍA 3: 🔥🔥🔥
...
DÍA 30: 🔥×30 (Leyenda)
```

**Bonificaciones:**
```
7 días:  +100⭐ + 🎖️ Badge "Dedicado"
14 días: +250⭐ + 🎖️ Badge "Comprometido"
21 días: +500⭐ + 🎖️ Badge "Imparable"
30 días: +1000⭐ + 🎖️ Badge "Leyenda" + Avatar especial
```

**Reset:**
- Si pasa 1 día sin jugar, racha vuelve a 0
- Notificación: "😢 Perdiste tu racha de X días"

### 5.4 Sistema de Combos

**Aplicable en:** Desafío Rápido, Aventura Espacial

```
COMBO x1: 0-2 seguidas  (Base)
COMBO x2: 3-4 seguidas  (+100% puntos)
COMBO x3: 5-6 seguidas  (+200% puntos)
COMBO x4: 7+ seguidas   (+300% puntos)
```

**Visual:**
- Contador grande en pantalla
- Animación de crecimiento
- Efecto de fuego al llegar a x4
- Sonido de combo

---

## 6. SISTEMA DE ECONOMÍA

### 6.1 Monedas: Estrellas (⭐)

**Formas de Ganar:**
```
DURANTE JUEGO:
- Respuesta correcta: +10⭐
- Racha de 5: +25⭐
- Completar partida: +50⭐
- Victoria perfecta: +100⭐
- Modo Fuego activo: x2 multiplicador

MISIONES DIARIAS:
- Misión fácil: +25⭐
- Misión media: +75⭐
- Misión difícil: +100⭐
- Completar todas: +50⭐ bonus

LOGROS:
- Logro común: +50⭐
- Logro raro: +100⭐
- Logro épico: +250⭐
- Logro legendario: +500⭐

RACHA:
- 7 días: +100⭐
- 14 días: +250⭐
- 21 días: +500⭐
- 30 días: +1000⭐
```

**Usos:**
- Comprar items en tienda
- Desbloquear temas
- Comprar paquetes de música
- Comprar power-ups

### 6.2 Trofeos (🏆)

**Tipos:**
```
🥇 ORO - 95%+ precisión
🥈 PLATA - 80-94% precisión
🥉 BRONCE - 60-79% precisión
```

**Otorgamiento:**
Al finalizar partida según % de aciertos

**Display:**
```
SALÓN DE TROFEOS:
🥇 Oro: 15
🥈 Plata: 32
🥉 Bronce: 48
Total: 95 🏆
```

**Desbloqueos:**
Algunos items legendarios requieren:
```
🐉 Avatar Dragón: 1000⭐ + 10🏆
🌠 Nave Legendaria: 1200⭐ + 15🏆
```

---

## 7. SISTEMA DE TIENDA

### 7.1 Categorías

**1. AVATARES**
```
CATEGORÍA      ITEM            PRECIO      RAREZA
─────────────────────────────────────────────────
FREE           👦 Martín       0⭐          Common
FREE           👧 Sofía        0⭐          Common
Personajes     🦸 Superhéroe   250⭐        Rare
Fantasía       🧙 Mago         500⭐        Epic
Deportes       🥷 Ninja        350⭐        Rare
Tecnología     🤖 Robot        400⭐        Epic
Espacial       👽 Alienígena   600⭐        Epic
LEGENDARIO     🐉 Dragón       1000⭐+10🏆  Legendary
```

**2. NAVES ESPACIALES**
```
NAVE               PRECIO    VELOCIDAD  PODER    RAREZA
──────────────────────────────────────────────────────
🚀 Nave Básica     0⭐       5          5        Common
🛸 Nave Veloz      200⭐     10         5        Rare
🛰️ Nave Épica     500⭐     10         10       Epic
✨ Nave Estelar    750⭐     12         12       Epic
🌠 Nave Legendaria 1200⭐+   15         15       Legendary
```

**3. AUTOS DE CARRERA**
```
AUTO                PRECIO   VELOCIDAD   ACELERACIÓN
────────────────────────────────────────────────────
🏎️ Auto Básico     0⭐      Normal      Normal
🏎️ Auto Deportivo  150⭐    +20%        +10%
🏎️ Auto F1         400⭐    +40%        +30%
🏎️ Auto Futurista  800⭐    +60%        +50% + FX
```

**4. ARMAS DE BATALLA**
```
ARMA          PRECIO   DAÑO    ESPECIAL
───────────────────────────────────────
⚔️ Espada     0⭐      15 HP   -
🗡️ Hacha      100⭐    18 HP   -
🛠️ Martillo   250⭐    22 HP   Stun 10%
⚡ Rayo       500⭐    30 HP   Cadena
```

**5. TEMAS VISUALES**
```
TEMA       PRECIO   DESCRIPCIÓN
─────────────────────────────────
Default    0⭐      Tema claro original
Dark       100⭐    Modo oscuro elegante
Neon       300⭐    Colores neón vibrantes
Forest     250⭐    Naturaleza verde
Ocean      250⭐    Azul profundo
Space      400⭐    Galaxia oscura
```

**6. PAQUETES DE MÚSICA**
```
PACK        PRECIO   PISTAS   ESTILO
───────────────────────────────────────
Original    0⭐      5        Alegre/Infantil
Chiptune    200⭐    8        Retro 8-bit
Epic        350⭐    6        Orquestal épica
Chill       150⭐    7        Relajante
Rock        300⭐    5        Energético
```

### 7.2 Interfaz de Tienda

```
┌─────────────────────────────────────────┐
│ 🛒 TIENDA          Tu saldo: 1,250⭐    │
├─────────────────────────────────────────┤
│ [Avatares] [Naves] [Autos] [Armas]     │
│ [Temas] [Música] [Power-ups]           │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │   🦸   │  │   🧙   │  │   🥷   │   │
│  │ Súper  │  │  Mago  │  │ Ninja  │   │
│  │ 250⭐  │  │ 500⭐  │  │ 350⭐  │   │
│  │[COMPRAR│  │[EQUIPAR│  │[COMPRAR│   │
│  └────────┘  └────────┘  └────────┘   │
│                                         │
│  EQUIPADO ACTUALMENTE: 🧙 Mago         │
└─────────────────────────────────────────┘
```

**Estados de Items:**
- 🔒 **Bloqueado:** No comprado, muestra precio
- ✓ **Comprado:** Ya en inventario, botón "Equipar"
- ⚡ **Equipado:** Actualmente en uso, badge dorado

---

## 8. SISTEMA DE LOGROS

### 8.1 Categorías de Logros

**1. CANTIDAD DE PREGUNTAS**
```
LOGRO              REQUISITO      RECOMPENSA
────────────────────────────────────────────
👶 Primeros Pasos  10 preguntas   +50⭐
📚 Aprendiz        50 preguntas   +100⭐
🎓 Estudiante      100 preguntas  +200⭐
🧙 Maestro         500 preguntas  +500⭐
👑 Leyenda         1000 preguntas +1000⭐ + Avatar
```

**2. PRECISIÓN**
```
💎 Perfección      10 sin errores      +100⭐
🎯 Francotirador   95% en 20 preguntas +250⭐
🧠 Mente Aguda     100 con 90%         +500⭐
```

**3. RACHAS**
```
🔥 Racha Ardiente  5 seguidas    +50⭐
⚡ Imparable       10 seguidas   +100⭐
💫 Fenómeno        20 seguidas   +200⭐
🌟 Imbatible       50 seguidas   +500⭐
```

**4. NIVEL**
```
⬆️ Ascenso         Nivel 5     +100⭐
🏆 Veterano        Nivel 10    +250⭐
💪 Élite           Nivel 20    +500⭐
⚡ Dios de Mates   Nivel 50    +2000⭐ + Corona
```

**5. MAESTRÍA DE TABLAS**
```
🎖️ Maestro Tabla    1 tabla 100%      +200⭐
🏅 Experto          5 tablas 100%     +500⭐
👑 Gran Maestro     Todas tablas 100% +2000⭐ + Título
```

**6. TROFEOS**
```
🥇 Coleccionista Oro  10 oros        +300⭐
🏆 Acaparador         50 total       +500⭐
💎 Perfeccionista     100 total      +1000⭐
```

**7. ESPECIALES**
```
💨 Demonio Velocidad   50 en Desafío    +200⭐
🚀 Explorador Espacial Completar Aventura +300⭐
🏁 Piloto Campeón      10 carreras      +250⭐
⚔️ Cazador de Jefes    Todos los jefes  +1000⭐
🎮 Estratega           20 power-ups     +150⭐
📅 Dedicado            7 días racha     Ver §5.3
🦉 Búho Nocturno       Jugar 10 PM+     +100⭐
🌅 Madrugador          Jugar antes 7 AM +100⭐
```

### 8.2 Notificación de Logro

```
┌────────────────────────────┐
│      🎉 ¡LOGRO!           │
│                            │
│   🏆 VETERANO             │
│   "Alcanza Nivel 10"       │
│                            │
│   Recompensa: +250⭐       │
│                            │
│        [OK]                │
└────────────────────────────┘
```

**Efectos:**
- Confeti en pantalla
- Sonido de fanfarria
- Mateo celebra
- Badge guardado en perfil

---

## 9. CARACTERÍSTICAS ESPECIALES

### 9.1 Trucos Mnemotécnicos

**Acceso:** Botón "📚 Trucos" durante partida

**Contenido por Tabla:**

```
TABLA 2 - "El Doble"
━━━━━━━━━━━━━━━━━━━━
💡 Duplica el número
   2×5 = 5+5 = 10

💡 Cuenta de 2 en 2
   2, 4, 6, 8, 10...

💡 Es como sumar dos veces
   2×7 = 7+7 = 14

TABLA 3 - "El Triángulo"
━━━━━━━━━━━━━━━━━━━━
💡 Suma 3 veces
   3×4 = 4+4+4 = 12

💡 Patrón: 3,6,9,12,15...
   (de 3 en 3)

💡 Trucos de dedos
   [Ilustración]

TABLA 7 - "La Difícil"
━━━━━━━━━━━━━━━━━━━━
💡 7×8 = 56 → "5,6,7,8"
   (números consecutivos)

💡 7×9 = 63 → "7 comió 9"

💡 7×6 = 42 → "La respuesta"
   (referencia cultural)
```

**Formato:**
- 3-5 tips por tabla
- Visuales con emojis
- Ejemplos prácticos
- Patrones numéricos

### 9.2 Mascota Mateo

**Apariencia:**
```
┌─────┐
│ 🧙  │ Mateo el Mago
│     │ Tu asistente personal
└─────┘
```

**Comportamiento:**

**1. Apariciones Contextuales:**
```
- Inicio de partida → "¡Buena suerte!"
- Respuesta correcta → "¡Excelente!"
- 5 errores seguidos → "Te ayudo con un truco?"
- Logro desbloqueado → "¡Felicidades!"
- Victoria → "¡Eres increíble!"
- Inactividad → "¿Seguimos practicando?"
```

**2. Expresiones:**
- 😊 Feliz (default)
- 🎉 Celebrando (logros)
- 😕 Confundido (muchos errores)
- 😌 Orgulloso (victoria)
- 🤔 Pensando (dando pistas)

**3. Posicionamiento:**
- Esquina inferior derecha
- Aparece con animación slide-in
- Desaparece después de 3 segundos
- No interrumpe gameplay

### 9.3 Sistema de Feedback Inmediato

**Respuesta CORRECTA:**
```
VISUAL:
- ✓ Verde grande en pantalla
- Opción seleccionada brilla verde
- Animación de confeti
- +⭐ flotante subiendo

SONIDO:
- "ding" alegre
- Sonido de monedas

DURACIÓN: 300ms
```

**Respuesta INCORRECTA:**
```
VISUAL:
- ✗ Rojo con shake effect
- Opción se vuelve roja
- Respuesta correcta se ilumina verde
- Mostrar: "Era 56"

SONIDO:
- "buzz" de error
- Sonido de decepción

DURACIÓN: 600ms
```

### 9.4 Sistema de Pausa

**Activación:**
- Botón ⏸️ en pantalla
- Tecla ESC
- Pérdida de foco (auto-pausa)

**Menú de Pausa:**
```
┌────────────────────────┐
│    ⏸️ PAUSA           │
├────────────────────────┤
│                        │
│   [▶️ Continuar]      │
│                        │
│   [🔄 Reiniciar]      │
│                        │
│   [🏠 Menú Principal] │
│                        │
│   [🔊 Sonido: ON]     │
│                        │
└────────────────────────┘
```

**Efectos:**
- Juego completamente pausado
- Timer detenido
- Música en fade-out
- Blur en fondo

### 9.5 Sistema de Partículas

**Uso:**
- Fondo de pantalla principal
- Celebraciones de logros
- Efectos de power-ups
- Explosiones en Aventura Espacial

**Tipos:**
```
⭐ Estrellas flotantes (fondo)
🎆 Confeti (logros)
💥 Explosión (batalla)
✨ Brillo (power-ups)
🔥 Llamas (Modo Fuego)
```

---

## 10. SISTEMA ADAPTATIVO

### 10.1 Algoritmo de Espaciado Repetido

**Concepto:**
El sistema analiza el rendimiento del usuario y ajusta la frecuencia de práctica de cada tabla.

**Variables Tracked:**
```
POR TABLA:
- Maestría actual (0-100%)
- Tiempo desde última práctica
- Tasa de error reciente
- Velocidad de respuesta
- Patrones de error (multiplicadores específicos)
```

**Lógica de Sugerencia:**
```
PRIORIDAD ALTA:
✓ Maestría < 50%
✓ Última práctica > 3 días
✓ Tasa de error > 40%

PRIORIDAD MEDIA:
✓ Maestría 50-80%
✓ Última práctica > 1 día
✓ Respuestas lentas (>8s)

PRIORIDAD BAJA:
✓ Maestría > 80%
✓ Practicada recientemente
✓ Alta precisión
```

**Aplicación:**
- Modo Práctica sugiere tablas automáticamente
- Diagnóstico genera mapa personalizado
- Mateo recomienda según análisis

### 10.2 Dificultad Adaptativa

**Progresión en Desafío Rápido:**
```
INICIO:
- Tablas fáciles (2, 5, 10)
- Multiplicadores bajos (1-5)
- Tiempo generoso

MEDIO (después de 10 correctas):
- Mix de tablas
- Multiplicadores medios (4-8)
- Tiempo normal

AVANZADO (después de 20 correctas):
- Tablas difíciles (7, 8, 9)
- Multiplicadores altos (6-10)
- Tiempo reducido
```

**Ajuste en Batalla de Jefes:**
```
HP del Jefe según maestría de tabla:
- Maestría 0-30%: HP -20% (más fácil)
- Maestría 31-70%: HP normal
- Maestría 71-100%: HP +30% (más difícil)
```

### 10.3 Generación Inteligente de Opciones

**Respuesta Correcta:** 7 × 8 = 56

**Opciones Incorrectas Realistas:**
```
❌ 54 = 7×7+7 (error común, tabla anterior)
❌ 63 = 7×9 (multiplicador vecino)
❌ 48 = 6×8 (tabla vecina)

EVITAR opciones obvias como:
✗ 1, 100, 0 (demasiado fáciles de descartar)
```

**Algoritmo:**
1. Calcular respuesta correcta
2. Generar errores basados en patrones comunes
3. Mezclar opciones aleatoriamente
4. Evitar duplicados

---

## 11. EXPERIENCIA DE USUARIO

### 11.1 Tutorial Interactivo

**Activación:**
- Automático en primera sesión
- Skip opcional con botón
- Re-activable desde configuración

**5 Pasos:**
```
PASO 1: BIENVENIDA
┌──────────────────────────┐
│   👋 ¡Bienvenido a      │
│   Multiplicar Mágico!    │
│                          │
│   Te mostraré cómo      │
│   usar la app en 30s    │
│                          │
│   [Siguiente] [Saltar]  │
└──────────────────────────┘

PASO 2: MODOS DE JUEGO
[Spotlight en grid de modos]
"¡Tenemos 8 modos diferentes!
Cada uno es único y divertido"

PASO 3: POWER-UPS
[Spotlight en barra de power-ups]
"Usa Escudo 🛡️, Pista 💡
y Saltar ⏭️"

PASO 4: TRUCOS
[Spotlight en botón Trucos]
"Consejos para memorizar
cada tabla"

PASO 5: PROGRESO
[Spotlight en Galaxy]
"Visualiza tu progreso
en el sistema solar"
```

**Features:**
- Spotlight visual en elemento
- Posicionamiento inteligente (arriba/abajo/izq/der)
- Flechas apuntando
- Overlay oscuro en resto de pantalla
- Navegación con teclado (←/→/ESC)

### 11.2 Accesibilidad

**Controles:**
```
RATÓN:
- Click en opciones
- Hover effects
- Drag en algunos modos

TECLADO:
- 1/2/3/4 para opciones
- Espacio para disparar
- ESC para pausa
- Enter para confirmar
- ← → para navegación

TOUCH (Móvil/Tablet):
- Tap en opciones
- Swipe para mover nave
- Multi-touch support
```

**Visual:**
- Fuente grande y legible
- Alto contraste
- Botones grandes (min 44x44px)
- Feedback visual claro
- Colores diferenciados

**Sonido:**
- Toggle ON/OFF fácil
- Sin sonidos molestos
- Música de fondo opcional
- Efectos desactivables independiente

### 11.3 Responsive Design

**Desktop (1920x1080):**
- Layout de 3 columnas
- Elementos espaciados
- Animaciones complejas
- Partículas en fondo

**Tablet (768x1024):**
- Layout de 2 columnas
- Elementos compactos
- Animaciones reducidas
- Menos partículas

**Móvil (375x667):**
- Layout de 1 columna vertical
- Botones más grandes
- Animaciones mínimas
- Sin partículas

### 11.4 Persistencia y Auto-Save

**Auto-guardado:**
```
CADA ACCIÓN:
- Respuesta contestada
- Compra en tienda
- Logro desbloqueado
- Cambio de equipamiento

CADA SESIÓN:
- Al terminar partida
- Al cambiar de pantalla
- Al cerrar app
- Cada 30 segundos (backup)
```

**LocalStorage Structure:**
```json
{
  "player": {
    "name": "Martín",
    "avatar": "🦸",
    "level": 12,
    "xp": 1450,
    "stars": 3200,
    "trophies": {
      "gold": 15,
      "silver": 32,
      "bronze": 48
    },
    "streak": 5,
    "lastPlayedDate": "2025-11-06"
  },
  "tableMastery": {
    "2": { "mastery": 0.95, "attempts": 120, ... },
    "3": { "mastery": 0.87, "attempts": 95, ... },
    ...
  },
  "inventory": ["🦸", "🧙", "🚀", "🛸", ...],
  "equipped": {
    "avatar": "🦸",
    "ship": "🚀",
    "car": "🏎️",
    "weapon": "⚔️"
  },
  "achievements": ["firstSteps", "apprentice", ...],
  "settings": {
    "sound": true,
    "music": true,
    "theme": "default"
  }
}
```

---

## 12. ARQUITECTURA TÉCNICA

### 12.1 Módulos Principales

**Core Components:**
```
📁 core/
  ├─ EventBus.js         Observer Pattern
  ├─ StateManager.js     Singleton Pattern
  └─ QuestionGenerator.js Factory Pattern

📁 systems/
  ├─ AdaptiveSystem.js   Algoritmo adaptativo
  └─ TutorialSystem.js   Tutorial interactivo

📁 services/
  └─ StorageService.js   Persistencia
```

**Game Engines:**
```
📁 engines/
  ├─ spaceGameEngine.js      Canvas + Physics
  ├─ bossGameEngine.js       Turn-based combat
  ├─ practiceSystemEngine.js Diagnóstico adaptativo
  └─ galaxySystemEngine.js   Visualización 3D
```

**Feature Systems:**
```
📁 features/
  ├─ coinSystem.js           Economía
  ├─ shopSystem.js           Tienda
  ├─ dailyMissionsSystem.js  Misiones
  ├─ fireModeSystem.js       Modo Fuego
  ├─ feedbackSystem.js       Feedback visual
  ├─ mnemonicTricks.js       Trucos
  ├─ mateo.js                Mascota
  └─ sounds.js               Audio
```

### 12.2 Patrones de Diseño Implementados

**1. Observer (EventBus)**
```javascript
// Comunicación desacoplada
eventBus.on('answer:correct', (data) => {
  updateScore(data.points);
  showFeedback(true);
  playSound('correct');
});

eventBus.emit('answer:correct', { points: 100 });
```

**2. Singleton (StateManager)**
```javascript
// Un solo estado centralizado
const state = StateManager.getInstance();
state.set('player.level', 5);
```

**3. Factory (QuestionGenerator)**
```javascript
// Generación estandarizada
const gen = new QuestionGenerator();
const q = gen.generate({ tables: [7,8] });
```

**4. Module Pattern**
```javascript
// Encapsulación de lógica
class AdaptiveSystem {
  recordAnswer(table, correct) { ... }
  getSuggestedTables() { ... }
}
```

### 12.3 Rendimiento

**Optimizaciones:**
```
✓ RequestAnimationFrame para animaciones
✓ Event delegation en listas
✓ Lazy loading de imágenes
✓ Debounce en inputs
✓ Throttle en scroll/resize
✓ Canvas offscreen para pre-render
✓ Object pooling en partículas
✓ LocalStorage comprimido (JSON)
```

**Carga Inicial:**
```
1. HTML base (<50KB)
2. CSS crítico inline
3. JavaScript core (app.js)
4. Cargar sistemas según necesidad
5. Lazy load engines al entrar al modo
```

### 12.4 Testing

**Cobertura:**
```
✓ EventBus: 50+ tests unitarios
✓ QuestionGenerator: 80+ tests
✓ StateManager: 50+ tests
✓ Total: 223 tests passing

Framework: Vitest + happy-dom
Comando: npm test
Coverage: >90% en módulos core
```

---

## CONCLUSIÓN

"Multiplicar Mágico" es una aplicación educativa completa que combina:

✅ **8 Modos de Juego** variados y entretenidos
✅ **Sistema de Progresión** multinivel con recompensas
✅ **Economía Virtual** con tienda de 30+ items
✅ **Aprendizaje Adaptativo** basado en IA
✅ **27 Logros** desbloqueables
✅ **Visualización de Progreso** tipo Sistema Solar
✅ **Trucos Mnemotécnicos** para cada tabla
✅ **Mascota Asistente** Mateo el Mago
✅ **Power-ups y Combos** para dinamismo
✅ **Tutorial Interactivo** con spotlight
✅ **Arquitectura Profesional** con patrones de diseño

**Objetivo Cumplido:**
Convertir el aprendizaje de tablas de multiplicar en una experiencia de juego adictiva, donde los niños practican sin darse cuenta que están estudiando, motivados por recompensas, progreso visual y variedad de desafíos.

---

**Documento generado:** 2025-11-06
**Versión:** 1.0
**Páginas:** 25/30
