export type Dificultad = "Baja" | "Media" | "Alta";

/**
 * Tipos de campos personalizados soportados según el contrato de API REST y modelo ER (RF7).
 */
export type TipoCampoFormulario =
  | "texto"
  | "seleccion_unica"
  | "seleccion_multiple"
  | "fecha"
  | "archivo";

/** Pregunta personalizada de un viaje (formulario de inscripción). */
export interface CampoFormulario {
  idCampo: number;
  idViaje: number;
  etiquetaPregunta: string;
  tipoCampo: TipoCampoFormulario;
  obligatorio: boolean;
  orden: number;
  opciones?: string[];
}

export interface CrearCampoFormularioRequest {
  etiquetaPregunta: string;
  tipoCampo: TipoCampoFormulario;
  obligatorio: boolean;
  orden?: number;
  opciones?: string[];
}

export interface ActualizarCampoFormularioRequest {
  etiquetaPregunta?: string;
  tipoCampo?: TipoCampoFormulario;
  obligatorio?: boolean;
  orden?: number;
  opciones?: string[];
}

export type EstadoInscripcion = "pendiente" | "aprobada" | "rechazada";

export interface Viaje {
  idViaje: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  fechaHoraIda: string;
  puntoEncuentro: string;
  montoTotal: number;
  montoReserva: number;
  cuposMaximos: number;
  cuposDisponibles: number;
  imagen?: string;
  itinerario: string[];
  equipo: string[];
}