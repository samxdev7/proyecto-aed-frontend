import { ApiClient } from "@/lib/api-client";
import type { EstadisticasPanel } from "@/types/estadistica";
import type { PageResponse } from "@/types/common";
import type { EstadoReserva, RechazarReservaRequest, ReservaAdminResumen, ReservaDetalle } from "@/types/reserva";
import type { HistorialReservaResumen } from "@/types/reserva";
import type { UsuarioPerfil } from "@/types/usuario";

export const adminService = {
  /** GET /estadisticas/panel — agregados para el dashboard. */
  async getDashboardStats(): Promise<EstadisticasPanel> {
    return ApiClient.get<EstadisticasPanel>("/estadisticas/panel");
  },

  /** GET /usuarios — todos los usuarios paginados. */
  async listarUsuarios(page = 0, size = 10): Promise<PageResponse<UsuarioPerfil>> {
    return ApiClient.get<PageResponse<UsuarioPerfil>>("/usuarios", {
      page: String(page),
      size: String(size),
    });
  },

  /** Bandeja de reservas; el detalle (comprobante) se obtiene con obtenerReserva. */
  async listarReservas(
    filtros?: { estado?: EstadoReserva; idViaje?: number },
    page = 0,
    size = 20,
  ): Promise<PageResponse<ReservaAdminResumen>> {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (filtros?.estado) params.estado = filtros.estado;
    if (filtros?.idViaje !== undefined) params.idViaje = String(filtros.idViaje);
    return ApiClient.get<PageResponse<ReservaAdminResumen>>("/reservas", params);
  },

  /** Detalle con comprobante para el modal de la bandeja. */
  async obtenerReserva(idReserva: number): Promise<ReservaDetalle> {
    return ApiClient.get<ReservaDetalle>(`/reservas/${idReserva}`);
  },

  async aprobarReserva(idReserva: number): Promise<ReservaDetalle> {
    return ApiClient.patch<ReservaDetalle>(`/reservas/${idReserva}/aprobar`);
  },

  async rechazarReserva(
    idReserva: number,
    request: RechazarReservaRequest,
  ): Promise<ReservaDetalle> {
    return ApiClient.patch<ReservaDetalle>(`/reservas/${idReserva}/rechazar`, request);
  },

  /** Historial de reservas de un usuario (GET /usuarios/{id}/historial). */
  async historialUsuario(
    idUsuario: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<HistorialReservaResumen>> {
    return ApiClient.get<PageResponse<HistorialReservaResumen>>(
      `/usuarios/${idUsuario}/historial`,
      { page: String(page), size: String(size) },
    );
  },
};
