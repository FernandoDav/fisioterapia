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

const content = document.querySelector("#menuContent");
if (content) {
  content.innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">RESUMEN GENERAL</p><h2>Resumen de la clinica</h2><p>Una vista clara de lo que sucede hoy.</p></div><span class="date-pill">${todayFormatted}</span></div><div class="kpis"><div class="kpi"><span>Ingresos cobrados</span><strong>${money(revenue)}</strong><i>Facturación registrada</i></div><div class="kpi"><span>Pacientes activos</span><strong>${patients.length}</strong><i>En seguimiento</i></div><div class="kpi"><span>Sesiones registradas</span><strong>${appointments.length}</strong><i>Agenda actualizada</i></div><div class="kpi"><span>Por cobrar</span><strong>${money(pending)}</strong><i>${pending > 0 ? "Facturas pendientes" : "Todo al día"}</i></div></div><div class="dashboard-grid"><section class="panel"><div class="panel-title"><h3>Ingresos del periodo</h3><a href="estadisticas.html">Ver detalle →</a></div><div class="bar-chart">${[55, 70, 45, 82, 68, 94, 76].map((height, index) => `<i style="height:${height}%" class="${index === 6 ? "current" : ""}"></i>`).join("")}</div></section><section class="panel"><div class="panel-title"><h3>Agenda de hoy</h3><a href="agenda.html">Ver agenda →</a></div>${appointments.slice(0, 5).map((item) => `<p class="agenda-row"><b>${item.time}</b> ${item.patient}<small>${item.employee}</small></p>`).join("") || '<p class="empty">No hay citas registradas.</p>'}</section></div>`;
}
