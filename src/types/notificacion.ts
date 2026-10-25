export type TipoNotificacion =
  | "nuevo_viaje"
  | "pocos_cupos"
  | "reserva_aprobada"
  | "reserva_rechazada"
  | "nueva_reserva";

/** GET /notificaciones/me — NotificacionResponseDto. */
export interface Notificacion {
  idNotificacion: number;
  idUsuario: number;
  idViaje?: number | null;
  tipo: TipoNotificacion | string;
  mensaje: string;
  fechaEnvio: string;
  leida: boolean;
}
