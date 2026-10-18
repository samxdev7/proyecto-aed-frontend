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

const KEY_MODIFICACIONES = "cnm_viajes_modificaciones_ts";

/** Registra una modificación reciente del viaje en el cliente para mantenerlo al tope de la lista. */
export function registrarModificacionViaje(idViaje: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY_MODIFICACIONES);
    const mapa: Record<number, number> = raw ? JSON.parse(raw) : {};
    mapa[idViaje] = Date.now();
    localStorage.setItem(KEY_MODIFICACIONES, JSON.stringify(mapa));
  } catch {
    /* Manejo silencioso en caso de storage no disponible */
  }
}

/** Remueve el registro de modificación de un viaje eliminado. */
export function removerModificacionViaje(idViaje: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY_MODIFICACIONES);
    if (!raw) return;
    const mapa: Record<number, number> = JSON.parse(raw);
    delete mapa[idViaje];
    localStorage.setItem(KEY_MODIFICACIONES, JSON.stringify(mapa));
  } catch {
    /* Manejo silencioso */
  }
}

/** Obtiene el mapa de modificaciones recientes. */
export function obtenerModificacionesViajes(): Record<number, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY_MODIFICACIONES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Ordena la lista de viajes colocando primero aquellos creados o modificados más recientemente
 * (invierte el orden ascendente original por defecto del backend).
 */
export function ordenarViajesRecientesPrimero<T extends Viaje>(viajes: T[]): T[] {
  const modificaciones = obtenerModificacionesViajes();
  return [...viajes].sort((a, b) => {
    // 1. Modificaciones recientes registradas en el cliente
    const modA = modificaciones[a.idViaje] || 0;
    const modB = modificaciones[b.idViaje] || 0;
    if (modA !== modB) {
      return modB - modA;
    }

    // 2. Fecha de modificación o actualización si la provee el backend
    const anyA = a as unknown as Record<string, unknown>;
    const anyB = b as unknown as Record<string, unknown>;
    const fechaModA = (anyA.fechaModificacion || anyA.updatedAt || anyA.fechaActualizacion) as string | undefined;
    const fechaModB = (anyB.fechaModificacion || anyB.updatedAt || anyB.fechaActualizacion) as string | undefined;
    if (fechaModA && fechaModB) {
      const diffMod = new Date(fechaModB).getTime() - new Date(fechaModA).getTime();
      if (diffMod !== 0) return diffMod;
    }

    // 3. Fecha de creación si la provee el backend
    const fechaCreacionA = (anyA.fechaCreacion || anyA.createdAt) as string | undefined;
    const fechaCreacionB = (anyB.fechaCreacion || anyB.createdAt) as string | undefined;
    if (fechaCreacionA && fechaCreacionB) {
      const diffCreacion = new Date(fechaCreacionB).getTime() - new Date(fechaCreacionA).getTime();
      if (diffCreacion !== 0) return diffCreacion;
    }

    // 4. Por defecto, orden inverso por idViaje (los IDs mayores son los más nuevos)
    return b.idViaje - a.idViaje;
  });
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
    const respuesta = await ApiClient.get<PageResponse<Viaje>>("/viajes", params);
    return {
      ...respuesta,
      content: ordenarViajesRecientesPrimero(respuesta.content),
    };
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
    const res = await ApiClient.post<ViajeDetalle>("/viajes", request);
    if (res?.idViaje) registrarModificacionViaje(res.idViaje);
    return res;
  },

  async actualizarViaje(idViaje: number, request: ViajeRequest): Promise<ViajeDetalle> {
    const res = await ApiClient.put<ViajeDetalle>(`/viajes/${idViaje}`, request);
    registrarModificacionViaje(idViaje);
    return res;
  },

  async cambiarEstado(idViaje: number, estado: EstadoViaje): Promise<ViajeDetalle> {
    const res = await ApiClient.patch<ViajeDetalle>(`/viajes/${idViaje}/estado`, { estado });
    registrarModificacionViaje(idViaje);
    return res;
  },

  /** Obtiene la lista completa de viajes que no han sido archivados (GET /viajes/no-archivados). */
  async listarViajesNoArchivados(): Promise<Viaje[]> {
    const respuesta = await ApiClient.get<Viaje[]>("/viajes/no-archivados");
    return ordenarViajesRecientesPrimero(respuesta);
  },

  /** Obtiene la lista completa de viajes archivados (GET /viajes/archivados). */
  async listarViajesArchivados(): Promise<Viaje[]> {
    const respuesta = await ApiClient.get<Viaje[]>("/viajes/archivados");
    return ordenarViajesRecientesPrimero(respuesta);
  },

  /** Archiva un viaje en estado cerrado (PATCH /viajes/{idViaje}/archivar). */
  async archivarViaje(idViaje: number): Promise<ViajeDetalle> {
    const res = await ApiClient.patch<ViajeDetalle>(`/viajes/${idViaje}/archivar`, {});
    registrarModificacionViaje(idViaje);
    return res;
  },

  /** Desarchiva un viaje previamente archivado (PATCH /viajes/{idViaje}/desarchivar). */
  async desarchivarViaje(idViaje: number): Promise<ViajeDetalle> {
    const res = await ApiClient.patch<ViajeDetalle>(`/viajes/${idViaje}/desarchivar`, {});
    registrarModificacionViaje(idViaje);
    return res;
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
