const user = (typeof getCurrentUser === "function" ? getCurrentUser() : null);
const userName = user ? user.name.split(" ")[0] : "Usuario";
shell(`Buenos dias, ${userName}`, "inicio");

const invoices = db.invoices || [];
const patients = db.patients || [];
const appointments = db.appointments || [];

const revenue = invoices
  .filter((item) => item.status === "Pagada")
  .reduce((sum, item) => sum + Number(item.amount || item.amountUsd || 0), 0);

const pending = invoices
  .filter((item) => item.status !== "Pagada")
  .reduce((sum, item) => sum + Number(item.amount || item.amountUsd || 0), 0);

const todayFormatted = new Date().toLocaleDateString("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function generateFullUserManualPdf() {
  const manualWindow = window.open("", "_blank", "width=980,height=800");
  if (!manualWindow) {
    alert("Permite las ventanas emergentes en tu navegador para generar y descargar el manual en PDF.");
    return;
  }

  const logoUrl = new URL("../public/css/imagenes/IMG_3629.PNG", window.location.href).href;
  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const manualHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Manual de Usuario y Guía de Operaciones · Fisio Clínica</title>
  <style>
    @page {
      margin: 14mm;
      size: A4 portrait;
    }
    *, *:before, *:after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a364a;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
      margin: 0;
      padding: 24px;
    }
    .print-bar {
      position: sticky;
      top: 0;
      background: #075b9d;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -24px -24px 24px -24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .print-btn {
      background: #13bfc2;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 11pt;
    }
    .print-btn:hover { background: #0fa3a6; }
    header {
      display: flex;
      align-items: center;
      gap: 20px;
      border-bottom: 3px solid #13bfc2;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    header img {
      width: 84px;
      height: 84px;
      object-fit: contain;
    }
    .header-text h1 {
      margin: 0 0 4px;
      font-size: 22pt;
      color: #075b9d;
      line-height: 1.2;
    }
    .header-text p {
      margin: 0;
      color: #668894;
      font-size: 11pt;
      font-weight: 500;
    }
    .meta-card {
      background: #f4fbfc;
      border: 1px solid #cfe9ec;
      border-left: 4px solid #13bfc2;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 22px;
      font-size: 9.5pt;
      color: #243b53;
    }
    .module-card {
      background: #ffffff;
      border: 1px solid #cfe9ec;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .module-card h2 {
      margin: 0 0 10px;
      color: #075b9d;
      font-size: 13.5pt;
      border-bottom: 2px solid #e1f2f4;
      padding-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .module-card h3 {
      color: #126c9f;
      font-size: 10.5pt;
      margin: 12px 0 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    p, li {
      font-size: 9.8pt;
      color: #243b53;
      margin: 6px 0;
    }
    ul, ol {
      margin: 6px 0 12px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 5px;
    }
    .btn-tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 700;
      margin: 0 2px;
      background: #edf4f1;
      color: #075b9d;
      border: 1px solid #cfe9ec;
    }
    .btn-tag.primary {
      background: #13bfc2;
      color: #fff;
      border-color: #13bfc2;
    }
    .btn-tag.danger {
      background: #fde8e7;
      color: #bd554d;
      border-color: #bd554d;
    }
    .note-box {
      background: #fdfaf2;
      border-left: 3px solid #d39b42;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      color: #634a17;
      border-radius: 0 4px 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #dbeaec;
      padding: 7px 10px;
      text-align: left;
    }
    th {
      background: #dff8f7;
      color: #075b9d;
      font-weight: 700;
    }
    .toc {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin: 12px 0 18px;
      font-size: 9pt;
    }
    .toc-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #075b9d;
      font-weight: 600;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0 !important; }
      .module-card { border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>Manual de Usuario Oficial</strong> · Fisio Clínica</span>
    <button class="print-btn" onclick="window.print()">🖨️ Descargar como PDF / Imprimir</button>
  </div>

  <header>
    <img src="${logoUrl}" alt="Faz Castillo Fisioterapia">
    <div class="header-text">
      <h1>Manual de Usuario y Guía de Operaciones</h1>
      <p>Clínica de Fisioterapia · Faz Castillo Fisioterapia</p>
    </div>
  </header>

  <div class="meta-card">
    <strong>Documento:</strong> Guía Integral de Uso, Menús y Funciones del Sistema.<br>
    <strong>Fecha de emisión:</strong> ${fechaGeneracion} · <strong>Versión:</strong> 1.0 (Edición Oficial Completa).<br>
    <strong>Objetivo:</strong> Facilitar a todo el personal administrativo y clínico el conocimiento detallado de cada función, botón, cálculo financiero y buenas prácticas del sistema.
  </div>

  <div class="module-card">
    <h2>📋 Índice de Módulos</h2>
    <div class="toc">
      <div class="toc-item"><span>1.</span> Acceso y Roles de Usuario</div>
      <div class="toc-item"><span>2.</span> Navegación y Barra Superior</div>
      <div class="toc-item"><span>3.</span> Inicio y Panel de Control</div>
      <div class="toc-item"><span>4.</span> Gestión de Pacientes</div>
      <div class="toc-item"><span>5.</span> Agenda de Citas</div>
      <div class="toc-item"><span>6.</span> Facturación y Multimoneda</div>
      <div class="toc-item"><span>7.</span> Pagos del Equipo (Comisiones)</div>
      <div class="toc-item"><span>8.</span> Estadísticas y Control Financiero</div>
      <div class="toc-item"><span>9.</span> Empleados y Permisos Granulares</div>
      <div class="toc-item"><span>10.</span> Catálogo de Precios y Servicios</div>
      <div class="toc-item"><span>11.</span> Recordatorios y Tareas</div>
      <div class="toc-item"><span>12.</span> Calculadora Clínica</div>
      <div class="toc-item"><span>13.</span> Historial y Auditoría</div>
      <div class="toc-item"><span>14.</span> Respaldo y Seguridad de Datos</div>
    </div>
  </div>

  <!-- 1. Acceso y Roles -->
  <div class="module-card">
    <h2>1. 🔐 Acceso y Roles de Usuario</h2>
    <p>El sistema cuenta con autenticación segura en <code>login.html</code> con dos niveles principales de acceso:</p>
    <ul>
      <li><strong>Administrador(a):</strong> Control total del sistema, configuración de empleados, permisos granulares, precios, respaldo y reinicio.</li>
      <li><strong>Empleado(a) / Fisioterapeuta:</strong> Acceso a los módulos asignados de acuerdo con sus permisos de visualización o gestión.</li>
    </ul>
    <h3>Funciones clave del inicio de sesión:</h3>
    <ul>
      <li><span class="btn-tag">👁 / 🙈</span> <strong>Mostrar u ocultar contraseña:</strong> Permite verificar la clave ingresada antes de enviar el formulario.</li>
      <li><span class="btn-tag primary">Entrar al sistema →</span> Valida credenciales activas, registra el acceso en la auditoría y redirige al panel principal.</li>
      <li><strong>Cuentas suspendidas:</strong> Si un administrador suspende una cuenta, el sistema bloquea inmediatamente el acceso mostrando una alerta descriptiva.</li>
    </ul>
  </div>

  <!-- 2. Navegación -->
  <div class="module-card">
    <h2>2. 🧭 Navegación y Barra Superior</h2>
    <p>La interfaz incorpora un entorno ágil con cabecera fija y menú lateral retráctil:</p>
    <ul>
      <li><span class="btn-tag">☰ Menus</span> <strong>Desplegable lateral:</strong> Muestra los accesos a cada menú permitido para el rol activo. Se cierra automáticamente al navegar, al hacer clic fuera del panel o pulsando la tecla <code>Escape</code>.</li>
      <li><span class="btn-tag danger">↪ Cerrar sesion</span> Cierra la sesión activa de forma segura y devuelve a la pantalla de acceso.</li>
      <li><span class="btn-tag">♧ Número</span> <strong>Alertas pendientes:</strong> Indica en tiempo real la cantidad de recordatorios pendientes de completar. Al hacer clic conduce directamente al menú de recordatorios.</li>
    </ul>
  </div>

  <!-- 3. Inicio -->
  <div class="module-card">
    <h2>3. 🏠 Inicio y Panel de Control</h2>
    <p>Ofrece una panorámica visual en tiempo real del estado de la clínica al día de hoy:</p>
    <ul>
      <li><strong>Tarjetas de KPIs:</strong> Ingresos cobrados, pacientes activos en seguimiento, sesiones registradas en agenda y montos pendientes por cobrar.</li>
      <li><strong>Ingresos del periodo:</strong> Gráfico de barras comparativo de las últimas semanas con enlace directo a Estadísticas.</li>
      <li><strong>Agenda de hoy:</strong> Lista de las próximas citas del día con hora, paciente y terapeuta asignado.</li>
      <li><span class="btn-tag primary">📖 Manual de Uso (PDF)</span> Permite descargar este documento oficial en cualquier momento.</li>
      <li><span class="btn-tag">Generar respaldo PDF</span> (Solo Admin): Genera un archivo imprimible con todos los registros confidenciales de la clínica.</li>
      <li><span class="btn-tag danger">Borrar datos respaldados</span> (Solo Admin): Tras haber generado y guardado el respaldo en PDF, permite purgar datos operativos conservando la cuenta administradora y el catálogo de precios.</li>
    </ul>
  </div>

  <!-- 4. Pacientes -->
  <div class="module-card">
    <h2>4. 👤 Gestión de Pacientes</h2>
    <p>Centraliza los datos clínicos, demográficos y antecedentes de cada persona atendida:</p>
    <ul>
      <li><span class="btn-tag primary">+ Registrar paciente</span> Abre el formulario clínico completo para registrar nombres, apellidos, cédula, teléfono, correo, tratamiento/diagnóstico inicial, representante legal, médico remitente, terapeuta asignado, historia médica, antecedentes y medicamentos.</li>
      <li><strong>Ver expediente completo:</strong> Despliegue interactivo en cada fila que muestra la ficha médica y el historial cruzado de todas las facturas y citas del paciente.</li>
      <li><span class="btn-tag">Editar</span> Abre el modal con todos los datos precargados para corregir o actualizar el expediente. Si se modifica el nombre del paciente, el sistema actualiza automáticamente sus citas y facturas asociadas.</li>
      <li><span class="btn-tag danger">Eliminar</span> Da de baja al paciente solicitando confirmación previa y generando un registro en la auditoría.</li>
    </ul>
  </div>

  <!-- 5. Agenda -->
  <div class="module-card">
    <h2>5. 📅 Agenda de Citas</h2>
    <p>Planificación visual semanal por horas y terapeutas:</p>
    <ul>
      <li><span class="btn-tag primary">+ Nueva cita</span> Abre el formulario para programar fecha, hora, paciente, fisioterapeuta, servicio y color distintivo.</li>
      <li><strong>Agendar con 1 clic:</strong> Al hacer clic sobre cualquier celda disponible de la tabla semanal, se abre el formulario preconfigurado con la fecha y hora seleccionadas.</li>
      <li><strong>Gestión de citas ocupadas:</strong> Al hacer clic sobre una cita ya agendada, se abre una tarjeta con los detalles completos y el botón <span class="btn-tag danger">Eliminar / Cancelar cita</span> para revocarla de inmediato.</li>
      <li><strong>Filtros rápidos:</strong> Permite filtrar por paciente específico, fisioterapeuta, fecha directa mediante selector, mes y año.</li>
      <li><strong>Navegación semanal:</strong> Botones <span class="btn-tag">←</span> y <span class="btn-tag">→</span> para desplazarse entre semanas con actualización automática de encabezados.</li>
    </ul>
  </div>

  <!-- 6. Facturación -->
  <div class="module-card">
    <h2>6. 🧾 Facturación y Multimoneda</h2>
    <p>Emisión y control de pagos adaptado a la economía venezolana (USD, Bs y EUR):</p>
    <ul>
      <li><span class="btn-tag primary">+ Nueva factura</span> Selecciona paciente, empleado, servicio, número de sesiones y cantidad de servicios con cálculo instantáneo en USD, Bs y EUR.</li>
      <li><span class="btn-tag">Actualizar tasa automática</span> Consulta en tiempo real la tasa del día (DolarApi / BCV) y actualiza el tipo de cambio oficial, permitiendo también ajuste manual.</li>
      <li><strong>Flexibilidad en estado de pago:</strong> Si la factura se emite como <code>Pendiente</code> o <code>No pagada</code>, el método de pago no bloquea la creación. Si se marca como <code>Pagada</code>, es obligatorio registrar método y número de referencia bancaria (en Pago móvil, Transferencia y Zelle).</li>
      <li><span class="btn-tag">PDF</span> Genera el comprobante individual formal de la factura con el desglose de montos y equivalencias.</li>
      <li><span class="btn-tag">Generar PDF</span> (Cabecera): Imprime un reporte consolidado de todas las facturas registradas.</li>
      <li><span class="btn-tag">Editar</span> Permite actualizar el estado de pago, número de referencia o tasas de cambio.</li>
      <li><span class="btn-tag danger">Eliminar</span> Elimina facturas erróneas con confirmación y auditoría.</li>
    </ul>
  </div>

  <!-- 7. Pagos del equipo -->
  <div class="module-card">
    <h2>7. 💼 Pagos del Equipo (Comisiones)</h2>
    <p>Cálculo y liquidación transparente de honorarios profesionales:</p>
    <ul>
      <li><strong>Criterio de elegibilidad:</strong> Filtra automáticamente facturas marcadas como <code>Pagada</code>, asociadas al fisioterapeuta y dentro del rango de fechas estipulado.</li>
      <li><strong>Modos de cálculo:</strong>
        <ul>
          <li><em>Al total de facturas:</em> Aplica el porcentaje sobre la sumatoria total en Bolívares.</li>
          <li><em>A cada factura:</em> Aplica el porcentaje factura por factura y suma los resultados.</li>
        </ul>
      </li>
      <li><span class="btn-tag">PDF</span> Emite el comprobante oficial de pago detallando las facturas incluidas, porcentajes y total liquidado.</li>
      <li><span class="btn-tag">Marcar pagado</span> Asienta el pago al empleado y crea automáticamente un registro en los gastos del módulo de Estadísticas para reflejar la salida de caja.</li>
    </ul>
  </div>

  <!-- 8. Estadísticas -->
  <div class="module-card">
    <h2>8. 📈 Estadísticas y Control Financiero</h2>
    <p>Supervisión analítica de la rentabilidad y rendimiento de la clínica:</p>
    <ul>
      <li><strong>Filtro de periodo:</strong> Selector de fechas <em>Desde / Hasta</em> para analizar periodos específicos (mes, trimestre o año).</li>
      <li><strong>KPIs Financieros:</strong> Ingresos cobrados, por cobrar, ganancia neta estimada (Ingresos - Gastos), ticket promedio por factura y tasa de cobro porcentual.</li>
      <li><strong>Barras Financieras:</strong> Gráfico proporcional comparativo entre lo efectivamente cobrado, cuentas por cobrar y gastos operativos.</li>
      <li><strong>Pestañas de análisis:</strong>
        <ul>
          <li><em>Resumen:</em> Panorámica global y tabla de gastos del periodo.</li>
          <li><em>Equipo:</em> Volumen de sesiones atendidas, facturas cobradas y tasa de conversión de cada fisioterapeuta.</li>
          <li><em>Servicios:</em> Ranking de los servicios de mayor demanda.</li>
        </ul>
      </li>
      <li><span class="btn-tag">+ Registrar gasto</span> Añade gastos operativos (alquiler, nómina, insumos) que impactan en la ganancia estimada, con opción de eliminar gastos erróneos.</li>
    </ul>
  </div>

  <!-- 9. Empleados y Permisos -->
  <div class="module-card">
    <h2>9. 👥 Empleados y Permisos Granulares</h2>
    <p>Administración del equipo de trabajo y seguridad de acceso:</p>
    <ul>
      <li><span class="btn-tag primary">+ Agregar empleado</span> Registro con ficha de datos personales, puesto, fecha de ingreso, salario, cuenta bancaria para transferencias y credenciales de acceso con verificación de contraseñas.</li>
      <li><strong>Matriz de Permisos:</strong> Control granular por módulo con dos niveles:
        <ul>
          <li><em>Ver:</em> Permite únicamente consultar la información del módulo sin poder alterar registros.</li>
          <li><em>Gestionar:</em> Habilita botones de creación, modificación, cobro y eliminación.</li>
        </ul>
      </li>
      <li><span class="btn-tag">Editar</span> Actualiza datos de cualquier empleado o del propio administrador.</li>
      <li><span class="btn-tag">Suspender / Reactivar</span> Inhabilita temporalmente el inicio de sesión de un empleado sin borrar su historial.</li>
      <li><span class="btn-tag danger">Eliminar</span> Da de baja definitiva a un empleado (protegido contra auto-eliminación del administrador principal).</li>
    </ul>
  </div>

  <!-- 10. Precios y Servicios -->
  <div class="module-card">
    <h2>10. 🏷️ Catálogo de Precios y Servicios</h2>
    <p>Gestión del menú de tratamientos ofrecidos por la clínica:</p>
    <ul>
      <li><span class="btn-tag primary">+ Agregar servicio</span> Registra un nuevo servicio indicando nombre, categoría (Evaluación, Tratamiento o Complementario), duración en minutos y precio base en USD.</li>
      <li><span class="btn-tag">Activo / Inactivo</span> Alterna la disponibilidad del servicio. Los servicios inactivos se conservan en el historial pero no aparecen en el desplegable de facturas nuevas.</li>
      <li><span class="btn-tag">Editar</span> y <span class="btn-tag danger">Eliminar</span>: Mantenimiento del catálogo con confirmación de seguridad.</li>
    </ul>
  </div>

  <!-- 11. Recordatorios -->
  <div class="module-card">
    <h2>11. 🔔 Recordatorios y Tareas</h2>
    <p>Organización de responsabilidades y avisos para el personal:</p>
    <ul>
      <li><span class="btn-tag primary">+ Nueva nota</span> Programa recordatorios con título, fecha límite, frecuencia (Única, Diaria, Semanal, Mensual) y responsable asignado.</li>
      <li><span class="btn-tag">Marcar lista / Completada</span> Cambia el estado de la tarea y actualiza automáticamente el contador de pendientes de la barra superior.</li>
      <li><span class="btn-tag danger">×</span> Elimina notas caducadas registrando la acción en el historial.</li>
    </ul>
  </div>

  <!-- 12. Calculadora -->
  <div class="module-card">
    <h2>12. 🔢 Calculadora Clínica</h2>
    <p>Herramienta auxiliar para cómputos rápidos en caja y recepción:</p>
    <ul>
      <li>Operaciones básicas: suma, resta, multiplicación y división protegida contra división entre cero.</li>
      <li><span class="btn-tag">%</span> Cálculo de porcentajes para descuentos y recargos.</li>
      <li><span class="btn-tag">±</span> Inversión rápida de signo positivo / negativo.</li>
      <li><span class="btn-tag">C</span> y <span class="btn-tag">⌫</span>: Limpieza total o borrado del último dígito.</li>
      <li><strong>Soporte de Teclado Físico:</strong> Permite utilizar el teclado numérico de la computadora (números, operadores, Enter, Backspace y Escape).</li>
    </ul>
  </div>

  <!-- 13. Historial -->
  <div class="module-card">
    <h2>13. 📜 Historial y Auditoría Inmutable</h2>
    <p>Registro cronológico y trazabilidad de todas las operaciones realizadas:</p>
    <ul>
      <li><strong>Inmutabilidad:</strong> Los registros no se pueden alterar ni borrar manualmente, garantizando transparencia contable y administrativa.</li>
      <li><strong>Búsqueda en tiempo real:</strong> Filtro instantáneo por texto sin pérdida de foco en el campo de búsqueda.</li>
      <li><strong>Filtros por categoría:</strong> Pacientes, Usuarios, Facturas, Citas, Servicios y Recordatorios.</li>
      <li><strong>Ficha de Persona:</strong> Consulta cruzada de facturas y eventos asociados a cualquier paciente o terapeuta.</li>
      <li><span class="btn-tag primary">Generar PDF</span> Exporta reportes auditados selectivos con opción de imprimir toda la información o filtrar por personas.</li>
    </ul>
  </div>

  <!-- 14. Buenas prácticas -->
  <div class="module-card">
    <h2>14. 💡 Buenas Prácticas y Respaldo de Seguridad</h2>
    <div class="note-box">
      <strong>Importante:</strong> El sistema opera con persistencia local en el navegador (<code>localStorage</code>). Para garantizar la integridad de los datos, siga estas recomendaciones:
    </div>
    <ul>
      <li><strong>Respaldos periódicos:</strong> Genere al menos un respaldo semanal en PDF desde el menú Inicio (<span class="btn-tag">Generar respaldo PDF</span>).</li>
      <li><strong>Evite el modo incógnito:</strong> No utilice ventanas privadas de navegador si desea conservar los registros de manera permanente.</li>
      <li><strong>Uso en equipo:</strong> Si varios usuarios utilizan la misma computadora, asegúrese de que cada persona cierre su sesión con <span class="btn-tag danger">↪ Cerrar sesion</span> antes de que el siguiente terapeuta ingrese al sistema.</li>
    </ul>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

  manualWindow.document.open();
  manualWindow.document.write(manualHtml);
  manualWindow.document.close();
}

const content = document.querySelector("#menuContent");
if (content) {
  content.innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">RESUMEN GENERAL</p>
        <h2>Resumen de la clinica</h2>
        <p>Una vista clara de lo que sucede hoy.</p>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button id="downloadManualBtn" class="secondary-button" type="button" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
          <span>📖</span> Manual de Uso (PDF)
        </button>
        <span class="date-pill">${todayFormatted}</span>
      </div>
    </div>
    <div class="kpis">
      <div class="kpi"><span>Ingresos cobrados</span><strong>${money(revenue)}</strong><i>Facturación registrada</i></div>
      <div class="kpi"><span>Pacientes activos</span><strong>${patients.length}</strong><i>En seguimiento</i></div>
      <div class="kpi"><span>Sesiones registradas</span><strong>${appointments.length}</strong><i>Agenda actualizada</i></div>
      <div class="kpi"><span>Por cobrar</span><strong>${money(pending)}</strong><i>${pending > 0 ? "Facturas pendientes" : "Todo al día"}</i></div>
    </div>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-title">
          <h3>Ingresos del periodo</h3>
          <a href="estadisticas.html">Ver detalle →</a>
        </div>
        <div class="bar-chart">
          ${[55, 70, 45, 82, 68, 94, 76]
            .map(
              (height, index) =>
                `<i style="height:${height}%" class="${index === 6 ? "current" : ""}"></i>`,
            )
            .join("")}
        </div>
      </section>
      <section class="panel">
        <div class="panel-title">
          <h3>Agenda de hoy</h3>
          <a href="agenda.html">Ver agenda →</a>
        </div>
        ${
          appointments.slice(0, 5).map((item) => `<p class="agenda-row"><b>${item.time}</b> ${item.patient}<small>${item.employee}</small></p>`).join("") ||
          '<p class="empty">No hay citas registradas.</p>'
        }
      </section>
    </div>
    <section class="panel" style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; background: linear-gradient(135deg, #e8f9f9 0%, #ffffff 100%); border-left: 4px solid var(--teal); padding: 18px 22px; border-radius: 8px;">
      <div>
        <h3 style="margin: 0 0 6px; color: var(--ink);">Guía y Manual Oficial de Operaciones</h3>
        <p style="margin: 0; color: var(--muted); font-size: 13px;">Descarga la guía completa en formato PDF con la explicación paso a paso de cada menú, botones, cobros, comisiones y procedimientos de la clínica.</p>
      </div>
      <button id="downloadManualBannerBtn" class="primary-button" type="button" style="font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
        <span>📥</span> Descargar Manual en PDF
      </button>
    </section>
  `;

  document.querySelector("#downloadManualBtn")?.addEventListener("click", generateFullUserManualPdf);
  document.querySelector("#downloadManualBannerBtn")?.addEventListener("click", generateFullUserManualPdf);

  const currentUser = getCurrentUser();
  if (
    localStorage.getItem("fisioRole") === "admin" &&
    currentUser?.role === "admin"
  ) {
    content.insertAdjacentHTML(
      "beforeend",
      `<section class="panel reset-panel"><div><h3>Reiniciar datos de la clínica</h3><p>Genera y guarda primero un respaldo PDF. Después podrás eliminar cuentas (excepto la administradora actual), empleados, pacientes, citas, facturas, gastos, pagos y registros históricos. Los servicios y precios se conservarán. El PDF contiene información confidencial; guárdalo de forma segura.</p></div><div class="reset-actions"><button id="backupClinicData" class="secondary-button">Generar respaldo PDF</button><button id="resetClinicData" class="danger-button" disabled>Borrar datos respaldados</button></div><small id="resetStatus" role="status">El borrado solo afecta los datos de este navegador.</small></section>`,
    );

    const backupButton = document.querySelector("#backupClinicData");
    const resetButton = document.querySelector("#resetClinicData");
    const resetStatus = document.querySelector("#resetStatus");
    let backupData = null;
    let backupFingerprint = null;

    function backupSection(title, records) {
      const json = JSON.stringify(
        records,
        (key, value) =>
          key.toLowerCase() === "password" ? undefined : value,
        2,
      );
      const safeJson = json.replace(/[&<>"']/g, (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[character];
      });
      return `<section class="backup-section"><h2>${title} (${records.length})</h2><pre class="backup-json">${safeJson}</pre></section>`;
    }

    backupButton.onclick = () => {
      backupFingerprint = localStorage.getItem("fisioData");
      if (!backupFingerprint) {
        resetStatus.textContent =
          "No se encontraron datos para respaldar. No se realizó ningún cambio.";
        return;
      }
      backupData = JSON.parse(backupFingerprint);
      const invoices = backupData.invoices || [];
      const expenses = backupData.expenses || [];
      const payrollPayments = backupData.payrollPayments || [];
      const paidRevenue = invoices
        .filter((invoice) => invoice.status === "Pagada")
        .reduce(
          (sum, invoice) =>
            sum +
            Number(
              invoice.amountBs ||
                Number(invoice.amountUsd || invoice.amount || 0) *
                  Number(invoice.dollarRate || 36),
            ),
          0,
        );
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + Number(expense.amountBs || 0),
        0,
      );
      const sections = [
        `<h2>Resumen</h2><p>Ingresos cobrados: Bs ${paidRevenue.toFixed(2)} · Gastos registrados: Bs ${totalExpenses.toFixed(2)} · Ganancia estimada: Bs ${(paidRevenue - totalExpenses).toFixed(2)}</p><p>Las contraseñas se excluyen del respaldo.</p>`,
        backupSection("Cuentas", backupData.users || []),
        backupSection("Empleados", backupData.employees || []),
        backupSection("Pacientes", backupData.patients || []),
        backupSection("Citas", backupData.appointments || []),
        backupSection("Facturas e ingresos", invoices),
        backupSection("Gastos", expenses),
        backupSection("Pagos al equipo", payrollPayments),
        backupSection("Recordatorios", backupData.notes || []),
        backupSection("Historial de auditoría", backupData.auditLog || []),
        backupSection("Registros de acceso", backupData.loginLogs || []),
      ];
      const opened = printReport(
        "Respaldo de datos · Fisio Clinica",
        `Generado ${new Date().toLocaleString("es-MX")}`,
        sections,
      );
      if (!opened) return;
      resetButton.disabled = false;
      resetStatus.textContent =
        "Se abrió el respaldo. Guárdalo como PDF y luego confirma el borrado.";
    };

    resetButton.onclick = () => {
      if (
        !backupData ||
        localStorage.getItem("fisioData") !== backupFingerprint
      ) {
        resetButton.disabled = true;
        resetStatus.textContent =
          "Los datos cambiaron desde el respaldo. Genera un respaldo nuevo antes de borrar.";
        return;
      }
      const currentData = JSON.parse(backupFingerprint);
      const currentAdmin = (currentData.users || []).find(
        (account) =>
          account.email === localStorage.getItem("fisioUser") &&
          account.role === "admin" &&
          account.active !== false,
      );
      if (
        !currentAdmin ||
        localStorage.getItem("fisioRole") !== "admin"
      ) {
        alert("Solo la administradora activa puede reiniciar los datos.");
        return;
      }
      if (
        !confirm(
          "¿Ya guardaste el respaldo como PDF? Se eliminarán permanentemente los datos de este navegador, excepto la cuenta administradora actual y el catálogo de servicios.",
        )
      )
        return;

      const resetData = {
        ...currentData,
        users: [currentAdmin],
        employees: [],
        patients: [],
        appointments: [],
        invoices: [],
        notes: [],
        expenses: [],
        payrollPayments: [],
        loginLogs: [],
        auditLog: [
          {
            id: Date.now(),
            type: "sistema",
            action: "reinicio",
            description: "Se reiniciaron los datos de la clínica.",
            user: currentAdmin.email,
            date: new Date().toISOString(),
          },
        ],
      };

      try {
        localStorage.setItem("fisioData", JSON.stringify(resetData));
      } catch (error) {
        resetStatus.textContent = `No se pudo guardar el reinicio: ${error.message}`;
        return;
      }
      location.reload();
    };
  }
}
