export type Rol = "cliente" | "administrador";

/** POST /auth/login — LoginResponseDto (guardada en localStorage como "cnm_auth"). */
export interface Sesion {
  token: string;
  tipoToken: string;
  idUsuario: number;
  correo: string;
  nombreCompleto: string;
  rol: Rol;
  notificacionesHabilitadas: boolean;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

/** POST /auth/registro — RegistroUsuarioRequestDto. */
export interface RegistroRequest {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  sexo?: "M" | "F" | "Otro";
  nacionalidad: string;
  tipoIdentificacion: "cedula" | "pasaporte";
  numeroIdentificacion: string;
  notificacionesHabilitadas: boolean;
}
