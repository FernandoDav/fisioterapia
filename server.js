const express = require('express');
const path = require('path');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para decodificar cuerpos de peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir carpetas estáticas requeridas por la arquitectura
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/vistas', express.static(path.join(__dirname, 'vistas')));

// Cargar rutas de la aplicación (incluyendo redirecciones de menús y /)
app.use(routes);

// Servir archivos estáticos del directorio raíz
app.use(express.static(path.join(__dirname)));

// Manejo de cualquier ruta no encontrada -> redirigir al login
app.get('*', (req, res) => {
  res.redirect('/vistas/login.html');
});

// Arrancar servidor si se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fisio Clinica iniciado con éxito.`);
    console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
  });
}

module.exports = app;
