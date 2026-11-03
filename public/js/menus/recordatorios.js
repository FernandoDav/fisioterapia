shell("Recordatorios", "recordatorios");

function updateNotificationBadge() {
  const badge = document.querySelector(".notification-button b");
  if (badge) {
    badge.textContent = (db.notes || []).filter((n) => !n.done).length;
  }
}

function render() {
  document.querySelector("#menuContent").innerHTML = `
    <div class="content-heading">
      <div>
        <p class="eyebrow">ORGANIZACION</p>
        <h2>Recordatorios</h2>
        <p>Programa responsabilidades y recibe avisos en todos los menús.</p>
      </div>
      <button id="new" class="primary-button">+ Nueva nota</button>
    </div>
    <section class="panel">
      <div class="agenda-list">
        ${(db.notes || [])
          .map(
            (n) => `<div class="note ${n.done ? "done" : ""}">
            <span>♧</span>
            <div>
              <strong>${n.title}</strong>
              <small>${n.date} · Frecuencia: ${n.frequency || "Única"}${n.assignee ? ` · Para: ${n.assignee}` : ""}</small>
            </div>
            <button class="secondary-button" data-note="${n.id}">${n.done ? "✓ Completada" : "Marcar lista"}</button>
            <button class="delete-note" data-delete-note="${n.id}" aria-label="Eliminar recordatorio">×</button>
          </div>`,
          )
          .join("") || '<p class="empty" style="padding: 20px;">No hay recordatorios pendientes.</p>'}
      </div>
    </section>`;

  document.querySelector("#new").onclick = () =>
    formCard(
      "Nuevo recordatorio",
      `
      <label>Título del recordatorio
        <input name="title" placeholder="Ej: Pagar alquiler, Revisar insumos" required>
      </label>
      <label>Fecha límite
        <input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
      </label>
      <label>Frecuencia
        <select name="frequency">
          <option>Única</option>
          <option>Diaria</option>
          <option>Semanal</option>
          <option>Mensual</option>
        </select>
      </label>
      <label>Responsable
        <select name="assignee">
          <option value="Todos">Todos</option>
          <option value="Administración">Administración</option>
          <option value="Fisioterapeutas">Fisioterapeutas</option>
        </select>
      </label>
      `,
      "notes",
      () => {
        updateNotificationBadge();
        render();
      },
    );

  document.querySelectorAll("[data-note]").forEach((button) => {
    button.onclick = () => {
      const note = (db.notes || []).find(
        (item) => String(item.id) === String(button.dataset.note),
      );
      if (!note) return;
      note.done = !note.done;
      save();
      updateNotificationBadge();
      render();
    };
  });

  document.querySelectorAll("[data-delete-note]").forEach((button) => {
    button.onclick = () => {
      const note = (db.notes || []).find(
        (item) => String(item.id) === String(button.dataset.deleteNote),
      );
      if (!note || !confirm(`¿Eliminar el recordatorio "${note.title}"?`))
        return;
      logEvent(
        "notes",
        "eliminar",
        `Se eliminó el recordatorio "${note.title}".`,
        note,
      );
      db.notes = (db.notes || []).filter(
        (item) => String(item.id) !== String(note.id),
      );
      save();
      updateNotificationBadge();
      render();
    };
  });
}

render();
updateNotificationBadge();
