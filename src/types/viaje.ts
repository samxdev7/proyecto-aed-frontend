export type Dificultad = "Baja" | "Media" | "Alta";

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