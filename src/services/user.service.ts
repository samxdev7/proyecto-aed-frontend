import { UsuarioPerfil, ActualizarPerfilRequest, ActualizarNotificacionesRequest } from "@/types/usuario";
import { Reserva } from "@/types/reserva";
import { Notificacion } from "@/types/notificacion";
import { PageResponse } from "@/types/common";
import { reservaService, type ReservaDetalle } from "@/services/reserva.service";
import {
  obtenerNotificacionesDemo,
  marcarNotificacionLeida as marcarLeidaDemo,
  marcarTodasNotificacionesLeidas as marcarTodasLeidasDemo,
} from "@/lib/demo";

function obtenerUsuarioActual(): UsuarioPerfil {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cnm_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) return parsed.user;
      }
    } catch {}
  }
  return {
    idUsuario: 1,
    primerNombre: "Carlos",
    primerApellido: "González",
    nombreCompleto: "Carlos González",
    correo: "carlos@example.com",
    rol: "cliente",
    telefono: "+505 8888-9999",
    sexo: "M",
    nacionalidad: "Nicaragüense",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "001-150890-0001A",
    notificacionesHabilitadas: true,
    fechaRegistro: "2026-05-10T10:00:00Z",
  };
}

function persistirUsuario(usuario: UsuarioPerfil) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("cnm_auth_user");
    const token = stored ? JSON.parse(stored).token : "cnm-demo-token";
    localStorage.setItem("cnm_auth_user", JSON.stringify({ user: usuario, token }));
    document.cookie = `cnm_user=${encodeURIComponent(JSON.stringify(usuario))}; path=/; SameSite=Lax`;

    const usersRaw = localStorage.getItem("cnm_registered_users");
    if (usersRaw) {
      const usersList: Array<{ usuario: UsuarioPerfil; passwordHash: string }> = JSON.parse(usersRaw);
      const index = usersList.findIndex((u) => u.usuario.idUsuario === usuario.idUsuario);
      if (index !== -1) {
        usersList[index].usuario = usuario;
        localStorage.setItem("cnm_registered_users", JSON.stringify(usersList));
      }
    }
  } catch (e) {
    console.error("Error guardando usuario:", e);
  }
}

export const userService = {
  async getMyProfile(): Promise<UsuarioPerfil> {
    return obtenerUsuarioActual();
  },

  async actualizarPerfil(datos: ActualizarPerfilRequest): Promise<UsuarioPerfil> {
    const actual = obtenerUsuarioActual();
    const primerNombre = datos.primerNombre !== undefined ? datos.primerNombre.trim() : actual.primerNombre;
    const segundoNombre = datos.segundoNombre !== undefined ? datos.segundoNombre.trim() : actual.segundoNombre;
    const primerApellido = datos.primerApellido !== undefined ? datos.primerApellido.trim() : actual.primerApellido;
    const segundoApellido = datos.segundoApellido !== undefined ? datos.segundoApellido.trim() : actual.segundoApellido;

    const nombreCompleto = [primerNombre, segundoNombre, primerApellido, segundoApellido]
      .filter(Boolean)
      .join(" ");

    const actualizado: UsuarioPerfil = {
      ...actual,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      nombreCompleto,
      telefono: datos.telefono !== undefined ? datos.telefono.trim() : actual.telefono,
      sexo: datos.sexo !== undefined ? datos.sexo : actual.sexo,
      nacionalidad: datos.nacionalidad !== undefined ? datos.nacionalidad.trim() : actual.nacionalidad,
      tipoIdentificacion: datos.tipoIdentificacion !== undefined ? datos.tipoIdentificacion : actual.tipoIdentificacion,
      numeroIdentificacion: datos.numeroIdentificacion !== undefined ? datos.numeroIdentificacion.trim() : actual.numeroIdentificacion,
    };

    persistirUsuario(actualizado);
    return actualizado;
  },

  async actualizarNotificaciones(request: ActualizarNotificacionesRequest): Promise<UsuarioPerfil> {
    const actual = obtenerUsuarioActual();
    const actualizado: UsuarioPerfil = {
      ...actual,
      notificacionesHabilitadas: request.notificacionesHabilitadas,
    };
    persistirUsuario(actualizado);
    return actualizado;
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

  async getMyNotifications(page = 0, size = 20): Promise<PageResponse<Notificacion>> {
    const demoList = obtenerNotificacionesDemo();
    const content: Notificacion[] = demoList.map((n) => ({
      idNotificacion: n.id,
      idUsuario: 1,
      tipo: n.tipo,
      mensaje: `${n.titulo}: ${n.cuerpo}`,
      fecha: new Date().toISOString(),
      leida: n.leida,
    }));

    return {
      content: content.slice(page * size, page * size + size),
      page,
      size,
      totalElements: content.length,
      totalPages: Math.max(1, Math.ceil(content.length / size)),
    };
  },

  async marcarNotificacionLeida(id: number): Promise<void> {
    marcarLeidaDemo(id);
  },

  async marcarTodasNotificacionesLeidas(): Promise<void> {
    marcarTodasLeidasDemo();
  },
};
