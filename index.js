const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 1. Configurar la carpeta de archivos estáticos (CSS, imágenes, JS del cliente)
// Esto permite que el HTML cargue los estilos correctamente.
app.use(express.static(path.join(__dirname, 'public')));

// (Opcional) Middleware para procesar datos de formularios o JSON, útil para tus funciones
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Enrutamiento de los menús y páginas del sistema
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para otro menú, por ejemplo, el área de pacientes
app.get('/pacientes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pacientes.html'));
});

// Ruta para el menú de citas o calendario
app.get('/citas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'citas.html'));
});

// 3. Enrutamiento para funciones/API (ejemplo para leer tu db.json)
app.get('/api/datos', (req, res) => {
    // Aquí puedes requerir o leer tu db.json y enviarlo al frontend
    const datos = require('./db.json');
    res.json(datos);
});

// 4. Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor de fisioterapia corriendo en http://localhost:${port}`);
});

const express = require('express');
const path = require('path');


const PORT = 3000;

// Servir los directorios estáticos definidos en la arquitectura
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/vistas', express.static(path.join(__dirname, 'vistas')));

// Redireccionamiento principal requerido por la documentación técnica
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'login.html'));
});

// Redireccionamiento explícito para el login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'login.html'));
});

// Opcional: Manejo de rutas no encontradas para redirigir al login por seguridad/comodidad
app.get('*', (req, res) => {
    res.redirect('/');
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor de Fisio Clinica iniciado.`);
    console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
});