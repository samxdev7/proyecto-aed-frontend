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
};
