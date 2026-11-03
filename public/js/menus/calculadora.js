shell("Calculadora", "calculadora");

let value = "";
let isEvaluated = false;

const keys = [
  "C", "⌫", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "−",
  "1", "2", "3", "+",
  "0", ".", "±", "=",
];

const operators = ["÷", "×", "−", "+"];

document.querySelector("#menuContent").innerHTML = `
  <div class="content-heading">
    <div>
      <p class="eyebrow">HERRAMIENTAS</p>
      <h2>Calculadora</h2>
      <p>Una herramienta rápida para tus cuentas del día.</p>
    </div>
  </div>
  <div class="calculator-stage">
    <div class="calc">
      <output id="display">0</output>
      <div class="keys">
        ${keys
          .map(
            (key) =>
              `<button type="button" class="${operators.includes(key) ? "operator" : ""} ${key === "=" ? "equal" : ""}" data-calc="${key}">${key}</button>`,
          )
          .join("")}
      </div>
    </div>
  </div>
`;

const display = document.querySelector("#display");

function updateDisplay() {
  display.value = value || "0";
}

function isErrorState() {
  return value === "Error" || value.includes("No se puede") || value === "NaN" || value === "Infinity";
}

function handleInput(key) {
  if (key === "C") {
    value = "";
    isEvaluated = false;
    updateDisplay();
    return;
  }

  if (key === "⌫") {
    if (isErrorState()) {
      value = "";
    } else {
      value = value.slice(0, -1);
    }
    isEvaluated = false;
    updateDisplay();
    return;
  }

  // Si había un error previo y el usuario escribe algo nuevo, reiniciar
  if (isErrorState()) {
    value = "";
    isEvaluated = false;
  }

  if (key === "=") {
    if (!value) return;
    try {
      // Remover operadores finales sueltos
      let clean = value;
      while (operators.some((op) => clean.endsWith(op))) {
        clean = clean.slice(0, -1);
      }
      if (!clean) return;

      const sanitized = clean
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-");

      // Validar división por cero
      if (/\/\s*0(?!\d|\.)/.test(sanitized)) {
        value = "No se puede dividir entre 0";
        isEvaluated = true;
        updateDisplay();
        return;
      }

      // Evaluar la expresión matemática con seguridad
      const result = Function(`"use strict"; return (${sanitized})`)();

      if (!Number.isFinite(result) || Number.isNaN(result)) {
        value = "Error";
      } else {
        // Formatear decimales para evitar problemas como 0.1 + 0.2 = 0.30000000000000004
        const rounded = Number(Math.round(Number(result + "e10")) + "e-10");
        value = String(rounded);
      }
      isEvaluated = true;
    } catch (e) {
      value = "Error";
      isEvaluated = true;
    }
    updateDisplay();
    return;
  }

  if (key === "%") {
    if (!value) return;
    // Extraer el último número de la expresión
    const match = value.match(/(\d+(\.\d+)?)$/);
    if (!match) return;

    const lastNum = Number(match[0]);
    const prefix = value.slice(0, -match[0].length);

    if (!prefix) {
      // Número único: 50% = 0.5
      value = String(lastNum / 100);
    } else {
      // Si hay una expresión previa (ej: 100 + 20%), calcula el porcentaje de la base
      try {
        const baseExpr = prefix
          .slice(0, -1)
          .replaceAll("×", "*")
          .replaceAll("÷", "/")
          .replaceAll("−", "-");
        const baseVal = Function(`"use strict"; return (${baseExpr})`)();
        const percentVal = (baseVal * lastNum) / 100;
        value = prefix + percentVal;
      } catch {
        value = prefix + String(lastNum / 100);
      }
    }
    isEvaluated = false;
    updateDisplay();
    return;
  }

  if (key === "±") {
    if (!value) {
      value = "−";
      updateDisplay();
      return;
    }

    // Si termina en (-num), revertir a num
    const negParenMatch = value.match(/\((−\d+(\.\d+)?)\)$/);
    if (negParenMatch) {
      const positiveNum = negParenMatch[1].replace("−", "");
      value = value.slice(0, -negParenMatch[0].length) + positiveNum;
      updateDisplay();
      return;
    }

    // Si termina en un número
    const numMatch = value.match(/(\d+(\.\d+)?)$/);
    if (numMatch) {
      const num = numMatch[0];
      const prefix = value.slice(0, -num.length);
      if (!prefix) {
        value = "−" + num;
      } else if (prefix === "−") {
        value = num;
      } else {
        value = prefix + `(−${num})`;
      }
      updateDisplay();
      return;
    }

    // Si empieza con − y es número simple
    if (value.startsWith("−")) {
      value = value.slice(1);
    } else {
      value = "−" + value;
    }
    updateDisplay();
    return;
  }

  if (operators.includes(key)) {
    isEvaluated = false;
    if (!value) {
      if (key === "−") {
        value = "−";
        updateDisplay();
      }
      return;
    }

    // Si el último caracter es un operador, reemplazarlo
    if (operators.some((op) => value.endsWith(op))) {
      value = value.slice(0, -1) + key;
      updateDisplay();
      return;
    }

    value += key;
    updateDisplay();
    return;
  }

  if (key === ".") {
    // Si recién se evaluó un resultado, empezar nuevo número "0."
    if (isEvaluated) {
      value = "0.";
      isEvaluated = false;
      updateDisplay();
      return;
    }

    // Obtener el último fragmento de número
    const parts = value.split(/[÷×−+]/);
    const lastPart = parts[parts.length - 1];

    if (!lastPart) {
      value += "0.";
    } else if (!lastPart.includes(".")) {
      value += ".";
    }
    updateDisplay();
    return;
  }

  // Dígitos (0-9)
  if (/\d/.test(key)) {
    if (isEvaluated) {
      value = key;
      isEvaluated = false;
    } else {
      // Evitar múltiples ceros al inicio
      if (value === "0") {
        value = key;
      } else {
        value += key;
      }
    }
    updateDisplay();
  }
}

// Eventos de clic en botones de la calculadora
document.querySelectorAll("[data-calc]").forEach((button) => {
  button.onclick = (e) => {
    e.preventDefault();
    handleInput(button.dataset.calc);
  };
});

// Soporte para teclado físico
window.onkeydown = (event) => {
  // Ignorar si el usuario está enfocado en un input de otra parte
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
    return;
  }

  const keyMap = {
    "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
    "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
    "+": "+", "-": "−", "*": "×", "/": "÷",
    ".": ".", ",": ".",
    "%": "%",
    "Enter": "=", "=": "=",
    "Backspace": "⌫",
    "Escape": "C", "c": "C", "C": "C",
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    handleInput(keyMap[event.key]);

    // Efecto visual en el botón correspondiente
    const targetButton = document.querySelector(`[data-calc="${keyMap[event.key]}"]`);
    if (targetButton) {
      targetButton.classList.add("active");
      setTimeout(() => targetButton.classList.remove("active"), 120);
    }
  }
};
