export type Dificultad = "Baja" | "Media" | "Alta";

export type TipoCampoFormulario = "texto" | "seleccion_unica";

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