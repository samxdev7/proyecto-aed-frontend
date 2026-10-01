import type { Rol, Sesion } from "@/types/auth";

/** Única clave de sesión del cliente. */
export const CLAVE_SESION = "cnm_auth";
/** Evento window disparado al iniciar/cerrar sesión (suscriptores: Header, guards). */
export const EVENTO_SESION = "cnm:sesion";

let cacheSesion: { cruda: string | null; valor: Sesion | null } = {
  cruda: undefined as unknown as string | null,
  valor: null,
};

export function obtenerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  try {
    const cruda = window.localStorage.getItem(CLAVE_SESION);
    if (cruda === cacheSesion.cruda) {
      return cacheSesion.valor;
    }
    cacheSesion = {
      cruda,
      valor: cruda ? (JSON.parse(cruda) as Sesion) : null,
    };
    return cacheSesion.valor;
  } catch {
    cacheSesion = { cruda: null, valor: null };
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  const cruda = JSON.stringify(sesion);
  cacheSesion = { cruda, valor: sesion };
  window.localStorage.setItem(CLAVE_SESION, cruda);
  window.dispatchEvent(new Event(EVENTO_SESION));
}

export function cerrarSesion(): void {
  cacheSesion = { cruda: null, valor: null };
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
