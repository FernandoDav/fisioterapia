shell("Empleados", "empleados");
function render() {
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">ADMINISTRACION</p><h2>Empleados</h2><p>Administra accesos, credenciales y permisos del personal.</p></div><button id="new" class="primary-button">+ Agregar empleado</button></div><section class="panel table-panel"><table><thead><tr><th>Nombre</th><th>Rol</th><th>Cédula</th><th>Teléfono</th><th>Contrato</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${(
      db.employees || []
    )
      .map((employee) => {
        const user = (db.users || []).find(
          (item) => item.email === employee.email,
        );
        const active = user?.active !== false;
        const personalData = user?.personalData || {};
        const workData = user?.workData || {};
        return `<tr>
          <td><strong>${employee.name}</strong><small>${personalData.firstNames || ""} ${personalData.lastNames || ""}</small></td>
          <td>${workData.role || employee.role}</td>
          <td>${personalData.cedula || "No registrada"}</td>
          <td>${personalData.phone || "No registrado"}</td>
          <td>${workData.contractType || "No especificado"}</td>
          <td><span class="status ${active ? "" : "suspended-status"}">${active ? "Activo" : "Suspendido"}</span></td>
          <td>${user && user.role !== "admin" ? `<button class="table-action edit-user" data-id="${user.id}">Editar</button><button class="table-action toggle-user ${active ? "suspend-action" : "reactivate-action"}" data-id="${user.id}">${active ? "Suspender" : "Reactivar"}</button><button class="table-action delete-user" data-id="${user.id}">Eliminar</button>` : "Usuario principal"}</td>
        </tr>`;
      })
      .join("")}</tbody></table></section>`;
  document.querySelector("#new").onclick = () =>
    formCard(
      "Agregar empleado",
      `<div class="employee-form-section"><h4>Datos personales</h4><label>Nombres<input name="firstNames" required></label><label>Apellidos<input name="lastNames" required></label><label>Nombre completo<input name="name" required></label><label>Fecha de nacimiento<input name="birthDate" type="date"></label><label>Cédula de identidad<input name="cedula" required></label><label>Dirección<input name="address"></label><label>Teléfono<input name="phone" type="tel" required></label><label>Correo personal<input name="personalEmail" type="email"></label></div><div class="employee-form-section"><h4>Datos laborales</h4><label>Cargo/Puesto<select name="role"><option value="Fisioterapeuta">Fisioterapeuta</option><option value="Recepcionista">Recepcionista</option><option value="Administrador">Administrador</option><option value="Asistente">Asistente</option><option value="Coordinador">Coordinador</option><option value="Gerente">Gerente</option><option value="Especialista">Especialista</option></select></label><label>Fecha de contratación<input name="hireDate" type="date" required></label><label>Tipo de contrato<select name="contractType"><option value="Tiempo completo">Tiempo completo</option><option value="Tiempo parcial">Tiempo parcial</option><option value="Por horas">Por horas</option><option value="Pasantía">Pasantía</option></select></label><label>Salario base<input name="baseSalary" type="number" min="0" step="0.01"></label><label>Moneda de pago<select name="currency"><option value="USD">USD</option><option value="EUR">EUR</option><option value="Bs">Bs</option></select></label><label>Banco para pagos<input name="bankName"></label><label>Número de cuenta<input name="accountNumber"></label><label>Tipo de cuenta<select name="accountType"><option value="Ahorro">Ahorro</option><option value="Corriente">Corriente</option></select></label></div><div class="employee-form-section"><h4>Acceso al sistema</h4><label>Correo de acceso<input name="email" type="email" required></label><label>Contraseña inicial<input name="password" type="password" minlength="6" required></label><label>Confirmar contraseña<input name="confirmPassword" type="password" minlength="6" required></label></div><div class="employee-form-section"><h4>Permisos por módulo</h4><small>Selecciona si puede consultar y/o gestionar cada módulo.</small>${permissionMenus.map((menu) => `<div class="permission-row"><span>${menu[0].toUpperCase() + menu.slice(1)}</span><label><input name="view-${menu}" type="checkbox" checked> Ver</label><label><input name="manage-${menu}" type="checkbox"> Gestionar</label></div>`).join("")}</div>`,
      "employees",
      render,
    );
  document.querySelectorAll(".edit-user").forEach((button) => {
    button.onclick = () =>
      openUserEditor(
        (db.users || []).find((user) => user.id === Number(button.dataset.id)),
      );
  });
  document.querySelectorAll(".toggle-user").forEach((button) => {
    button.onclick = () => {
      const user = (db.users || []).find(
        (item) => item.id === Number(button.dataset.id),
      );
      if (!user) return;
      user.active = user.active === false;
      logEvent(
        "usuario",
        user.active ? "reactivar" : "suspender",
        `Se ${user.active ? "reactivo" : "suspendio"} el usuario ${user.name}.`,
        user,
      );
      save();
      render();
    };
  });
  document.querySelectorAll(".delete-user").forEach((button) => {
    button.onclick = () => {
      const user = (db.users || []).find(
        (item) => item.id === Number(button.dataset.id),
      );
      if (
        !user ||
        !confirm(
          `¿Eliminar el usuario ${user.name}? Esta accion no se puede deshacer.`,
        )
      )
        return;
      logEvent(
        "usuario",
        "eliminar",
        `Se elimino el usuario ${user.name}.`,
        user,
      );
      db.users = db.users.filter((item) => item.id !== user.id);
      db.employees = (db.employees || []).filter(
        (item) => item.email !== user.email,
      );
      save();
      render();
    };
  });
}

function permissionFields(user) {
  return permissionMenus
    .map((menu) => {
      const permission = Array.isArray(user?.permissions)
        ? { view: user.permissions.includes(menu), manage: false }
        : user?.permissions?.[menu] || {};
      return `<div class="permission-row"><span>${menu[0].toUpperCase() + menu.slice(1)}</span><label><input name="view-${menu}" type="checkbox" ${permission.view ? "checked" : ""}> Ver</label><label><input name="manage-${menu}" type="checkbox" ${permission.manage ? "checked" : ""}> Gestionar</label></div>`;
    })
    .join("");
}

function openUserEditor(user) {
  if (!user) return;
  const employee = (db.employees || []).find(
    (item) => item.email === user.email,
  );
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  
  const personalData = user.personalData || {};
  const workData = user.workData || {};
  
  modal.innerHTML = `<div class="panel modal-card"><div class="panel-title"><div><h3>Editar empleado</h3><p>Actualiza datos personales, laborales y permisos de acceso.</p></div><button class="close" type="button">×</button></div><form class="form-grid">
    <div class="employee-form-section"><h4>Datos personales</h4>
      <label>Nombres<input name="firstNames" value="${personalData.firstNames || ""}" required></label>
      <label>Apellidos<input name="lastNames" value="${personalData.lastNames || ""}" required></label>
      <label>Nombre completo<input name="name" value="${user.name}" required></label>
      <label>Fecha de nacimiento<input name="birthDate" type="date" value="${personalData.birthDate || ""}"></label>
      <label>Cédula de identidad<input name="cedula" value="${personalData.cedula || ""}" required></label>
      <label>Dirección<input name="address" value="${personalData.address || ""}"></label>
      <label>Teléfono<input name="phone" type="tel" value="${personalData.phone || ""}" required></label>
      <label>Correo personal<input name="personalEmail" type="email" value="${personalData.personalEmail || ""}"></label>
    </div>
    <div class="employee-form-section"><h4>Datos laborales</h4>
      <label>Cargo/Puesto<select name="role">
        <option value="Fisioterapeuta" ${workData.role === "Fisioterapeuta" ? "selected" : ""}>Fisioterapeuta</option>
        <option value="Recepcionista" ${workData.role === "Recepcionista" ? "selected" : ""}>Recepcionista</option>
        <option value="Administrador" ${workData.role === "Administrador" ? "selected" : ""}>Administrador</option>
        <option value="Asistente" ${workData.role === "Asistente" ? "selected" : ""}>Asistente</option>
        <option value="Coordinador" ${workData.role === "Coordinador" ? "selected" : ""}>Coordinador</option>
        <option value="Gerente" ${workData.role === "Gerente" ? "selected" : ""}>Gerente</option>
        <option value="Especialista" ${workData.role === "Especialista" ? "selected" : ""}>Especialista</option>
      </select></label>
      <label>Fecha de contratación<input name="hireDate" type="date" value="${workData.hireDate || ""}" required></label>
      <label>Tipo de contrato<select name="contractType">
        <option value="Tiempo completo" ${workData.contractType === "Tiempo completo" ? "selected" : ""}>Tiempo completo</option>
        <option value="Tiempo parcial" ${workData.contractType === "Tiempo parcial" ? "selected" : ""}>Tiempo parcial</option>
        <option value="Por horas" ${workData.contractType === "Por horas" ? "selected" : ""}>Por horas</option>
        <option value="Pasantía" ${workData.contractType === "Pasantía" ? "selected" : ""}>Pasantía</option>
      </select></label>
      <label>Salario base<input name="baseSalary" type="number" min="0" step="0.01" value="${workData.baseSalary || ""}"></label>
      <label>Moneda de pago<select name="currency">
        <option value="USD" ${workData.currency === "USD" ? "selected" : ""}>USD</option>
        <option value="EUR" ${workData.currency === "EUR" ? "selected" : ""}>EUR</option>
        <option value="Bs" ${workData.currency === "Bs" ? "selected" : ""}>Bs</option>
      </select></label>
      <label>Banco para pagos<input name="bankName" value="${workData.bankName || ""}"></label>
      <label>Número de cuenta<input name="accountNumber" value="${workData.accountNumber || ""}"></label>
      <label>Tipo de cuenta<select name="accountType">
        <option value="Ahorro" ${workData.accountType === "Ahorro" ? "selected" : ""}>Ahorro</option>
        <option value="Corriente" ${workData.accountType === "Corriente" ? "selected" : ""}>Corriente</option>
      </select></label>
    </div>
    <div class="employee-form-section"><h4>Acceso al sistema</h4>
      <label>Correo de acceso<input name="email" type="email" value="${user.email}" required></label>
      <label>Contraseña nueva<input name="password" type="password" minlength="6" placeholder="Dejar vacía para conservarla"></label>
      <label>Confirmar contraseña<input name="confirmPassword" type="password" minlength="6" placeholder="Dejar vacía para conservarla"></label>
    </div>
    <div class="employee-form-section"><h4>Permisos por módulo</h4><small>Define si puede consultar y/o gestionar cada módulo.</small>${permissionFields(user)}</div>
    <p class="form-error wide"></p>
    <div class="wide form-actions"><button class="secondary-button close" type="button">Cancelar</button><button class="primary-button">Guardar cambios</button></div>
  </form></div>`;
  
  document.body.append(modal);
  modal
    .querySelectorAll(".close")
    .forEach((button) => (button.onclick = () => modal.remove()));
    
  modal.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    const duplicate = db.users.find(
      (item) => item.email === values.email && item.id !== user.id,
    );
    if (duplicate)
      return showFormError(modal, "Ese correo ya pertenece a otro usuario.");
    
    // Validación de contraseña si se proporciona
    if (values.password && values.password !== values.confirmPassword) {
      return showFormError(modal, "Las contraseñas no coinciden.");
    }
    
    if (values.password && values.password.length < 6) {
      return showFormError(modal, "La contraseña debe tener al menos 6 caracteres.");
    }
    
    // Actualizar datos personales
    user.personalData = {
      firstNames: values.firstNames,
      lastNames: values.lastNames,
      cedula: values.cedula,
      birthDate: values.birthDate,
      address: values.address,
      phone: values.phone,
      personalEmail: values.personalEmail,
    };
    
    // Actualizar datos laborales
    user.workData = {
      role: values.role,
      hireDate: values.hireDate,
      contractType: values.contractType,
      baseSalary: values.baseSalary,
      currency: values.currency,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountType: values.accountType,
    };
    
    user.name = values.name;
    user.email = values.email;
    if (values.password) user.password = values.password;
    
    user.permissions = Object.fromEntries(
      permissionMenus.map((menu) => [
        menu,
        {
          view: event.target.querySelector(`[name="view-${menu}"]`).checked,
          manage: event.target.querySelector(`[name="manage-${menu}"]`).checked,
        },
      ]),
    );
    
    if (employee) {
      employee.name = values.name;
      employee.email = values.email;
      employee.role = values.role;
    }
    
    logEvent(
      "usuario",
      "editar",
      `Se actualizaron los datos del empleado ${user.name}.`,
      user,
    );
    save();
    modal.remove();
    render();
  };
}
render();
