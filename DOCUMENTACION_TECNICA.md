# Documentacion tecnica · Fisio Clinica

## Arquitectura

- `vistas/`: entradas HTML independientes.
- `public/js/common.js`: base de datos local, sesion, permisos, navegacion, modales y auditoria.
- `public/js/menus/`: logica especifica de cada menu.
- `public/css/style.css`: variables de marca, layout y componentes globales.
- `public/css/menus/`: estilos especificos.
- `public/css/imagenes/`: logos de la clinica.
- `server.js`: servidor Express estatico opcional.

## Persistencia

La variable global `db` se hidrata desde `localStorage.fisioData` y se guarda con `save()`. Las colecciones principales son:

- `patients`
- `employees`
- `users`
- `services`
- `invoices`
- `appointments`
- `notes`
- `auditLog`

## Sesion y autorizacion

`fisioUser` y `fisioRole` identifican la sesion local. `shell()` valida que el usuario exista y no este suspendido antes de renderizar cualquier menu. `hasPermission(menu, action)` controla visualizacion y gestion.

## Facturacion

Una factura guarda precio unitario, cantidad de servicios, sesiones, tasa USD/Bs, tasa EUR/Bs, equivalentes monetarios, método de pago, referencia, estado, paciente, empleado y fecha.

`tasa.js` consulta primero un proxy local, luego DolarApi y finalmente un proveedor de tipo de cambio externo. Usa caché temporal y permite una tasa manual si no hay conexión. La tasa usada queda en `dollarRate` y el total histórico en `amountBs`.

Valores:

- `amountUsd = precio unitario USD × sesiones × cantidad de servicios`
- `amountBs = amountUsd × dollarRate`
- `amountEur = amountBs / euroRate`

## Pagos

El menu `pagos.js` filtra `invoices` por:

- `status === "Pagada"`
- empleado asignado
- fecha entre `fromDate` y `toDate`

Después suma `amountBs` y aplica el porcentaje manual.

El modo `total` calcula el porcentaje sobre el acumulado. El modo `invoice` calcula el porcentaje de cada factura y suma esos resultados. Para datos antiguos sin `amountBs`, se usa como compatibilidad `amountUsd × dollarRate`.

## Auditoria

`logEvent(type, action, description, data)` elimina contraseñas del snapshot y agrega eventos a `auditLog`. No existe una acción de borrado para esos eventos.

## Express y Rutas

Express sirve los archivos estáticos y centraliza las redirecciones en `routes/routes.js`:
- `/` y `/login` redirigen a `vistas/login.html`.
- Rutas limpias (`/inicio`, `/pacientes`, `/facturacion`, `/agenda`, `/estadisticas`, `/empleados`, `/pagos`, `/recordatorios`, `/calculadora`, `/historial`, `/precios`) y con `.html` redirigen automáticamente a sus vistas correspondientes en `/vistas/<menu>.html`.
- La persistencia continúa siendo local del navegador (`localStorage.fisioData`); no hay base de datos de servidor en esta fase.

## Despliegue en Vercel

La configuración en `vercel.json`:
- Establece `"outputDirectory": "."` para que Vercel incluya la raíz completa del proyecto (`vistas/`, `public/`, etc.) y no solo la carpeta `public/`.
- Configura redirecciones automáticas para todas las rutas y menús hacia sus respectivas vistas en `/vistas/`.
- Mantiene `"cleanUrls": false` para preservar la resolución relativa nativa de enlaces entre vistas (`inicio.html`, `pacientes.html`, etc.).
- Incluye `index.html` en la raíz y en `public/` con redirección inmediata a `/vistas/login.html`.
