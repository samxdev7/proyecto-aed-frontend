export type EstadoInscripcionViaje = "disponible" | "expirado" | "cerrado";

export interface EstadoViajeCalculado {
  estadoInscripcion: EstadoInscripcionViaje;
  esExpirado: boolean;
  esCerrado: boolean;
  puedeReservar: boolean;
  mensajeBadge: string;
  mensajeDetalle: string;
  fechaLimiteInscripcion: Date;
}

export const DIAS_EXPIRACION_PREVIA = 7;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Evalúa el ciclo de vida de inscripciones de un viaje:
 * 1. Cada viaje expira en inscripciones exactamente 1 semana (7 días) antes de su fecha asignada de salida.
 * 2. Durante la semana previa a la salida, permanece visible indicando que el viaje expiró y bloqueando reservas.
 * 3. Se cierra automáticamente cuando la fecha actual coincide o sobrepasa el día/hora de salida (o si el admin lo cerró manualmente).
 */
export function calcularEstadoViaje(
  fechaHoraIdaIso: string,
  estadoBase: "activo" | "cerrado" = "activo",
  fechaReferencia: Date = new Date()
): EstadoViajeCalculado {
  const fechaSalida = new Date(fechaHoraIdaIso);
  const limiteInscripcionMs = fechaSalida.getTime() - DIAS_EXPIRACION_PREVIA * MS_POR_DIA;
  const fechaLimiteInscripcion = new Date(limiteInscripcionMs);
  const refTime = fechaReferencia.getTime();

  // Caso 1: Cerrado manualmente o la fecha actual alcanzó o superó el día/hora de salida
  if (estadoBase === "cerrado" || refTime >= fechaSalida.getTime()) {
    return {
      estadoInscripcion: "cerrado",
      esExpirado: false,
      esCerrado: true,
      puedeReservar: false,
      mensajeBadge: "Cerrado",
      mensajeDetalle: "Esta expedición ya ha iniciado o finalizado. El viaje está cerrado.",
      fechaLimiteInscripcion,
    };
  }

  // Caso 2: Expiró en inscripciones (semana previa a la salida: fechaSalida - 7 días <= refTime < fechaSalida)
  if (refTime >= limiteInscripcionMs) {
    return {
      estadoInscripcion: "expirado",
      esExpirado: true,
      esCerrado: false,
      puedeReservar: false,
      mensajeBadge: "Inscripciones expiradas",
      mensajeDetalle:
        "Las inscripciones para este viaje han expirado. Las reservaciones cierran automáticamente 1 semana antes de la salida.",
      fechaLimiteInscripcion,
    };
  }

  // Caso 3: Disponible para inscripciones regulares
  return {
    estadoInscripcion: "disponible",
    esExpirado: false,
    esCerrado: false,
    puedeReservar: true,
    mensajeBadge: "Inscripciones abiertas",
    mensajeDetalle: "Inscripciones disponibles.",
    fechaLimiteInscripcion,
  };
}
