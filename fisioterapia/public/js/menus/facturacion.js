shell("Facturacion", "facturacion");

const defaultRates = { usdToBs: 36, eurToBs: 39 };
const referenceMethods = ["Pago movil", "Transferencia", "Zelle"];

function activeServices() {
  return (db.services || []).filter((service) => service.active !== false);
}
function employeeOptions() {
  return (db.employees || [])
    .filter((employee) => employee.role !== "Administradora")
    .map((employee) => `<option>${employee.name}</option>`)
    .join("");
}
function render() {
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">GESTION CLINICA</p><h2>Facturacion</h2><p>Registra sesiones, servicios, tasas y pagos reales.</p></div><div class="invoice-actions"><button id="exportInvoices" class="secondary-button">Generar PDF</button><button id="new" class="primary-button">+ Nueva factura</button></div></div><section class="panel table-panel"><div class="panel-title"><div><h3>Facturas recientes</h3><p>Los totales en Bs quedan guardados para calcular pagos reales.</p></div><select id="filter"><option>Todos</option><option>Pagada</option><option>Pendiente</option><option>No pagada</option></select></div><table><thead><tr><th>Factura</th><th>Paciente</th><th>Servicio</th><th>Sesiones</th><th>Total Bs</th><th>Pago</th><th>Estado</th><th>Accion</th></tr></thead><tbody>${db.invoices.map((invoice) => `<tr data-status="${invoice.status || "Pendiente"}"><td><strong>${invoice.id}</strong></td><td>${invoice.patient}</td><td>${invoice.service || "Sin servicio"}<small>${invoice.serviceQuantity || 1} servicio(s)</small></td><td>${invoice.sessionCount || 1}</td><td><strong>Bs ${Number(invoice.amountBs || 0).toFixed(2)}</strong><small>${money(invoice.amountUsd || invoice.amount)}</small></td><td>${invoice.paymentMethod || "Sin registrar"}${invoice.reference ? `<small>Ref. ${invoice.reference}</small>` : ""}</td><td><span class="status ${invoice.status === "Pagada" ? "paid-status" : "pending"}">${invoice.status || "Pendiente"}</span></td><td><button class="table-action edit-invoice" data-id="${invoice.id}">Editar pago</button></td></tr>`).join("")}</tbody></table></section>`;
  document.querySelector("#new").onclick = openInvoiceForm;
  document.querySelector("#exportInvoices").onclick = () =>
    printReport(
      "Facturas · Fisio Clinica",
      `Generado ${new Date().toLocaleString("es-MX")}`,
      [
        `<h2>Facturas registradas</h2><table><tr><th>Factura</th><th>Paciente</th><th>Empleado</th><th>Estado</th><th>Total Bs</th><th>Metodo</th></tr>${db.invoices.map((invoice) => `<tr><td>${invoice.id}</td><td>${invoice.patient}</td><td>${invoice.employee}</td><td>${invoice.status || ""}</td><td>Bs ${Number(invoice.amountBs || 0).toFixed(2)}</td><td>${invoice.paymentMethod || ""}</td></tr>`).join("")}</table>`,
      ],
    );
  document.querySelector("#filter").onchange = (event) =>
    document.querySelectorAll("[data-status]").forEach((row) => {
      row.hidden =
        event.target.value !== "Todos" &&
        row.dataset.status !== event.target.value;
    });
  document.querySelectorAll(".invoice-pdf").forEach((button) => {
    button.onclick = () =>
      exportInvoicePdf(
        db.invoices.find((invoice) => invoice.id === button.dataset.id),
      );
  });
  document.querySelectorAll(".edit-invoice").forEach((button) => {
    if (button.parentElement.querySelector(".invoice-pdf")) return;
    const pdfButton = document.createElement("button");
    pdfButton.className = "table-action invoice-pdf";
    pdfButton.dataset.id = button.dataset.id;
    pdfButton.textContent = "PDF";
    pdfButton.onclick = () =>
      exportInvoicePdf(
        db.invoices.find((invoice) => invoice.id === pdfButton.dataset.id),
      );
    button.parentElement.append(pdfButton);
  });
  document.querySelectorAll(".edit-invoice").forEach((button) => {
    button.onclick = () =>
      openInvoicePaymentEditor(
        db.invoices.find((invoice) => invoice.id === button.dataset.id),
      );
  });
}
function exportInvoicePdf(invoice) {
  if (!invoice) return;
  printReport(
    `Factura ${invoice.id} · Fisio Clinica`,
    `Generada ${new Date().toLocaleString("es-MX")}`,
    [
      `<h2>Datos del paciente</h2><p><strong>${invoice.patient}</strong></p><h2>Detalle del servicio</h2><table><tr><th>Servicio</th><th>Sesiones</th><th>Cantidad</th><th>Empleado</th></tr><tr><td>${invoice.service || "Sin servicio"}</td><td>${invoice.sessionCount || 1}</td><td>${invoice.serviceQuantity || 1}</td><td>${invoice.employee || "Sin empleado"}</td></tr></table><h2>Pago</h2><table><tr><th>Estado</th><th>Metodo</th><th>Referencia</th><th>Total Bs</th></tr><tr><td>${invoice.status || "Pendiente"}</td><td>${invoice.paymentMethod || "Sin registrar"}</td><td>${invoice.reference || "Sin referencia"}</td><td>Bs ${Number(invoice.amountBs || 0).toFixed(2)}</td></tr></table>`,
    ],
  );
}
function openInvoicePaymentEditor(invoice) {
  if (!invoice) return;
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  modal.innerHTML = `<div class="panel modal-card invoice-modal"><div class="panel-title"><div><h3>Editar pago ${invoice.id}</h3><p>${invoice.patient} · ${invoice.service || "Servicio no especificado"}</p></div><button class="close" type="button">×</button></div><form class="form-grid"><div class="currency-preview wide"><strong>Total guardado</strong><div><span>USD <b>${money(invoice.amountUsd || invoice.amount)}</b></span><span>EUR <b>€${Number(invoice.amountEur || 0).toFixed(2)}</b></span><span>Bs <b>Bs ${Number(invoice.amountBs || 0).toFixed(2)}</b></span></div><small>${invoice.sessionCount || 1} sesion(es) × ${invoice.serviceQuantity || 1} servicio(s)</small></div><label>Estado<select name="status"><option ${invoice.status === "Pendiente" ? "selected" : ""}>Pendiente</option><option ${invoice.status === "Pagada" ? "selected" : ""}>Pagada</option><option ${invoice.status === "No pagada" ? "selected" : ""}>No pagada</option></select></label><label>Metodo de pago<select name="paymentMethod"><option value="">Sin pago registrado</option><option ${invoice.paymentMethod === "Pago movil" ? "selected" : ""}>Pago movil</option><option ${invoice.paymentMethod === "Transferencia" ? "selected" : ""}>Transferencia</option><option ${invoice.paymentMethod === "Zelle" ? "selected" : ""}>Zelle</option><option ${invoice.paymentMethod === "Divisa" ? "selected" : ""}>Divisa</option><option ${invoice.paymentMethod === "Efectivo (Bs)" ? "selected" : ""}>Efectivo (Bs)</option></select></label><label class="wide">Numero de referencia<input name="reference" value="${invoice.reference || ""}"></label><label>Tasa USD a Bs<input name="usdRate" type="number" min="0.01" step="0.01" value="${invoice.dollarRate || defaultRates.usdToBs}" required></label><label>Tasa EUR a Bs<input name="eurRate" type="number" min="0.01" step="0.01" value="${invoice.eurRate || defaultRates.eurToBs}" required></label><p class="form-error wide"></p><div class="wide form-actions"><button type="button" class="secondary-button close">Cancelar</button><button class="primary-button">Guardar cambios</button></div></form></div>`;
  document.body.append(modal);
  const form = modal.querySelector("form");
  modal
    .querySelectorAll(".close")
    .forEach((button) => (button.onclick = () => modal.remove()));
  form.onsubmit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const requiresReference = referenceMethods.includes(values.paymentMethod);
    if (values.status === "Pagada" && !values.paymentMethod)
      return showFormError(
        modal,
        "Una factura pagada debe tener método de pago.",
      );
    if (
      values.status === "Pagada" &&
      requiresReference &&
      !values.reference.trim()
    )
      return showFormError(modal, "Debes registrar el número de referencia.");
    const oldStatus = invoice.status;
    invoice.status = values.status;
    invoice.paymentMethod = values.paymentMethod;
    invoice.reference = values.reference;
    invoice.dollarRate = Number(values.usdRate);
    invoice.eurRate = Number(values.eurRate);
    if (values.status === "Pagada") {
      invoice.amountBs = Number(
        (
          Number(invoice.amountUsd || invoice.amount) * invoice.dollarRate
        ).toFixed(2),
      );
      invoice.amountEur = Number(
        (invoice.amountBs / invoice.eurRate).toFixed(2),
      );
    }
    logEvent(
      "invoices",
      "editar_pago",
      `Se actualizo el pago de ${invoice.id}: ${oldStatus} a ${invoice.status}.`,
      invoice,
    );
    save();
    modal.remove();
    render();
  };
}
function openInvoiceForm() {
  const services = activeServices();
  if (!services.length)
    return alert("No hay servicios activos en el catalogo.");
  const modal = document.createElement("section");
  modal.className = "entry-modal";
  modal.innerHTML = `<div class="panel modal-card invoice-modal"><div class="panel-title"><div><h3>Nueva factura</h3><p>El total se calcula antes de guardar y queda congelado en la factura.</p></div><button class="close" type="button">×</button></div><form id="invoiceForm" class="form-grid"><label>Paciente<select name="patient" required>${db.patients.map((patient) => `<option>${patient.name}</option>`).join("")}</select></label><label>Empleado<select name="employee" required>${employeeOptions()}</select></label><label class="wide">Servicio<select id="service" name="service" required>${services.map((service) => `<option value="${service.name}" data-price="${service.price}">${service.name} · ${money(service.price)} USD</option>`).join("")}</select></label><label>Sesiones a pagar<input id="sessionCount" name="sessionCount" type="number" min="1" value="1" required></label><label>Cantidad de servicios<input id="serviceQuantity" name="serviceQuantity" type="number" min="1" value="1" required></label><label>Tasa USD a Bs<input id="usdRate" name="usdRate" type="number" min="0.01" step="0.01" value="${defaultRates.usdToBs}" required><button id="autoRate" type="button" class="rate-button">Actualizar tasa automática</button><small id="rateStatus">Tasa manual inicial</small></label><label>Tasa EUR a Bs<input id="eurRate" name="eurRate" type="number" min="0.01" step="0.01" value="${defaultRates.eurToBs}" required></label><div class="currency-preview wide"><strong>Resumen antes de guardar</strong><div><span>USD <b id="previewUsd">$0</b></span><span>EUR <b id="previewEur">€0</b></span><span>Bs <b id="previewBs">Bs 0</b></span></div><small id="previewFormula">1 sesion × 1 servicio</small></div><label>Metodo de pago<select id="paymentMethod" name="paymentMethod" required><option value="">Selecciona un método</option><option>Pago movil</option><option>Transferencia</option><option>Zelle</option><option>Divisa</option><option>Efectivo (Bs)</option></select></label><label>Estado<select name="status"><option>Pendiente</option><option>Pagada</option><option>No pagada</option></select></label><label id="referenceField" class="wide hidden-field">Numero de referencia<input id="reference" name="reference"><small>Obligatorio para Pago movil, Transferencia y Zelle.</small></label><label class="wide">Fecha<input name="date" type="date" value="2026-09-08" required></label><p class="form-error wide"></p><div class="wide form-actions"><button type="button" class="secondary-button close">Cancelar</button><button class="primary-button">Guardar factura</button></div></form></div>`;
  document.body.append(modal);
  const form = modal.querySelector("#invoiceForm");
  const service = modal.querySelector("#service");
  const sessionCount = modal.querySelector("#sessionCount");
  const serviceQuantity = modal.querySelector("#serviceQuantity");
  const usdRate = modal.querySelector("#usdRate");
  const autoRate = modal.querySelector("#autoRate");
  const rateStatus = modal.querySelector("#rateStatus");
  const eurRate = modal.querySelector("#eurRate");
  const paymentMethod = modal.querySelector("#paymentMethod");
  const referenceField = modal.querySelector("#referenceField");
  const reference = modal.querySelector("#reference");
  const updatePreview = () => {
    const baseUsd = Number(service.selectedOptions[0]?.dataset.price || 0);
    const totalUsd =
      baseUsd *
      Number(sessionCount.value || 1) *
      Number(serviceQuantity.value || 1);
    const rateUsd = Number(usdRate.value || defaultRates.usdToBs);
    const rateEur = Number(eurRate.value || defaultRates.eurToBs);
    modal.querySelector("#previewUsd").textContent = money(totalUsd);
    modal.querySelector("#previewEur").textContent =
      `€${((totalUsd * rateUsd) / rateEur).toFixed(2)}`;
    modal.querySelector("#previewBs").textContent =
      `Bs ${(totalUsd * rateUsd).toFixed(2)}`;
    modal.querySelector("#previewFormula").textContent =
      `${sessionCount.value} sesion(es) × ${serviceQuantity.value} servicio(s) · Tasa USD: ${rateUsd} Bs`;
  };
  [service, sessionCount, serviceQuantity, usdRate, eurRate].forEach(
    (field) => (field.oninput = updatePreview),
  );
  autoRate.onclick = async () => {
    autoRate.disabled = true;
    rateStatus.textContent = "Consultando tasa...";
    try {
      const rate = await window.TasaCliente?.obtenerTasaAuto({ force: true });
      if (!rate || rate <= 0) throw new Error("Tasa no disponible");
      usdRate.value = Number(rate).toFixed(2);
      rateStatus.textContent = `Tasa automática: ${Number(rate).toFixed(2)} Bs/USD`;
      updatePreview();
    } catch (error) {
      rateStatus.textContent =
        "No fue posible consultar la tasa; usa un valor manual.";
    } finally {
      autoRate.disabled = false;
    }
  };
  paymentMethod.onchange = () => {
    const required = referenceMethods.includes(paymentMethod.value);
    referenceField.classList.toggle("visible-field", required);
    reference.required = required;
  };
  modal
    .querySelectorAll(".close")
    .forEach((button) => (button.onclick = () => modal.remove()));
  updatePreview();
  form.onsubmit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const baseUsd = Number(service.selectedOptions[0]?.dataset.price || 0);
    const sessions = Number(values.sessionCount);
    const quantity = Number(values.serviceQuantity);
    const rate = Number(values.usdRate);
    if (sessions < 1 || quantity < 1 || rate <= 0)
      return showFormError(
        modal,
        "Sesiones, servicios y tasa deben ser mayores que cero.",
      );
    if (
      referenceMethods.includes(values.paymentMethod) &&
      !values.reference.trim()
    )
      return showFormError(modal, "Debes registrar el numero de referencia.");
    const totalUsd = baseUsd * sessions * quantity;
    const invoice = {
      id: `FAC-${1050 + db.invoices.length}`,
      ...values,
      amount: totalUsd,
      amountUsd: totalUsd,
      amountEur: Number(
        ((totalUsd * rate) / Number(values.eurRate)).toFixed(2),
      ),
      amountBs: Number((totalUsd * rate).toFixed(2)),
      unitPriceUsd: baseUsd,
      sessionCount: sessions,
      serviceQuantity: quantity,
      dollarRate: rate,
      rateSource: rateStatus.textContent,
    };
    db.invoices.unshift(invoice);
    logEvent(
      "invoices",
      "crear",
      `Se registro la factura ${invoice.id} para ${invoice.patient}.`,
      invoice,
    );
    save();
    modal.remove();
    render();
  };
}
render();
