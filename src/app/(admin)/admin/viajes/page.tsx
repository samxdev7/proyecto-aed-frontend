"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Viaje, Dificultad, EstadoViaje } from "@/types/viaje";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Map,
  ListFilter,
  AlertTriangle,
  Loader2,
  RotateCw,
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ChipDificultad } from "@/components/ui/Chip";

interface FormViajeData {
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  fechaHoraIda: string;
  fechaHoraVuelta: string;
  puntoEncuentro: string;
  montoTotal: number;
  montoReserva: number;
  cuposMaximos: number;
  enlaceWhatsapp: string;
  imagen: string;
}

const FORM_INICIAL: FormViajeData = {
  titulo: "",
  descripcion: "",
  dificultad: "Media",
  fechaHoraIda: "",
  fechaHoraVuelta: "",
  puntoEncuentro: "",
  montoTotal: 1200,
  montoReserva: 400,
  cuposMaximos: 15,
  enlaceWhatsapp: "",
  imagen: "",
};

export default function AdminViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  // Estados para modal de creación / edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);
  const [formData, setFormData] = useState<FormViajeData>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  // Estados para modal de eliminación
  const [viajeParaEliminar, setViajeParaEliminar] = useState<Viaje | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Mensaje de éxito / notificación temporal
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getViajesAdmin()
      .then((response) => {
        setViajes(response.content);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [reintentos]);

  function mostrarNotificacion(mensaje: string) {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(null), 4000);
  }

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  const handleOpenCreate = () => {
    setEditingViaje(null);
    setFormData(FORM_INICIAL);
    setErrorFormulario(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (viaje: Viaje) => {
    setEditingViaje(viaje);
    setFormData({
      titulo: viaje.titulo,
      descripcion: viaje.descripcion,
      dificultad: viaje.dificultad,
      fechaHoraIda: viaje.fechaHoraIda ? viaje.fechaHoraIda.slice(0, 16) : "",
      fechaHoraVuelta: viaje.fechaHoraVuelta ? viaje.fechaHoraVuelta.slice(0, 16) : "",
      puntoEncuentro: viaje.puntoEncuentro,
      montoTotal: viaje.montoTotal,
      montoReserva: viaje.montoReserva,
      cuposMaximos: viaje.cuposMaximos,
      enlaceWhatsapp: viaje.enlaceWhatsapp || "",
      imagen: viaje.imagen || "",
    });
    setErrorFormulario(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario(null);

    if (!formData.titulo.trim()) {
      setErrorFormulario("El título del viaje es obligatorio.");
      return;
    }
    if (!formData.descripcion.trim()) {
      setErrorFormulario("La descripción del viaje es obligatoria.");
      return;
    }
    if (!formData.puntoEncuentro.trim()) {
      setErrorFormulario("El punto de encuentro es obligatorio.");
      return;
    }
    if (!formData.fechaHoraIda) {
      setErrorFormulario("La fecha y hora de salida son obligatorias.");
      return;
    }
    if (formData.montoTotal <= 0) {
      setErrorFormulario("El monto total debe ser mayor a 0.");
      return;
    }
    if (formData.montoReserva <= 0 || formData.montoReserva > formData.montoTotal) {
      setErrorFormulario("El monto de reserva debe ser mayor a 0 y menor o igual al total.");
      return;
    }
    if (formData.cuposMaximos <= 0) {
      setErrorFormulario("Los cupos máximos deben ser al menos 1.");
      return;
    }

    try {
      setGuardando(true);
      if (editingViaje) {
        const viajeActualizado = await adminService.actualizarViaje(editingViaje.idViaje, {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          dificultad: formData.dificultad,
          fechaHoraIda: formData.fechaHoraIda,
          fechaHoraVuelta: formData.fechaHoraVuelta || undefined,
          puntoEncuentro: formData.puntoEncuentro,
          montoTotal: Number(formData.montoTotal),
          montoReserva: Number(formData.montoReserva),
          cuposMaximos: Number(formData.cuposMaximos),
          enlaceWhatsapp: formData.enlaceWhatsapp.trim() || undefined,
          imagen: formData.imagen.trim() || undefined,
        });
        setViajes((prev) =>
          prev.map((v) => (v.idViaje === viajeActualizado.idViaje ? viajeActualizado : v))
        );
        mostrarNotificacion(`Viaje "${viajeActualizado.titulo}" actualizado exitosamente.`);
      } else {
        const nuevoViaje = await adminService.crearViaje({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          dificultad: formData.dificultad,
          fechaHoraIda: formData.fechaHoraIda,
          fechaHoraVuelta: formData.fechaHoraVuelta || undefined,
          puntoEncuentro: formData.puntoEncuentro,
          montoTotal: Number(formData.montoTotal),
          montoReserva: Number(formData.montoReserva),
          cuposMaximos: Number(formData.cuposMaximos),
          enlaceWhatsapp: formData.enlaceWhatsapp.trim() || undefined,
          imagen: formData.imagen.trim() || undefined,
        });
        setViajes((prev) => [nuevoViaje, ...prev]);
        mostrarNotificacion(`Viaje "${nuevoViaje.titulo}" creado exitosamente.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorFormulario(
        err instanceof Error ? err.message : "Error al procesar la solicitud del viaje."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (viaje: Viaje) => {
    const nuevoEstado: EstadoViaje = viaje.estado === "cerrado" ? "activo" : "cerrado";
    try {
      const actualizado = await adminService.cambiarEstadoViaje(viaje.idViaje, nuevoEstado);
      setViajes((prev) =>
        prev.map((v) => (v.idViaje === actualizado.idViaje ? actualizado : v))
      );
      mostrarNotificacion(
        `El viaje "${actualizado.titulo}" ahora está ${
          nuevoEstado === "activo" ? "Activo para inscripciones" : "Cerrado"
        }.`
      );
    } catch {
      alert("No se pudo cambiar el estado del viaje.");
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!viajeParaEliminar) return;
    try {
      setEliminando(true);
      await adminService.eliminarViaje(viajeParaEliminar.idViaje);
      setViajes((prev) => prev.filter((v) => v.idViaje !== viajeParaEliminar.idViaje));
      mostrarNotificacion(`Viaje "${viajeParaEliminar.titulo}" eliminado exitosamente.`);
      setViajeParaEliminar(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el viaje.");
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md font-medium">Título</th>
              <th className="p-md font-medium">Dificultad</th>
              <th className="p-md font-medium">Cupos</th>
              <th className="p-md font-medium">Tarifa</th>
              <th className="p-md font-medium">Estado</th>
              <th className="p-md font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <FilaTablaSkeleton columnas={6} />
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar los viajes"
        descripcion="Ocurrió un error al obtener la lista. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="space-y-md">
      {/* Alerta de notificación temporal */}
      {mensajeExito && (
        <div className="bg-success/15 border border-success/30 text-success px-md py-sm rounded-md flex items-center justify-between text-sm animate-in fade-in">
          <span className="flex items-center gap-xs font-medium">
            <CheckCircle size={16} />
            {mensajeExito}
          </span>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-xs text-admin-muted hover:text-admin-text ml-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado de página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Gestión de Viajes</h2>
          <p className="text-sm text-admin-muted">
            Administra las expediciones, define cupos, estados y preguntas dinámicas.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-admin-accent text-white px-md py-xs rounded-md flex items-center gap-xs hover:bg-admin-accent-hover transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} /> Nuevo Viaje
        </button>
      </div>

      {viajes.length === 0 ? (
        <EmptyState
          icono={Map}
          titulo="Sin viajes creados"
          descripcion="Todavía no hay expediciones publicadas en el catálogo. Crea la primera."
          accion={{ etiqueta: "Nuevo Viaje", onClick: handleOpenCreate }}
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md font-medium">Título</th>
                <th className="p-md font-medium">Dificultad</th>
                <th className="p-md font-medium">Cupos</th>
                <th className="p-md font-medium">Tarifa</th>
                <th className="p-md font-medium">Estado</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {viajes.map((viaje) => {
                const esCerrado = viaje.estado === "cerrado";
                return (
                  <tr
                    key={viaje.idViaje}
                    className={`hover:bg-admin-bg/50 transition-colors ${
                      esCerrado ? "opacity-75 bg-admin-bg/25" : ""
                    }`}
                  >
                    <td className="p-md">
                      <div className="font-semibold text-sm text-admin-text">{viaje.titulo}</div>
                      <div className="text-xs text-admin-muted line-clamp-1">
                        {viaje.puntoEncuentro}
                      </div>
                    </td>
                    <td className="p-md">
                      <ChipDificultad dificultad={viaje.dificultad} />
                    </td>
                    <td className="p-md text-sm">
                      <span className="font-medium text-admin-text">{viaje.cuposDisponibles}</span>
                      <span className="text-admin-muted"> / {viaje.cuposMaximos}</span>
                    </td>
                    <td className="p-md text-sm">
                      <span className="font-semibold text-admin-text">
                        C$ {viaje.montoTotal.toLocaleString()}
                      </span>
                      <span className="text-xs text-admin-muted block">
                        Anticipo: C$ {viaje.montoReserva.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-md">
                      <button
                        type="button"
                        onClick={() => handleToggleEstado(viaje)}
                        title={
                          esCerrado
                            ? "Clic para activar viaje"
                            : "Clic para cerrar viaje a nuevas inscripciones"
                        }
                        className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold transition-colors ${
                          esCerrado
                            ? "bg-neutral-bg text-neutral-muted hover:bg-neutral-border border border-neutral-border"
                            : "bg-success/10 text-success hover:bg-success/20 border border-success/30"
                        }`}
                      >
                        {esCerrado ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {esCerrado ? "Cerrado" : "Activo"}
                      </button>
                    </td>
                    <td className="p-md text-right">
                      <div className="flex justify-end items-center gap-xs">
                        {/* Enlace a configuración de campos dinámicos */}
                        <Link
                          href={`/admin/viajes/${viaje.idViaje}/campos`}
                          className="p-xs text-admin-muted hover:text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                          title="Gestionar preguntas del formulario"
                        >
                          <ListFilter size={16} />
                        </Link>
                        {/* Botón de editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(viaje)}
                          className="p-xs text-admin-accent hover:bg-admin-accent/10 rounded-md transition-colors"
                          title="Editar información del viaje"
                        >
                          <Edit2 size={16} />
                        </button>
                        {/* Botón de eliminar */}
                        <button
                          type="button"
                          onClick={() => setViajeParaEliminar(viaje)}
                          className="p-xs text-error hover:bg-estado-rechazada-bg rounded-md transition-colors"
                          title="Eliminar viaje"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulario: Crear / Editar Viaje */}
      <Modal
        abierto={isModalOpen}
        onCerrar={() => !guardando && setIsModalOpen(false)}
        titulo={editingViaje ? "Editar Expedición" : "Crear Nueva Expedición"}
        className="max-w-2xl p-lg"
      >
        <div className="space-y-md">
          <div className="border-b border-admin-border pb-sm">
            <h3 className="text-xl font-bold text-admin-text">
              {editingViaje ? `Editar: ${editingViaje.titulo}` : "Crear Nueva Expedición"}
            </h3>
            <p className="text-xs text-admin-muted mt-0.5">
              Configura los detalles logísticos, tarifarios y de cupos de la expedición.
            </p>
          </div>

          {errorFormulario && (
            <div className="bg-error/10 border border-error/30 text-error p-sm rounded-md text-xs flex items-center gap-xs">
              <AlertTriangle size={15} />
              {errorFormulario}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Título */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Título de la Expedición *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Volcán Cerro Negro Nocturno"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe la ruta, atractivo y condiciones..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all resize-y"
                />
              </div>

              {/* Dificultad */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">Dificultad *</label>
                <select
                  value={formData.dificultad}
                  onChange={(e) =>
                    setFormData({ ...formData, dificultad: e.target.value as Dificultad })
                  }
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                >
                  <option value="Baja">Baja (Familiar / Recreativa)</option>
                  <option value="Media">Media (Senderismo con desnivel)</option>
                  <option value="Alta">Alta (Exigencia física alta)</option>
                </select>
              </div>

              {/* Punto de Encuentro */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Punto de Encuentro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gasolinera Puma Metrocentro - 5:00 AM"
                  value={formData.puntoEncuentro}
                  onChange={(e) => setFormData({ ...formData, puntoEncuentro: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Fecha y Hora de Ida */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Fecha y Hora de Salida *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fechaHoraIda}
                  onChange={(e) => setFormData({ ...formData, fechaHoraIda: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Fecha y Hora de Vuelta */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Fecha y Hora de Retorno (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaHoraVuelta}
                  onChange={(e) => setFormData({ ...formData, fechaHoraVuelta: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Monto Total */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Precio Total (C$) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.montoTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, montoTotal: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Monto Reserva */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Anticipo para Reserva (C$) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.montoReserva}
                  onChange={(e) =>
                    setFormData({ ...formData, montoReserva: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Cupos Máximos */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Cupos Totales *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.cuposMaximos}
                  onChange={(e) =>
                    setFormData({ ...formData, cuposMaximos: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>

              {/* Enlace WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Enlace Grupo de WhatsApp
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={formData.enlaceWhatsapp}
                  onChange={(e) => setFormData({ ...formData, enlaceWhatsapp: e.target.value })}
                  className="w-full px-sm py-2 border border-admin-border rounded-md text-sm text-admin-text bg-white dark:bg-admin-bg focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-sm pt-sm border-t border-admin-border">
              <button
                type="button"
                disabled={guardando}
                onClick={() => setIsModalOpen(false)}
                className="px-md py-xs text-admin-muted hover:bg-admin-bg rounded-md transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-md py-xs bg-admin-accent text-white rounded-md hover:bg-admin-accent-hover transition-colors text-sm font-medium flex items-center gap-xs shadow-sm"
              >
                {guardando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : editingViaje ? (
                  "Guardar Cambios"
                ) : (
                  "Publicar Expedición"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Confirmación: Eliminar Viaje */}
      <Modal
        abierto={viajeParaEliminar !== null}
        onCerrar={() => !eliminando && setViajeParaEliminar(null)}
        titulo="Confirmar Eliminación"
        className="max-w-md p-lg"
      >
        <div className="space-y-md">
          <div className="flex items-center gap-sm text-error">
            <div className="p-xs bg-error/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-admin-text">¿Eliminar expedición?</h3>
          </div>
          <p className="text-sm text-admin-muted leading-relaxed">
            Estás a punto de eliminar el viaje{" "}
            <strong className="text-admin-text font-semibold">
              &quot;{viajeParaEliminar?.titulo}&quot;
            </strong>
            . Esta acción removerá el viaje y sus configuraciones de preguntas asociadas.
          </p>

          <div className="flex justify-end gap-sm pt-sm border-t border-admin-border">
            <button
              type="button"
              disabled={eliminando}
              onClick={() => setViajeParaEliminar(null)}
              className="px-md py-xs text-admin-muted hover:bg-admin-bg rounded-md transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={eliminando}
              onClick={handleConfirmarEliminar}
              className="px-md py-xs bg-error text-white rounded-md hover:bg-error/90 transition-colors text-sm font-medium flex items-center gap-xs shadow-sm"
            >
              {eliminando ? (
                <>
                  <RotateCw size={16} className="animate-spin" /> Eliminando...
                </>
              ) : (
                "Eliminar Definitivamente"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
