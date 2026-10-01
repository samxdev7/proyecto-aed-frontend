export type EstadoReserva = "pendiente" | "aprobada" | "rechazada" | "expirada";

export type TipoIdentificacion = "cedula" | "pasaporte";

export interface Acompanante {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;
}

/** Respuesta del formulario de inscripción: una por campo, para toda la reserva. */
export interface RespuestaFormulario {
  idCampo: number;
  /** Solo viene en respuestas del backend (etiqueta copiada al leer). */
  etiquetaPregunta?: string | null;
  valorRespuesta: string;
}

export interface CrearReservaRequest {
  idViaje: number;
  acompanantes?: Acompanante[];
  respuestasFormulario?: Array<Pick<RespuestaFormulario, "idCampo" | "valorRespuesta">>;
  numeroReferenciaPago: string;
  /** Data-URI del comprobante comprimido en el cliente (sin endpoint de upload aún). */
  capturaComprobanteUrl: string;
}

export interface RechazarReservaRequest {
  motivoRechazo: string;
}

/** Detalle de una reserva (GET /reservas/{id} — ReservaDetalleDto). */
export interface ReservaDetalle {
  idReserva: number;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  idViaje: number;
  tituloViaje: string;
  idAdministradorRevisor: number | null;
  estado: EstadoReserva;
  /** Abono POR PERSONA del viaje; el total mostrado es montoReserva × personas. */
  montoReserva: number;
  fechaReserva: string;
  fechaLimitePago: string;
  fechaPago: string | null;
  numeroReferenciaPago: string | null;
  capturaComprobanteUrl: string | null;
  motivoRechazo: string | null;
  fechaRevision: string | null;
  editable: boolean;
  acompanantes: Acompanante[];
  respuestasFormulario: RespuestaFormulario[];
}

/** Fila de la bandeja admin (GET /reservas — ReservaAdminResumenDto). */
export interface ReservaAdminResumen {
  idReserva: number;
  idViaje: number;
  tituloViaje: string;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  estado: EstadoReserva;
  montoReserva: number;
  fechaReserva: string;
  fechaLimitePago: string;
  fechaPago: string | null;
  numeroReferenciaPago: string | null;
  fechaRevision: string | null;
  totalAcompanantes: number;
}

/** Item del historial del cliente (GET /usuarios/me/historial). */
export interface HistorialReservaResumen {
  idReserva: number;
  viaje: {
    idViaje: number;
    titulo: string;
    dificultad: string;
    fechaHoraIda: string;
  };
  estado: EstadoReserva;
  montoReserva: number;
  fechaReserva: string;
  fechaRevision: string | null;
}
