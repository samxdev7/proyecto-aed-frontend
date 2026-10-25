export type Dificultad = "Baja" | "Media" | "Alta" | "Extrema";

export type EstadoViaje = "activo" | "cerrado";

export type TipoCampoFormulario =
  | "texto"
  | "seleccion_unica"
  | "seleccion_multiple"
  | "fecha"
  | "archivo";

/** Viaje del catálogo público (GET /viajes — ViajeResumenDto). */
export interface Viaje {
  idViaje: number;
  titulo: string;
  descripcion: string | null;
  dificultad: Dificultad;
  fechaHoraIda: string;
  fechaHoraVuelta: string;
  puntoEncuentro: string;
  montoTotal: number;
  montoReserva: number;
  cuposMaximos: number;
  cuposDisponibles: number;
  estado: EstadoViaje;
  /** Ruta local o URL de la imagen; null si el viaje aún no tiene foto. */
  imagenUrl: string | null;
  /** Indica si el viaje fue archivado (borrado lógico). */
  archivado?: boolean;
}

/** Ficha completa (GET /viajes/{id} — ViajeDetalleDto). */
export interface ViajeDetalle extends Viaje {
  idAdministradorCreador: number;
  enlaceWhatsApp: string | null;
  fechaCreacion: string;
}

/** Pregunta personalizada del formulario de inscripción de un viaje. */
export interface CampoFormulario {
  idCampo: number;
  idViaje: number;
  etiquetaPregunta: string;
  tipoCampo: TipoCampoFormulario;
  /** JSON string con el arreglo de opciones, p.ej. '["Sí","No"]' (usar opcionesDeCampo). */
  opcionesRespuesta: string | null;
  orden: number;
  obligatorio: boolean;
}

export interface CrearCampoRequest {
  tipoCampo: TipoCampoFormulario;
  etiquetaPregunta: string;
  opcionesRespuesta?: string;
  orden: number;
  obligatorio: boolean;
}

export interface ViajeRequest {
  titulo: string;
  descripcion?: string;
  dificultad: Dificultad;
  fechaHoraIda: string;
  fechaHoraVuelta: string;
  puntoEncuentro: string;
  montoTotal: number;
  montoReserva: number;
  cuposMaximos: number;
  enlaceWhatsApp?: string;
  imagenUrl?: string;
}
