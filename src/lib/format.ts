export function formatoCordobas(monto: number): string {
  return `C$ ${Math.round(monto).toLocaleString("en-US")}`;
}

export function formatoPrecio(monto: number): string {
  // Solo córdobas — nada de conversión aproximada a USD.
  return formatoCordobas(monto);
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