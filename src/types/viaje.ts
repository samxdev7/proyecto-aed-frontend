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
}

/** Ficha completa (GET /viajes/{id} — ViajeDetalleDto). */
export interface ViajeDetalle extends Viaje {
  idAdministradorCreador: number;
  /** Pasos del itinerario, una línea por elemento (usar splitLineas). */
  itinerario: string | null;
  /** Inclusiones adicionales a las base del club, una línea por elemento. */
  inclusionesAdicionales: string | null;
  enlaceWhatsApp: string | null;
  fechaCreacion: string;
  /** Equipo requerido, una línea por elemento (usar splitLineas). */
  equipo: string | null;
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
  /** Una línea por paso. */
  itinerario?: string;
  dificultad: Dificultad;
  fechaHoraIda: string;
  fechaHoraVuelta: string;
  puntoEncuentro: string;
  /** Una línea por elemento. */
  inclusionesAdicionales?: string;
  montoTotal: number;
  montoReserva: number;
  cuposMaximos: number;
  enlaceWhatsApp?: string;
  imagenUrl?: string;
  /** Una línea por elemento. */
  equipo?: string;
}
