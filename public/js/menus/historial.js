shell("Historial", "historial");

const historyTypes = [
  "todos",
  "patients",
  "usuario",
  "invoices",
  "appointments",
  "services",
  "notes",
];

function invoiceStatusClass(status) {
  const normalized = String(status || "Pendiente").toLowerCase();
  if (normalized.includes("no pag") || normalized.includes("pendiente")) return "invoice-unpaid";
  if (normalized.includes("pagad")) return "invoice-paid";
  return "invoice-pending";
}

let activeType = "todos";
let selectedKind = "patient";
let selectedId = "";

function typeLabel(type) {
  return (
    {
      patients: "Pacientes",
      usuario: "Usuarios",
      invoices: "Facturas",
      appointments: "Citas",
      services: "Servicios",
      notes: "Recordatorios",
    }[type] || type
  );
}

function selectedRecord() {
  const collection = selectedKind === "patient" ? (db.patients || []) : (db.employees || []);
  return (
    collection.find(
      (item) => String(item.id || item.email || item.name) === selectedId,
    ) || collection[0]
  );
}

function eventCards(events) {
  return events.length
    ? `<div class="timeline">${events.map((event) => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const iconMap = {
          patients: "👤",
          usuario: "👥",
          invoices: "🧾",
          appointments: "📅",
          services: "⚕️",
          notes: "📝"
        };
        
        return `<article class="history-event" data-type="${event.type}">
          <span class="event-dot"></span>
          <div>
            <div class="event-top">
              <div>
                <span style="font-size: 16px; margin-right: 8px;">${iconMap[event.type] || "📋"}</span>
                <strong>${event.description}</strong>
              </div>
              <time>${formattedDate}</time>
            </div>
            <p>
              <b style="background: var(--mint); padding: 2px 8px; border-radius: 12px; font-size: 11px;">${typeLabel(event.type)}</b>
              <span style="margin: 0 8px; color: var(--line);">•</span>
              <b style="color: var(--coral); font-weight: 600;">${event.action}</b>
              <span style="margin: 0 8px; color: var(--line);">•</span>
              <span style="font-weight: 600; color: var(--ink-2);">${event.user}</span>
            </p>
            ${event.data ? `<details style="margin-top: 8px;">
              <summary style="cursor: pointer; color: var(--teal); font-size: 11px; font-weight: 600;">Ver detalles</summary>
              <pre style="margin-top: 8px; padding: 10px; background: var(--cream); border-radius: 6px; font-size: 11px; color: var(--ink-2); overflow-x: auto;">${JSON.stringify(event.data, null, 2)}</pre>
            </details>` : ''}
          </div>
        </article>`;
      }).join("")}</div>`
    : '<div class="empty-state"><div style="font-size: 48px; color: var(--line); margin-bottom: 16px;">📋</div><p style="color: var(--muted); font-size: 14px;">No hay actividad relacionada</p><p style="color: var(--muted); font-size: 11px; margin-top: 4px;">Los registros aparecerán aquí cuando haya actividad</p></div>';
}

