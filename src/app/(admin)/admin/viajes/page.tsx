"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { viajesService } from "@/services/viajes.service";
import { ApiError } from "@/lib/api-client";
import type { Dificultad, EstadoViaje, Viaje, ViajeRequest } from "@/types/viaje";
import { formatoCordobas, formatoFecha } from "@/lib/format";
import {
  Plus,
  Edit2,
  Trash2,
  Map,
  ListChecks,
  Power,
  Image as ImageIcon
} from "lucide-react";
import Skeleton, { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import { ChipDificultad } from "@/components/ui/Chip";

const DIFICULTADES = ["Baja", "Media", "Alta", "Extrema"] as const;

/** Mensaje del backend (ApiError) o un texto por defecto genérico. */
function mensajeDeError(e: unknown, porDefecto: string): string {
  return e instanceof ApiError && e.message ? e.message : porDefecto;
}

/** ISO → valor de <input type="datetime-local"> en la zona del navegador. */
function aValorLocal(iso: string): string {
  const fecha = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

/* El formulario vive como strings (inputs) y se convierte en ViajeRequest al guardar. */
interface FormViaje {
  titulo: string;
  descripcion: string;
  itinerario: string;
  dificultad: Dificultad;
  fechaIdaLocal: string;
  fechaVueltaLocal: string;
  puntoEncuentro: string;
  inclusionesAdicionales: string;
  montoTotal: string;
  montoReserva: string;
  cuposMaximos: string;
  enlaceWhatsApp: string;
  imagenUrl: string;
  equipo: string;
}

const FORM_VACIO: FormViaje = {
  titulo: "",
  descripcion: "",
  itinerario: "",
  dificultad: "Baja",
  fechaIdaLocal: "",
  fechaVueltaLocal: "",
  puntoEncuentro: "",
  inclusionesAdicionales: "",
  montoTotal: "",
  montoReserva: "",
  cuposMaximos: "",
  enlaceWhatsApp: "",
  imagenUrl: "",
  equipo: "",
};

export default function AdminViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  /* Modal crear/editar. */
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [form, setForm] = useState<FormViaje>(FORM_VACIO);
  /* id del viaje con una mutación de fila en curso (toggle/eliminar). */
  const [ocupado, setOcupado] = useState<number | null>(null);

  async function cargarViajes() {
    setLoading(true);
    setError(false);
    try {
      const respuesta = await viajesService.listarViajes();
      setViajes(respuesta.content);
    } catch (e) {
      setMensaje(mensajeDeError(e, "Ocurrió un error al obtener la lista. Inténtalo de nuevo."));
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;
    viajesService
      .listarViajes()
      .then((respuesta) => {
        if (!activo) return;
        setViajes(respuesta.content);
        setLoading(false);
      })
      .catch((e) => {
        if (!activo) return;
        setMensaje(mensajeDeError(e, "Ocurrió un error al obtener la lista. Inténtalo de nuevo."));
        setError(true);
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [reintentos]);

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setCargandoDetalle(false);
    setModalAbierto(true);
  }

  async function abrirEditar(viaje: Viaje) {
    setEditandoId(viaje.idViaje);
    setForm(FORM_VACIO);
    setErrorForm("");
    setCargandoDetalle(true);
    setModalAbierto(true);
    try {
      const detalle = await viajesService.obtenerViaje(viaje.idViaje);
      if (!detalle) {
        setErrorForm("No pudimos cargar los datos del viaje.");
        return;
      }
      setForm({
        titulo: detalle.titulo,
        descripcion: detalle.descripcion ?? "",
        itinerario: detalle.itinerario ?? "",
        dificultad: detalle.dificultad,
        fechaIdaLocal: aValorLocal(detalle.fechaHoraIda),
        fechaVueltaLocal: aValorLocal(detalle.fechaHoraVuelta),
        puntoEncuentro: detalle.puntoEncuentro,
        inclusionesAdicionales: detalle.inclusionesAdicionales ?? "",
        montoTotal: String(detalle.montoTotal),
        montoReserva: String(detalle.montoReserva),
        cuposMaximos: String(detalle.cuposMaximos),
        enlaceWhatsApp: detalle.enlaceWhatsApp ?? "",
        imagenUrl: detalle.imagenUrl ?? "",
        equipo: detalle.equipo ?? "",
      });
    } catch (e) {
      setErrorForm(mensajeDeError(e, "No pudimos cargar los datos del viaje."));
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setErrorForm("");
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!form.fechaIdaLocal || !form.fechaVueltaLocal) {
      setErrorForm("Completa la fecha y hora de ida y de vuelta.");
      return;
    }
    const request: ViajeRequest = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      itinerario: form.itinerario.trim() || undefined,
      dificultad: form.dificultad,
      fechaHoraIda: new Date(form.fechaIdaLocal).toISOString(),
      fechaHoraVuelta: new Date(form.fechaVueltaLocal).toISOString(),
      puntoEncuentro: form.puntoEncuentro.trim(),
      inclusionesAdicionales: form.inclusionesAdicionales.trim() || undefined,
      montoTotal: Number(form.montoTotal),
      montoReserva: Number(form.montoReserva),
      cuposMaximos: Number(form.cuposMaximos),
      enlaceWhatsApp: form.enlaceWhatsApp.trim() || undefined,
      imagenUrl: form.imagenUrl.trim() || undefined,
      equipo: form.equipo.trim() || undefined,
    };
    setGuardando(true);
    setErrorForm("");
    try {
      if (editandoId !== null) {
        await viajesService.actualizarViaje(editandoId, request);
        setAviso({ tipo: "ok", texto: `Viaje "${request.titulo}" actualizado.` });
      } else {
        await viajesService.crearViaje(request);
        setAviso({ tipo: "ok", texto: `Viaje "${request.titulo}" creado.` });
      }
      cerrarModal();
      await cargarViajes();
    } catch (e) {
      /* Validaciones del backend (montoReserva <= montoTotal, fechas, etc.) en español. */
      setErrorForm(mensajeDeError(e, "No se pudo guardar el viaje."));
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(viaje: Viaje) {
    const nuevoEstado: EstadoViaje = viaje.estado === "activo" ? "cerrado" : "activo";
    setOcupado(viaje.idViaje);
    try {
      await viajesService.cambiarEstado(viaje.idViaje, nuevoEstado);
      await cargarViajes();
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeDeError(e, "No se pudo cambiar el estado del viaje.") });
    } finally {
      setOcupado(null);
    }
  }

  async function eliminar(viaje: Viaje) {
    if (!window.confirm(`¿Eliminar el viaje "${viaje.titulo}"? Esta acción no se puede deshacer.`)) return;
    setOcupado(viaje.idViaje);
    try {
      await viajesService.eliminarViaje(viaje.idViaje);
      setAviso({ tipo: "ok", texto: `Viaje "${viaje.titulo}" eliminado.` });
      await cargarViajes();
    } catch (e) {
      /* 409 con message del backend si el viaje tiene reservas activas. */
      setAviso({ tipo: "error", texto: mensajeDeError(e, "No se pudo eliminar el viaje.") });
    } finally {
      setOcupado(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md font-medium">Imagen</th>
              <th className="p-md font-medium">Título</th>
              <th className="p-md font-medium">Dificultad</th>
              <th className="p-md font-medium">Salida</th>
              <th className="p-md font-medium">Cupos</th>
              <th className="p-md font-medium">Monto</th>
              <th className="p-md font-medium">Estado</th>
              <th className="p-md font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <FilaTablaSkeleton columnas={8} />
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar los viajes"
        descripcion={mensaje}
        accion={{ etiqueta: "Reintentar", onClick: () => setReintentos((n) => n + 1) }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Gestión de Viajes</h2>
          <p className="text-sm text-admin-muted">Administra las expediciones y rutas disponibles.</p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-admin-accent text-white px-sm py-xs rounded-md flex items-center gap-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Nuevo Viaje
        </button>
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

      {viajes.length === 0 ? (
        <EmptyState
          icono={Map}
          titulo="Sin viajes creados"
          descripcion="Todavía no hay expediciones publicadas. Crea la primera."
          accion={{ etiqueta: "Nuevo Viaje", onClick: abrirCrear }}
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md font-medium">Imagen</th>
                <th className="p-md font-medium">Título</th>
                <th className="p-md font-medium">Dificultad</th>
                <th className="p-md font-medium">Salida</th>
                <th className="p-md font-medium">Cupos</th>
                <th className="p-md font-medium">Monto</th>
                <th className="p-md font-medium">Estado</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {viajes.map((viaje) => (
                <tr key={viaje.idViaje} className="hover:bg-admin-bg transition-colors">
                  <td className="p-md">
                    {viaje.imagenUrl ? (
                      <Image
                        src={viaje.imagenUrl}
                        alt=""
                        width={48}
                        height={36}
                        unoptimized
                        className="h-9 w-12 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-12 items-center justify-center rounded-sm bg-admin-bg text-admin-muted">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="p-md">
                    <div className="font-medium text-sm">{viaje.titulo}</div>
                    <div className="text-xs text-admin-muted">{viaje.puntoEncuentro}</div>
                  </td>
                  <td className="p-md">
                    <ChipDificultad dificultad={viaje.dificultad} />
                  </td>
                  <td className="p-md text-sm">{formatoFecha(viaje.fechaHoraIda)}</td>
                  <td className="p-md text-sm">
                    {viaje.cuposDisponibles} / {viaje.cuposMaximos}
                  </td>
                  <td className="p-md text-sm">{formatoCordobas(viaje.montoTotal)}</td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <span className={`text-xs font-bold ${viaje.estado === "activo" ? "text-success" : "text-admin-muted"}`}>
                        {viaje.estado === "activo" ? "Activo" : "Cerrado"}
                      </span>
                      <button
                        onClick={() => alternarEstado(viaje)}
                        disabled={ocupado === viaje.idViaje}
                        title={viaje.estado === "activo" ? "Cerrar viaje" : "Reactivar viaje"}
                        className="p-xs text-admin-muted hover:bg-admin-bg rounded-sm transition-colors disabled:opacity-50"
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex justify-end gap-xs">
                      <Link
                        href={`/admin/viajes/${viaje.idViaje}/campos`}
                        className="p-xs text-admin-accent hover:bg-admin-bg rounded-sm transition-colors inline-flex"
                        title="Preguntas del formulario"
                      >
                        <ListChecks size={16} />
                      </Link>
                      <button
                        onClick={() => abrirEditar(viaje)}
                        className="p-xs text-admin-accent hover:bg-admin-bg rounded-sm transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(viaje)}
                        disabled={ocupado === viaje.idViaje}
                        className="p-xs text-error hover:bg-estado-rechazada-bg rounded-sm transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar viaje */}
      <Modal
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        titulo={editandoId !== null ? "Editar Viaje" : "Crear Nuevo Viaje"}
        className="max-w-2xl p-lg"
      >
        <h3 className="text-xl font-bold mb-lg text-admin-text">
          {editandoId !== null ? "Editar Viaje" : "Crear Nuevo Viaje"}
        </h3>
        {cargandoDetalle ? (
          <div className="space-y-md">
            <Skeleton className="h-10 w-full rounded-sm" />
            <div className="grid grid-cols-2 gap-md">
              <Skeleton className="h-10 w-full rounded-sm" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <Skeleton className="h-24 w-full rounded-sm" />
          </div>
        ) : (
          <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="md:col-span-2">
              <Campo
                label="Título del viaje"
                required
                valor={form.titulo}
                alCambiar={(v) => setForm({ ...form, titulo: v })}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Descripción"
                multilinea
                valor={form.descripcion}
                alCambiar={(v) => setForm({ ...form, descripcion: v })}
              />
            </div>
            <Campo
              label="Dificultad"
              opciones={[...DIFICULTADES]}
              valor={form.dificultad}
              alCambiar={(v) => setForm({ ...form, dificultad: v as Dificultad })}
            />
            <Campo
              label="Punto de encuentro"
              required
              valor={form.puntoEncuentro}
              alCambiar={(v) => setForm({ ...form, puntoEncuentro: v })}
            />
            <Campo
              label="Fecha y hora de ida"
              tipo="datetime-local"
              required
              valor={form.fechaIdaLocal}
              alCambiar={(v) => setForm({ ...form, fechaIdaLocal: v })}
            />
            <Campo
              label="Fecha y hora de vuelta"
              tipo="datetime-local"
              required
              valor={form.fechaVueltaLocal}
              alCambiar={(v) => setForm({ ...form, fechaVueltaLocal: v })}
            />
            <Campo
              label="Monto total (C$)"
              tipo="number"
              required
              valor={form.montoTotal}
              alCambiar={(v) => setForm({ ...form, montoTotal: v })}
            />
            <Campo
              label="Monto de reserva (C$)"
              tipo="number"
              required
              hint="Abono por persona; debe ser menor o igual al monto total."
              valor={form.montoReserva}
              alCambiar={(v) => setForm({ ...form, montoReserva: v })}
            />
            <Campo
              label="Cupos máximos"
              tipo="number"
              required
              valor={form.cuposMaximos}
              alCambiar={(v) => setForm({ ...form, cuposMaximos: v })}
            />
            <Campo
              label="Enlace de WhatsApp"
              placeholder="https://chat.whatsapp.com/..."
              valor={form.enlaceWhatsApp}
              alCambiar={(v) => setForm({ ...form, enlaceWhatsApp: v })}
            />
            <div className="md:col-span-2">
              <Campo
                label="Imagen"
                placeholder="/Presentaciones/viajes/mombacho.jpg"
                hint="Ruta local del club o data-URI."
                valor={form.imagenUrl}
                alCambiar={(v) => setForm({ ...form, imagenUrl: v })}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Itinerario"
                multilinea
                hint="Una línea por paso."
                valor={form.itinerario}
                alCambiar={(v) => setForm({ ...form, itinerario: v })}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Inclusiones adicionales"
                multilinea
                hint="Una línea por inclusión."
                valor={form.inclusionesAdicionales}
                alCambiar={(v) => setForm({ ...form, inclusionesAdicionales: v })}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Equipo requerido"
                multilinea
                hint="Una línea por elemento."
                valor={form.equipo}
                alCambiar={(v) => setForm({ ...form, equipo: v })}
              />
            </div>
            {errorForm && (
              <p className="md:col-span-2 text-sm text-error" role="alert">
                {errorForm}
              </p>
            )}
            <div className="md:col-span-2 flex justify-end gap-sm">
              <Boton variante="contorno" onClick={cerrarModal}>
                Cancelar
              </Boton>
              <button
                type="submit"
                disabled={guardando}
                className="px-md py-xs bg-admin-accent text-white rounded-md hover:bg-admin-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
              >
                Guardar Viaje
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
