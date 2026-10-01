export type TipoNotificacion =
  | "nuevo_viaje"
  | "pocos_cupos"
  | "reserva_aprobada"
  | "reserva_rechazada";

/** GET /notificaciones/me — NotificacionResponseDto. */
export interface Notificacion {
  idNotificacion: number;
  idUsuario: number;
  tipo: TipoNotificacion | string;
  mensaje: string;
  fechaEnvio: string;
  leida: boolean;
}
