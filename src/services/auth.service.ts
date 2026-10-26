import { ApiClient } from "@/lib/api-client";
import type { Sesion, LoginRequest, RegistroRequest } from "@/types/auth";
import type { UsuarioPerfil } from "@/types/usuario";

export const authService = {
  /** Inicia sesión; devuelve el JWT + datos del usuario. */
  async login(request: LoginRequest): Promise<Sesion> {
    return ApiClient.post<Sesion>("/auth/login", request);
  },

  /** Crea la cuenta (201, UsuarioPerfil); NO inicia sesión: llamar login después. */
  async registro(request: RegistroRequest): Promise<UsuarioPerfil> {
    return ApiClient.post<UsuarioPerfil>("/auth/registro", request);
  },

  /** Inicia sesión o registra mediante cuenta de Google (POST /auth/google). */
  async loginGoogle(idToken: string): Promise<Sesion> {
    return ApiClient.post<Sesion>("/auth/google", { idToken });
  },

  /** Solicita el enlace de recuperación de contraseña por correo electrónico. */
  async solicitarRecuperacion(correo: string): Promise<{ mensaje: string }> {
    return ApiClient.post<{ mensaje: string }>("/auth/recuperar-contrasena", {
      correo,
    });
  },

  /** Restablece la contraseña utilizando el token temporal recibido por correo. */
  async restablecerContrasena(
    token: string,
    nuevaContrasena: string,
  ): Promise<{ mensaje: string }> {
    return ApiClient.post<{ mensaje: string }>("/auth/restablecer-contrasena", {
      token,
      nuevaContrasena,
    });
  },
};
