import { EstadisticasPanel } from "@/types/estadistica";
import { EstadoReserva } from "@/types/reserva";
import { ReservaAdmin } from "@/types/admin-ui";
import { UsuarioPerfil } from "@/types/usuario";
import { PageResponse } from "@/types/common";
import {
  Viaje,
  EstadoViaje,
  CrearViajeRequest,
  ActualizarViajeRequest,
  CampoFormulario,
  CrearCampoFormularioRequest,
  ActualizarCampoFormularioRequest,
} from "@/types/viaje";
import { viajes as viajesIniciales } from "@/data/viajes";

export type {
  CampoFormulario,
  CrearCampoFormularioRequest,
  ActualizarCampoFormularioRequest,
  CrearViajeRequest,
  ActualizarViajeRequest,
};

/** Comprobante mock: SVG embebido (data URI) para el preview con next/image.
    next/image pasa data:/blob: directo al <img> sin tocar el optimizador. */
const COMPROBANTE_DEMO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">` +
      `<rect width="640" height="400" fill="#f1f5f9"/>` +
      `<rect x="40" y="40" width="560" height="320" fill="#ffffff" stroke="#cbd5e1"/>` +
      `<text x="64" y="96" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a">Comprobante de transferencia</text>` +
      `<text x="64" y="140" font-family="monospace" font-size="16" fill="#334155">REF: REF-123 · Monto: C$ 400.00</text>` +
      `<text x="64" y="172" font-family="sans-serif" font-size="14" fill="#64748b">Banpro · Cuenta ****4521 · A nombre de CNM Tours</text>` +
      `<text x="64" y="320" font-family="sans-serif" font-size="12" fill="#94a3b8">Imagen de demostración (mock E6)</text>` +
      `</svg>`,
  );

/* Mock E6: store en memoria para que aprobar/rechazar mute y la bandeja se refresque. */
const reservasDemo: ReservaAdmin[] = [
  {
    idReserva: 500,
    idViaje: 1,
    tituloViaje: "Volcán Telica",
    idUsuario: 1,
    nombreUsuario: "Carlos González",
    correoUsuario: "carlos@example.com",
    estado: "pendiente",
    montoTotal: 400,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    numeroReferenciaPago: "REF-123-4567",
    capturaComprobanteUrl: COMPROBANTE_DEMO,
    numAcompanantes: 1,
    acompanantes: [
      {
        primerNombre: "María",
        primerApellido: "Pérez",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-200195-0002A",
      },
    ],
  },
  {
    idReserva: 501,
    idViaje: 2,
    tituloViaje: "Cañón de Somoto",
    idUsuario: 2,
    nombreUsuario: "Ana Pérez",
    correoUsuario: "ana@example.com",
    estado: "aprobada",
    montoTotal: 1200,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    fechaPago: new Date().toISOString(),
    numeroReferenciaPago: "REF-987-0011",
    numAcompanantes: 0,
    acompanantes: [],
  },
  {
    idReserva: 502,
    idViaje: 1,
    tituloViaje: "Volcán Telica",
    idUsuario: 3,
    nombreUsuario: "Luis Martínez",
    correoUsuario: "luis@example.com",
    estado: "rechazada",
    montoTotal: 400,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    fechaRechazo: new Date().toISOString(),
    motivoRechazo: "Comprobante ilegible: no se distingue el número de referencia.",
    numeroReferenciaPago: "REF-555-0002",
    numAcompanantes: 0,
    acompanantes: [],
  },
];

/* Store mutable en memoria para viajes (RF2 / C1-C6) */
let viajesStore: Viaje[] = viajesIniciales.map((v) => ({
  ...v,
  estado: v.estado ?? "activo",
}));
let siguienteIdViaje = Math.max(0, ...viajesStore.map((v) => v.idViaje)) + 1;

let siguienteIdCampo = 10;

/* Mock D1-D4: Almacén de campos de formulario personalizados mutable en memoria */
const camposPorViaje: Map<number, CampoFormulario[]> = new Map([
  [
    1,
    [
      {
        idCampo: 1,
        idViaje: 1,
        etiquetaPregunta: "¿Tienes experiencia previa en senderismo de altura?",
        tipoCampo: "seleccion_unica",
        obligatorio: true,
        orden: 1,
        opciones: [
          "Principiante (primera vez)",
          "Intermedio (1 a 3 ascensos)",
          "Avanzado (+4 ascensos)",
        ],
      },
      {
        idCampo: 2,
        idViaje: 1,
        etiquetaPregunta: "Alergias o condiciones médicas relevantes",
        tipoCampo: "texto",
        obligatorio: false,
        orden: 2,
      },
      {
        idCampo: 3,
        idViaje: 1,
        etiquetaPregunta: "¿Qué equipo propio llevarás a la expedición?",
        tipoCampo: "seleccion_multiple",
        obligatorio: false,
        orden: 3,
        opciones: [
          "Bastones de trekking",
          "Linterna frontal",
          "Saco de dormir (sleeping)",
          "Carpa personal",
        ],
      },
      {
        idCampo: 4,
        idViaje: 1,
        etiquetaPregunta: "Fecha de tu último chequeo médico general",
        tipoCampo: "fecha",
        obligatorio: false,
        orden: 4,
      },
    ],
  ],
]);

