import type { Rol, Sesion } from "@/types/auth";

/** Única clave de sesión del cliente. */
export const CLAVE_SESION = "cnm_auth";
/** Evento window disparado al iniciar/cerrar sesión (suscriptores: Header, guards). */
export const EVENTO_SESION = "cnm:sesion";

export function obtenerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  try {
    const cruda = window.localStorage.getItem(CLAVE_SESION);
    return cruda ? (JSON.parse(cruda) as Sesion) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  window.dispatchEvent(new Event(EVENTO_SESION));
}

export function cerrarSesion(): void {
  window.localStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO_SESION));
}

/** Token para el header Authorization; null si no hay sesión. */
export function obtenerToken(): string | null {
  return obtenerSesion()?.token ?? null;
}

export function esAdministrador(sesion: Sesion | null): sesion is Sesion & { rol: Rol } {
  return sesion !== null && sesion.rol === "administrador";
}
