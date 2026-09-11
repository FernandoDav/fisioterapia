// simple cache en localStorage para reducir llamadas
function _setTasaCache(tasa, source) {
  try {
    localStorage.setItem(
      "tasa_cache",
      JSON.stringify({
        tasa: Number(tasa),
        source: source || "unknown",
        ts: Date.now(),
      }),
    );
  } catch (e) {}
}
function _getTasaCache(ttl = 5 * 60 * 1000) {
  try {
    const raw = localStorage.getItem("tasa_cache");
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (!j || typeof j.tasa !== "number") return null;
    if (Date.now() - (j.ts || 0) > ttl) return null;
    return j;
  } catch (e) {
    return null;
  }
}

function _parsePossibleNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    // limpiar y convertir comas a punto
    const cleaned = v.replace(/[^0-9\,\.\-]/g, "").replace(/,/g, ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}

function _findNumericRec(obj) {
  if (obj == null) return null;
  if (typeof obj !== "object") return _parsePossibleNumber(obj);
  // search known keys first
  const keysPriority = [
    "venta",
    "valor",
    "price",
    "ask",
    "sell",
    "cotizacion",
    "tasa",
    "value",
    "venta_dolares",
  ];
  for (const k of keysPriority) {
    if (k in obj) {
      const v = _parsePossibleNumber(obj[k]);
      if (v !== null) return v;
    }
  }
  // traverse
  for (const k of Object.keys(obj)) {
    try {
      const v = _findNumericRec(obj[k]);
      if (v !== null) return v;
    } catch (e) {}
  }
  return null;
}

async function obtenerTasaDolarApi(apiKey = null) {
  // Intentar varios endpoints conocidos de DolarApi.com y parsear la respuesta
  // Priorizar endpoint VE oficial y otras variantes conocidas
  const endpoints = [
    "https://ve.dolarapi.com/v1/dolares/oficial",
    "https://api.dolarapi.com/v1/dolar",
    "https://api.dolarapi.com/v1/dolares",
    "https://www.dolarapi.com/api/dolar",
    "https://www.dolarapi.com/api/dolar/fecha", // posibles variantes
  ];
  for (const urlBase of endpoints) {
    try {
      const url = apiKey
        ? urlBase + "?api_key=" + encodeURIComponent(apiKey)
        : urlBase;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const j = await res.json();
      // Si el endpoint devuelve un objeto con 'oficial' (ej. ve.dolarapi.com), intentar extraer de ahí
      if (j && (j.oficial || (j.dolares && j.dolares.oficial))) {
        const candidate = j.oficial || (j.dolares && j.dolares.oficial);
        // campos comunes: venta, valor, price, ask
        const v0 = _findNumericRec(candidate);
        if (v0 !== null) return Number(v0);
      }
      // fallback genérico: buscar cualquier número en la respuesta
      const found = _findNumericRec(j);
      if (found && !isNaN(found)) return Number(found);
    } catch (e) {
      // ignore and try next
    }
  }
  return null;
}

/**
 * Obtener tasa de cambio USD->VES
 * opciones: { force, apiKey, cacheTtl }
 */
async function obtenerTasaAuto({
  force = false,
  apiKey = null,
  cacheTtl = 5 * 60 * 1000,
} = {}) {
  // si hay cache válida y no forzamos, retornar
  if (!force) {
    const cached = _getTasaCache(cacheTtl);
    if (cached) return cached.tasa;
  }

  // 1) Intentar proxy local primero (evita problemas de parseo y cambios en BCV)
  try {
    const res = await fetch("http://localhost:2530/api/bcv-tasa");
    if (res.ok) {
      const j = await res.json();
      const v = _findNumericRec(j);
      if (v !== null) {
        _setTasaCache(v, "proxy-local");
        return v;
      }
    }
  } catch (e) {
    // Silenciar error y usar fallback
  }

  // 2) Intentar DolarApi.com con parsing robusto
  try {
    const v2 = await obtenerTasaDolarApi(apiKey);
    if (v2 !== null) {
      _setTasaCache(v2, "dolarapi");
      return v2;
    }
  } catch (e) {
    // continue
  }

  // 3) Fallback a exchangerate.host (soporta CORS)
  try {
    const res2 = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=VES",
    );
    if (res2.ok) {
      const j2 = await res2.json();
      if (j2 && j2.rates && j2.rates.VES) {
        _setTasaCache(Number(j2.rates.VES), "exchangerate.host");
        return Number(j2.rates.VES);
      }
    }
  } catch (e) {
    // ignore
  }

  // Si todo falla, devolver null
  return null;
}

function calcularPrecioVES(precioUSD, tasa) {
  if (typeof precioUSD !== "number") precioUSD = Number(precioUSD);
  if (!tasa || isNaN(tasa)) throw new Error("Tasa inválida");
  return precioUSD * tasa;
}

// Exponer globalmente para uso en páginas
window.TasaCliente = {
  obtenerTasaAuto,
  calcularPrecioVES,
};
// ... (Todo tu código que pusiste arriba va aquí arriba) ...

// COMPATIBILIDAD CON EL SISTEMA:
// Creamos el objeto TasaSoporte que el archivo empleado.js está buscando
const TasaSoporte = {
  obtenerTasa: async () => {
    // Llamamos a tu función obtenerTasaAuto
    const tasa = await obtenerTasaAuto();
    // Si por alguna razón extrema todo falla y devuelve null,
    // damos un valor de seguridad para que no se rompa la factura
    return tasa || 36.5;
  },
};

// También lo exponemos como TasaCliente como lo tenías pensado
window.TasaCliente = {
  obtenerTasaAuto,
  calcularPrecioVES,
  TasaSoporte, // Agregamos la referencia aquí también
};