function initLayout() {
  document.querySelector("#menuContent").innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">CONTROL Y TRAZABILIDAD</p>
        <h2>Historial del sistema</h2>
        <p>Consulta la información completa sin mostrar datos técnicos.</p>
      </div>
      <span id="historyBadge" class="immutable-badge">Solo lectura · ${(db.auditLog || []).length} registros</span>
    </div>
    <section class="panel history-toolbar">
      <label>Buscar en el historial
        <input id="historySearch" type="search" placeholder="Paciente, empleado, factura, acción...">
      </label>
      <div id="historyTypeFilters" class="history-filters">
        ${historyTypes.map((type) => `<button class="filter-button ${activeType === type ? "active" : ""}" data-type="${type}">${type === "todos" ? "Todo" : typeLabel(type)}</button>`).join("")}
      </div>
      <button id="exportHistory" class="primary-button">Generar PDF</button>
    </section>
    <div class="history-layout">
      <aside id="recordListContainer" class="panel record-list"></aside>
      <section id="recordDetailContainer" class="panel record-detail"></section>
    </div>
    <section id="generalActivityContainer" class="panel history-panel"></section>
  `;

  document.querySelector("#historySearch").oninput = updateDynamicViews;

  document.querySelectorAll("#historyTypeFilters [data-type]").forEach((button) => {
    button.onclick = () => {
      activeType = button.dataset.type;
      document.querySelectorAll("#historyTypeFilters [data-type]").forEach((b) => {
        b.classList.toggle("active", b.dataset.type === activeType);
      });
      updateDynamicViews();
    };
  });

  document.querySelector("#exportHistory").onclick = () => {
    const query = (document.querySelector("#historySearch")?.value || "").toLowerCase();
    const filteredEvents = getFilteredEvents(query);
    openReportModal(filteredEvents);
  };

  updateDynamicViews();
}

function getFilteredEvents(query) {
  return (db.auditLog || []).filter(
    (event) =>
      (activeType === "todos" || event.type === activeType) &&
      `${event.description || ""} ${event.user || ""} ${event.data ? JSON.stringify(event.data) : ""}`
        .toLowerCase()
        .includes(query),
  );
}

function updateDynamicViews() {
  const query = (document.querySelector("#historySearch")?.value || "").toLowerCase();
  const collection = selectedKind === "patient" ? (db.patients || []) : (db.employees || []);
  const record = selectedRecord();
  selectedId = String(record?.id || record?.email || record?.name || "");

  const events = getFilteredEvents(query);

  // 1. Actualizar Record List
  const recordListEl = document.querySelector("#recordListContainer");
  if (recordListEl) {
    recordListEl.innerHTML = `
      <div class="list-heading">
        <h3>Personas</h3>
        <div>
          <button class="person-filter ${selectedKind === "patient" ? "active" : ""}" data-kind="patient">Pacientes</button>
          <button class="person-filter ${selectedKind === "employee" ? "active" : ""}" data-kind="employee">Empleados</button>
        </div>
      </div>
      ${collection
        .map((item) => {
          const id = String(item.id || item.email || item.name);
          return `<button class="record-option ${id === selectedId ? "selected" : ""}" data-record="${id}">
            <span class="small-avatar">${initials(item.name)}</span>
            <span>
              <strong>${item.name}</strong>
              <small>${selectedKind === "patient" ? item.therapy || "Paciente" : item.role || "Empleado"}</small>
            </span>
            <span>›</span>
          </button>`;
        })
        .join("") || '<p class="empty" style="padding: 12px;">No hay registros.</p>'}
    `;

    recordListEl.querySelectorAll("[data-kind]").forEach((b) => {
      b.onclick = () => {
        selectedKind = b.dataset.kind;
        selectedId = "";
        updateDynamicViews();
      };
    });

    recordListEl.querySelectorAll("[data-record]").forEach((b) => {
      b.onclick = () => {
        selectedId = b.dataset.record;
        updateDynamicViews();
      };
    });
  }

  // 2. Actualizar Record Detail
  const recordDetailEl = document.querySelector("#recordDetailContainer");
  if (recordDetailEl) {
    const invoices = (db.invoices || []).filter((invoice) =>
      selectedKind === "patient"
        ? invoice.patient === record?.name
        : invoice.employee === record?.name,
    );

    recordDetailEl.innerHTML = `
      <div class="record-header">
        <div class="large-avatar">${record ? initials(record.name) : "--"}</div>
        <div>
          <h3>${record?.name || "Sin selección"}</h3>
          <p>${selectedKind === "patient" ? record?.medicalHistory || "Expediente de paciente" : record?.role || "Expediente de empleado"}</p>
        </div>
      </div>
      <div class="related-grid">
        <section>
          <h4>Facturas relacionadas</h4>
          ${
            record
              ? invoices
                  .map((invoice) => {
                    const statusClass = invoiceStatusClass(invoice.status);
                    const statusColor =
                      statusClass === "invoice-paid"
                        ? "#3c9b72"
                        : statusClass === "invoice-pending"
                          ? "#d39b42"
                          : "#bd554d";

                    return `<div class="related-card">
                      <div class="related-icon" style="background: ${statusColor}; color: white;">🧾</div>
                      <div>
                        <strong>${invoice.id} · ${invoice.patient}</strong>
                        <small>${invoice.service || "Sin servicio"} · ${invoice.date}</small>
                        ${invoice.employee ? `<small style="display: block; margin-top: 2px;">Atendido por: ${invoice.employee}</small>` : ""}
                      </div>
                      <b style="color: ${statusColor};">Bs ${Number(invoice.amountBs || 0).toFixed(2)}
                        <small style="display: block; margin-top: 2px; padding: 2px 6px; background: ${statusColor}; color: white; border-radius: 12px; font-size: 9px;">${invoice.status || "Pendiente"}</small>
                      </b>
                    </div>`;
                  })
                  .join("") ||
                '<div class="empty-state"><div style="font-size: 32px; color: var(--line);">💸</div><p style="color: var(--muted); font-size: 12px; margin-top: 8px;">No hay facturas relacionadas</p></div>'
              : '<p class="empty">Selecciona una persona.</p>'
          }
        </section>
        <section>
          <h4>Actividad relacionada</h4>
          ${eventCards(
            record
              ? (db.auditLog || []).filter((event) =>
                  `${event.description || ""} ${event.data ? JSON.stringify(event.data) : ""}`
                    .toLowerCase()
                    .includes(record.name.toLowerCase()),
                )
              : [],
          )}
        </section>
      </div>
    `;
  }

  // 3. Actualizar General Activity
  const generalActivityEl = document.querySelector("#generalActivityContainer");
  if (generalActivityEl) {
    generalActivityEl.innerHTML = `
      <div class="history-heading">
        <h3>Actividad general (${events.length})</h3>
        <small>Registros de auditoría inmutables</small>
      </div>
      ${eventCards(events)}
    `;
  }
}

function openReportModal(events) {
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  modal.innerHTML = `
    <div class="panel modal-card report-modal">
      <div class="panel-title">
        <div>
          <h3>Generar reporte PDF</h3>
          <p>Selecciona exactamente qué información deseas imprimir.</p>
        </div>
        <button class="close" type="button">×</button>
      </div>
      <form class="form-grid">
        <label>Tipo de información
          <select id="reportType">
            <option value="all">Toda la información</option>
            <option value="patients">Pacientes</option>
            <option value="employees">Empleados</option>
            <option value="invoices">Facturas</option>
            <option value="appointments">Citas y sesiones</option>
          </select>
        </label>
        <label id="personFilterLabel" class="hidden-field">Persona
          <select id="personFilter">
            <option value="all">Todos</option>
          </select>
        </label>
        <div class="wide form-actions">
          <button type="button" class="secondary-button close">Cancelar</button>
          <button class="primary-button">Generar PDF</button>
        </div>
      </form>
    </div>`;

  document.body.append(modal);
  const type = modal.querySelector("#reportType");
  const personLabel = modal.querySelector("#personFilterLabel");
  const person = modal.querySelector("#personFilter");

  const updatePeople = () => {
    const people = type.value === "patients" ? (db.patients || []) : (db.employees || []);
    const enabled = ["patients", "employees"].includes(type.value);
    person.innerHTML = `<option value="all">Todos</option>${enabled ? people.map((item) => `<option value="${item.name}">${item.name}</option>`).join("") : ""}`;
    personLabel.classList.toggle("visible-field", enabled);
    personLabel.classList.toggle("hidden-field", !enabled);
  };

  type.onchange = updatePeople;
  updatePeople();

  modal.querySelectorAll(".close").forEach((b) => (b.onclick = () => modal.remove()));

  modal.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    exportHistoryReport(type.value, person.value, events);
    modal.remove();
  };
}

function exportHistoryReport(reportType, personName, events) {
  const sections = [];
  if (reportType === "all" || reportType === "patients") {
    const people =
      personName === "all"
        ? (db.patients || [])
        : (db.patients || []).filter((item) => item.name === personName);
    sections.push(
      `<h2>Pacientes</h2><table><tr><th>Nombre</th><th>Cedula</th><th>Telefono</th><th>Tratamiento</th></tr>${people.map((item) => `<tr><td>${item.name}</td><td>${item.cedula || ""}</td><td>${item.phone || ""}</td><td>${item.therapy || ""}</td></tr>`).join("")}</table>`,
    );
  }
  if (reportType === "all" || reportType === "employees") {
    const people =
      personName === "all"
        ? (db.employees || [])
        : (db.employees || []).filter((item) => item.name === personName);
    sections.push(
      `<h2>Empleados</h2><table><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr>${people.map((item) => `<tr><td>${item.name}</td><td>${item.email || ""}</td><td>${item.role || ""}</td></tr>`).join("")}</table>`,
    );
  }
  if (reportType === "all" || reportType === "invoices")
    sections.push(
      `<h2>Facturas</h2><table><tr><th>Factura</th><th>Paciente</th><th>Estado</th><th>Total Bs</th></tr>${(db.invoices || []).map((item) => `<tr><td>${item.id}</td><td>${item.patient}</td><td>${item.status || ""}</td><td>Bs ${Number(item.amountBs || 0).toFixed(2)}</td></tr>`).join("")}</table>`,
    );
  if (reportType === "all" || reportType === "appointments")
    sections.push(
      `<h2>Citas y sesiones</h2><table><tr><th>Paciente</th><th>Empleado</th><th>Servicio</th><th>Fecha</th></tr>${(db.appointments || []).map((item) => `<tr><td>${item.patient}</td><td>${item.employee}</td><td>${item.service || ""}</td><td>${item.date}</td></tr>`).join("")}</table>`,
    );
  sections.push(
    `<h2>Actividad auditada</h2><p>${events.length} registros seleccionados.</p>`,
  );
  printReport(
    "Reporte del sistema · Fisio Clinica",
    `Filtro: ${reportType} · ${personName === "all" ? "Todos" : personName}`,
    sections,
  );
}

initLayout();
