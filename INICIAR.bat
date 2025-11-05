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
