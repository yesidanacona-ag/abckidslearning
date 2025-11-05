# 📥 ACTUALIZACIÓN MANUAL - Sin Git Pull

## 🎯 Objetivo

Actualizar tu proyecto con todos los últimos cambios sin usar `git pull`.

---

## 📝 MÉTODO SIMPLE: Cambiar solo lo necesario

### Paso 1: Cambia el puerto en `server.js`

Abre el archivo `server.js` y busca la línea 21:

**Cambiar de:**
```javascript
const PORT = 3000;
```

**A:**
```javascript
const PORT = 8080;
```

También cambia la línea 92:

**Cambiar de:**
```javascript
console.log('   - Abre http://localhost:3000 en tu navegador');
```

**A:**
```javascript
console.log(`   - Abre http://localhost:${PORT} en tu navegador`);
```

**¡ESO ES TODO!**

Si solo quieres cambiar el puerto, con esto es suficiente.

---

## 📦 MÉTODO COMPLETO: Agregar todas las mejoras

Si quieres TODAS las herramientas de testing y debugging, crea estos archivos nuevos:

---

### 📄 Archivo 1: `INICIAR.bat` (Windows)

Crea un archivo llamado `INICIAR.bat` con este contenido:

```batch
@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo    🚀 MULTIPLICAR MÁGICO
echo    Iniciando servidor de desarrollo...
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: npm no está instalado
    echo.
    pause
    exit /b 1
)

echo ✅ npm encontrado
echo.

REM Verificar si node_modules existe
if not exist "node_modules\" (
    echo 📦 Instalando dependencias...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencias instaladas
    echo.
)

echo 🚀 Iniciando servidor en http://localhost:8080
echo.
echo 💡 INSTRUCCIONES:
echo    1. Abre tu navegador
echo    2. Ve a: http://localhost:8080
echo    3. Presiona F12 para abrir la consola
echo    4. Para ver el tutorial de nuevo:
echo       - En consola: localStorage.clear()
echo       - Luego: F5 (recargar)
echo.
echo 🐛 Para testing:
echo    - Ve a: http://localhost:8080/test-tutorial.html
echo.
echo ⛔ Para detener el servidor:
echo    - Presiona Ctrl+C
echo.
echo ========================================
echo.

REM Iniciar el servidor
node server.js

pause
```

---

### 📄 Archivo 2: `LEEME.md`

Crea este archivo como guía rápida:

```markdown
# 🚀 MULTIPLICAR MÁGICO - Inicio Rápido

## ⚡ MÉTODO MÁS FÁCIL (Windows)

**Doble click en: `INICIAR.bat`**

Luego abre: `http://localhost:8080`

---

## 📝 O usa la terminal:

```bash
npm start
```

Luego abre: `http://localhost:8080`

---

## 🐛 Para ver el tutorial de nuevo:

1. Abre la consola del navegador: `F12`
2. Ejecuta:
```javascript
localStorage.clear()
```
3. Recarga: `F5`

---

## ✅ URLs importantes:

- App principal: http://localhost:8080
- Testing: http://localhost:8080/test-tutorial.html

---

¿Problemas? Revisa `INSTRUCCIONES.md` para más detalles.
```

---

## 🚀 PROBANDO LA ACTUALIZACIÓN

Después de hacer los cambios:

### 1. Abre terminal en la carpeta del proyecto

### 2. Si usas Windows, ejecuta:
```
INICIAR.bat
```

### 3. O ejecuta:
```bash
npm start
```

### 4. Deberías ver:

```
🚀 ========================================
   Servidor de desarrollo iniciado
========================================

📂 Sirviendo archivos desde: C:\tu\carpeta
🌐 URL: http://localhost:8080

✅ Listo para usar
```

### 5. Abre tu navegador:
```
http://localhost:8080
```

### 6. Para ver el tutorial:

- Presiona `F12`
- En consola ejecuta: `localStorage.clear()`
- Presiona `F5` para recargar

### 7. Verifica los logs en consola:

Deberías ver:
```
🚀 Tutorial: start() llamado
✅ Tutorial: Primera vez, mostrando tutorial
🔧 Tutorial: Configurando event listeners...
✅ Tutorial: Listener agregado a Skip
```

---

## ✅ Checklist

- [ ] Cambié el puerto a 8080 en `server.js`
- [ ] Creé `INICIAR.bat` (opcional, solo Windows)
- [ ] Ejecuté el servidor
- [ ] Abrí `http://localhost:8080`
- [ ] El fondo del tutorial está más claro
- [ ] El botón "Saltar" funciona
- [ ] Veo logs en la consola (F12)

---

## 📸 Si algo no funciona

Envíame:
1. Screenshot del error en terminal
2. Screenshot de la consola del navegador (F12)
3. Dime qué paso estás haciendo

---

**¡Eso es todo!** Con solo cambiar el puerto en `server.js` ya debería funcionar. Los otros archivos son opcionales para facilitar el inicio.
