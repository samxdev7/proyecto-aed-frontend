import { UsuarioPerfil } from "./usuario";

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioPerfil;
}

export interface RegistroRequest {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  password: string;
  telefono: string;
  sexo: string;
  nacionalidad: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}
