#!/usr/bin/env node

/**
 * Servidor HTTP simple para desarrollo local
 * Sirve la aplicación en http://localhost:8080
 *
 * Uso:
 *   node server.js
 *
 * O agregar a package.json:
 *   "scripts": {
 *     "start": "node server.js"
 *   }
 * Luego ejecutar: npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Tipos MIME para diferentes archivos
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
    // Quitar query strings y normalizar
    let filePath = req.url.split('?')[0];

    // Si es la raíz, servir index.html
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // Construir ruta completa
    filePath = path.join(__dirname, filePath);

    // Obtener extensión del archivo
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Leer y servir el archivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Archivo no encontrado
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                // Error del servidor
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`, 'utf-8');
            }
        } else {
            // Éxito
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('   Servidor de desarrollo iniciado');
    console.log('========================================');
    console.log('');
    console.log(`📂 Sirviendo archivos desde: ${__dirname}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('');
    console.log('✅ Listo para usar');
    console.log('');
    console.log('💡 Consejos:');
    console.log('   - Abre http://localhost:3000 en tu navegador');
    console.log('   - Presiona Ctrl+C para detener el servidor');
    console.log('   - Recarga la página después de hacer cambios');
    console.log('');
    console.log('🐛 Debug: Abre la consola del navegador (F12)');
    console.log('   para ver los logs del tutorial');
    console.log('');
    console.log('========================================');
    console.log('');
});

// Manejo de errores
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
        console.error('   Intenta cerrar otras aplicaciones o usa otro puerto');
    } else {
        console.error('❌ Error del servidor:', error);
    }
    process.exit(1);
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
    console.log('\n\n👋 Cerrando servidor...\n');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente\n');
        process.exit(0);
    });
});
