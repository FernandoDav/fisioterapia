const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const rootDir = path.resolve(__dirname, '..');

const menus = [
  'inicio',
  'pacientes',
  'facturacion',
  'agenda',
  'estadisticas',
  'empleados',
  'pagos',
  'recordatorios',
  'calculadora',
  'historial',
  'precios',
];

// Redirección principal y login
router.get('/', (req, res) => {
  res.redirect('/vistas/login.html');
});

router.get('/login', (req, res) => {
  res.redirect('/vistas/login.html');
});

router.get('/login.html', (req, res) => {
  res.redirect('/vistas/login.html');
});

// Enrutamiento para cada menú del sistema
menus.forEach((menu) => {
  // Ruta limpia: /pacientes -> /vistas/pacientes.html
  router.get(`/${menu}`, (req, res) => {
    res.redirect(`/vistas/${menu}.html`);
  });

  // Ruta con extensión en la raíz: /pacientes.html -> /vistas/pacientes.html
  router.get(`/${menu}.html`, (req, res) => {
    res.redirect(`/vistas/${menu}.html`);
  });
});

// Endpoint opcional para consultar datos iniciales de db.json
router.get('/api/datos', (req, res) => {
  const dbPath = path.join(rootDir, 'data', 'db.json');
  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Error al leer db.json' });
    }
  }
  res.status(404).json({ error: 'db.json no encontrado' });
});

module.exports = router;
