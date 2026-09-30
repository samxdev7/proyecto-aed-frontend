export type EstadoReserva = "pendiente" | "aprobada" | "rechazada";

export interface Reserva {
  idReserva: number;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  idViaje: number;
  tituloViaje: string;
  idGuia?: number;
  nombreGuia?: string;
  estado: EstadoReserva;
  montoTotal: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPago?: string;
  numeroReferenciaPago?: string;
  capturaComprobanteUrl?: string;
  motivoRechazo?: string;
  fechaRechazo?: string;
  confirmada: boolean;
  acompanantes: Acompanante[];
  respuestasFormulario: RespuestaFormulario[];
}

export interface Acompanante {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}

export interface RespuestaFormulario {
  idCampo: number;
  respuesta: string;
  /**
   * Quién respondió: "titular" o "acomp-<índice>". El backend aún no lo
   * persiste (ver INFORME-PENDIENTES): el front lo envía y lo muestra por persona.
   */
  persona?: string;
}

export interface CrearReservaRequest {
  idViaje: number;
  numeroReferenciaPago: string;
  capturaComprobanteUrl: string;
  acompanantes?: Acompanante[];
  respuestasFormulario?: RespuestaFormulario[];
}

export interface RechazarReservaRequest {
  motivoRechazo: string;
}

export interface ReservaAdminResumen {
  idReserva: number;
  idViaje: number;
  tituloViaje: string;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  estado: EstadoReserva;
  montoTotal: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  numeroReferenciaPago: string;
  capturaComprobanteUrl?: string;
  acompanantes: Acompanante[];
  numAcompanantes: number;
}
