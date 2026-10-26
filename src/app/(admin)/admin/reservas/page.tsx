"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { ApiError } from "@/lib/api-client";
import { useMensajes } from "@/contexts/MensajesContext";
import type { EstadoReserva, ReservaAdminResumen, ReservaDetalle } from "@/types/reserva";
import { formatoCordobas, formatoFechaCorta, formatearRespuestaFormulario } from "@/lib/format";
import {
  CheckCircle,
  Eye,
  CalendarX,
  Download,
  Users as UsersIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Skeleton, { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Chip from "@/components/ui/Chip";
import DatoSensible from "@/components/admin/DatoSensible";

const FILTROS: Array<{ valor: "" | EstadoReserva; etiqueta: string }> = [
  { valor: "", etiqueta: "Todas" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "aprobada", etiqueta: "Aprobadas" },
  { valor: "rechazada", etiqueta: "Rechazadas" },
  { valor: "expirada", etiqueta: "Expiradas" },
];

function esEstado(valor: string | null): valor is EstadoReserva {
  return (
    valor === "pendiente" ||
    valor === "aprobada" ||
    valor === "rechazada" ||
    valor === "expirada"
  );
}

function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Mensaje del backend (ApiError) o un texto por defecto genérico. */
function mensajeDeError(e: unknown, porDefecto: string): string {
  return e instanceof ApiError && e.message ? e.message : porDefecto;
}

function TablaSkeleton() {
  return (
    <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
          <tr>
            <th className="p-4 font-medium">Usuario</th>
            <th className="p-4 font-medium">Viaje</th>
            <th className="p-4 font-medium">Abono</th>
            <th className="p-4 font-medium">Ref. pago</th>
            <th className="p-4 font-medium">Fechas</th>
            <th className="p-4 font-medium">Estado</th>
            <th className="p-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <FilaTablaSkeleton columnas={7} />
      </table>
    </div>
  );
}

export default function AdminReservasPage() {
  return (
    <Suspense fallback={<TablaSkeleton />}>
      <AdminReservas />
    </Suspense>
  );
}

function AdminReservas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useMensajes();
  const estadoFiltro: "" | EstadoReserva = esEstado(searchParams.get("estado"))
    ? (searchParams.get("estado") as EstadoReserva)
    : "";

  const [reservas, setReservas] = useState<ReservaAdminResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);
  /* Modal de detalle: se carga con obtenerReserva al abrirlo. */
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<ReservaDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [seccionDetalle, setSeccionDetalle] = useState<1 | 2>(1);

  async function cargarReservas() {
    setLoading(true);
    setError(false);
    try {
      const respuesta = await adminService.listarReservas(
        { estado: estadoFiltro || undefined },
        0,
        50,
      );
      setReservas(respuesta.content);
    } catch (e) {
      const msg = mensajeDeError(e, "Ocurrió un error al obtener la bandeja. Inténtalo de nuevo.");
      setMensaje(msg);
      setError(true);
      mostrarError("Error al cargar reservas", msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;
    adminService
      .listarReservas(
        { estado: estadoFiltro || undefined },
        0,
        50,
      )
      .then((respuesta) => {
        if (!activo) return;
        setReservas(respuesta.content);
        setLoading(false);
      })
      .catch((e) => {
        if (!activo) return;
        const msg = mensajeDeError(e, "Ocurrió un error al obtener la bandeja. Inténtalo de nuevo.");
        setMensaje(msg);
        setError(true);
        mostrarError("Error al cargar reservas", msg);
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [estadoFiltro, reintentos]);

  function cambiarFiltro(estado: "" | EstadoReserva) {
    setLoading(true);
    router.replace(estado ? `/admin/reservas?estado=${estado}` : "/admin/reservas", { scroll: false });
  }

  async function abrirDetalle(idReserva: number) {
    setDetalleId(idReserva);
    setDetalle(null);
    setErrorDetalle("");
    setMotivo("");
    setErrorMotivo("");
    setSeccionDetalle(1);
    setCargandoDetalle(true);
    try {
      setDetalle(await adminService.obtenerReserva(idReserva));
    } catch (e) {
      const msg = mensajeDeError(e, "No pudimos cargar el detalle de la reserva.");
      setErrorDetalle(msg);
      mostrarError("Error al cargar detalle", msg);
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarModal() {
    setDetalleId(null);
    setDetalle(null);
    setErrorDetalle("");
    setMotivo("");
    setErrorMotivo("");
    setSeccionDetalle(1);
  }

  async function aprobar(idReserva: number) {
    setProcesando(true);
    try {
      await adminService.aprobarReserva(idReserva);
      const exitoTexto = `Reserva #${idReserva} aprobada exitosamente. Se envió el correo de confirmación al cliente.`;
      mostrarExito("Reserva aprobada", exitoTexto);
    } catch (e) {
      const errorTexto = mensajeDeError(e, `No se pudo aprobar la reserva #${idReserva}.`);
      mostrarError("Error al aprobar reserva", errorTexto);
    } finally {
      setProcesando(false);
      cerrarModal();
      await cargarReservas();
    }
  }

  async function rechazar() {
    if (detalleId === null) return;
    if (!motivo.trim()) {
      setErrorMotivo("El motivo del rechazo es obligatorio.");
      mostrarAdvertencia("Motivo requerido", "Debes ingresar el motivo del rechazo de la reserva.");
      return;
    }
    setProcesando(true);
    try {
      await adminService.rechazarReserva(detalleId, { motivoRechazo: motivo.trim() });
      const rechazoTexto = `Reserva #${detalleId} rechazada. Se notificó al cliente con la justificación.`;
      mostrarInfo("Reserva rechazada", rechazoTexto);
    } catch (e) {
      const errorTexto = mensajeDeError(e, `No se pudo rechazar la reserva #${detalleId}.`);
      mostrarError("Error al rechazar reserva", errorTexto);
    } finally {
      setProcesando(false);
      cerrarModal();
      await cargarReservas();
    }
  }

  if (loading) {
    return <TablaSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar las reservas"
        descripcion={mensaje}
        accion={{ etiqueta: "Reintentar", onClick: () => setReintentos((n) => n + 1) }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bandeja de Reservas</h2>
          <p className="text-admin-muted">Revisa y gestiona las solicitudes de inscripción.</p>
        </div>
        {/* Filtro segmentado por estado, sincronizado con ?estado= en la URL */}
        <div className="flex flex-wrap rounded-lg border border-admin-border bg-admin-surface overflow-hidden" role="group" aria-label="Filtrar por estado">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor || "todas"}
              onClick={() => cambiarFiltro(filtro.valor)}
              className={`px-4 py-2 text-sm transition-colors ${
                estadoFiltro === filtro.valor
                  ? "bg-admin-accent text-white"
                  : "text-admin-muted hover:bg-admin-bg"
              }`}
            >
              {filtro.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {reservas.length === 0 ? (
        <EmptyState
          icono={CalendarX}
          titulo="Sin reservas"
          descripcion={estadoFiltro ? `No hay reservas con estado "${estadoFiltro}".` : "No hay solicitudes de inscripción por revisar."}
        />
      ) : (
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
              <tr>
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium">Viaje</th>
                <th className="p-4 font-medium">Abono</th>
                <th className="p-4 font-medium">Ref. pago</th>
                <th className="p-4 font-medium">Fechas</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {reservas.map((res) => {
                const totalPersonas = res.totalAcompanantes + 1;
                return (
                  <tr key={res.idReserva} className="hover:bg-admin-bg transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{res.nombreUsuario}</div>
                      <div className="text-xs text-admin-muted">
                        <DatoSensible valor={res.correoUsuario} />
                      </div>
                    </td>
                    <td className="p-4 text-sm">{res.tituloViaje}</td>
                    <td className="p-4 text-sm">
                      <div className="font-medium">
                        <DatoSensible valor={formatoCordobas(res.montoReserva)} ultimos={0} />
                      </div>
                      <div className="text-xs text-admin-muted flex items-center gap-1">
                        <UsersIcon size={12} /> {totalPersonas} pers. ·{" "}
                        <DatoSensible
                          valor={formatoCordobas(res.montoReserva * totalPersonas)}
                          ultimos={0}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {res.numeroReferenciaPago ? (
                        <DatoSensible valor={res.numeroReferenciaPago} />
                      ) : (
                        <span className="text-admin-muted">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <div>{formatoFechaCorta(res.fechaReserva)}</div>
                      <div className="text-xs text-admin-muted">
                        límite: {fechaHora(res.fechaLimitePago)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Chip estado={res.estado} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirDetalle(res.idReserva)}
                          className="p-2 text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye size={18} />
                        </button>
                        {res.estado === "pendiente" && (
                          <button
                            onClick={() => aprobar(res.idReserva)}
                            disabled={procesando}
                            className="p-2 text-success hover:bg-estado-aprobada-bg rounded-md transition-colors disabled:opacity-50"
                            title="Aprobar"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalle y Acción */}
      <Modal
        abierto={detalleId !== null}
        onCerrar={cerrarModal}
        titulo="Detalle de Reserva"
        className="max-w-3xl p-lg"
      >
        {cargandoDetalle ? (
          <div className="space-y-md">
            <Skeleton className="h-6 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <Skeleton className="h-40 w-full rounded-md" />
          </div>
        ) : errorDetalle ? (
          <div className="space-y-md">
            <p className="text-sm text-error">{errorDetalle}</p>
            <div className="flex justify-end">
              <button onClick={cerrarModal} className="px-4 py-2 text-admin-muted hover:bg-admin-bg rounded-lg transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        ) : detalle ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-admin-text">
                  Detalle de Reserva #{detalle.idReserva}
                </h3>
                <p className="text-xs text-admin-muted mt-0.5">
                  Inspección organizada en 2 secciones para evitar saturación de información.
                </p>
              </div>
              <Chip estado={detalle.estado} />
            </div>

            {/* Paginador / Selector de secciones */}
            <div className="flex border-b border-admin-border mb-5" role="tablist" aria-label="Secciones de la reserva">
              <button
                type="button"
                role="tab"
                aria-selected={seccionDetalle === 1}
                onClick={() => setSeccionDetalle(1)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                  seccionDetalle === 1
                    ? "border-admin-accent text-admin-accent bg-admin-accent/5"
                    : "border-transparent text-admin-muted hover:text-admin-text hover:bg-admin-bg"
                }`}
              >
                <span>1. Información General y Pago</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={seccionDetalle === 2}
                onClick={() => setSeccionDetalle(2)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                  seccionDetalle === 2
                    ? "border-admin-accent text-admin-accent bg-admin-accent/5"
                    : "border-transparent text-admin-muted hover:text-admin-text hover:bg-admin-bg"
                }`}
              >
                <span>2. Acompañantes y Formularios</span>
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-admin-bg text-admin-muted font-normal">
                  {detalle.acompanantes.length + (detalle.respuestasFormulario.length > 0 ? detalle.respuestasFormulario.length : 0)}
                </span>
              </button>
            </div>

            {/* SECCIÓN 1: INFORMACIÓN GENERAL Y PAGO */}
            {seccionDetalle === 1 && (
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-md">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-admin-muted uppercase">Usuario</label>
                      <p className="font-medium">{detalle.nombreUsuario}</p>
                      <p className="text-sm text-admin-muted">
                        <DatoSensible valor={detalle.correoUsuario} interactivo />
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-admin-muted uppercase">Viaje</label>
                      <p className="font-medium">{detalle.tituloViaje}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-admin-muted uppercase">Abono por persona</label>
                      <p className="font-bold text-lg">
                        <DatoSensible valor={formatoCordobas(detalle.montoReserva)} ultimos={0} interactivo />
                      </p>
                      <p className="text-xs text-admin-muted">
                        {detalle.acompanantes.length + 1} persona(s) · Total{" "}
                        <DatoSensible
                          valor={formatoCordobas(detalle.montoReserva * (detalle.acompanantes.length + 1))}
                          ultimos={0}
                        />
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-admin-muted uppercase">Ref. Pago</label>
                      {detalle.numeroReferenciaPago ? (
                        <p className="font-mono text-sm">
                          <DatoSensible valor={detalle.numeroReferenciaPago} interactivo />
                        </p>
                      ) : (
                        <p className="font-mono text-sm text-admin-muted">N/A</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-admin-muted uppercase">Comprobante de Pago</label>
                      <div className="relative mt-2 border border-admin-border rounded-lg overflow-hidden bg-admin-bg h-40 flex items-center justify-center">
                        {detalle.capturaComprobanteUrl ? (
                          <Image
                            src={detalle.capturaComprobanteUrl}
                            alt={`Comprobante de la reserva #${detalle.idReserva}`}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-admin-muted text-sm">Sin comprobante adjunto</span>
                        )}
                      </div>
                      {detalle.capturaComprobanteUrl && (
                        <a
                          href={detalle.capturaComprobanteUrl}
                          download="comprobante-pago"
                          className="mt-2 inline-flex items-center gap-2 text-sm text-admin-accent hover:text-admin-accent-hover transition-colors"
                        >
                          <Download size={16} /> Descargar comprobante
                        </a>
                      )}
                    </div>
                    <div className="bg-admin-bg p-4 rounded-md space-y-2 text-sm">
                      <div className="flex justify-between gap-sm">
                        <span className="text-admin-muted">Reservada</span>
                        <span>{fechaHora(detalle.fechaReserva)}</span>
                      </div>
                      <div className="flex justify-between gap-sm">
                        <span className="text-admin-muted">Límite de pago</span>
                        <span className={detalle.estado === "pendiente" ? "font-medium text-warning-text" : ""}>
                          {fechaHora(detalle.fechaLimitePago)}
                        </span>
                      </div>
                      {detalle.fechaPago && (
                        <div className="flex justify-between gap-sm">
                          <span className="text-admin-muted">Pagada</span>
                          <span>{fechaHora(detalle.fechaPago)}</span>
                        </div>
                      )}
                      {detalle.fechaRevision && (
                        <div className="flex justify-between gap-sm">
                          <span className="text-admin-muted">Revisada</span>
                          <span>{fechaHora(detalle.fechaRevision)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trazabilidad del rechazo */}
                {detalle.estado === "rechazada" && detalle.motivoRechazo && (
                  <div className="bg-estado-rechazada-bg p-4 rounded-md mb-md">
                    <h4 className="font-bold text-sm text-estado-rechazada-text">Motivo del Rechazo</h4>
                    <p className="text-sm text-estado-rechazada-text mt-1">{detalle.motivoRechazo}</p>
                    {detalle.fechaRevision && (
                      <p className="text-xs text-estado-rechazada-text/70 mt-2">
                        Rechazada el {fechaHora(detalle.fechaRevision)}
                      </p>
                    )}
                  </div>
                )}

                {/* Botón para avanzar a la sección 2 */}
                <div className="flex justify-between items-center pt-2 border-t border-admin-border/60">
                  <span className="text-xs text-admin-muted">Sección 1 de 2</span>
                  <button
                    type="button"
                    onClick={() => setSeccionDetalle(2)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-admin-accent text-admin-accent hover:bg-admin-accent/10 transition-colors"
                  >
                    <span>Ver Acompañantes y Formularios</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* SECCIÓN 2: ACOMPAÑANTES Y RESPUESTAS DE FORMULARIOS */}
            {seccionDetalle === 2 && (
              <div className="space-y-md">
                {/* Acompañantes */}
                <div className="bg-admin-bg p-4 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-admin-muted flex items-center gap-2">
                      <UsersIcon size={16} />
                      <span>Acompañantes registrados ({detalle.acompanantes.length})</span>
                    </h4>
                    <span className="text-xs text-admin-muted">
                      {detalle.acompanantes.length === 0 ? "Titular viaja solo" : `${detalle.acompanantes.length} persona(s) adicional(es)`}
                    </span>
                  </div>
                  {detalle.acompanantes.length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {detalle.acompanantes.map((acc, i) => (
                        <li key={i} className="flex justify-between items-center border-b border-admin-border pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-medium text-admin-text">
                              {acc.primerNombre} {acc.segundoNombre ? `${acc.segundoNombre} ` : ""}{acc.primerApellido} {acc.segundoApellido ? ` ${acc.segundoApellido}` : ""}
                            </span>
                            <span className="text-admin-muted text-xs ml-2 uppercase font-medium">
                              ({acc.tipoIdentificacion})
                            </span>
                          </div>
                          <DatoSensible valor={acc.numeroIdentificacion} interactivo className="text-admin-muted font-mono" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-admin-muted italic">Esta reserva no incluye acompañantes adicionales.</p>
                  )}
                </div>

                {/* Respuestas del Formulario */}
                <div className="bg-admin-bg p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-admin-muted flex items-center gap-2">
                      <FileText size={16} />
                      <span>Respuestas del formulario ({detalle.respuestasFormulario.length})</span>
                    </h4>
                    <span className="text-xs text-admin-muted">Una respuesta por campo</span>
                  </div>
                  {detalle.respuestasFormulario.length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {detalle.respuestasFormulario.map((respuesta) => {
                        const esArchivo =
                          respuesta.valorRespuesta.startsWith("http://") ||
                          respuesta.valorRespuesta.startsWith("https://") ||
                          respuesta.valorRespuesta.startsWith("data:");
                        return (
                          <li
                            key={respuesta.idCampo}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 border-b border-admin-border pb-2 last:border-b-0 last:pb-0"
                          >
                            <span className="text-admin-muted font-medium">
                              {respuesta.etiquetaPregunta ?? `Pregunta #${respuesta.idCampo}`}
                            </span>
                            {esArchivo ? (
                              <a
                                href={respuesta.valorRespuesta}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-admin-accent hover:text-admin-accent-hover font-semibold underline text-sm"
                              >
                                <FileText size={15} />
                                Ver / Descargar archivo adjunto
                              </a>
                            ) : (
                              <span className="font-medium text-right text-admin-text">
                                {formatearRespuestaFormulario(respuesta.valorRespuesta)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-admin-muted italic">Este viaje no requirió preguntas adicionales en la inscripción.</p>
                  )}
                </div>

                {/* Botón para volver a la sección 1 */}
                <div className="flex justify-between items-center pt-2 border-t border-admin-border/60">
                  <button
                    type="button"
                    onClick={() => setSeccionDetalle(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-bg transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Volver a Datos y Pago</span>
                  </button>
                  <span className="text-xs text-admin-muted">Sección 2 de 2</span>
                </div>
              </div>
            )}

            {/* ÁREA DE DECISIÓN Y ACCIONES DEL ADMINISTRADOR */}
            <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-admin-border">
              {detalle.estado === "pendiente" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-admin-muted">
                    Motivo del Rechazo (obligatorio para rechazar)
                  </label>
                  <textarea
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-surface outline-none focus:ring-2 focus:ring-error"
                    placeholder="Explique por qué se rechaza la reserva..."
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setErrorMotivo("");
                    }}
                  />
                  {errorMotivo && <p className="text-xs text-error">{errorMotivo}</p>}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 text-admin-muted hover:bg-admin-bg rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {detalle.estado === "pendiente" && (
                  <>
                    <button
                      onClick={rechazar}
                      disabled={procesando}
                      className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
                    >
                      Rechazar Reserva
                    </button>
                    <button
                      onClick={() => aprobar(detalle.idReserva)}
                      disabled={procesando}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      Aprobar Reserva
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