export const adminService = {
  async getDashboardStats(): Promise<EstadisticasPanel> {
    return {
      inscritosPorViaje: [
        { idViaje: 1, tituloViaje: "Volcán Telica", inscritos: 15, cuposMaximos: 20, porcentajeOcupacion: 75 },
        { idViaje: 2, tituloViaje: "Cañón de Somoto", inscritos: 18, cuposMaximos: 20, porcentajeOcupacion: 90 },
      ],
      rutasPopulares: [
        { idViaje: 2, tituloViaje: "Cañón de Somoto", dificultad: "Media", totalInscritos: 45 },
        { idViaje: 1, tituloViaje: "Volcán Telica", dificultad: "Media", totalInscritos: 38 },
      ],
      resumenCupos: { totalCupos: 100, reservados: 78, disponibles: 22 },
    };
  },

  async listarUsuarios(page = 0, size = 50): Promise<PageResponse<UsuarioPerfil>> {
    const base: UsuarioPerfil[] = [
      {
        idUsuario: 100,
        primerNombre: "Administrador",
        primerApellido: "CNM",
        nombreCompleto: "Administrador CNM",
        correo: "admin@cnm.org.ni",
        rol: "administrador",
        telefono: "+505 8888-0000",
        sexo: "M",
        nacionalidad: "Nicaragüense",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-010180-0001A",
        notificacionesHabilitadas: true,
        fechaRegistro: "2026-01-01T08:00:00Z",
      },
      {
        idUsuario: 1,
        primerNombre: "Carlos",
        primerApellido: "González",
        nombreCompleto: "Carlos González",
        correo: "carlos@example.com",
        rol: "cliente",
        telefono: "+505 8888-9999",
        sexo: "M",
        nacionalidad: "Nicaragüense",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-150890-0001A",
        notificacionesHabilitadas: true,
        fechaRegistro: "2026-05-10T10:00:00Z",
      },
      {
        idUsuario: 2,
        primerNombre: "Ana",
        primerApellido: "Pérez",
        nombreCompleto: "Ana Pérez",
        correo: "ana@example.com",
        rol: "cliente",
        telefono: "+505 8777-6655",
        sexo: "F",
        nacionalidad: "Nicaragüense",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-200195-0003B",
        notificacionesHabilitadas: true,
        fechaRegistro: "2026-06-15T14:30:00Z",
      },
      {
        idUsuario: 3,
        primerNombre: "Luis",
        primerApellido: "Martínez",
        nombreCompleto: "Luis Martínez",
        correo: "luis@example.com",
        rol: "cliente",
        telefono: "+505 8666-4433",
        sexo: "M",
        nacionalidad: "Nicaragüense",
        tipoIdentificacion: "cedula",
        numeroIdentificacion: "001-120488-0005C",
        notificacionesHabilitadas: true,
        fechaRegistro: "2026-07-20T09:15:00Z",
      },
    ];

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cnm_registered_users");
        if (stored) {
          const parsed: Array<{ usuario: UsuarioPerfil }> = JSON.parse(stored);
          parsed.forEach((entry) => {
            if (!base.some((b) => b.idUsuario === entry.usuario.idUsuario)) {
              base.push(entry.usuario);
            }
          });
        }
      } catch {}
    }

    return {
      content: base.slice(page * size, page * size + size),
      page,
      size,
      totalElements: base.length,
      totalPages: Math.max(1, Math.ceil(base.length / size)),
    };
  },

  async getHistorialUsuario(idUsuario: number): Promise<ReservaAdmin[]> {
    return reservasDemo.filter((r) => r.idUsuario === idUsuario).map((r) => ({ ...r }));
  },

  async listarReservas(page = 0, size = 50, estado?: EstadoReserva): Promise<PageResponse<ReservaAdmin>> {
    const filtradas = estado
      ? reservasDemo.filter((reserva) => reserva.estado === estado)
      : reservasDemo;
    return {
      content: filtradas.slice(page * size, page * size + size).map((reserva) => ({ ...reserva })),
      page,
      size,
      totalElements: filtradas.length,
      totalPages: Math.max(1, Math.ceil(filtradas.length / size)),
    };
  },

  async getViajesAdmin(page = 0, size = 50): Promise<PageResponse<Viaje>> {
    const start = page * size;
    const paginados = viajesStore.slice(start, start + size);
    return {
      content: paginados.map((v) => ({ ...v })),
      page,
      size,
      totalElements: viajesStore.length,
      totalPages: Math.max(1, Math.ceil(viajesStore.length / size)),
    };
  },

  async getViajeById(id: number): Promise<Viaje> {
    const viaje = viajesStore.find((v) => v.idViaje === id);
    if (!viaje) {
      throw new Error(`Viaje con id ${id} no encontrado.`);
    }
    return { ...viaje };
  },

  async crearViaje(input: CrearViajeRequest): Promise<Viaje> {
    const nuevoViaje: Viaje = {
      idViaje: siguienteIdViaje++,
      titulo: input.titulo.trim(),
      descripcion: input.descripcion.trim(),
      dificultad: input.dificultad,
      fechaHoraIda: input.fechaHoraIda,
      fechaHoraVuelta: input.fechaHoraVuelta,
      puntoEncuentro: input.puntoEncuentro.trim(),
      montoTotal: Number(input.montoTotal),
      montoReserva: Number(input.montoReserva),
      cuposMaximos: Number(input.cuposMaximos),
      cuposDisponibles: Number(input.cuposMaximos),
      estado: "activo",
      imagen: input.imagen?.trim() || "/Presentaciones/viajes/mombacho/VolcanMombacho.jpg",
      itinerario:
        input.itinerario && input.itinerario.length > 0
          ? input.itinerario
          : ["Salida desde punto de encuentro", "Recorrido por la ruta", "Retorno"],
      equipo:
        input.equipo && input.equipo.length > 0
          ? input.equipo
          : ["Botas de montaña", "Agua (2L)", "Ropa cómoda"],
      inclusiones:
        input.inclusiones && input.inclusiones.length > 0
          ? input.inclusiones
          : ["Transporte ida y vuelta", "Guías certificados", "Coordinación"],
      enlaceWhatsapp: input.enlaceWhatsapp?.trim(),
    };
    viajesStore = [nuevoViaje, ...viajesStore];
    return { ...nuevoViaje };
  },

  async actualizarViaje(idViaje: number, input: ActualizarViajeRequest): Promise<Viaje> {
    const indice = viajesStore.findIndex((v) => v.idViaje === idViaje);
    if (indice === -1) {
      throw new Error(`Viaje con id ${idViaje} no encontrado.`);
    }
    const actual = viajesStore[indice];
    const actualizado: Viaje = {
      ...actual,
      titulo: input.titulo !== undefined ? input.titulo.trim() : actual.titulo,
      descripcion: input.descripcion !== undefined ? input.descripcion.trim() : actual.descripcion,
      dificultad: input.dificultad ?? actual.dificultad,
      fechaHoraIda: input.fechaHoraIda ?? actual.fechaHoraIda,
      fechaHoraVuelta: input.fechaHoraVuelta !== undefined ? input.fechaHoraVuelta : actual.fechaHoraVuelta,
      puntoEncuentro: input.puntoEncuentro !== undefined ? input.puntoEncuentro.trim() : actual.puntoEncuentro,
      montoTotal: input.montoTotal !== undefined ? Number(input.montoTotal) : actual.montoTotal,
      montoReserva: input.montoReserva !== undefined ? Number(input.montoReserva) : actual.montoReserva,
      cuposMaximos: input.cuposMaximos !== undefined ? Number(input.cuposMaximos) : actual.cuposMaximos,
      cuposDisponibles: input.cuposDisponibles !== undefined ? Number(input.cuposDisponibles) : actual.cuposDisponibles,
      estado: input.estado ?? actual.estado,
      imagen: input.imagen !== undefined ? input.imagen : actual.imagen,
      itinerario: input.itinerario ?? actual.itinerario,
      equipo: input.equipo ?? actual.equipo,
      inclusiones: input.inclusiones ?? actual.inclusiones,
      enlaceWhatsapp: input.enlaceWhatsapp !== undefined ? input.enlaceWhatsapp : actual.enlaceWhatsapp,
    };
    viajesStore[indice] = actualizado;
    return { ...actualizado };
  },

  async eliminarViaje(idViaje: number): Promise<void> {
    const indice = viajesStore.findIndex((v) => v.idViaje === idViaje);
    if (indice === -1) {
      throw new Error(`Viaje con id ${idViaje} no encontrado.`);
    }
    viajesStore = viajesStore.filter((v) => v.idViaje !== idViaje);
  },

  async cambiarEstadoViaje(idViaje: number, estado: EstadoViaje): Promise<Viaje> {
    return this.actualizarViaje(idViaje, { estado });
  },

  // -------------------------------------------------------------
  // D1-D4: Endpoints de Campos de Formulario Personalizados (RF7)
  // -------------------------------------------------------------

  async listarCampos(idViaje: number): Promise<CampoFormulario[]> {
    const lista = camposPorViaje.get(idViaje) || [];
    return [...lista].sort((a, b) => a.orden - b.orden);
  },

  async crearCampo(
    idViaje: number,
    input: CrearCampoFormularioRequest
  ): Promise<CampoFormulario> {
    const lista = camposPorViaje.get(idViaje) || [];
    const nuevo: CampoFormulario = {
      idCampo: siguienteIdCampo++,
      idViaje,
      etiquetaPregunta: input.etiquetaPregunta.trim(),
      tipoCampo: input.tipoCampo,
      obligatorio: input.obligatorio,
      orden: input.orden ?? lista.length + 1,
      opciones:
        input.tipoCampo === "seleccion_unica" || input.tipoCampo === "seleccion_multiple"
          ? input.opciones && input.opciones.length > 0
            ? [...input.opciones]
            : ["Opción 1", "Opción 2"]
          : undefined,
    };
    lista.push(nuevo);
    camposPorViaje.set(idViaje, lista);
    return { ...nuevo };
  },

  async actualizarCampo(
    idViaje: number,
    idCampo: number,
    input: ActualizarCampoFormularioRequest
  ): Promise<CampoFormulario> {
    const lista = camposPorViaje.get(idViaje) || [];
    const indice = lista.findIndex((c) => c.idCampo === idCampo);
    if (indice === -1) throw new Error(`Campo con id ${idCampo} no encontrado.`);

    const previo = lista[indice];
    const tipo = input.tipoCampo ?? previo.tipoCampo;
    const opciones =
      tipo === "seleccion_unica" || tipo === "seleccion_multiple"
        ? input.opciones !== undefined
          ? input.opciones
          : previo.opciones
        : undefined;

    const actualizado: CampoFormulario = {
      ...previo,
      etiquetaPregunta: input.etiquetaPregunta?.trim() ?? previo.etiquetaPregunta,
      tipoCampo: tipo,
      obligatorio: input.obligatorio ?? previo.obligatorio,
      orden: input.orden ?? previo.orden,
      opciones,
    };
    lista[indice] = actualizado;
    camposPorViaje.set(idViaje, lista);
    return { ...actualizado };
  },

  async eliminarCampo(idViaje: number, idCampo: number): Promise<void> {
    const lista = camposPorViaje.get(idViaje) || [];
    const filtrada = lista.filter((c) => c.idCampo !== idCampo);
    camposPorViaje.set(idViaje, filtrada);
  },

  async reordenarCampos(
    idViaje: number,
    nuevosCampos: CampoFormulario[]
  ): Promise<CampoFormulario[]> {
    const reordenados = nuevosCampos.map((c, i) => ({ ...c, orden: i + 1 }));
    camposPorViaje.set(idViaje, reordenados);
    return [...reordenados];
  },

  // -------------------------------------------------------------
  // E4-E5: Aprobación y Rechazo de Reservas (RF4 / RF9)
  // -------------------------------------------------------------

  async aprobarReserva(id: number): Promise<ReservaAdmin> {
    const reserva = reservasDemo.find((r) => r.idReserva === id);
    if (!reserva) throw new Error(`Reserva ${id} no encontrada`);
    reserva.estado = "aprobada";
    reserva.fechaPago = new Date().toISOString();
    reserva.fechaActualizacion = reserva.fechaPago;
    return { ...reserva };
  },

  async rechazarReserva(id: number, motivo: string): Promise<ReservaAdmin> {
    const reserva = reservasDemo.find((r) => r.idReserva === id);
    if (!reserva) throw new Error(`Reserva ${id} no encontrada`);
    reserva.estado = "rechazada";
    reserva.motivoRechazo = motivo;
    reserva.fechaRechazo = new Date().toISOString();
    reserva.fechaActualizacion = reserva.fechaRechazo;
    return { ...reserva };
  },
};
