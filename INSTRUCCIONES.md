# 🚀 Instrucciones de Uso - Multiplicar Mágico

## ⚠️ IMPORTANTE: Cómo ejecutar la aplicación correctamente

### ❌ **NO HAGAS ESTO:**

No abras el archivo `index.html` directamente haciendo doble clic. Esto causará:
- Error de CORS (Cross-Origin Resource Sharing)
- Archivos bloqueados (manifest.json, assets, etc)
- Comportamiento incorrecto de la aplicación

### ✅ **HAZ ESTO:**

Usa el servidor HTTP incluido para servir la aplicación correctamente.

---

## 📋 Pasos para Ejecutar

### Opción 1: Con Node.js (RECOMENDADO)

1. **Abre una terminal/consola en la carpeta del proyecto**

2. **Ejecuta el servidor:**
   ```bash
   npm start
   ```

3. **Verás algo como esto:**
   ```
   🚀 ========================================
      Servidor de desarrollo iniciado
   ========================================

   📂 Sirviendo archivos desde: C:\...\abckidslearning
   🌐 URL: http://localhost:3000

   ✅ Listo para usar
   ```

4. **Abre tu navegador y ve a:**
   ```
   http://localhost:3000
   ```

5. **Para detener el servidor:**
   Presiona `Ctrl+C` en la terminal

---

### Opción 2: Con Python (si no tienes Node.js)

1. **Abre terminal en la carpeta del proyecto**

2. **Python 3:**
   ```bash
   python -m http.server 3000
   ```

3. **Abre tu navegador:**
   ```
   http://localhost:3000
   ```

---

### Opción 3: Con extensión de VS Code

Si usas Visual Studio Code:

1. Instala la extensión "Live Server"
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

---

## 🐛 Debugging del Tutorial

El tutorial ahora incluye **logs detallados** en la consola del navegador.

### Para ver los logs:

1. Abre la aplicación con el servidor (`http://localhost:3000`)

2. Presiona `F12` para abrir las Herramientas de Desarrollador

3. Ve a la pestaña "Console" / "Consola"

4. **Borra el localStorage** para ver el tutorial de nuevo:
   ```javascript
   localStorage.clear()
   ```
   Luego recarga la página (`F5`)

5. **Verás logs como estos:**

   ```
   🚀 Tutorial: start() llamado
   ✅ Tutorial: Primera vez, mostrando tutorial
   ✅ Tutorial: Overlay mostrado
   🔧 Tutorial: Configurando event listeners...
   🔍 Tutorial: nextBtn encontrado? true
   🔍 Tutorial: skipBtn encontrado? true
   ✅ Tutorial: Listener agregado a Next
   ✅ Tutorial: Listener agregado a Skip
   ✅ Tutorial: Event listeners configurados exitosamente
   ```

6. **Al hacer click en "Saltar":**

   ```
   ⏭️ Tutorial: Click en Saltar
   ⏭️ Tutorial: Método skip() llamado
   🏁 Tutorial: Iniciando complete()...
   🔍 Tutorial: Elementos encontrados: {overlay: true, spotlight: true, content: true}
   ✅ Tutorial: Overlay ocultado
   ✅ Tutorial: Spotlight limpiado
   ✅ Tutorial: Content reseteado
   ✅ Tutorial: Marcado como completado en localStorage
   🔊 Tutorial: Sonido de éxito reproducido
   ✅ Tutorial: mainScreen pointer-events restaurado a auto
   🎉 Tutorial: Complete() finalizado exitosamente
   ```

---

## 🔧 Fixes Aplicados

### 1. **Fondo menos oscuro**
- **Antes:** `rgba(0, 0, 0, 0.85)` - 85% negro (muy oscuro)
- **Ahora:** `rgba(0, 0, 0, 0.5)` - 50% negro (más suave y visible)

### 2. **Logs de debugging**
- Cada acción del tutorial ahora imprime logs en consola
- Fácil diagnosticar qué está pasando
- Ver si botones están siendo encontrados
- Ver si event listeners se agregan correctamente

### 3. **Event listeners mejorados**
- Verificación de existencia de elementos antes de agregar listeners
- Prevención de listeners duplicados
- Logs cuando no se encuentran elementos

### 4. **Cleanup completo**
- Restauración de `pointer-events: auto` en mainScreen
- Limpieza de spotlight y overlay
- Reset de estilos de posicionamiento

---

## 📸 Reportar Problemas

Si el tutorial **TODAVÍA** tiene problemas:

1. **Abre la consola (F12)**

2. **Copia TODOS los logs** que aparecen

3. **Captura una screenshot** de:
   - La pantalla del tutorial
   - La consola con los logs

4. **Envía:**
   - Los logs copiados
   - La screenshot
   - Descripción del problema

---

## 🧪 Tests

Para ejecutar los tests unitarios (135 tests):

```bash
npm test
```

Para ver cobertura:

```bash
npm run test:coverage
```

---

## 📂 Estructura del Proyecto

```
abckidslearning/
├── index.html           - Aplicación principal
├── app.js               - Lógica del juego (con TutorialSystem)
├── mateo.js             - Sistema de mascota
├── styles.css           - Estilos (fondo tutorial ajustado)
├── server.js            - ✨ Servidor HTTP para desarrollo
├── package.json         - Scripts (npm start, npm test)
├── TESTING.md           - Guía de testing
├── INSTRUCCIONES.md     - Este archivo
└── tests/               - Tests unitarios (135 tests)
```

---

## ❓ Preguntas Frecuentes

### P: ¿Por qué no puedo abrir index.html directamente?

**R:** Los navegadores modernos bloquean el acceso a archivos locales por seguridad (política CORS). Necesitas un servidor HTTP.

### P: ¿Cómo borro el tutorial para verlo de nuevo?

**R:** Abre la consola (F12) y ejecuta:
```javascript
localStorage.clear()
```
Luego recarga (F5).

### P: El tutorial sigue negro, ¿qué hago?

**R:**
1. Asegúrate de usar el servidor HTTP (`npm start`)
2. Borra la caché del navegador (Ctrl+Shift+Delete)
3. Recarga con Ctrl+F5 (forzar recarga sin caché)
4. Envía los logs de la consola para diagnosticar

### P: ¿Dónde veo los logs de debug?

**R:** Presiona F12 → pestaña "Console"

---

## 🎯 Resumen Rápido

```bash
# 1. Abre terminal en la carpeta del proyecto
cd ruta/a/abckidslearning

# 2. Inicia el servidor
npm start

# 3. Abre el navegador
# Ve a: http://localhost:3000

# 4. Abre consola para ver logs
# Presiona F12 → Console

# 5. Para ver tutorial de nuevo
# En consola: localStorage.clear()
# Luego: F5
```

---

## 🆘 Soporte

Si nada de esto funciona:

1. Copia TODO el contenido de la consola (F12)
2. Toma screenshot de la pantalla
3. Describe exactamente qué pasos seguiste
4. Menciona tu sistema operativo y navegador

¡Te ayudaré a resolverlo! 🚀
