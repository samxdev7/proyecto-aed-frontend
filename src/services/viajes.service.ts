import { adminService } from "./admin.service";
import type { Viaje } from "@/types/viaje";

/** Resumen para el catálogo público: por ahora el viaje completo (mock). */
export type ViajeResumen = Viaje;

/**
 * Detalle de viaje para el showcase público.
 * Extiende el tipo base con campos que el backend aún no expone.
 */
export interface ViajeDetalle extends Viaje {
  /** Retorno del viaje; si falta, salida y regreso son la misma jornada. */
  fechaHoraVuelta?: string;
  /** Rubros incluidos en el precio. */
  inclusiones: string[];
}

/** Inclusiones mock aplicables a cualquier expedición. */
const INCLUSIONES_BASE: string[] = [
  "Transporte ida y vuelta desde el punto de encuentro",
  "Guías del club durante toda la ruta",
  "Charla de seguridad y equipo comunitario",
  "Coordinación del grupo de WhatsApp del viaje",
];

/** Pernoctas: el tipo base solo trae fechaHoraIda; mock del regreso. */
const FECHAS_VUELTA: Record<number, string> = {
  5: "2026-11-13T09:00:00", // Telica: descenso al amanecer
  9: "2027-01-16T13:00:00", // Acatenango (foráneo): retorno al día siguiente
};

function conDetalle(viaje: Viaje): ViajeDetalle {
  return {
    ...viaje,
    fechaHoraVuelta: viaje.fechaHoraVuelta || FECHAS_VUELTA[viaje.idViaje],
    inclusiones:
      viaje.inclusiones && viaje.inclusiones.length > 0
        ? viaje.inclusiones
        : INCLUSIONES_BASE,
  };
}

export const viajesService = {
  /** Catálogo público de expediciones (mock, sin backend). */
  async listarViajes(): Promise<ViajeResumen[]> {
    const res = await adminService.getViajesAdmin(0, 100);
    return res.content.filter((item) => item.estado !== "cerrado");
  },

  /** Detalle de una expedición; null si no existe. */
  async obtenerViaje(idViaje: number): Promise<ViajeDetalle | null> {
    try {
      const viaje = await adminService.getViajeById(idViaje);
      return conDetalle(viaje);
    } catch {
      return null;
    }
  },
};
