export function formatoCordobas(monto: number): string {
  return `C$ ${Math.round(monto).toLocaleString("en-US")}`;
}

export function formatoPrecio(monto: number): string {
  // Solo córdobas — nada de conversión aproximada a USD.
  return formatoCordobas(monto);
}

export function formatoHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-NI", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatoFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatoFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Formatea de forma segura el tipo y número de documento del usuario.
 * Evita imprimir 'null: null' o 'Null: Null' ante campos vacíos o no inicializados.
 */
export function formatoIdentificacion(
  tipo?: string | null,
  numero?: string | null
): string {
  const tipoLimpio =
    tipo && tipo !== "null" && tipo !== "undefined" ? tipo.trim() : "";
  const numeroLimpio =
    numero && numero !== "null" && numero !== "undefined" ? numero.trim() : "";

  if (!tipoLimpio && !numeroLimpio) return "Sin registrar";

  const etiquetaTipo =
    tipoLimpio.toLowerCase() === "cedula"
      ? "Cédula"
      : tipoLimpio.toLowerCase() === "pasaporte"
        ? "Pasaporte"
        : tipoLimpio || "Identificación";

  if (!numeroLimpio) return `${etiquetaTipo}: (Sin número)`;
  return `${etiquetaTipo}: ${numeroLimpio}`;
}

/**
 * Formatea respuestas de formulario dinámico para visualización.
 * Si es un arreglo JSON (opción múltiple), lo muestra unido por ' · '.
 */
export function formatearRespuestaFormulario(valor?: string | null): string {
  if (!valor) return "—";
  if (valor.startsWith("[") && valor.endsWith("]")) {
    try {
      const parsed = JSON.parse(valor) as unknown;
      if (Array.isArray(parsed)) return parsed.join(" · ");
    } catch {
      /* fallback */
    }
  }
  return valor;
}