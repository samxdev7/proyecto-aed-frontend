export interface UsuarioPerfil {
  idUsuario: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreCompleto: string;
  correo: string;
  rol: "cliente" | "administrador";
  telefono?: string | null;
  sexo?: string | null;
  nacionalidad?: string | null;
  tipoIdentificacion?: string | null;
  numeroIdentificacion?: string | null;
  notificacionesHabilitadas: boolean;
  fechaRegistro: string;
}

export interface ActualizarPerfilRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefono?: string;
  sexo?: string;
  nacionalidad?: string;
  tipoIdentificacion?: string;
  numeroIdentificacion?: string;
}

export interface ActualizarNotificacionesRequest {
  notificacionesHabilitadas: boolean;
}
