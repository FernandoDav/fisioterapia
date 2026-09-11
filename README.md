# Fisio Clinica

MVP local para la gestion de una clinica de fisioterapia con roles de administrador y empleado.

## Arranque

Puede abrirse directamente desde `vistas/login.html` o ejecutarse con Express:

```powershell
npm install
npm start
```

Después abre `http://localhost:3000`.

## Menus separados

Cada menu tiene su propio HTML, JavaScript y CSS:

- `vistas/login.html` + `public/js/menus/login.js` + `public/css/menus/login.css`
- `vistas/inicio.html` + `public/js/menus/inicio.js` + `public/css/menus/inicio.css`
- `vistas/pacientes.html` + `public/js/menus/pacientes.js` + `public/css/menus/pacientes.css`
- `vistas/facturacion.html` + `public/js/menus/facturacion.js` + `public/css/menus/facturacion.css`
- `vistas/agenda.html` + `public/js/menus/agenda.js` + `public/css/menus/agenda.css`
- `vistas/estadisticas.html` + `public/js/menus/estadisticas.js` + `public/css/menus/estadisticas.css`
- `vistas/empleados.html` + `public/js/menus/empleados.js` + `public/css/menus/empleados.css`
- `vistas/pagos.html` + `public/js/menus/pagos.js` + `public/css/menus/pagos.css`
- `vistas/recordatorios.html` + `public/js/menus/recordatorios.js` + `public/css/menus/recordatorios.css`
- `vistas/calculadora.html` + `public/js/menus/calculadora.js` + `public/css/menus/calculadora.css`

Abre `vistas/login.html` para comenzar el recorrido completo. `public/js/common.js` contiene la navegación y la persistencia compartida mediante `localStorage`.

## Accesos demo

- Administrador: `admin@fisio.local` / `admin123`
- Empleado: `empleado@fisio.local` / `fisio123`

Los datos temporales se guardan en `localStorage` con la clave `fisioData`. Para reiniciar la demo, borra los datos del sitio desde las herramientas del navegador.

Consulta [`MANUAL_USUARIO.md`](MANUAL_USUARIO.md) y [`DOCUMENTACION_TECNICA.md`](DOCUMENTACION_TECNICA.md) para conocer los procesos, variables y reglas de cálculo.
