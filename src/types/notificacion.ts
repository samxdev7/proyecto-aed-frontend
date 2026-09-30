export interface Notificacion {
  idNotificacion: number;
  idUsuario: number;
  tipo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface SuscripcionPushRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
}
