# Manual de usuario · Fisio Clinica

## Inicio

1. Ejecuta `npm install` una sola vez.
2. Ejecuta `npm start`.
3. Abre `http://localhost:3000`.
4. Inicia sesion con un usuario activo.

Usuarios demo:

- Administradora: `admin@fisio.local` / `admin123`
- Empleado: `empleado@fisio.local` / `fisio123`

## Navegacion

El boton `Menus` abre el panel de modulos. `Cerrar sesion` elimina la sesion local y devuelve al login.

## Pacientes

Registra datos de contacto, cedula, historial medico, tratamiento y empleado. En el expediente puedes consultar facturas y sesiones relacionadas.

## Agenda

Usa los filtros de paciente, empleado, fecha, mes y año. Las celdas libres permiten crear citas. Cada cita guarda servicio, empleado, color, fecha y hora.

## Facturacion

1. Selecciona paciente, empleado y servicio.
2. Indica sesiones y cantidad de servicios.
3. Confirma o cambia las tasas USD/Bs y EUR/Bs.
   Puedes pulsar `Actualizar tasa automática`; si el servicio externo no responde, conserva o escribe una tasa manual.
4. Revisa los totales en USD, EUR y Bs.
5. Elige método de pago y estado.
6. Añade referencia para Pago movil, Transferencia o Zelle.

El total en Bs queda guardado en la factura.

La factura conserva la tasa USD/Bs utilizada, la fuente indicada y el total exacto en Bs. Las facturas antiguas no se recalculan.

## Pagos del equipo

Selecciona fechas desde/hasta, el porcentaje a pagar y el modo `A cada factura` o `Al total de facturas`. El sistema considera únicamente facturas pagadas, asignadas al empleado y dentro del rango.

Modo total:

`pago del empleado = suma de facturas pagadas en Bs × porcentaje / 100`

Modo por factura:

`pago del empleado = suma de (cada factura en Bs × porcentaje / 100)`

## Empleados y permisos

La administradora puede crear, editar, suspender, reactivar y eliminar usuarios. Los permisos separan visualización y gestión por menú.

## Historial

El historial es de solo lectura. Conserva eventos incluso si se elimina un paciente, usuario, servicio o recordatorio.

## Datos locales

La aplicación usa `localStorage` con la clave `fisioData`. Para reiniciar la demo, elimina esa clave desde las herramientas del navegador.
