import type { Rol, Sesion } from "@/types/auth";
import type { UsuarioPerfil } from "@/types/usuario";

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

/** Actualiza propiedades locales de la sesión (nombreCompleto, notificaciones) y notifica a los oyentes. */
export function actualizarDatosSesion(
  parcial: Partial<Pick<Sesion, "nombreCompleto" | "notificacionesHabilitadas">>,
): void {
  const actual = obtenerSesion();
  if (!actual) return;
  guardarSesion({ ...actual, ...parcial });
}

/** Token para el header Authorization; null si no hay sesión. */
export function obtenerToken(): string | null {
  return obtenerSesion()?.token ?? null;
}

export function esAdministrador(sesion: Sesion | null): sesion is Sesion & { rol: Rol } {
  return sesion !== null && sesion.rol === "administrador";
}

/** Determina si el perfil cuenta con los datos indispensables para reservar viajes. */
export function perfilEstaCompleto(p: UsuarioPerfil | null | undefined): boolean {
  if (!p) return false;
  return (
    !!p.primerNombre?.trim() &&
    !!p.primerApellido?.trim() &&
    !!p.numeroIdentificacion?.trim() &&
    !!p.nacionalidad?.trim()
  );
}

/**
 * Marca el estado del perfil (completo o no) por usuario. Permite a la
 * inscripción saberlo al instante, sin esperar a cargar el perfil.
 */
const CLAVE_PERFIL = "cnm:perfil-completo";

export function marcarPerfilCompleto(idUsuario: number, completo: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${CLAVE_PERFIL}:${idUsuario}`, completo ? "1" : "0");
  } catch {
    /* sin localStorage */
  }
}

/** null = aún no verificado; true/false = última verificación. */
export function leerPerfilCompleto(idUsuario: number): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const valor = window.localStorage.getItem(`${CLAVE_PERFIL}:${idUsuario}`);
    return valor === null ? null : valor === "1";
  } catch {
    return null;
  }
}

