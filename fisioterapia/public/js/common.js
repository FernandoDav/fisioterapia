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
db.services = db.services || seed.services;
db.users = db.users || seed.users;
db.auditLog = db.auditLog || [];
db.expenses = db.expenses || [];
db.payrollPayments = db.payrollPayments || [];
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
    return;
  }
  reportWindow.document.write(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#075b9d;padding:36px}header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #13bfc2;padding-bottom:16px;margin-bottom:24px}header img{width:86px;height:86px;object-fit:contain}h1{margin:0 0 5px}h2{color:#126c9f;border-bottom:1px solid #cfe9ec;padding-bottom:6px}p,td,th{font-size:12px}table{width:100%;border-collapse:collapse;margin:12px 0 24px}td,th{border-bottom:1px solid #dbeaec;padding:9px;text-align:left}th{background:#dff8f7;color:#075b9d}.report-meta{color:#668894;margin-bottom:25px}.total{font-size:18px;font-weight:bold;color:#075b9d}</style></head><body><header><img src="${new URL("public/css/imagenes/IMG_3629.PNG", window.location.href).href}" alt="Faz Castillo Fisioterapia"><div><h1>${title}</h1><p class="report-meta">${subtitle}</p></div></header>${sections.join("")}<script>window.onload=()=>{window.print()}<\/script></body></html>`,
  );
  reportWindow.document.close();
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
    )}</nav></aside><main class="main-content"><header class="topbar"><div class="topbar-leading"><button id="menuToggle" class="menu-toggle" type="button" aria-expanded="false" aria-label="Mostrar menus">☰ <span>Menus</span></button><button class="logout topbar-logout" type="button" onclick="localStorage.removeItem('fisioRole');localStorage.removeItem('fisioUser');location.href='login.html'">↪ Cerrar sesion</button></div><div class="topbar-heading"><p class="eyebrow">GESTION CLINICA</p><h1>${title}</h1></div><div class="topbar-actions"><a class="notification-button" href="recordatorios.html">♧ <b>${(db.notes || []).length}</b></a></div></header><main id="menuContent" class="content-area"></main></main></div>`;
  const navigation = document.querySelector(".sidebar nav");
  navigation.id = "menuNavigation";
  document.querySelector("#menuToggle").onclick = () => {
    const sidebar = document.querySelector(".sidebar");
    const open = sidebar.classList.toggle("menu-open");
    sidebar.classList.toggle("open", open);
    document
      .querySelector("#menuToggle")
      .setAttribute("aria-expanded", String(open));
  };
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
      button.classList.contains("close")
    )
      return;
    button.dataset.helpReady = "true";
    const wrapper = document.createElement("span");
    wrapper.className = "action-help";
    const help = document.createElement("button");
    help.type = "button";
    help.className = "info-button action-info";
    help.textContent = "!";
    help.setAttribute(
      "aria-label",
      `Informacion sobre ${button.textContent.trim()}`,
    );
    const message = document.createElement("span");
    message.className = "action-help-message";
    message.textContent = describeButton(button);
    help.onclick = () => {
      message.hidden = !message.hidden;
    };
    button.parentNode.insertBefore(wrapper, button);
    wrapper.append(button, help, message);
    message.hidden = true;
  };
  const scan = () =>
    document
      .querySelectorAll(".app-shell button, .entry-modal button")
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
      "Abre el formulario para registrar un nuevo paciente.",
    "+ Nueva factura": "Abre el formulario para crear una factura.",
    "+ Nueva cita": "Abre el formulario para agendar una cita.",
    "+ Agregar empleado": "Abre el formulario para agregar un empleado.",
    "+ Nueva nota": "Abre el formulario para programar un recordatorio.",
    Editar: "Permite modificar los datos del servicio.",
    Eliminar: "Elimina este servicio del catalogo.",
    "Marcar lista": "Marca el recordatorio como completado.",
    "×": "Elimina este recordatorio. La acción queda registrada en el historial.",
  };
  return (
    descriptions[label] ||
    `Muestra o ejecuta la accion: ${label || "esta opcion"}.`
  );
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
    const value = Object.fromEntries(new FormData(event.target));
    
    // Validaciones específicas por colección
    if (collection === "services" &&
        (!Number.isFinite(Number(value.price)) || Number(value.price) <= 0)) {
      showFormError(wrapper, "El precio debe ser mayor que cero.");
      return;
    }
    
    if (collection === "employees") {
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
          baseSalary: value.baseSalary,
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
      value.status = "Pagada";
    }
    
    db[collection] = db[collection] || [];
    db[collection].unshift(value);
    logEvent(
      collection === "employees" ? "usuario" : collection,
      "crear",
      `Se registro ${collection === "employees" ? "el usuario " + value.name : "un nuevo " + collection.slice(0, -1)}.`,
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
