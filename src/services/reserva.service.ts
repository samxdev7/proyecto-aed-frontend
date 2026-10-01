import { ApiClient, ApiError } from "@/lib/api-client";
import type { PageResponse } from "@/types/common";
import type {
  CrearReservaRequest,
  HistorialReservaResumen,
  ReservaDetalle,
} from "@/types/reserva";

/** Ventana de pago del backend (RF1): espejo client-side para el temporizador
    del flujo de inscripción. El servidor manda la fechaLimitePago definitiva. */
export const DURACION_RETENCION_MS = 30 * 60 * 1000;

/** Estado local del flujo antes del POST: solo para el temporizador UX. */
export interface BorradorReserva {
  idViaje: number;
  cupos: number;
  fechaCreacion: string;
  fechaLimitePago: string;
}

export const reservaService = {
  crearBorrador(idViaje: number, cupos: number): BorradorReserva {
    const ahora = Date.now();
    return {
      idViaje,
      cupos,
      fechaCreacion: new Date(ahora).toISOString(),
      fechaLimitePago: new Date(ahora + DURACION_RETENCION_MS).toISOString(),
    };
  },

  /** POST /reservas: datos, acompañantes, respuestas y comprobante en un envío. */
  async crearReserva(input: CrearReservaRequest): Promise<ReservaDetalle> {
    return ApiClient.post<ReservaDetalle>("/reservas", input);
  },

  /** GET /reservas/{id}: dueño o admin (el backend valida la propiedad). */
  async obtenerReserva(idReserva: number): Promise<ReservaDetalle | null> {
    try {
      return await ApiClient.get<ReservaDetalle>(`/reservas/${idReserva}`);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
        return null;
      }
      throw error;
    }
  },

  /** Historial del usuario autenticado (GET /usuarios/me/historial). */
  async listarMisReservas(page = 0, size = 10): Promise<PageResponse<HistorialReservaResumen>> {
    return ApiClient.get<PageResponse<HistorialReservaResumen>>("/usuarios/me/historial", {
      page: String(page),
      size: String(size),
    });
  },
};
