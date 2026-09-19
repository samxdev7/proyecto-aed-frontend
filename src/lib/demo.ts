import { viajes } from "@/data/viajes";
import { formatoFechaCorta } from "@/lib/format";
import type { EstadoInscripcion } from "@/types/viaje";

export type RolDemo = "anon" | "client";

export const EVENTO_SESION_DEMO = "cnm:sesion-demo";
export const EVENTO_NOTIFICACIONES = "cnm:notificaciones";

const CLAVE_ROL = "cnm_demo_rol";
const CLAVE_NOTIFICACIONES_LEIDAS = "cnm_demo_notificaciones_leidas";
const CLAVE_NOTIFICACIONES_ACTIVAS = "cnm_demo_notificaciones_activas";

export const etiquetasEstado: Record<EstadoInscripcion, string> = {
  pendiente: "Inscripción en Validación",
  aprobada: "Cupo Confirmado",
  rechazada: "Inscripción Rechazada",
};

export const textosBotonEstado: Record<EstadoInscripcion, string> = {
  pendiente: "Ver estado",
  aprobada: "Ver reserva",
  rechazada: "No disponible",
};

export const estadoInscripcionesDemo: Record<number, EstadoInscripcion> = {
  1: "pendiente",
  2: "aprobada",
  4: "pendiente",
  7: "rechazada",
};

export const idViajesNuevosDemo: ReadonlySet<number> = new Set([9, 10]);

export interface NotificacionDemo {
  id: number;
  tipo:
    | "aprobada"
    | "revision"
    | "solicitud"
    | "pocos-cupos"
    | "nuevo"
    | "recordatorio"
    | "rechazada";
  titulo: string;
  cuerpo: string;
  idViaje: number;
  leida: boolean;
}

function tituloDelViaje(idViaje: number): string {
  return viajes.find((viaje) => viaje.idViaje === idViaje)?.titulo ?? "el viaje";
}

function cuposDelViaje(idViaje: number): number {
  return viajes.find((viaje) => viaje.idViaje === idViaje)?.cuposDisponibles ?? 0;
}

function fechaDelViaje(idViaje: number): string {
  const viaje = viajes.find((viaje) => viaje.idViaje === idViaje);
  return viaje ? formatoFechaCorta(viaje.fechaHoraIda) : "";
}

const NOTIFICACIONES_BASE: Array<Omit<NotificacionDemo, "leida">> = [
  {
    id: 1,
    tipo: "aprobada",
    titulo: "¡Cupo confirmado!",
    cuerpo: `Tu inscripción al ${tituloDelViaje(2)} fue aprobada. Revisa el correo con el enlace del grupo de WhatsApp del viaje.`,
    idViaje: 2,
  },
  {
    id: 2,
    tipo: "revision",
    titulo: "Comprobante en revisión",
    cuerpo: `Estamos auditando tu transferencia para el ${tituloDelViaje(1)}.`,
    idViaje: 1,
  },
  {
    id: 3,
    tipo: "solicitud",
    titulo: "Solicitud recibida",
    cuerpo: `Recibimos tu solicitud para el ${tituloDelViaje(4)}. Queda en revisión a la espera de la verificación de tu comprobante de pago.`,
    idViaje: 4,
  },
  {
    id: 4,
    tipo: "pocos-cupos",
    titulo: "Quedan pocos cupos",
    cuerpo: `Alerta para el ${tituloDelViaje(3)}: solo quedan ${cuposDelViaje(3)} cupos para reservar.`,
    idViaje: 3,
  },
  {
    id: 5,
    tipo: "pocos-cupos",
    titulo: "Quedan pocos cupos",
    cuerpo: `Alerta para el ${tituloDelViaje(6)}: solo quedan ${cuposDelViaje(6)} cupos para reservar.`,
    idViaje: 6,
  },
  {
    id: 6,
    tipo: "nuevo",
    titulo: "Nueva expedición",
    cuerpo: `El ${tituloDelViaje(9)} abrió inscripciones. Conoce la ruta y aparta tu cupo.`,
    idViaje: 9,
  },
  {
    id: 7,
    tipo: "nuevo",
    titulo: "Nueva expedición",
    cuerpo: `El ${tituloDelViaje(10)} abrió inscripciones. Conoce la ruta y aparta tu cupo.`,
    idViaje: 10,
  },
  {
    id: 8,
    tipo: "recordatorio",
    titulo: "Recordatorio de salida",
    cuerpo: `Se acerca la salida del ${tituloDelViaje(2)} (${fechaDelViaje(2)}). Revisa el punto de encuentro y tu equipo recomendado.`,
    idViaje: 2,
  },
  {
    id: 9,
    tipo: "rechazada",
    titulo: "Inscripción rechazada",
    cuerpo: `Lamentablemente tu inscripción al ${tituloDelViaje(7)} fue rechazada. Puedes elegir otro viaje disponible.`,
    idViaje: 7,
  },
];

export function obtenerRolDemo(): RolDemo {
  if (typeof window === "undefined") return "anon";
  return localStorage.getItem(CLAVE_ROL) === "client" ? "client" : "anon";
}

export function establecerRolDemo(rol: RolDemo): void {
  if (typeof window === "undefined") return;
  if (rol === "client") {
    localStorage.setItem(CLAVE_ROL, rol);
  } else {
    localStorage.removeItem(CLAVE_ROL);
  }
  window.dispatchEvent(new Event(EVENTO_SESION_DEMO));
}

export function limpiarRolDemo(): void {
  establecerRolDemo("anon");
}

function leerNotificacionesLeidas(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = localStorage.getItem(CLAVE_NOTIFICACIONES_LEIDAS);
    return crudo ? (JSON.parse(crudo) as number[]) : [];
  } catch {
    return [];
  }
}

function guardarNotificacionesLeidas(ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE_NOTIFICACIONES_LEIDAS, JSON.stringify(ids));
}

export function obtenerNotificacionesDemo(): NotificacionDemo[] {
  const leidas = new Set(leerNotificacionesLeidas());
  return NOTIFICACIONES_BASE.map((notificacion) => ({
    ...notificacion,
    leida: leidas.has(notificacion.id),
  }));
}

export function cantidadNotificacionesSinLeer(): number {
  return obtenerNotificacionesDemo().filter((notificacion) => !notificacion.leida)
    .length;
}

export function marcarNotificacionLeida(id: number): void {
  guardarNotificacionesLeidas([...new Set([...leerNotificacionesLeidas(), id])]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES));
  }
}

export function marcarTodasNotificacionesLeidas(): void {
  guardarNotificacionesLeidas(NOTIFICACIONES_BASE.map((notificacion) => notificacion.id));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES));
  }
}

export function notificacionesActivas(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CLAVE_NOTIFICACIONES_ACTIVAS) !== "off";
}

export function cambiarNotificacionesActivas(activas: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE_NOTIFICACIONES_ACTIVAS, activas ? "on" : "off");
}