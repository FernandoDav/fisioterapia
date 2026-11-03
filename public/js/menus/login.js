document.querySelector(".login-help .info-button")?.addEventListener("click", () => {
  const helpMessage = document.querySelector(
    ".login-help .action-help-message",
  );
  if (helpMessage) helpMessage.hidden = !helpMessage.hidden;
});

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  loginForm.onsubmit = (event) => {
    event.preventDefault();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;
    const errorEl = document.querySelector("#error");

    const users = (typeof db !== "undefined" && db.users) ? db.users : [];
    const user = users.find(
      (item) => item.email.toLowerCase() === email && item.password === password,
    );

    if (!user) {
      errorEl.textContent = "Correo o contraseña incorrectos";
      return;
    }

    if (user.active === false) {
      errorEl.textContent = "Esta cuenta se encuentra suspendida. Contacta a un administrador.";
      return;
    }

    if (typeof logEvent === "function") {
      logEvent("sesion", "inicio", `Inicio de sesion de ${user.name}.`, {
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }

    localStorage.setItem("fisioRole", user.role);
    localStorage.setItem("fisioUser", user.email);
    location.href = "inicio.html";
  };
}
