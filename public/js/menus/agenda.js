shell("Agenda de citas", "agenda");
let patientFilter = "all";
let employeeFilter = "all";
let selectedDate = new Date(2026, 7, 24);

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function mondayOf(date) {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  return result;
}
function monthLabel(date) {
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
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
function serviceOptions() {
  return (db.services || [])
    .filter((service) => service.active !== false)
    .map(
      (service) =>
        `<option value="${service.name}">${service.name} · ${money(service.price)}</option>`,
    )
    .join("");
}

function openAppointmentDetails(appointment) {
  if (!appointment) return;
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  modal.innerHTML = `
    <div class="panel modal-card">
      <div class="panel-title">
        <div>
          <h3>Detalles de la cita</h3>
          <p>${appointment.patient} · ${appointment.date} a las ${appointment.time}</p>
        </div>
        <button class="close" type="button">×</button>
      </div>
      <div class="appointment-card-body" style="display: grid; gap: 12px; margin: 16px 0;">
        <p><strong>Paciente:</strong> ${appointment.patient}</p>
        <p><strong>Fisioterapeuta asignado:</strong> ${appointment.employee || "Sin asignar"}</p>
        <p><strong>Servicio:</strong> ${appointment.service || "Consulta general"}</p>
        <p><strong>Fecha y hora:</strong> ${appointment.date} a las ${appointment.time}</p>
        <p><strong>Estado:</strong> <span class="status">${appointment.date < dateKey(new Date()) ? "Finalizada" : "Programada"}</span></p>
      </div>
      <div class="wide form-actions" style="display: flex; justify-content: space-between; align-items: center;">
        <button id="cancelAppointmentBtn" type="button" class="danger-button">Eliminar / Cancelar cita</button>
        <button type="button" class="secondary-button close">Cerrar</button>
      </div>
    </div>
  `;

  document.body.append(modal);
  modal.querySelectorAll(".close").forEach((b) => (b.onclick = () => modal.remove()));

  modal.querySelector("#cancelAppointmentBtn").onclick = () => {
    if (!confirm(`¿Estás seguro de cancelar y eliminar la cita de ${appointment.patient} para el ${appointment.date} a las ${appointment.time}?`)) {
      return;
    }
    db.appointments = (db.appointments || []).filter(
      (item) => String(item.id) !== String(appointment.id),
    );
    logEvent(
      "appointments",
      "eliminar",
      `Se canceló la cita de ${appointment.patient} del ${appointment.date} a las ${appointment.time}.`,
      appointment,
    );
    save();
    modal.remove();
    render();
  };
}

function render() {
  const weekStart = mondayOf(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });
  const hours = Array.from(
    { length: 24 },
    (_, hour) => `${String(hour).padStart(2, "0")}:00`,
  );
  const allAppointments = db.appointments || [];
  const appointments = allAppointments.filter(
    (appointment) =>
      (patientFilter === "all" || appointment.patient === patientFilter) &&
      (employeeFilter === "all" || appointment.employee === employeeFilter),
  );
  const patients = [...new Set((db.patients || []).map((item) => item.name))];
  const employees = [...new Set((db.employees || []).map((item) => item.name))];
  const employeeColors = [
    "#2e7b78",
    "#e8876b",
    "#5b8cc9",
    "#b486c8",
    "#d39b42",
  ];
  const employeeLegend = employees
    .map((employee, index) => {
      const appointment = allAppointments.find(
        (item) => item.employee === employee && item.color,
      );
      return `<span><i style="background:${appointment?.color || employeeColors[index % employeeColors.length]}"></i>${employee}</span>`;
    })
    .join("");

  document.querySelector("#menuContent").innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">PLANIFICACION</p>
        <h2>Agenda de citas</h2>
        <p>Consulta disponibilidad, descansos y pacientes asignados.</p>
      </div>
      <button id="new" class="primary-button">+ Nueva cita</button>
    </div>
    <section class="panel calendar-panel">
      <div class="agenda-filters">
        <label>Paciente
          <select id="patientFilter">
            <option value="all">Todos los pacientes</option>
            ${patients.map((patient) => `<option value="${patient}" ${patient === patientFilter ? "selected" : ""}>${patient}</option>`).join("")}
          </select>
        </label>
        <label>Empleado
          <select id="employeeFilter">
            <option value="all">Todos los empleados</option>
            ${employees.map((employee) => `<option value="${employee}" ${employee === employeeFilter ? "selected" : ""}>${employee}</option>`).join("")}
          </select>
        </label>
        <label>Ir a una fecha
          <input id="dateFilter" type="date" value="${dateKey(selectedDate)}">
        </label>
        <label>Mes
          <select id="monthFilter">
            ${Array.from({ length: 12 }, (_, month) => `<option value="${month}" ${month === selectedDate.getMonth() ? "selected" : ""}>${new Date(2026, month, 1).toLocaleDateString("es-MX", { month: "long" })}</option>`).join("")}
          </select>
        </label>
        <label>Año
          <select id="yearFilter">
            ${Array.from({ length: 101 }, (_, index) => {
              const year = 2000 + index;
              return `<option value="${year}" ${year === selectedDate.getFullYear() ? "selected" : ""}>${year}</option>`;
            }).join("")}
          </select>
        </label>
      </div>
      <div class="employee-legend">
        <strong>Empleado:</strong>${employeeLegend}
      </div>
      <div class="calendar-title">
        <button id="previousWeek" type="button" aria-label="Semana anterior">←</button>
        <h3 id="calendarMonth">${monthLabel(selectedDate)}</h3>
        <button id="nextWeek" type="button" aria-label="Semana siguiente">→</button>
      </div>
      <div class="calendar">
        <b>HORA</b>
        ${days.map((day) => `<b>${day.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" })}</b>`).join("")}
        ${hours
          .map(
            (hour) =>
              `<span class="hour">${hour}</span>${days
                .map((_, index) => {
                  const dayStr = dateKey(days[index]);
                  const a = appointments.find(
                    (item) => item.time === hour && item.date === dayStr,
                  );
                  const anyAppointment = allAppointments.find(
                    (item) => item.time === hour && item.date === dayStr,
                  );
                  const isBreak = hour === "13:00";
                  const slotClass = a || anyAppointment
                    ? "occupied"
                    : isBreak
                      ? "break-slot"
                      : "available";
                  const slotContent = a
                    ? `<i data-id="${a.id}" style="--employee-color:${a.color || "#2e7b78"}">${a.patient}<small>${a.employee}</small><small>${a.service || "Servicio no especificado"}</small></i>`
                    : anyAppointment
                      ? '<small class="filtered-label">Ocupado · oculto por filtro</small>'
                      : isBreak
                        ? "<em>Descanso</em>"
                        : '<small class="available-label">Disponible · clic para agendar</small>';
                  return `<span class="calendar-slot ${slotClass}" data-date="${dayStr}" data-time="${hour}">${slotContent}</span>`;
                })
                .join("")}`,
          )
          .join("")}
      </div>
    </section>`;

  document.querySelector("#new").onclick = () =>
    formCard(
      "Nueva cita",
      `
      <label>Paciente
        <select name="patient" required>
          ${(db.patients || []).map((p) => `<option value="${p.name}">${p.name}</option>`).join("")}
        </select>
      </label>
      <label>Empleado
        <select name="employee" required>${employeeOptions()}</select>
      </label>
      <label>Servicio
        <select name="service" required>${serviceOptions()}</select>
      </label>
      <label>Fecha
        <input name="date" type="date" value="${dateKey(selectedDate)}" required>
      </label>
      <label>Hora
        <input name="time" type="time" value="09:00" required>
      </label>
      <label>Color del empleado
        <input name="color" type="color" value="#2e7b78" required>
      </label>
      `,
      "appointments",
      render,
    );

  document.querySelector("#patientFilter").onchange = (event) => {
    patientFilter = event.target.value;
    render();
  };
  document.querySelector("#employeeFilter").onchange = (event) => {
    employeeFilter = event.target.value;
    render();
  };
  document.querySelector("#dateFilter").onchange = (event) => {
    selectedDate = new Date(`${event.target.value}T12:00:00`);
    render();
  };
  document.querySelector("#monthFilter").onchange = (event) => {
    selectedDate.setDate(1);
    selectedDate.setMonth(Number(event.target.value));
    render();
  };
  document.querySelector("#yearFilter").onchange = (event) => {
    selectedDate.setDate(1);
    selectedDate.setFullYear(Number(event.target.value));
    render();
  };

  document.querySelectorAll(".calendar-slot.available").forEach((slot) => {
    slot.onclick = () =>
      openAppointmentForm(slot.dataset.date, slot.dataset.time);
  });

  document.querySelectorAll(".calendar-slot.occupied").forEach((slot) => {
    slot.onclick = () => {
      const idEl = slot.querySelector("[data-id]");
      if (!idEl) return;
      const appointment = (db.appointments || []).find(
        (item) => String(item.id) === String(idEl.dataset.id),
      );
      if (appointment) {
        openAppointmentDetails(appointment);
      }
    };
  });

  document.querySelector("#previousWeek").onclick = () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    render();
  };
  document.querySelector("#nextWeek").onclick = () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    render();
  };
}

function openAppointmentForm(date, time) {
  if (!hasPermission("agenda", "manage")) return;
  formCard(
    "Nueva cita",
    `
    <label>Paciente
      <select name="patient" required>
        ${(db.patients || []).map((p) => `<option value="${p.name}">${p.name}</option>`).join("")}
      </select>
    </label>
    <label>Empleado
      <select name="employee" required>${employeeOptions()}</select>
    </label>
    <label>Servicio
      <select name="service" required>${serviceOptions()}</select>
    </label>
    <label>Fecha
      <input name="date" type="date" value="${date}" required>
    </label>
    <label>Hora
      <input name="time" type="time" value="${time}" required>
    </label>
    <label>Color del empleado
      <input name="color" type="color" value="#2e7b78" required>
    </label>
    `,
    "appointments",
    render,
  );
}

render();
