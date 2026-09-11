shell("Recordatorios", "recordatorios");
function render() {
  document.querySelector("#menuContent").innerHTML =
    `<div class="content-heading"><div><p class="eyebrow">ORGANIZACION</p><h2>Recordatorios</h2><p>Programa responsabilidades y recibe avisos en todos los menus.</p></div><button id="new" class="primary-button">+ Nueva nota</button></div><section class="panel"><div class="agenda-list">${(db.notes || []).map((n) => `<div class="note ${n.done ? "done" : ""}"><span>♧</span><div><strong>${n.title}</strong><small>${n.date} · Frecuencia: ${n.frequency}</small></div><button class="secondary-button" data-note="${n.id}">${n.done ? "Completada" : "Marcar lista"}</button><button class="delete-note" data-delete-note="${n.id}" aria-label="Eliminar recordatorio">×</button></div>`).join("")}</div></section>`;
  document.querySelector("#new").onclick = () =>
    formCard(
      "Nuevo recordatorio",
      `<label>Titulo<input name="title" required></label><label>Fecha<input name="date" type="date" required></label><label>Frecuencia<select name="frequency"><option>Unica</option><option>Diaria</option><option>Semanal</option><option>Mensual</option></select></label>`,
      "notes",
      render,
    );
  document.querySelectorAll("[data-note]").forEach((button) => {
    button.onclick = () => {
      const note = db.notes.find(
        (item) => item.id === Number(button.dataset.note),
      );
      note.done = !note.done;
      save();
      render();
    };
  });
  document.querySelectorAll("[data-delete-note]").forEach((button) => {
    button.onclick = () => {
      const note = db.notes.find(
        (item) => item.id === Number(button.dataset.deleteNote),
      );
      if (!note || !confirm(`¿Eliminar el recordatorio "${note.title}"?`))
        return;
      logEvent(
        "notes",
        "eliminar",
        `Se elimino el recordatorio ${note.title}.`,
        note,
      );
      db.notes = db.notes.filter((item) => item.id !== note.id);
      save();
      render();
    };
  });
}
render();
