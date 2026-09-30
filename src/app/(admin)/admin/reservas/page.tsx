"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { ReservaAdmin } from "@/types/admin-ui";
import { EstadoReserva } from "@/types/reserva";
import { formatoCordobas, formatoFecha } from "@/lib/format";
import {
  CheckCircle,
  XCircle,
  Eye,
  CalendarX,
  ZoomIn
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Chip from "@/components/ui/Chip";
import DatoSensible from "@/components/admin/DatoSensible";

const FILTROS: Array<{ valor: "" | EstadoReserva; etiqueta: string }> = [
  { valor: "", etiqueta: "Todas" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "aprobada", etiqueta: "Aprobadas" },
  { valor: "rechazada", etiqueta: "Rechazadas" },
];

function esEstado(valor: string | null): valor is EstadoReserva {
  return valor === "pendiente" || valor === "aprobada" || valor === "rechazada";
}

function TablaSkeleton() {
  return (
    <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
          <tr>
            <th className="p-4 font-medium">Usuario</th>
            <th className="p-4 font-medium">Viaje</th>
            <th className="p-4 font-medium">Monto</th>
            <th className="p-4 font-medium">Estado</th>
            <th className="p-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <FilaTablaSkeleton columnas={5} />
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

  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaAdmin | null>(null);
  const [rejectMotive, setRejectMotive] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  useEffect(() => {
    loadReservas(estadoFiltro);
  }, [estadoFiltro]);

  async function loadReservas(estado: "" | EstadoReserva) {
    setLoading(true);
    setError(false);
    try {
      const response = await adminService.listarReservas(0, 50, estado || undefined);
      setReservas(response.content);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function cambiarFiltro(estado: "" | EstadoReserva) {
    router.replace(estado ? `/admin/reservas?estado=${estado}` : "/admin/reservas", { scroll: false });
  }

  const handleApprove = async (id: number) => {
    await adminService.aprobarReserva(id);
    setSelectedReserva(null);
    await loadReservas(estadoFiltro);
  };

  const handleReject = async (id: number) => {
    if (!rejectMotive.trim()) {
      setErrorMotivo("El motivo del rechazo es obligatorio.");
      return;
    }
    await adminService.rechazarReserva(id, rejectMotive.trim());
    setRejectMotive("");
    setErrorMotivo("");
    setSelectedReserva(null);
    await loadReservas(estadoFiltro);
  };

  function abrirDetalle(reserva: ReservaAdmin) {
    setSelectedReserva({ ...reserva });
    setRejectMotive("");
    setErrorMotivo("");
  }

  if (loading) {
    return <TablaSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar las reservas"
        descripcion="Ocurrió un error al obtener la bandeja. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: () => loadReservas(estadoFiltro) }}
      />
    );
  }

  return (
    <div className="space-y-6">
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
          titulo="Sin órdenes"
          descripcion={estadoFiltro ? `No hay reservas con estado "${estadoFiltro}".` : "No hay solicitudes de inscripción por revisar."}
        />
      ) : (
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
              <tr>
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium">Viaje</th>
                <th className="p-4 font-medium">Monto</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {reservas.map((res) => (
                <tr key={res.idReserva} className="hover:bg-admin-bg transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{res.nombreUsuario}</div>
                    <div className="text-xs text-admin-muted">
                      <DatoSensible valor={res.correoUsuario} />
                    </div>
                  </td>
                  <td className="p-4 text-sm">{res.tituloViaje}</td>
                  <td className="p-4 text-sm">
                    <DatoSensible valor={formatoCordobas(res.montoTotal)} ultimos={0} />
                  </td>
                  <td className="p-4">
                    <Chip estado={res.estado} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirDetalle(res)}
                        className="p-2 text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                        title="Ver Detalle"
                      >
                        <Eye size={18} />
                      </button>
                      {res.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleApprove(res.idReserva)}
                            className="p-2 text-success hover:bg-estado-aprobada-bg rounded-md transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => abrirDetalle(res)}
                            className="p-2 text-error hover:bg-estado-rechazada-bg rounded-md transition-colors"
                            title="Rechazar"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalle y Acción */}
      <Modal
        abierto={selectedReserva !== null}
        onCerrar={() => setSelectedReserva(null)}
        titulo={selectedReserva ? `Detalle de Reserva #${selectedReserva.idReserva}` : "Detalle de Reserva"}
        className="max-w-3xl p-8"
      >
        {selectedReserva && (
          <>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-admin-text">Detalle de Reserva #{selectedReserva.idReserva}</h3>
              <button onClick={() => setSelectedReserva(null)} className="text-admin-muted hover:text-admin-text">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-admin-muted uppercase">Usuario</label>
                  <p className="font-medium">{selectedReserva.nombreUsuario}</p>
                  <p className="text-sm text-admin-muted">
                    <DatoSensible valor={selectedReserva.correoUsuario} interactivo />
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-muted uppercase">Viaje</label>
                  <p className="font-medium">{selectedReserva.tituloViaje}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-muted uppercase">Monto Pagado</label>
                  <p className="font-bold text-lg">
                    <DatoSensible valor={formatoCordobas(selectedReserva.montoTotal)} ultimos={0} interactivo />
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-admin-muted uppercase">Comprobante de Pago</label>
                  <div className="relative mt-2 border border-admin-border rounded-lg overflow-hidden bg-admin-bg h-40 flex items-center justify-center">
                    {selectedReserva.capturaComprobanteUrl ? (
                      <Image
                        src={selectedReserva.capturaComprobanteUrl}
                        alt={`Comprobante de la reserva #${selectedReserva.idReserva}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-admin-muted text-sm">Sin comprobante adjunto</span>
                    )}
                  </div>
                  {selectedReserva.capturaComprobanteUrl && (
                    <button
                      onClick={() => window.open(selectedReserva.capturaComprobanteUrl, "_blank")}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-admin-accent hover:text-admin-accent-hover transition-colors"
                    >
                      <ZoomIn size={16} /> Ver en tamaño completo
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-muted uppercase">Ref. Pago</label>
                  {selectedReserva.numeroReferenciaPago ? (
                    <p className="font-mono text-sm">
                      <DatoSensible valor={selectedReserva.numeroReferenciaPago} interactivo />
                    </p>
                  ) : (
                    <p className="font-mono text-sm">N/A</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-admin-bg p-4 rounded-md mb-6 space-y-4">
              <h4 className="font-bold text-sm text-admin-muted">Acompañantes</h4>
              {selectedReserva.acompanantes.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {selectedReserva.acompanantes.map((acc, i) => (
                    <li key={i} className="flex justify-between border-b border-admin-border pb-1">
                      <span>{acc.primerNombre} {acc.primerApellido}</span>
                      <DatoSensible valor={acc.numeroIdentificacion} interactivo className="text-admin-muted" />
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-admin-muted italic">Sin acompañantes</p>}
            </div>

            {/* Trazabilidad del rechazo: visible para el admin al auditar */}
            {selectedReserva.estado === 'rechazada' && selectedReserva.motivoRechazo && (
              <div className="bg-estado-rechazada-bg p-4 rounded-md mb-6">
                <h4 className="font-bold text-sm text-estado-rechazada-text">Motivo del Rechazo</h4>
                <p className="text-sm text-estado-rechazada-text mt-1">{selectedReserva.motivoRechazo}</p>
                {selectedReserva.fechaRechazo && (
                  <p className="text-xs text-estado-rechazada-text/70 mt-2">Rechazada el {formatoFecha(selectedReserva.fechaRechazo)}</p>
                )}
              </div>
            )}

            {selectedReserva.estado === 'aprobada' && selectedReserva.fechaPago && (
              <div className="bg-estado-aprobada-bg p-4 rounded-md mb-6">
                <p className="text-sm text-estado-aprobada-text">Pago aprobado el {formatoFecha(selectedReserva.fechaPago)}.</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {selectedReserva.estado === 'pendiente' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-admin-muted">Motivo del Rechazo (obligatorio para rechazar)</label>
                  <textarea
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-surface outline-none focus:ring-2 focus:ring-error"
                    placeholder="Explique por qué se rechaza la reserva..."
                    value={rejectMotive}
                    onChange={(e) => { setRejectMotive(e.target.value); setErrorMotivo(""); }}
                  />
                  {errorMotivo && <p className="text-xs text-error">{errorMotivo}</p>}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedReserva(null)}
                  className="px-4 py-2 text-admin-muted hover:bg-admin-bg rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {selectedReserva.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedReserva.idReserva)}
                      className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                    >
                      Rechazar Reserva
                    </button>
                    <button
                      onClick={() => handleApprove(selectedReserva.idReserva)}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                    >
                      Aprobar Reserva
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
