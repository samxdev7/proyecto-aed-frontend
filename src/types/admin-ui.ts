import type { ReservaAdminResumen } from "@/types/reserva";

/** Detalle de reserva para auditoría admin: extiende el resumen con campos
    internos (pago/rechazo) que el portal público no expone. */
export interface ReservaAdmin extends ReservaAdminResumen {
  fechaPago?: string;
  motivoRechazo?: string;
  fechaRechazo?: string;
}
