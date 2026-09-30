import { UsuarioPerfil, ActualizarPerfilRequest, ActualizarNotificacionesRequest } from "@/types/usuario";
import { Reserva } from "@/types/reserva";
import { Notificacion } from "@/types/notificacion";
import { PageResponse } from "@/types/common";
import { reservaService, type ReservaDetalle } from "@/services/reserva.service";

export const userService = {
  async getMyProfile(): Promise<UsuarioPerfil> {
    return {
      idUsuario: 1, primerNombre: "Carlos", primerApellido: "González", nombreCompleto: "Carlos González", correo: "carlos@example.com", rol: "cliente", telefono: "+505 8888-9999", sexo: "M", nacionalidad: "Nicaragüense", tipoIdentificacion: "cedula", numeroIdentificacion: "001-150890-0001A", notificacionesHabilitadas: true, fechaRegistro: new Date().toISOString(),
    };
  },

  async actualizarPerfil(datos: ActualizarPerfilRequest): Promise<UsuarioPerfil> {
    return {
      idUsuario: 1, primerNombre: datos.primerNombre || "Carlos", primerApellido: datos.primerApellido || "González", nombreCompleto: "Carlos González", correo: "carlos@example.com", rol: "cliente", telefono: datos.telefono || "+505 8888-9999", sexo: datos.sexo || "M", nacionalidad: datos.nacionalidad || "Nicaragüense", tipoIdentificacion: datos.tipoIdentificacion || "cedula", numeroIdentificacion: datos.numeroIdentificacion || "001-150890-0001A", notificacionesHabilitadas: true, fechaRegistro: new Date().toISOString(),
    };
  },

  async actualizarNotificaciones(request: ActualizarNotificacionesRequest): Promise<UsuarioPerfil> {
    return {
      idUsuario: 1, primerNombre: "Carlos", primerApellido: "González", nombreCompleto: "Carlos González", correo: "carlos@example.com", rol: "cliente", telefono: "+505 8888-9999", sexo: "M", nacionalidad: "Nicaragüense", tipoIdentificacion: "cedula", numeroIdentificacion: "001-150890-0001A", notificacionesHabilitadas: request.notificacionesHabilitadas, fechaRegistro: new Date().toISOString(),
    };
  },

  async getMyHistorial(page = 0, size = 10): Promise<PageResponse<Reserva>> {
    const todas = await reservaService.listarMisReservas();
    return {
      content: todas.slice(page * size, page * size + size),
      page,
      size,
      totalElements: todas.length,
      totalPages: Math.max(1, Math.ceil(todas.length / size)),
    };
  },

  async getReservaDetalle(id: number): Promise<ReservaDetalle> {
    const reserva = await reservaService.obtenerReserva(id);
    if (!reserva) throw new Error("Reserva no encontrada");
    return reserva;
  },

  async getMyNotifications(page = 0, size = 10): Promise<PageResponse<Notificacion>> {
    return {
      content: [
        { idNotificacion: 1, idUsuario: 1, tipo: "nuevo_viaje", mensaje: "¡Nuevo viaje publicado!", fecha: new Date().toISOString(), leida: true },
      ],
      page, size, totalElements: 1, totalPages: 1,
    };
  },
};
