#!/bin/bash

clear

echo ""
echo "========================================"
echo "   🚀 MULTIPLICAR MÁGICO"
echo "   Iniciando servidor de desarrollo..."
echo "========================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js no está instalado"
    echo ""
    echo "Por favor instala Node.js desde: https://nodejs.org"
    echo ""
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm no está instalado"
    echo ""
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
    echo ""
    echo "✅ Dependencias instaladas"
    echo ""
fi

echo "🚀 Iniciando servidor en http://localhost:8080"
echo ""
echo "💡 INSTRUCCIONES:"
echo "   1. Abre tu navegador"
echo "   2. Ve a: http://localhost:8080"
echo "   3. Presiona F12 para abrir la consola"
echo "   4. Para ver el tutorial de nuevo:"
echo "      - En consola: localStorage.clear()"
echo "      - Luego: F5 (recargar)"
echo ""
echo "🐛 Para testing:"
echo "   - Ve a: http://localhost:8080/test-tutorial.html"
echo ""
echo "⛔ Para detener el servidor:"
echo "   - Presiona Ctrl+C"
echo ""
echo "========================================"
echo ""

# Iniciar el servidor
node server.js
