const seedUsers = [
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
];
const storedData = JSON.parse(localStorage.getItem("fisioData") || "{}");
storedData.users = storedData.users || seedUsers;
document.querySelector(".login-help .info-button").onclick = () => {
  const helpMessage = document.querySelector(
    ".login-help .action-help-message",
  );
  if (helpMessage) helpMessage.hidden = !helpMessage.hidden;
};
document.querySelector("#loginForm").onsubmit = (event) => {
  event.preventDefault();
  const user = storedData.users.find(
    (item) =>
      item.email === document.querySelector("#email").value &&
      item.password === document.querySelector("#password").value &&
      item.active !== false,
  );
  if (user) {
    storedData.auditLog = storedData.auditLog || [];
    storedData.auditLog.unshift({
      id: Date.now() + Math.random(),
      type: "sesion",
      action: "inicio",
      description: `Inicio de sesion de ${user.name}.`,
      data: { name: user.name, email: user.email, role: user.role },
      user: user.email,
      date: new Date().toISOString(),
    });
    localStorage.setItem("fisioData", JSON.stringify(storedData));
    localStorage.setItem("fisioRole", user.role);
    localStorage.setItem("fisioUser", user.email);
    location.href = "inicio.html";
  } else
    document.querySelector("#error").textContent =
      "Correo o contrasena incorrectos";
};
