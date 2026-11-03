const seed = {
  patients: [
    {
      id: 1,
      name: "Lucia Fernandez",
      phone: "555 0142",
      therapy: "Rehabilitacion deportiva",
      employee: "Carlos Mendez",
      date: "2026-08-18",
      status: "En tratamiento",
    },
    {
      id: 2,
      name: "Diego Ramirez",
      phone: "555 0198",
      therapy: "Dolor lumbar",
      employee: "Carlos Mendez",
      date: "2026-08-20",
      status: "Primera visita",
    },
  ],
  invoices: [
    {
      id: "FAC-1048",
      patient: "Lucia Fernandez",
      employee: "Carlos Mendez",
      amount: 850,
      date: "2026-08-21",
      status: "Pagada",
    },
    {
      id: "FAC-1047",
      patient: "Diego Ramirez",
      employee: "Carlos Mendez",
      amount: 700,
      date: "2026-08-20",
      status: "Pagada",
    },
  ],
  appointments: [
    {
      id: 1,
      patient: "Lucia Fernandez",
      employee: "Carlos Mendez",
      date: "2026-08-24",
      time: "09:00",
    },
  ],
  notes: [
    { id: 1, title: "Pago de renta", date: "2026-08-30", frequency: "Mensual" },
  ],
  employees: [
    {
      name: "Mariana Torres",
      email: "admin@fisio.local",
      role: "Administradora",
    },
    {
      name: "Carlos Mendez",
      email: "empleado@fisio.local",
      role: "Fisioterapeuta",
    },
  ],
  users: [
    {
      id: 1,
      name: "Mariana Torres",
      email: "admin@fisio.local",
      password: "admin123",
      role: "admin",
    },
    {
      id: 2,
      name: "Carlos Mendez",
      email: "empleado@fisio.local",
      password: "fisio123",
      role: "empleado",
      permissions: [
        "inicio",
        "pacientes",
        "facturacion",
        "agenda",
        "estadisticas",
        "pagos",
        "recordatorios",
        "calculadora",
      ],
    },
  ],
  services: [
    {
      id: 1,
      name: "Valoracion inicial",
      category: "Evaluacion",
      duration: 60,
      price: 500,
      active: true,
    },
    {
      id: 2,
      name: "Sesion de fisioterapia",
      category: "Tratamiento",
      duration: 50,
      price: 700,
      active: true,
    },
    {
      id: 3,
      name: "Rehabilitacion deportiva",
      category: "Tratamiento",
      duration: 60,
      price: 850,
      active: true,
    },
  ],
  auditLog: [],
  expenses: [],
  payrollPayments: [],
};
const db = JSON.parse(
  localStorage.getItem("fisioData") || JSON.stringify(seed),
);
db.patients = Array.isArray(db.patients) ? db.patients : (seed.patients || []);
db.invoices = Array.isArray(db.invoices) ? db.invoices : (seed.invoices || []);
db.appointments = Array.isArray(db.appointments) ? db.appointments : (seed.appointments || []);
db.notes = Array.isArray(db.notes) ? db.notes : (seed.notes || []);
db.employees = Array.isArray(db.employees) ? db.employees : (seed.employees || []);
db.services = Array.isArray(db.services) ? db.services : (seed.services || []);
db.users = Array.isArray(db.users) ? db.users : (seed.users || []);
db.auditLog = Array.isArray(db.auditLog) ? db.auditLog : [];
db.expenses = Array.isArray(db.expenses) ? db.expenses : [];
db.payrollPayments = Array.isArray(db.payrollPayments) ? db.payrollPayments : [];
if (
  db.users.some(
    (user) =>
      Array.isArray(user.permissions) &&
      !user.permissions.includes("historial"),
  )
) {
  db.users
    .filter((user) => Array.isArray(user.permissions))
    .forEach((user) => user.permissions.push("historial"));
  save();
}
function save() {
  localStorage.setItem("fisioData", JSON.stringify(db));
}
function money(value) {
  return `$${Number(value).toLocaleString("es-MX")}`;
}
function printReport(title, subtitle, sections) {
  const reportWindow = window.open("", "_blank", "width=900,height=700");
  if (!reportWindow) {
    alert("Permite las ventanas emergentes para generar el PDF.");
    return false;
  }
  reportWindow.document.write(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#075b9d;padding:36px}header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #13bfc2;padding-bottom:16px;margin-bottom:24px}header img{width:86px;height:86px;object-fit:contain}h1{margin:0 0 5px}h2{color:#126c9f;border-bottom:1px solid #cfe9ec;padding-bottom:6px}p,td,th{font-size:12px}table{width:100%;border-collapse:collapse;margin:12px 0 24px}td,th{border-bottom:1px solid #dbeaec;padding:9px;text-align:left}th{background:#dff8f7;color:#075b9d}.report-meta{color:#668894;margin-bottom:25px}.total{font-size:18px;font-weight:bold;color:#075b9d}.backup-json{white-space:pre-wrap;overflow-wrap:anywhere;font-size:9px;color:#243b53}.backup-section{break-inside:avoid-page}</style></head><body><header><img src="${new URL("../public/css/imagenes/IMG_3629.PNG", window.location.href).href}" alt="Faz Castillo Fisioterapia"><div><h1>${title}</h1><p class="report-meta">${subtitle}</p></div></header>${sections.join("")}<script>window.onload=()=>{window.print()}<\/script></body></html>`,
  );
  reportWindow.document.close();
  return true;
}
function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
const permissionMenus = [
  "inicio",
  "pacientes",
  "facturacion",
  "agenda",
  "estadisticas",
  "pagos",
  "recordatorios",
  "calculadora",
  "historial",
];
function logEvent(type, action, description, data = {}) {
  const safeData = JSON.parse(
    JSON.stringify(data, (key, value) =>
      key === "password" ? undefined : value,
    ),
  );
  db.auditLog.unshift({
    id: Date.now() + Math.random(),
    type,
    action,
    description,
    data: safeData,
    user: localStorage.getItem("fisioUser") || "Sistema",
    date: new Date().toISOString(),
  });
  save();
}
function initializeAuditLog() {
  if (db.auditLog.length) return;
  const collections = [
    ["patients", "paciente"],
    ["invoices", "factura"],
    ["appointments", "cita"],
    ["services", "servicio"],
    ["employees", "empleado"],
  ];
  collections.forEach(([collection, label]) =>
    (db[collection] || []).forEach((item) => {
      db.auditLog.push({
        id: Date.now() + Math.random(),
        type: collection === "employees" ? "usuario" : collection,
        action: "registro inicial",
        description: `Registro historico de ${label}.`,
        data: JSON.parse(JSON.stringify(item)),
        user: "Sistema",
        date: item.date
          ? `${item.date}T12:00:00.000Z`
          : new Date().toISOString(),
      });
    }),
  );
  save();
}
initializeAuditLog();
function getCurrentUser() {
  return db.users.find(
    (user) => user.email === localStorage.getItem("fisioUser"),
  );
}
function hasPermission(menu, action = "view") {
  if (localStorage.getItem("fisioRole") === "admin") return true;
  const permissions = getCurrentUser()?.permissions || [];
  if (Array.isArray(permissions))
    return action === "view" && permissions.includes(menu);
  return Boolean(permissions[menu]?.[action]);
}
function shell(title, active) {
  const sessionEmail = localStorage.getItem("fisioUser");
  const sessionUser = db.users.find(
    (user) => user.email === sessionEmail && user.active !== false,
  );
  if (!sessionUser) {
    localStorage.removeItem("fisioRole");
    localStorage.removeItem("fisioUser");
    location.href = "login.html";
    return;
  }
  const isAdmin = localStorage.getItem("fisioRole") === "admin";
  if (sessionUser.role !== localStorage.getItem("fisioRole")) {
    localStorage.setItem("fisioRole", sessionUser.role);
  }
  if (!isAdmin && !hasPermission(active, "view")) {
    location.href = "inicio.html";
    return;
  }
  const menuItems = [
    ["inicio", "Inicio", "⌂"],
    ["pacientes", "Pacientes", "♙"],
    ["facturacion", "Facturacion", "▣"],
    ["agenda", "Agenda", "▦"],
    ["estadisticas", "Estadisticas", "◒"],
    ["empleados", "Empleados", "♧"],
    ["pagos", "Pagos equipo", "◌"],
    ["recordatorios", "Recordatorios", "♧"],
    ["calculadora", "Calculadora", "＋"],
    ["historial", "Historial", "◷"],
    ["precios", "Precios y servicios", "＄"],
  ].filter((item) => isAdmin || hasPermission(item[0], "view"));
  document.body.innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="sidebar-brand" href="inicio.html"><img src="../public/css/imagenes/IMG_3629.PNG" alt="Faz Castillo Fisioterapia"><strong>FISIO<br>CLINICA</strong></a><p class="clinic-label">ESPACIO DE TRABAJO</p><nav>${menuItems
    .map(
      (item) =>
        `<a class="nav-item ${active === item[0] ? "active" : ""}" href="${item[0]}.html"><span>${item[2]}</span>${item[1]}</a>`,
    )
    .join(
      "",
    )}</nav></aside><main class="main-content"><header class="topbar"><div class="topbar-leading"><button id="menuToggle" class="menu-toggle" type="button" aria-expanded="false" aria-label="Mostrar menus">☰ <span>Menus</span></button><button class="logout topbar-logout" type="button" onclick="localStorage.removeItem('fisioRole');localStorage.removeItem('fisioUser');location.href='login.html'">↪ Cerrar sesion</button></div><div class="topbar-heading"><p class="eyebrow">GESTION CLINICA</p><h1>${title}</h1></div><div class="topbar-actions"><a class="notification-button" href="recordatorios.html" title="Recordatorios pendientes">♧ <b>${(db.notes || []).filter((n) => !n.done).length}</b></a></div></header><main id="menuContent" class="content-area"></main></main></div>`;
  const navigation = document.querySelector(".sidebar nav");
  navigation.id = "menuNavigation";
  document.querySelector("#menuToggle").onclick = (e) => {
    e.stopPropagation();
    const sidebar = document.querySelector(".sidebar");
    const open = sidebar.classList.toggle("menu-open");
    sidebar.classList.toggle("open", open);
    document
      .querySelector("#menuToggle")
      .setAttribute("aria-expanded", String(open));
  };
  if (!document.body.dataset.listenersInstalled) {
    document.body.dataset.listenersInstalled = "true";
    document.addEventListener("click", (e) => {
      const sidebar = document.querySelector(".sidebar");
      const menuToggle = document.querySelector("#menuToggle");
      if (sidebar && sidebar.classList.contains("menu-open")) {
        if (!sidebar.contains(e.target) && (!menuToggle || !menuToggle.contains(e.target))) {
          sidebar.classList.remove("menu-open", "open");
          menuToggle?.setAttribute("aria-expanded", "false");
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const sidebar = document.querySelector(".sidebar");
        const menuToggle = document.querySelector("#menuToggle");
        if (sidebar && sidebar.classList.contains("menu-open")) {
          sidebar.classList.remove("menu-open", "open");
          menuToggle?.setAttribute("aria-expanded", "false");
        }
        const lastModal = document.querySelector(".entry-modal:last-child");
        if (lastModal) lastModal.remove();
      }
    });
  }
  installButtonHelp();
  applyManagementPermissions();
}
function applyManagementPermissions() {
  if (localStorage.getItem("fisioRole") === "admin") return;
  const disableActions = () =>
    document
      .querySelectorAll(
        "#menuContent .primary-button, #menuContent .edit-service, #menuContent .delete-service, #menuContent .edit-invoice, #menuContent .action-status, #menuContent [data-note], #menuContent [data-delete-note]",
      )
      .forEach((button) => {
        if (
          !hasPermission(
            document
              .querySelector(".nav-item.active")
              ?.getAttribute("href")
              ?.replace(".html", ""),
            "manage",
          )
        ) {
          button.disabled = true;
          button.title =
            "Tu usuario solo tiene permiso de consulta en este menu.";
          button.classList.add("restricted-action");
        }
      });
  disableActions();
  new MutationObserver(disableActions).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
function installButtonHelp() {
  const content = document.querySelector("#menuContent");
  if (!content || document.body.dataset.helpInstalled) return;
  document.body.dataset.helpInstalled = "true";
  const addHelp = (button) => {
    if (
      button.dataset.helpReady ||
      button.classList.contains("info-button") ||
      button.classList.contains("close") ||
      button.closest(".calc, .calendar, table, .stats-tabs, .history-filters, .record-list, .topbar-leading, .date-pill, .agenda-filters, .calendar-title") ||
      button.dataset.key ||
      button.dataset.calc ||
      button.classList.contains("table-action") ||
      button.classList.contains("delete-note") ||
      button.classList.contains("status") ||
      button.classList.contains("filter-button") ||
      button.classList.contains("person-filter")
    )
      return;
    const label = button.textContent.trim().replace(/\s+/g, " ");
    const description = describeButton(button);
    if (!description) return;
    button.dataset.helpReady = "true";
    const wrapper = document.createElement("span");
    wrapper.className = "action-help";
    const help = document.createElement("button");
    help.type = "button";
    help.className = "info-button action-info";
    help.textContent = "!";
    help.setAttribute(
      "aria-label",
      `Informacion sobre ${label}`,
    );
    const message = document.createElement("span");
    message.className = "action-help-message";
    message.textContent = description;
    help.onclick = (e) => {
      e.stopPropagation();
      message.hidden = !message.hidden;
    };
    button.parentNode.insertBefore(wrapper, button);
    wrapper.append(button, help, message);
    message.hidden = true;
  };
  const scan = () =>
    document
      .querySelectorAll(".content-heading button.primary-button, .invoice-actions button, .reset-actions button")
      .forEach(addHelp);
  scan();
  new MutationObserver(scan).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
function describeButton(button) {
  const label = button.textContent.trim().replace(/\s+/g, " ");
  const descriptions = {
    "+ Registrar paciente":
      "Abre el formulario para registrar un nuevo paciente en el sistema.",
    "+ Nueva factura": "Abre el formulario para crear y calcular una factura.",
    "+ Nueva cita": "Abre el formulario para agendar una cita en la agenda.",
    "+ Agregar empleado": "Abre el formulario para dar de alta a un empleado.",
    "+ Nueva nota": "Abre el formulario para programar un recordatorio.",
    "+ Agregar servicio": "Abre el formulario para registrar un nuevo servicio en el catálogo.",
    "Generar respaldo PDF": "Genera y abre una vista imprimible para guardar el respaldo completo en PDF.",
    "Borrar datos respaldados": "Reinicia los datos operativos tras haber guardado el respaldo en PDF.",
    "Generar PDF": "Descarga o imprime un reporte en formato PDF.",
  };
  return descriptions[label] || null;
}
function formCard(title, fields, collection, onDone) {
  const wrapper = document.createElement("section");
  wrapper.className = "entry-modal";
  wrapper.innerHTML = `<div class="panel modal-card"><div class="panel-title"><h3>${title}</h3><button class="close" type="button">×</button></div><form class="form-grid">${fields}<div class="wide form-actions"><button class="secondary-button close" type="button">Cancelar</button><button class="primary-button">Guardar</button></div></form></div>`;
  document.body.append(wrapper);
  wrapper
    .querySelectorAll(".close")
    .forEach((button) => (button.onclick = () => wrapper.remove()));
  wrapper.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const value = Object.fromEntries(formData);
    const multiBackgrounds = formData.getAll("medicalBackground");
    if (multiBackgrounds.length) {
      value.medicalBackground = multiBackgrounds;
    }
    
    // Validaciones específicas por colección
    if (collection === "services") {
      const price = Number(value.price);
      if (!Number.isFinite(price) || price <= 0) {
        showFormError(wrapper, "El precio debe ser un número mayor que cero.");
        return;
      }
      value.price = price;
      value.duration = Number(value.duration || 50);
      value.active = true;
    }

    if (collection === "expenses") {
      const amountBs = Number(value.amountBs);
      if (!Number.isFinite(amountBs) || amountBs <= 0) {
        showFormError(wrapper, "El monto del gasto debe ser mayor que cero.");
        return;
      }
      value.amountBs = amountBs;
    }

    if (collection === "notes") {
      value.done = false;
    }

    if (collection === "patients") {
      if (!value.name && (value.firstNames || value.lastNames)) {
        value.name = `${value.firstNames || ""} ${value.lastNames || ""}`.trim();
      }
      if (!value.status) value.status = "Primera visita";
    }
    
    if (collection === "employees") {
      const emailLower = (value.email || "").trim().toLowerCase();
      if ((db.users || []).some(u => (u.email || "").toLowerCase() === emailLower)) {
        showFormError(wrapper, "Ya existe un usuario registrado con este correo.");
        return;
      }

      // Validación de contraseña
      if (value.password !== value.confirmPassword) {
        showFormError(wrapper, "Las contraseñas no coinciden.");
        return;
      }
      
      if (value.password.length < 6) {
        showFormError(wrapper, "La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      
      value.permissions = Object.fromEntries(
        permissionMenus.map((menu) => [
          menu,
          {
            view:
              event.target.querySelector(`[name="view-${menu}"]`)?.checked ||
              false,
            manage:
              event.target.querySelector(`[name="manage-${menu}"]`)?.checked ||
              false,
          },
        ]),
      );
      
      // Agregar al registro de usuarios
      db.users = db.users || [];
      db.users.push({
        id: Date.now() + 1,
        name: value.name,
        email: value.email,
        password: value.password,
        role: "empleado",
        active: true,
        personalData: {
          firstNames: value.firstNames,
          lastNames: value.lastNames,
          cedula: value.cedula,
          birthDate: value.birthDate,
          address: value.address,
          phone: value.phone,
          personalEmail: value.personalEmail,
        },
        workData: {
          role: value.role,
          hireDate: value.hireDate,
          contractType: value.contractType,
          baseSalary: value.baseSalary ? Number(value.baseSalary) : 0,
          currency: value.currency,
          bankName: value.bankName,
          accountNumber: value.accountNumber,
          accountType: value.accountType,
        },
        permissions: value.permissions,
      });
    }
    
    value.id = Date.now();
    if (collection === "invoices") {
      value.id = `FAC-${1050 + db.invoices.length}`;
      value.amount = Number(value.amount);
      value.status = value.status || "Pagada";
    }
    
    db[collection] = db[collection] || [];
    db[collection].unshift(value);
    logEvent(
      collection === "employees" ? "usuario" : collection,
      "crear",
      `Se registro ${collection === "employees" ? "el usuario " + value.name : "un nuevo registro en " + collection}.`,
      value,
    );
    save();
    wrapper.remove();
    onDone();
  };
}
function showFormError(wrapper, message) {
  let error = wrapper.querySelector(".form-error");
  if (!error) {
    error = document.createElement("p");
    error.className = "form-error wide";
    wrapper.querySelector("form").prepend(error);
  }
  error.textContent = message;
}
