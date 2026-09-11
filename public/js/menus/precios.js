shell("Precios y servicios", "precios");

function render() {
  const services = db.services || [];
  document.querySelector("#menuContent").innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">ADMINISTRACION</p>
        <h2>Precios y servicios</h2>
        <p>Administra el catalogo que se ofrece a los pacientes.</p>
      </div>
      <button id="newService" class="primary-button">+ Agregar servicio</button>
    </div>
    <div class="service-summary">
      <div class="kpi"><span>Servicios activos</span><strong>${services.filter((service) => service.active).length}</strong><i>Disponibles para facturar</i></div>
      <div class="kpi total-price-kpi"><span>Valor total del catalogo <button id="totalInfo" class="info-button" type="button" aria-label="Como se calcula el valor total del catalogo">!</button></span><strong>${money(services.reduce((sum, service) => sum + Number(service.price), 0))}</strong><i>Sumatoria de precios publicados</i><p id="totalExplanation" class="calculation-message" hidden>Se suman los precios de todos los servicios registrados para obtener el valor total del catalogo.</p></div>
      <div class="kpi"><span>Duracion promedio</span><strong>${Math.round(services.reduce((sum, service) => sum + Number(service.duration), 0) / (services.length || 1))} min</strong><i>Tiempo por sesion</i></div>
    </div>
    <section class="panel table-panel">
      <div class="panel-title"><div><h3>Catalogo de servicios</h3><p>Estos precios apareceran al crear una factura.</p></div><select id="serviceFilter"><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></div>
      <table><thead><tr><th>Servicio</th><th>Categoria</th><th>Duracion</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        ${services.map((service) => `<tr data-active="${service.active}"><td><strong>${service.name}</strong></td><td>${service.category}</td><td>${service.duration} min</td><td><strong>${money(service.price)}</strong></td><td><button class="status action-status" data-id="${service.id}">${service.active ? "Activo" : "Inactivo"}</button></td><td><button class="table-action edit-service" data-id="${service.id}">Editar</button><button class="table-action delete-service" data-id="${service.id}">Eliminar</button></td></tr>`).join("")}
      </tbody></table>
    </section>`;
  document.querySelector("#newService").onclick = () => openServiceForm();
  document.querySelector("#totalInfo").onclick = () => {
    const message = document.querySelector("#totalExplanation");
    message.hidden = !message.hidden;
  };
  document.querySelector("#serviceFilter").onchange = (event) =>
    document.querySelectorAll("[data-active]").forEach((row) => {
      row.hidden =
        event.target.value !== "all" &&
        String(event.target.value === "active") !== row.dataset.active;
    });
  document.querySelectorAll(".action-status").forEach(
    (button) =>
      (button.onclick = () => {
        const service = services.find(
          (item) => item.id === Number(button.dataset.id),
        );
        service.active = !service.active;
        logEvent(
          "services",
          service.active ? "activar" : "desactivar",
          `Se ${service.active ? "activo" : "desactivo"} el servicio ${service.name}.`,
          service,
        );
        save();
        render();
      }),
  );
  document.querySelectorAll(".delete-service").forEach(
    (button) =>
      (button.onclick = () => {
        db.services = services.filter(
          (item) => item.id !== Number(button.dataset.id),
        );
        logEvent(
          "services",
          "eliminar",
          `Se elimino el servicio ${services.find((item) => item.id === Number(button.dataset.id))?.name || "sin nombre"}.`,
          { id: button.dataset.id },
        );
        save();
        render();
      }),
  );
  document
    .querySelectorAll(".edit-service")
    .forEach(
      (button) =>
        (button.onclick = () =>
          openServiceForm(
            services.find((item) => item.id === Number(button.dataset.id)),
          )),
    );
}

function openServiceForm(service = null) {
  const fields = `<label>Nombre del servicio<input name="name" value="${service?.name || ""}" required></label><label>Categoria<select name="category"><option ${service?.category === "Evaluacion" ? "selected" : ""}>Evaluacion</option><option ${service?.category === "Tratamiento" ? "selected" : ""}>Tratamiento</option><option ${service?.category === "Complementario" ? "selected" : ""}>Complementario</option></select></label><label>Duracion (minutos)<input name="duration" type="number" min="5" value="${service?.duration || 50}" required></label><label>Precio<input name="price" type="number" min="0.01" step="0.01" value="${service?.price || ""}" required></label>`;
  formCard(
    service ? "Editar servicio" : "Agregar servicio",
    fields,
    "services",
    () => render(),
  );
  if (service) {
    const modal = document.querySelector(".entry-modal:last-child");
    modal.querySelector("form").onsubmit = (event) => {
      event.preventDefault();
      const price = Number(event.target.price.value);
      if (!Number.isFinite(price) || price <= 0) {
        showFormError(modal, "El precio debe ser mayor que cero.");
        return;
      }
      Object.assign(service, Object.fromEntries(new FormData(event.target)), {
        duration: Number(event.target.duration.value),
        price,
      });
      save();
      logEvent(
        "services",
        "editar",
        `Se actualizo el servicio ${service.name}.`,
        service,
      );
      modal.remove();
      render();
    };
  }
}
render();
