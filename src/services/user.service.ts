import { ApiClient } from "@/lib/api-client";
import type { PageResponse } from "@/types/common";
import type { Notificacion } from "@/types/notificacion";
import type {
  ActualizarNotificacionesRequest,
  ActualizarPerfilRequest,
  UsuarioPerfil,
} from "@/types/usuario";

export const userService = {
  async getMyProfile(): Promise<UsuarioPerfil> {
    return ApiClient.get<UsuarioPerfil>("/usuarios/me");
  },

  async actualizarPerfil(datos: ActualizarPerfilRequest): Promise<UsuarioPerfil> {
    return ApiClient.patch<UsuarioPerfil>("/usuarios/me", datos);
  },

  async actualizarNotificaciones(
    request: ActualizarNotificacionesRequest,
  ): Promise<UsuarioPerfil> {
    return ApiClient.patch<UsuarioPerfil>("/usuarios/me/notificaciones", request);
  },

  async getMyNotifications(page = 0, size = 20): Promise<PageResponse<Notificacion>> {
    return ApiClient.get<PageResponse<Notificacion>>("/notificaciones/me", {
      page: String(page),
      size: String(size),
    });
  },

  async marcarNotificacionLeida(idNotificacion: number): Promise<Notificacion> {
    return ApiClient.patch<Notificacion>(`/notificaciones/${idNotificacion}/leida`);
  },

  /** Marca todas como leídas en paralelo (no hay endpoint masivo). */
  async marcarTodasLeidas(notificaciones: Notificacion[]): Promise<void> {
    const pendientes = notificaciones.filter((n) => !n.leida);
    await Promise.all(
      pendientes.map((n) => ApiClient.patch<Notificacion>(`/notificaciones/${n.idNotificacion}/leida`)),
    );
  },
};
