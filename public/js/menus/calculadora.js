shell("Calculadora", "calculadora");
let value = "";
const keys = [
  "C", "⌫", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "−",
  "1", "2", "3", "+",
  "0", ".", "±", "=",
];
document.querySelector("#menuContent").innerHTML =
  `<div class="content-heading"><div><p class="eyebrow">HERRAMIENTAS</p><h2>Calculadora</h2><p>Una herramienta rapida para tus cuentas del dia.</p></div></div><div class="calculator-stage"><div class="calc"><output id="display">0</output><div class="keys">${keys.map((key) => `<button class="${["÷", "×", "−", "+", "="].includes(key) ? "operator" : ""}" data-key="${key}">${key}</button>`).join("")}</div></div></div>`;
document.querySelectorAll("[data-key]").forEach(
  (button) =>
    (button.onclick = () => {
      const key = button.dataset.key;
      if (key === "C") value = "";
      else if (key === "⌫") value = value.slice(0, -1);
      else if (key === "%") value = String(Number(value) / 100);
      else if (key === "±") value = String(Number(value || 0) * -1);
      else if (key === "=") {
        try {
          value = String(
            Function(
              `return ${value.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-")}`,
            )(),
          );
        } catch {
          value = "Error";
        }
      } else value += key;
      document.querySelector("#display").value = value || "0";
    }),
);
