"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { ApiError } from "@/lib/api-client";
import type { EstadoReserva, ReservaAdminResumen, ReservaDetalle } from "@/types/reserva";
import { formatoCordobas, formatoFechaCorta } from "@/lib/format";
import {
  CheckCircle,
  Eye,
  CalendarX,
  ZoomIn,
  Users as UsersIcon
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
  const estadoFiltro: "" | EstadoReserva = esEstado(searchParams.get("estado"))
    ? (searchParams.get("estado") as EstadoReserva)
    : "";

  const [reservas, setReservas] = useState<ReservaAdminResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);
  /* Aviso global (banner) de resultado de aprobar/rechazar. */
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  /* Modal de detalle: se carga con obtenerReserva al abrirlo. */
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<ReservaDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);

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
      setMensaje(mensajeDeError(e, "Ocurrió un error al obtener la bandeja. Inténtalo de nuevo."));
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setAviso(null);
    void cargarReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFiltro, reintentos]);

  function cambiarFiltro(estado: "" | EstadoReserva) {
    router.replace(estado ? `/admin/reservas?estado=${estado}` : "/admin/reservas", { scroll: false });
  }

  async function abrirDetalle(idReserva: number) {
    setDetalleId(idReserva);
    setDetalle(null);
    setErrorDetalle("");
    setMotivo("");
    setErrorMotivo("");
    setCargandoDetalle(true);
    try {
      setDetalle(await adminService.obtenerReserva(idReserva));
    } catch (e) {
      setErrorDetalle(mensajeDeError(e, "No pudimos cargar el detalle de la reserva."));
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
  }

  async function aprobar(idReserva: number) {
    setProcesando(true);
    try {
      await adminService.aprobarReserva(idReserva);
      setAviso({ tipo: "ok", texto: `Reserva #${idReserva} aprobada.` });
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeDeError(e, `No se pudo aprobar la reserva #${idReserva}.`) });
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
      return;
    }
    setProcesando(true);
    try {
      await adminService.rechazarReserva(detalleId, { motivoRechazo: motivo.trim() });
      setAviso({ tipo: "ok", texto: `Reserva #${detalleId} rechazada.` });
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeDeError(e, `No se pudo rechazar la reserva #${detalleId}.`) });
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

      {aviso && (
        <div
          role="status"
          className={`rounded-sm px-md py-sm text-sm font-medium ${
            aviso.tipo === "ok"
              ? "bg-estado-aprobada-bg text-estado-aprobada-text"
              : "bg-estado-rechazada-bg text-estado-rechazada-text"
          }`}
        >
          {aviso.texto}
        </div>
      )}

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
        titulo={detalleId ? `Detalle de Reserva #${detalleId}` : "Detalle de Reserva"}
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
            <div className="flex justify-between items-start mb-md">
              <h3 className="text-xl font-bold text-admin-text">
                Detalle de Reserva #{detalle.idReserva}
              </h3>
              <Chip estado={detalle.estado} />
            </div>

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
                      <ZoomIn size={16} /> Descargar comprobante
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

            <div className="bg-admin-bg p-4 rounded-md mb-md space-y-4">
              <h4 className="font-bold text-sm text-admin-muted">
                Acompañantes ({detalle.acompanantes.length})
              </h4>
              {detalle.acompanantes.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {detalle.acompanantes.map((acc, i) => (
                    <li key={i} className="flex justify-between border-b border-admin-border pb-1">
                      <span>
                        {acc.primerNombre} {acc.primerApellido}
                        <span className="text-admin-muted text-xs ml-sm">
                          ({acc.tipoIdentificacion})
                        </span>
                      </span>
                      <DatoSensible valor={acc.numeroIdentificacion} interactivo className="text-admin-muted" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-admin-muted italic">Sin acompañantes</p>
              )}
            </div>

            {detalle.respuestasFormulario.length > 0 && (
              <div className="bg-admin-bg p-4 rounded-md mb-md space-y-2">
                <h4 className="font-bold text-sm text-admin-muted">Respuestas del formulario</h4>
                <ul className="text-sm space-y-1">
                  {detalle.respuestasFormulario.map((respuesta) => (
                    <li key={respuesta.idCampo} className="flex justify-between gap-md border-b border-admin-border pb-1">
                      <span className="text-admin-muted">{respuesta.etiquetaPregunta ?? `Pregunta #${respuesta.idCampo}`}</span>
                      {respuesta.valorRespuesta.startsWith("data:") ? (
                        <a
                          href={respuesta.valorRespuesta}
                          target="_blank"
                          rel="noreferrer"
                          className="text-admin-accent hover:text-admin-accent-hover"
                        >
                          Ver archivo adjunto
                        </a>
                      ) : (
                        <span className="font-medium text-right">{respuesta.valorRespuesta}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

            <div className="flex flex-col gap-4">
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
