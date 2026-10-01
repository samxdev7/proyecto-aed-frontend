/**
 * Datos de la transferencia bancaria del club para el paso de pago.
 * ponytail: config institucional en el front — el backend no expone un
 * endpoint de datos de pago. Si algún día se administra desde el panel,
 * mover a un GET /config/pago y consumirlo aquí.
 */
export const DATOS_PAGO = {
  banco: "BanPro",
  cuenta: "100-022-000123-4",
  moneda: "Córdobas",
  titular: "Club Nicaragüense de Montañismo",
} as const;
