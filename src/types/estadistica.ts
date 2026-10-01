import type { Dificultad } from "@/types/viaje";

/** GET /estadisticas/panel — EstadisticasPanelResponseDto. */
export interface InscritosPorViaje {
  idViaje: number;
  titulo: string;
  totalInscritos: number;
  cuposMaximos: number;
  porcentajeOcupacion: number;
}

export interface RutaPopular {
  idViaje: number;
  titulo: string;
  dificultad: Dificultad;
  totalReservasAprobadas: number;
}

export interface ResumenCupos {
  totalCuposOfrecidos: number;
  totalCuposReservados: number;
  totalCuposDisponibles: number;
}

export interface EstadisticasPanel {
  inscritosPorViaje: InscritosPorViaje[];
  rutasMasPopulares: RutaPopular[];
  cuposReservados: ResumenCupos;
}
