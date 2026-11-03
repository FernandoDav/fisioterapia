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

function employeeOptions(selected = "") {
  const options = ['<option value="">Sin asignar</option>'];
  (db.employees || [])
    .filter((employee) => employee.role !== "Administradora")
    .forEach((employee) => {
      options.push(
        `<option value="${employee.name}" ${employee.name === selected ? "selected" : ""}>${employee.name}</option>`,
      );
    });
  return options.join("");
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

  const backgrounds = Array.isArray(patient.medicalBackground)
    ? patient.medicalBackground.join(", ")
    : patient.medicalBackground || "Sin antecedentes registrados";

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
    <div><span>Tratamiento</span><strong>${patient.therapy || "Sin tratamiento"}</strong></div>
    <div class="wide medical-history"><span>Historia médica</span><strong>${patient.medicalHistory || "Sin historia médica registrada."}</strong></div>
    <div class="wide"><span>Antecedentes médicos</span><strong>${backgrounds}</strong></div>
    <div class="wide"><span>Observaciones</span><strong>${patient.observations || "Sin observaciones"}</strong></div>
    <div class="wide"><span>Medicamentos</span><strong>${patient.medications || "Sin medicamentos registrados"}</strong></div>
  </div><div class="history-columns"><div><h4>Facturas</h4>${invoiceHistory}</div><div><h4>Sesiones en la clínica</h4>${sessionHistory}</div></div></div></details>`;
}

function openPatientEditor(patient) {
  if (!patient) return;
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  
  const selectedBackgrounds = Array.isArray(patient.medicalBackground)
    ? patient.medicalBackground
    : patient.medicalBackground
      ? [patient.medicalBackground]
      : [];

  const backgroundOptions = [
    "Hipertensión", "Diabetes", "Asma", "Alergias", "Cardiopatías",
    "Enfermedades respiratorias", "Artritis", "Osteoporosis", "Cáncer",
    "Enfermedades autoinmunes", "Otra",
  ];

  modal.innerHTML = `
    <div class="panel modal-card">
      <div class="panel-title">
        <div>
          <h3>Editar paciente</h3>
          <p>${patient.name}</p>
        </div>
        <button class="close" type="button">×</button>
      </div>
      <form class="form-grid">
        <label>Nombres<input name="firstNames" value="${patient.firstNames || ""}" required></label>
        <label>Apellidos<input name="lastNames" value="${patient.lastNames || ""}" required></label>
        <label>Nombre completo<input name="name" value="${patient.name}" required></label>
        <label>Cédula<input name="cedula" value="${patient.cedula || ""}" required></label>
        <label>Teléfono<input name="phone" type="tel" value="${patient.phone || ""}" required></label>
        <label>Correo<input name="email" type="email" value="${patient.email || ""}"></label>
        <label>Tratamiento<input name="therapy" value="${patient.therapy || ""}" required></label>
        <label>Fecha de ingreso<input name="date" type="date" value="${patient.date || ""}" required></label>
        <label>Dirección<input name="address" value="${patient.address || ""}"></label>
        <label>Representante
          <select name="representative">
            <option value="" ${!patient.representative ? "selected" : ""}>No requiere representante</option>
            <option value="Menor de edad" ${patient.representative === "Menor de edad" ? "selected" : ""}>Menor de edad</option>
            <option value="Persona con necesidades especiales" ${patient.representative === "Persona con necesidades especiales" ? "selected" : ""}>Persona con necesidades especiales</option>
            <option value="Atención especial requerida" ${patient.representative === "Atención especial requerida" ? "selected" : ""}>Atención especial requerida</option>
          </select>
        </label>
        <label>Estatus
          <select name="status">
            <option ${patient.status === "Primera visita" ? "selected" : ""}>Primera visita</option>
            <option ${patient.status === "En tratamiento" ? "selected" : ""}>En tratamiento</option>
            <option ${patient.status === "Alta médica" ? "selected" : ""}>Alta médica</option>
            <option ${patient.status === "Seguimiento" ? "selected" : ""}>Seguimiento</option>
            <option ${patient.status === "Urgencia" ? "selected" : ""}>Urgencia</option>
          </select>
        </label>
        <label>Referido por doctor<input name="referredBy" value="${patient.referredBy || ""}" placeholder="Nombre del doctor"></label>
        <label>Empleado asignado<select name="employee">${employeeOptions(patient.employee)}</select></label>
        <label class="wide">Historia médica<textarea name="medicalHistory" rows="3">${patient.medicalHistory || ""}</textarea></label>
        <label>Antecedentes médicos
          <select name="medicalBackground" multiple style="height: 100px">
            ${backgroundOptions
              .map(
                (bg) =>
                  `<option value="${bg}" ${selectedBackgrounds.includes(bg) ? "selected" : ""}>${bg}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label>Medicamentos<textarea name="medications" rows="3">${patient.medications || ""}</textarea></label>
        <label class="wide">Observaciones<textarea name="observations" rows="3">${patient.observations || ""}</textarea></label>
        <div class="wide form-actions">
          <button class="secondary-button close" type="button">Cancelar</button>
          <button class="primary-button">Guardar cambios</button>
        </div>
      </form>
    </div>
  `;

  document.body.append(modal);
  modal.querySelectorAll(".close").forEach((b) => (b.onclick = () => modal.remove()));

  modal.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = Object.fromEntries(formData);
    const multiBackgrounds = formData.getAll("medicalBackground");
    values.medicalBackground = multiBackgrounds.length ? multiBackgrounds : [];

    const oldName = patient.name;
    Object.assign(patient, values);

    // Si cambió el nombre, sincronizar en facturas y citas del paciente
    if (oldName !== patient.name) {
      (db.invoices || []).forEach((inv) => {
        if (inv.patient === oldName) inv.patient = patient.name;
      });
      (db.appointments || []).forEach((appt) => {
        if (appt.patient === oldName) appt.patient = patient.name;
      });
    }

    logEvent(
      "patients",
      "editar",
      `Se actualizaron los datos del paciente ${patient.name}.`,
      patient,
    );
    save();
    modal.remove();
    render();
  };
}

function render() {
  document.querySelector("#menuContent").innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">GESTION CLINICA</p>
        <h2>Pacientes</h2>
        <p>Consulta el expediente, edita datos y gestiona el historial de cada paciente.</p>
      </div>
      <button id="new" class="primary-button">+ Registrar paciente</button>
    </div>
    <section class="panel table-panel">
      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Tratamiento</th>
            <th>Fisioterapeuta</th>
            <th>Ingreso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${(db.patients || [])
            .map(
              (patient) => `<tr>
              <td>
                <strong>${patient.name}</strong>
                <small>Cédula: ${patient.cedula || "No registrada"}</small>
                ${patientDetails(patient)}
              </td>
              <td>${patient.firstNames || "No registrado"}</td>
              <td>${patient.lastNames || "No registrado"}</td>
              <td>${patient.therapy || "Sin tratamiento"}</td>
              <td>${patient.employee || "Sin asignar"}</td>
              <td>${patient.date || "No registrada"}</td>
              <td><span class="status">${patient.status || "Primera visita"}</span></td>
              <td>
                <button class="table-action edit-patient" data-id="${patient.id}">Editar</button>
                <button class="table-action delete-patient" data-id="${patient.id}">Eliminar</button>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </section>`;

  document.querySelector("#new").onclick = () =>
    formCard(
      "Registrar paciente",
      `
      <label>Nombres<input name="firstNames" required></label>
      <label>Apellidos<input name="lastNames" required></label>
      <label>Nombre completo<input name="name" placeholder="Dejar vacío para combinar nombres" ></label>
      <label>Cédula<input name="cedula" required></label>
      <label>Teléfono<input name="phone" type="tel" placeholder="Ej: 0414 1234567" required></label>
      <label>Correo<input name="email" type="email" placeholder="correo@ejemplo.com"></label>
      <label>Tratamiento<input name="therapy" placeholder="Ej: Rehabilitación lumbar, Terapia manual" required></label>
      <label>Fecha de ingreso<input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required></label>
      <label>Dirección<input name="address"></label>
      <label>Representante
        <select name="representative">
          <option value="">No requiere representante</option>
          <option value="Menor de edad">Menor de edad</option>
          <option value="Persona con necesidades especiales">Persona con necesidades especiales</option>
          <option value="Atención especial requerida">Atención especial requerida</option>
        </select>
      </label>
      <label>Estatus
        <select name="status">
          <option>Primera visita</option>
          <option>En tratamiento</option>
          <option>Alta médica</option>
          <option>Seguimiento</option>
          <option>Urgencia</option>
        </select>
      </label>
      <label>Referido por doctor<input name="referredBy" placeholder="Nombre del doctor"></label>
      <label>Empleado asignado<select name="employee">${employeeOptions()}</select></label>
      <label class="wide">Historia médica<textarea name="medicalHistory" rows="3" placeholder="Historia clínica del paciente"></textarea></label>
      <label>Antecedentes médicos
        <select name="medicalBackground" multiple style="height: 100px">
          <option value="Hipertensión">Hipertensión</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Asma">Asma</option>
          <option value="Alergias">Alergias</option>
          <option value="Cardiopatías">Cardiopatías</option>
          <option value="Enfermedades respiratorias">Enfermedades respiratorias</option>
          <option value="Artritis">Artritis</option>
          <option value="Osteoporosis">Osteoporosis</option>
          <option value="Cáncer">Cáncer</option>
          <option value="Enfermedades autoinmunes">Enfermedades autoinmunes</option>
          <option value="Otra">Otra (especificar en observaciones)</option>
        </select>
      </label>
      <label>Medicamentos<textarea name="medications" rows="3" placeholder="Medicamentos que toma el paciente"></textarea></label>
      <label class="wide">Observaciones<textarea name="observations" rows="3" placeholder="Observaciones adicionales"></textarea></label>
      `,
      "patients",
      render,
    );

  document.querySelectorAll(".edit-patient").forEach((button) => {
    button.onclick = () => {
      const patient = (db.patients || []).find(
        (p) => String(p.id) === String(button.dataset.id),
      );
      if (patient) openPatientEditor(patient);
    };
  });

  document.querySelectorAll(".delete-patient").forEach((button) => {
    button.onclick = () => {
      const patient = (db.patients || []).find(
        (p) => String(p.id) === String(button.dataset.id),
      );
      if (
        !patient ||
        !confirm(
          `¿Eliminar al paciente ${patient.name}? Esta acción no se puede deshacer.`,
        )
      ) {
        return;
      }
      db.patients = (db.patients || []).filter(
        (p) => String(p.id) !== String(patient.id),
      );
      logEvent(
        "patients",
        "eliminar",
        `Se eliminó al paciente ${patient.name}.`,
        patient,
      );
      save();
      render();
    };
  });
}

render();
