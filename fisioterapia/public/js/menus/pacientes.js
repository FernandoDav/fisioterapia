shell("Pacientes", "pacientes");

function invoiceStatusClass(status) {
  const normalized = String(status || "Pendiente").toLowerCase();
  if (normalized.includes("no pag")) return "invoice-unpaid";
  if (normalized.includes("pagad")) return "invoice-paid";
  return "invoice-pending";
}

function sessionStatus(session) {
  if (session.status) return session.status;
  return session.date < "2026-08-24" ? "Terminada" : "Pendiente";
}

function employeeOptions() {
  return (db.employees || [])
    .filter((employee) => employee.role !== "Administradora")
    .map(
      (employee) =>
        `<option value="${employee.name}">${employee.name}</option>`,
    )
    .join("");
}

function patientDetails(patient) {
  const invoices = db.invoices.filter(
    (invoice) => invoice.patient === patient.name,
  );
  const sessions = db.appointments.filter(
    (session) => session.patient === patient.name,
  );
  const invoiceHistory = invoices.length
    ? invoices
        .map(
          (invoice) =>
            `<div class="history-item ${invoiceStatusClass(invoice.status)}"><strong>${invoice.id} · ${invoice.service || "Servicio no especificado"}</strong><span>${invoice.date} · USD ${money(invoice.amountUsd || invoice.amount)} · EUR €${invoice.amountEur || "0.00"} · Bs ${invoice.amountBs || "0.00"}</span><small>${invoice.paymentMethod || "Método no registrado"}${invoice.reference ? ` · Ref. ${invoice.reference}` : ""}</small><b>${invoice.status || "Pendiente"}</b></div>`,
        )
        .join("")
    : '<p class="history-empty">No hay facturas registradas.</p>';
  const sessionHistory = sessions.length
    ? sessions
        .map(
          (session) =>
            `<div class="history-item session-item"><strong>${session.service || "Servicio no especificado"}</strong><span>${session.date} · ${session.time || "Hora no indicada"} · ${session.employee || "Sin empleado"}</span><b>${sessionStatus(session)}</b></div>`,
        )
        .join("")
    : '<p class="history-empty">No hay sesiones registradas.</p>';
  
  return `<details class="patient-details"><summary>Ver expediente completo</summary><div class="patient-file"><div class="patient-data">
    <div><span>Nombres</span><strong>${patient.firstNames || "No registrado"}</strong></div>
    <div><span>Apellidos</span><strong>${patient.lastNames || "No registrado"}</strong></div>
    <div><span>Fecha ingreso</span><strong>${patient.date || "No registrada"}</strong></div>
    <div><span>Dirección</span><strong>${patient.address || "No registrada"}</strong></div>
    <div><span>Representante</span><strong>${patient.representative || "No requiere"}</strong></div>
    <div><span>Estatus</span><strong>${patient.status || "Primera visita"}</strong></div>
    <div><span>Referido por</span><strong>${patient.referredBy || "No referido"}</strong></div>
    <div><span>Empleado asignado</span><strong>${patient.employee || "Sin asignar"}</strong></div>
    <div><span>Teléfono</span><strong>${patient.phone || "No registrado"}</strong></div>
    <div><span>Correo</span><strong>${patient.email || "No registrado"}</strong></div>
    <div class="wide medical-history"><span>Historia médica</span><strong>${patient.medicalHistory || "Sin historia médica registrada."}</strong></div>
    <div class="wide"><span>Antecedentes médicos</span><strong>${patient.medicalBackground ? (Array.isArray(patient.medicalBackground) ? patient.medicalBackground.join(", ") : patient.medicalBackground) : "Sin antecedentes registrados"}</strong></div>
    <div class="wide"><span>Observaciones</span><strong>${patient.observations || "Sin observaciones"}</strong></div>
    <div class="wide"><span>Medicamentos</span><strong>${patient.medications || "Sin medicamentos registrados"}</strong></div>
  </div><div class="history-columns"><div><h4>Facturas</h4>${invoiceHistory}</div><div><h4>Sesiones en la clinica</h4>${sessionHistory}</div></div></div></details>`;
}

function render() {
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">GESTION CLINICA</p><h2>Pacientes</h2><p>Consulta el expediente y el historial completo de cada paciente.</p></div><button id="new" class="primary-button">+ Registrar paciente</button></div><section class="panel table-panel"><table><thead><tr><th>Paciente</th><th>Nombres</th><th>Apellidos</th><th>Tratamiento</th><th>Fisioterapeuta</th><th>Ingreso</th><th>Estado</th></tr></thead><tbody>${db.patients.map((patient) => `<tr><td><strong>${patient.name}</strong><small>Cédula: ${patient.cedula || "No registrada"}</small>${patientDetails(patient)}</td><td>${patient.firstNames || "No registrado"}</td><td>${patient.lastNames || "No registrado"}</td><td>${patient.therapy || "Sin tratamiento"}</td><td>${patient.employee || "Sin asignar"}</td><td>${patient.date}</td><td><span class="status">${patient.status || "Primera visita"}</span></td></tr>`).join("")}</tbody></table></section>`;
  document.querySelector("#new").onclick = () =>
    formCard(
      "Registrar paciente",
      `<label>Nombres<input name="firstNames" required></label><label>Apellidos<input name="lastNames" required></label><label>Nombre completo<input name="name" required></label><label>Cedula<input name="cedula" required></label><label>Fecha de ingreso<input name="date" type="date" value="2026-08-24" required></label><label>Direccion<input name="address"></label><label>Representante<select name="representative"><option value="">No requiere representante</option><option value="Menor de edad">Menor de edad</option><option value="Persona con necesidades especiales">Persona con necesidades especiales</option><option value="Atención especial requerida">Atención especial requerida</option></select></label><label class="wide">Historia médica<textarea name="medicalHistory" rows="3" placeholder="Historia clínica del paciente"></textarea></label><label>Antecedentes médicos<select name="medicalBackground" multiple style="height: 100px"><option value="Hipertensión">Hipertensión</option><option value="Diabetes">Diabetes</option><option value="Asma">Asma</option><option value="Alergias">Alergias</option><option value="Cardiopatías">Cardiopatías</option><option value="Enfermedades respiratorias">Enfermedades respiratorias</option><option value="Artritis">Artritis</option><option value="Osteoporosis">Osteoporosis</option><option value="Cáncer">Cáncer</option><option value="Enfermedades autoinmunes">Enfermedades autoinmunes</option><option value="Otra">Otra (especificar en observaciones)</option></select></label><label>Estatus<select name="status"><option>Primera visita</option><option>En tratamiento</option><option>Alta médica</option><option>Seguimiento</option><option>Urgencia</option></select></label><label>Referido por doctor<input name="referredBy" placeholder="Nombre del doctor"></label><label>Empleado asignado<select name="employee">${employeeOptions()}</select></label><label>Observaciones<textarea name="observations" rows="3" placeholder="Observaciones adicionales"></textarea></label><label>Medicamentos<textarea name="medications" rows="3" placeholder="Medicamentos que toma el paciente"></textarea></label>`,
      "patients",
      render,
    );
}

render();
