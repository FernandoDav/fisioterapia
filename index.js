// Archivo de entrada compatible con server.js y plataformas de despliegue
const app = require('./server');
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de Fisio Clinica corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
