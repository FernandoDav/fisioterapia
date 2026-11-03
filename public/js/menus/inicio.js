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
