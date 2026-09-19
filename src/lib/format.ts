const TIPO_CAMBIO_USD = 36.7;

export function formatoCordobas(monto: number): string {
  return `C$ ${Math.round(monto).toLocaleString("en-US")}`;
}

export function formatoUSDAproximado(monto: number): string {
  return `~$${Math.round(monto / TIPO_CAMBIO_USD)} USD`;
}

export function formatoPrecio(monto: number): string {
  return `${formatoCordobas(monto)} (${formatoUSDAproximado(monto)})`;
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