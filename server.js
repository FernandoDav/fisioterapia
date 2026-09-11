const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.use(express.static(root));
app.get("/", (request, response) => response.sendFile(path.join(root, "vistas", "login.html")));
app.get("/login", (request, response) => response.sendFile(path.join(root, "vistas", "login.html")));
app.listen(port, () => console.log(`Fisio Clinica disponible en http://localhost:${port}`));

const express = require('express');
const path = require('path');

const app = express();
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