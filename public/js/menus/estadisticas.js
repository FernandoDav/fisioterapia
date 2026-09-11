shell("Estadisticas", "estadisticas");

let fromDate = "2026-01-01";
let toDate = "2026-12-31";
let activeView = "general";

function periodInvoices() {
  return db.invoices.filter(
    (invoice) => invoice.date >= fromDate && invoice.date <= toDate,
  );
}
function periodAppointments() {
  return db.appointments.filter(
    (appointment) => appointment.date >= fromDate && appointment.date <= toDate,
  );
}
function moneyBs(value) {
  return `Bs ${Number(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function invoiceBs(invoice) {
  return Number(
    invoice.amountBs ||
      Number(invoice.amountUsd || invoice.amount || 0) *
        Number(invoice.dollarRate || 36),
  );
}
function render() {
  const invoices = periodInvoices();
  const appointments = periodAppointments();
  const paid = invoices.filter((invoice) => invoice.status === "Pagada");
  const pending = invoices.filter((invoice) => invoice.status !== "Pagada");
  const revenueBs = paid.reduce((sum, invoice) => sum + invoiceBs(invoice), 0);
  const pendingBs = pending.reduce(
    (sum, invoice) => sum + invoiceBs(invoice),
    0,
  );
  const expensesBs = (db.expenses || [])
    .filter((expense) => expense.date >= fromDate && expense.date <= toDate)
    .reduce((sum, expense) => sum + Number(expense.amountBs || 0), 0);
  const uniquePatients = new Set(
    appointments.map((appointment) => appointment.patient),
  );
  const averageTicket = paid.length ? revenueBs / paid.length : 0;
  const serviceCounts = {};
  appointments.forEach((appointment) => {
    const key = appointment.service || "Servicio no especificado";
    serviceCounts[key] = (serviceCounts[key] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const employeeRows = (db.employees || [])
    .filter((employee) => employee.role !== "Administradora")
    .map((employee) => {
      const employeeAppointments = appointments.filter(
        (appointment) => appointment.employee === employee.name,
      );
      const employeeInvoices = paid.filter(
        (invoice) => invoice.employee === employee.name,
      );
      const total = employeeInvoices.reduce(
        (sum, invoice) => sum + invoiceBs(invoice),
        0,
      );
      return `<tr><td><strong>${employee.name}</strong></td><td>${employeeAppointments.length}</td><td>${employeeInvoices.length}</td><td>${moneyBs(total)}</td><td><span class="status">${employeeAppointments.length ? Math.round((employeeInvoices.length / employeeAppointments.length) * 100) : 0}% cobro</span></td></tr>`;
    })
    .join("");
  const maxService = Math.max(...topServices.map((item) => item[1]), 1);
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">ANALISIS DEL NEGOCIO</p><h2>Estadisticas</h2><p>Control financiero, operativo y de rendimiento de la clinica.</p></div><button id="addExpense" class="secondary-button">+ Registrar gasto</button></div><section class="panel stats-filters"><label>Desde<input id="fromDate" type="date" value="${fromDate}"></label><label>Hasta<input id="toDate" type="date" value="${toDate}"></label><button id="applyDates" class="primary-button">Actualizar analisis</button></section><div class="kpis"><div class="kpi"><span>Ingresos cobrados</span><strong>${moneyBs(revenueBs)}</strong><i>${paid.length} facturas pagadas</i></div><div class="kpi"><span>Por cobrar</span><strong>${moneyBs(pendingBs)}</strong><i>${pending.length} facturas pendientes</i></div><div class="kpi"><span>Ganancia estimada</span><strong>${moneyBs(revenueBs - expensesBs)}</strong><i>Ingresos menos gastos</i></div><div class="kpi"><span>Ticket promedio</span><strong>${moneyBs(averageTicket)}</strong><i>Por factura pagada</i></div><div class="kpi"><span>Pacientes atendidos</span><strong>${uniquePatients.size}</strong><i>${appointments.length} sesiones registradas</i></div><div class="kpi"><span>Tasa de cobro</span><strong>${invoices.length ? Math.round((paid.length / invoices.length) * 100) : 0}%</strong><i>Facturas pagadas del periodo</i></div></div><div class="stats-tabs"><button data-view="general" class="${activeView === "general" ? "active" : ""}">Resumen</button><button data-view="team" class="${activeView === "team" ? "active" : ""}">Equipo</button><button data-view="services" class="${activeView === "services" ? "active" : ""}">Servicios</button></div><div class="dashboard-grid"><section class="panel"><div class="panel-title"><div><h3>Estado financiero</h3><p>${fromDate} → ${toDate}</p></div></div><div class="financial-bars"><div><span>Cobrado</span><i style="width:${revenueBs || 0}%"></i><b>${moneyBs(revenueBs)}</b></div><div><span>Por cobrar</span><i class="pending-bar" style="width:${pendingBs ? Math.min((pendingBs / Math.max(revenueBs, pendingBs)) * 100, 100) : 0}%"></i><b>${moneyBs(pendingBs)}</b></div><div><span>Gastos</span><i class="expense-bar" style="width:${expensesBs ? Math.min((expensesBs / Math.max(revenueBs, expensesBs)) * 100, 100) : 0}%"></i><b>${moneyBs(expensesBs)}</b></div></div></section><section class="panel"><div class="panel-title"><div><h3>Servicios más solicitados</h3><p>Sesiones del periodo</p></div></div>${topServices.length ? topServices.map(([name, count]) => `<div class="service-stat"><span>${name}</span><i><b style="width:${(count / maxService) * 100}%"></b></i><strong>${count}</strong></div>`).join("") : '<p class="empty">No hay sesiones en este periodo.</p>'}</section></div><section class="panel table-panel"><div class="panel-title"><div><h3>Desempeño del equipo</h3><p>Pacientes, facturas y cobros registrados.</p></div></div><table><thead><tr><th>Empleado</th><th>Sesiones</th><th>Facturas pagadas</th><th>Facturado Bs</th><th>Conversión</th></tr></thead><tbody>${employeeRows || '<tr><td colspan="5" class="empty">No hay empleados disponibles.</td></tr>'}</tbody></table></section><section class="panel activity-summary"><h3>Lectura del periodo</h3><p>Se atendieron <strong>${uniquePatients.size}</strong> pacientes en <strong>${appointments.length}</strong> sesiones. La clinica cobró <strong>${moneyBs(revenueBs)}</strong> y mantiene <strong>${moneyBs(pendingBs)}</strong> por cobrar.</p></section>`;
  document.querySelector("#applyDates").onclick = () => {
    const nextFrom = document.querySelector("#fromDate").value;
    const nextTo = document.querySelector("#toDate").value;
    if (!nextFrom || !nextTo || nextFrom > nextTo)
      return alert("Selecciona un rango de fechas valido.");
    fromDate = nextFrom;
    toDate = nextTo;
    logEvent(
      "estadisticas",
      "filtrar",
      `Se consultaron estadisticas del ${fromDate} al ${toDate}.`,
      { fromDate, toDate },
    );
    render();
  };
  document.querySelectorAll("[data-view]").forEach(
    (button) =>
      (button.onclick = () => {
        activeView = button.dataset.view;
        render();
      }),
  );
  document.querySelector("#addExpense").onclick = () =>
    formCard(
      "Registrar gasto",
      `<label>Concepto<input name="concept" required></label><label>Monto en Bs<input name="amountBs" type="number" min="0.01" step="0.01" required></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label>`,
      "expenses",
      render,
    );
}
render();
