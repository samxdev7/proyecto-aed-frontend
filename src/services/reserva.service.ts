import { viajes } from "@/data/viajes";
import type { CrearReservaRequest, Reserva } from "@/types/reserva";

/** Detalle para la vista del cliente: la reserva base + metadatos de pago. */
export interface ReservaDetalle extends Reserva {
  /** Límite para enviar el comprobante sin perder la retención del cupo. */
  fechaLimitePago?: string;
}

/** Draft previo al POST /reservas: fija el inicio de la retención del cupo. */
export interface BorradorReserva {
  idViaje: number;
  cupos: number;
  fechaCreacion: string;
  fechaLimitePago: string;
}

/** Retención del cupo tras confirmar los datos: 30 minutos (backend). */
export const DURACION_RETENCION_MS = 30 * 60 * 1000;

let siguienteId = 1044;

const semilla: ReservaDetalle[] = [
  {
    idReserva: 1042,
    idUsuario: 1,
    nombreUsuario: "Carlos González",
    correoUsuario: "carlos@example.com",
    idViaje: 7,
    tituloViaje: "Cerro Mogotón",
    estado: "aprobada",
    montoTotal: 650,
    fechaCreacion: "2026-08-30T14:20:00",
    fechaActualizacion: "2026-09-02T09:05:00",
    fechaPago: "2026-08-30T14:32:00",
    numeroReferenciaPago: "TRF-20260830-118",
    confirmada: true,
    acompanantes: [],
    respuestasFormulario: [],
  },
  {
    idReserva: 1043,
    idUsuario: 1,
    nombreUsuario: "Carlos González",
    correoUsuario: "carlos@example.com",
    idViaje: 1,
    tituloViaje: "Volcán Mombacho",
    estado: "pendiente",
    montoTotal: 1100,
    fechaCreacion: "2026-09-26T10:15:00",
    fechaActualizacion: "2026-09-26T10:15:00",
    fechaLimitePago: "2026-09-26T10:45:00",
    numeroReferenciaPago: "TRF-884213",
    confirmada: false,
    acompanantes: [
      {
        primerNombre: "María",
        primerApellido: "Pérez",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-200195-0002A",
      },
    ],
    respuestasFormulario: [
      { idCampo: 1, respuesta: "Sí", persona: "titular" },
      { idCampo: 1, respuesta: "No", persona: "acomp-0" },
    ],
  },
];

// Store en memoria del módulo: única fuente de verdad del lado cliente (mock).
const reservas = new Map<number, ReservaDetalle>(
  semilla.map((reserva) => [reserva.idReserva, reserva]),
);

export const reservaService = {
  crearBorrador(idViaje: number, cupos: number): BorradorReserva {
    const ahora = Date.now();
    return {
      idViaje,
      cupos,
      fechaCreacion: new Date(ahora).toISOString(),
      fechaLimitePago: new Date(ahora + DURACION_RETENCION_MS).toISOString(),
    };
  },

  /** Mock del POST /reservas: referencia + comprobante van en el mismo envío. */
  async crearReserva(
    input: CrearReservaRequest,
    borrador?: BorradorReserva,
  ): Promise<ReservaDetalle> {
    if (borrador && Date.now() > new Date(borrador.fechaLimitePago).getTime()) {
      throw new Error("La retención del cupo expiró");
    }
    const viaje = viajes.find((item) => item.idViaje === input.idViaje);
    if (!viaje) throw new Error("Viaje no encontrado");

    const cupos = 1 + (input.acompanantes?.length ?? 0);
    const ahora = new Date().toISOString();
    const reserva: ReservaDetalle = {
      idReserva: siguienteId++,
      idUsuario: 1,
      nombreUsuario: "Carlos González",
      correoUsuario: "carlos@example.com",
      idViaje: viaje.idViaje,
      tituloViaje: viaje.titulo,
      estado: "pendiente",
      montoTotal: viaje.montoReserva * cupos,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      fechaLimitePago:
        borrador?.fechaLimitePago ??
        new Date(Date.now() + DURACION_RETENCION_MS).toISOString(),
      numeroReferenciaPago: input.numeroReferenciaPago,
      capturaComprobanteUrl: input.capturaComprobanteUrl,
      confirmada: false,
      acompanantes: input.acompanantes ?? [],
      respuestasFormulario: input.respuestasFormulario ?? [],
    };
    reservas.set(reserva.idReserva, reserva);
    return reserva;
  },

  async obtenerReserva(id: number): Promise<ReservaDetalle | null> {
    return reservas.get(id) ?? null;
  },

  async listarMisReservas(): Promise<ReservaDetalle[]> {
    return [...reservas.values()].sort((a, b) => b.idReserva - a.idReserva);
  },
};
