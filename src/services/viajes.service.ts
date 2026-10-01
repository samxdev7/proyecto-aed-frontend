import { ApiClient, ApiError } from "@/lib/api-client";
import type { PageResponse } from "@/types/common";
import type {
  CampoFormulario,
  CrearCampoRequest,
  EstadoViaje,
  Viaje,
  ViajeDetalle,
  ViajeRequest,
} from "@/types/viaje";

/** Divide los campos multilinea del backend (itinerario, equipo, inclusiones). */
export function splitLineas(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);
}

/** Opciones de un campo: el backend las devuelve como JSON string. */
export function opcionesDeCampo(campo: CampoFormulario): string[] {
  if (!campo.opcionesRespuesta) return [];
  try {
    const parseado = JSON.parse(campo.opcionesRespuesta) as unknown;
    return Array.isArray(parseado) ? (parseado as string[]) : [];
  } catch {
    return [];
  }
}

export const viajesService = {
  /** Catálogo público paginado (GET /viajes). */
  async listarViajes(
    filtros?: { dificultad?: string; estado?: EstadoViaje },
    page = 0,
    size = 50,
  ): Promise<PageResponse<Viaje>> {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (filtros?.dificultad) params.dificultad = filtros.dificultad;
    if (filtros?.estado) params.estado = filtros.estado;
    return ApiClient.get<PageResponse<Viaje>>("/viajes", params);
  },

  /** Ficha del viaje; null si no existe. */
  async obtenerViaje(idViaje: number): Promise<ViajeDetalle | null> {
    try {
      return await ApiClient.get<ViajeDetalle>(`/viajes/${idViaje}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  // ----- administración de viajes (requiere rol administrador) -----

  async crearViaje(request: ViajeRequest): Promise<ViajeDetalle> {
    return ApiClient.post<ViajeDetalle>("/viajes", request);
  },

  async actualizarViaje(idViaje: number, request: ViajeRequest): Promise<ViajeDetalle> {
    return ApiClient.put<ViajeDetalle>(`/viajes/${idViaje}`, request);
  },

  async cambiarEstado(idViaje: number, estado: EstadoViaje): Promise<ViajeDetalle> {
    return ApiClient.patch<ViajeDetalle>(`/viajes/${idViaje}/estado`, { estado });
  },

  async eliminarViaje(idViaje: number): Promise<void> {
    return ApiClient.delete(`/viajes/${idViaje}`);
  },

  // ----- formulario de inscripción (público leer, admin escribir) -----

  async listarCampos(idViaje: number): Promise<CampoFormulario[]> {
    return ApiClient.get<CampoFormulario[]>(`/viajes/${idViaje}/campos-formulario`);
  },

  async crearCampo(idViaje: number, request: CrearCampoRequest): Promise<CampoFormulario> {
    return ApiClient.post<CampoFormulario>(`/viajes/${idViaje}/campos-formulario`, request);
  },

  async actualizarCampo(
    idViaje: number,
    idCampo: number,
    request: CrearCampoRequest,
  ): Promise<CampoFormulario> {
    return ApiClient.put<CampoFormulario>(
      `/viajes/${idViaje}/campos-formulario/${idCampo}`,
      request,
    );
  },

  async eliminarCampo(idViaje: number, idCampo: number): Promise<void> {
    return ApiClient.delete(`/viajes/${idViaje}/campos-formulario/${idCampo}`);
  },
};
