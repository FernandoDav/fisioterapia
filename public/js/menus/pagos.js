shell("Pagos del equipo", "pagos");

let fromDate = "2026-01-01";
let toDate = "2026-12-31";
let percentage = 40;
let calculationMode = "total";

function eligibleInvoices(employee) {
  return db.invoices.filter(
    (invoice) =>
      invoice.employee === employee &&
      invoice.status === "Pagada" &&
      invoice.date >= fromDate &&
      invoice.date <= toDate,
  );
}
function employeeCalculation(employeeName) {
  const invoices = eligibleInvoices(employeeName);
  const totals = invoices.map((invoice) =>
    Number(
      invoice.amountBs ||
        Number(invoice.amountUsd || invoice.amount || 0) *
          Number(invoice.dollarRate || 36),
    ),
  );
  const totalBs = totals.reduce((sum, amount) => sum + amount, 0);
  const paymentBs =
    calculationMode === "invoice"
      ? totals.reduce((sum, amount) => sum + (amount * percentage) / 100, 0)
      : (totalBs * percentage) / 100;
  return { invoices, totals, totalBs, paymentBs };
}
function exportPayroll(employeeName, markAsPaid = false) {
  const employee = db.employees.find((item) => item.name === employeeName);
  const result = employeeCalculation(employeeName);
  const date = new Date().toISOString().slice(0, 10);
  printReport(
    `Comprobante de pago · ${employeeName}`,
    `Periodo ${fromDate} al ${toDate} · ${date}`,
    [
      `<h2>Empleado</h2><p>${employeeName} · ${employee?.role || "Fisioterapeuta"}</p><h2>Resumen</h2><p>Total facturado en Bs: <span class="total">Bs ${result.totalBs.toFixed(2)}</span></p><p>Porcentaje aplicado: ${percentage}% · Modo: ${calculationMode === "invoice" ? "por factura" : "sobre total"}</p><p>Monto a pagar: <span class="total">Bs ${result.paymentBs.toFixed(2)}</span></p><h2>Facturas incluidas</h2><table><tr><th>Factura</th><th>Paciente</th><th>Fecha</th><th>Total Bs</th></tr>${result.invoices.map((invoice, index) => `<tr><td>${invoice.id}</td><td>${invoice.patient}</td><td>${invoice.date}</td><td>Bs ${result.totals[index].toFixed(2)}</td></tr>`).join("")}</table>`,
    ],
  );
  if (!markAsPaid) return;
  const payment = {
    id: Date.now(),
    employee: employeeName,
    fromDate,
    toDate,
    percentage,
    calculationMode,
    amountBs: Number(result.paymentBs.toFixed(2)),
    date,
  };
  db.payrollPayments.push(payment);
  db.expenses.push({
    id: Date.now() + 1,
    concept: `Pago a ${employeeName}`,
    amountBs: payment.amountBs,
    date,
    payroll: true,
  });
  logEvent(
    "pagos",
    "pagar_empleado",
    `Se registro pago de Bs ${payment.amountBs.toFixed(2)} para ${employeeName}.`,
    payment,
  );
  save();
  render();
}
function render() {
  const rows = (db.employees || [])
    .filter((employee) => employee.role !== "Administradora")
    .map((employee) => {
      const result = employeeCalculation(employee.name);
      return `<tr><td><strong>${employee.name}</strong></td><td>${result.invoices.length}</td><td>Bs ${result.totalBs.toFixed(2)}</td><td><strong>Bs ${result.paymentBs.toFixed(2)}</strong><small>${calculationMode === "invoice" ? "Por factura" : "Sobre total"}</small></td><td>${result.invoices.map((invoice, index) => `<small>${invoice.id} · ${invoice.date} · Bs ${result.totals[index].toFixed(2)}</small>`).join("") || "<small>Sin facturas en el periodo</small>"}</td><td><button class="table-action payroll-pdf" data-employee="${employee.name}">PDF</button><button class="table-action payroll-paid" data-employee="${employee.name}">Marcar pagado</button></td></tr>`;
    })
    .join("");
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">ADMINISTRACION</p><h2>Pagos del equipo</h2><p>Calcula, reporta y registra pagos usando facturas pagadas.</p></div></div><section class="panel payment-filters"><label>Desde<input id="fromDate" type="date" value="${fromDate}"></label><label>Hasta<input id="toDate" type="date" value="${toDate}"></label><label>Porcentaje a pagar (%)<input id="percentage" type="number" min="0" max="100" step="0.01" value="${percentage}"></label><label>Aplicar porcentaje<select id="calculationMode"><option value="total" ${calculationMode === "total" ? "selected" : ""}>Al total de facturas</option><option value="invoice" ${calculationMode === "invoice" ? "selected" : ""}>A cada factura</option></select></label><button id="applyFilters" class="primary-button">Calcular pagos</button></section><section class="panel table-panel"><div class="panel-title"><div><h3>Comisiones del periodo</h3><p>Los pagos registrados se descuentan como gastos en estadísticas.</p></div><span class="date-pill">${fromDate} → ${toDate} · ${percentage}%</span></div><table><thead><tr><th>Empleado</th><th>Facturas pagadas</th><th>Total Bs</th><th>Pago Bs</th><th>Facturas incluidas</th><th>Reportes</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  document.querySelector("#applyFilters").onclick = () => {
    const nextFrom = document.querySelector("#fromDate").value;
    const nextTo = document.querySelector("#toDate").value;
    const nextPercentage = Number(document.querySelector("#percentage").value);
    if (!nextFrom || !nextTo || nextFrom > nextTo)
      return alert("Selecciona un rango de fechas valido.");
    if (nextPercentage < 0 || nextPercentage > 100)
      return alert("El porcentaje debe estar entre 0 y 100.");
    fromDate = nextFrom;
    toDate = nextTo;
    percentage = nextPercentage;
    calculationMode = document.querySelector("#calculationMode").value;
    logEvent(
      "pagos",
      "calcular",
      `Se calcularon pagos del ${fromDate} al ${toDate} con ${percentage}% en modo ${calculationMode}.`,
      { fromDate, toDate, percentage, calculationMode },
    );
    render();
  };
  document
    .querySelectorAll(".payroll-pdf")
    .forEach(
      (button) =>
        (button.onclick = () => exportPayroll(button.dataset.employee)),
    );
  document.querySelectorAll(".payroll-paid").forEach(
    (button) =>
      (button.onclick = () => {
        if (
          confirm(
            `¿Registrar como pagado el monto calculado para ${button.dataset.employee}?`,
          )
        )
          exportPayroll(button.dataset.employee, true);
      }),
  );
}
render();
