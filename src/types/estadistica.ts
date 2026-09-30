import type { Dificultad } from "@/types/viaje";

export interface InscritosPorViaje {
  idViaje: number;
  tituloViaje: string;
  inscritos: number;
  cuposMaximos: number;
  porcentajeOcupacion: number;
}

export interface RutaPopular {
  idViaje: number;
  tituloViaje: string;
  dificultad: Dificultad;
  totalInscritos: number;
}

export interface ResumenCupos {
  totalCupos: number;
  reservados: number;
  disponibles: number;
}

export interface EstadisticasPanel {
  inscritosPorViaje: InscritosPorViaje[];
  rutasPopulares: RutaPopular[];
  resumenCupos: ResumenCupos;
}
