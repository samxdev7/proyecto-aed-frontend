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
  Archive,
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
import SelectorFechaHora from "@/components/ui/SelectorFechaHora";
import { ChipDificultad } from "@/components/ui/Chip";
import GaleriaSupabaseModal from "@/components/admin/GaleriaSupabaseModal";
import ModalViajesArchivados from "@/components/admin/ModalViajesArchivados";

const DIFICULTADES = ["Baja", "Media", "Alta", "Extrema"] as const;

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

const DRAFT_KEY_CREAR = "cnm_admin_viaje_draft_crear";
const getDraftKeyEditar = (id: number) => `cnm_admin_viaje_draft_editar_${id}`;

function guardarBorradorEnStorage(id: number | null, datos: FormViaje) {
  if (typeof window === "undefined") return;
  try {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch {
    // Ignorar restricciones de almacenamiento
  }
}

function cargarBorradorDeStorage(id: number | null): FormViaje | null {
  if (typeof window === "undefined") return null;
  try {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function eliminarBorradorDeStorage(id: number | null) {
  if (typeof window === "undefined") return;
  try {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    localStorage.removeItem(clave);
  } catch {
    // Ignorar
  }
}

/** Mensaje del backend (ApiError) o un texto por defecto genérico. */
function mensajeDeError(e: unknown, porDefecto: string): string {
  if (e instanceof ApiError && e.message) {
    const msg = e.message;
    // Ocultar detalles técnicos internos de base de datos o SQL al administrador
    if (
      /could not execute statement|character varying|SQL \[|Hibernate|PSQLException|syntax error|constraint|org\.hibernate|column .* does not exist/i.test(
        msg
      )
    ) {
      return "No se pudo guardar la información del viaje con los datos proporcionados. Por favor revisa que los campos sean válidos e intenta nuevamente.";
    }
    return msg;
  }
  return porDefecto;
}

/** ISO → valor de <input type="datetime-local"> en la zona del navegador. */
function aValorLocal(iso: string): string {
  const fecha = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

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
  /* Modal de galeria de Supabase Storage para portada. */
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  /* Modal de viajes archivados. */
  const [modalArchivadosAbierto, setModalArchivadosAbierto] = useState(false);
  /* id del viaje con una mutación de fila en curso (toggle/archivar). */
  const [ocupado, setOcupado] = useState<number | null>(null);
  /** Errores por campo para validación inline. */
  const [erroresCampo, setErroresCampo] = useState<Partial<Record<keyof FormViaje, string>>>({});
  /** Campos que el usuario ya tocó (para mostrar error al desenfocar). */
  const [tocados, setTocados] = useState<Partial<Record<keyof FormViaje, boolean>>>({});

  async function cargarViajes() {
    setLoading(true);
    setError(false);
    try {
      const respuesta = await viajesService.listarViajesNoArchivados();
      setViajes(respuesta);
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
      .listarViajesNoArchivados()
      .then((respuesta) => {
        if (!activo) return;
        setViajes(respuesta);
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
    const borrador = cargarBorradorDeStorage(null);
    if (borrador) {
      setForm(borrador);
    } else {
      setForm(FORM_VACIO);
    }
    setErrorForm("");
    setErroresCampo({});
    setTocados({});
    setCargandoDetalle(false);
    setModalAbierto(true);
  }

  async function abrirEditar(viaje: Viaje) {
    setEditandoId(viaje.idViaje);
    const borrador = cargarBorradorDeStorage(viaje.idViaje);
    if (borrador) {
      setForm(borrador);
      setErrorForm("");
      setErroresCampo({});
      setTocados({});
      setCargandoDetalle(false);
      setModalAbierto(true);
      return;
    }

    setForm(FORM_VACIO);
    setErrorForm("");
    setErroresCampo({});
    setTocados({});
    setCargandoDetalle(true);
    setModalAbierto(true);
    try {
      const detalle = await viajesService.obtenerViaje(viaje.idViaje);
      if (!detalle) {
        setErrorForm("No pudimos cargar los datos del viaje.");
        return;
      }
      const nuevoForm: FormViaje = {
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
      };
      setForm(nuevoForm);
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
    setErroresCampo({});
    setTocados({});
  }

  function limpiarCampos() {
    setForm(FORM_VACIO);
    setErroresCampo({});
    setTocados({});
    setErrorForm("");
    eliminarBorradorDeStorage(editandoId);
  }

  /** Valida un campo individual y actualiza erroresCampo. Devuelve el mensaje o "". */
  function validarCampo(nombre: keyof FormViaje, valor: string, formActual = form): string {
    switch (nombre) {
      case "titulo": {
        const t = valor.trim();
        if (!t) return "El título es obligatorio.";
        if (t.length > 200) return "El título no puede superar los 200 caracteres.";
        return "";
      }
      case "puntoEncuentro": {
        const p = valor.trim();
        if (!p) return "El punto de encuentro es obligatorio.";
        if (p.length > 500) return "El punto de encuentro no puede superar los 500 caracteres.";
        return "";
      }
      case "fechaIdaLocal": {
        if (!valor) return "La fecha de ida es obligatoria.";
        const fechaIda = new Date(valor);
        const ahora = new Date();
        ahora.setSeconds(0, 0);
        // 60 segundos de tolerancia
        if (fechaIda.getTime() < ahora.getTime() - 60000) {
          return "La fecha de ida no puede ser en el pasado.";
        }
        return "";
      }
      case "fechaVueltaLocal": {
        if (!valor) return "La fecha de vuelta es obligatoria.";
        const fechaVuelta = new Date(valor);
        const ahora = new Date();
        ahora.setSeconds(0, 0);
        if (fechaVuelta.getTime() < ahora.getTime() - 60000) {
          return "La fecha de vuelta no puede ser en el pasado.";
        }
        if (formActual.fechaIdaLocal && fechaVuelta <= new Date(formActual.fechaIdaLocal)) {
          return "La vuelta debe ser posterior a la ida.";
        }
        return "";
      }
      case "montoTotal":
        if (!valor) return "El monto total es obligatorio.";
        if (Number(valor) <= 0) return "Debe ser un valor mayor a 0.";
        return "";
      case "montoReserva": {
        if (!valor) return "El monto de reserva es obligatorio.";
        const r = Number(valor);
        if (r <= 0) return "Debe ser un valor mayor a 0.";
        if (formActual.montoTotal && r > Number(formActual.montoTotal)) {
          return "El monto de reserva no puede ser mayor al monto total.";
        }
        return "";
      }
      case "cuposMaximos": {
        if (!valor) return "Los cupos son obligatorios.";
        const n = Number(valor);
        if (!Number.isInteger(n) || n < 1)
          return "Debe ser un número entero positivo (mínimo 1).";
        return "";
      }
      default:
        return "";
    }
  }

  function tocar(nombre: keyof FormViaje) {
    setTocados((prev) => ({ ...prev, [nombre]: true }));
    const err = validarCampo(nombre, form[nombre]);
    setErroresCampo((prev) => ({ ...prev, [nombre]: err }));
  }

  function cambiarCampo(nombre: keyof FormViaje, valor: string) {
    const nuevoForm = { ...form, [nombre]: valor };
    setForm(nuevoForm);
    guardarBorradorEnStorage(editandoId, nuevoForm);
    // Actualizar error solo si el campo ya fue tocado.
    if (tocados[nombre]) {
      const err = validarCampo(nombre, valor, nuevoForm);
      setErroresCampo((prev) => ({ ...prev, [nombre]: err }));
    }
    if (nombre === "fechaIdaLocal" && tocados.fechaVueltaLocal) {
      const errVuelta = validarCampo("fechaVueltaLocal", nuevoForm.fechaVueltaLocal, nuevoForm);
      setErroresCampo((prev) => ({ ...prev, fechaVueltaLocal: errVuelta }));
    }
    if (nombre === "montoTotal" && tocados.montoReserva) {
      const errReserva = validarCampo("montoReserva", nuevoForm.montoReserva, nuevoForm);
      setErroresCampo((prev) => ({ ...prev, montoReserva: errReserva }));
    }
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    // Marcar todos los campos requeridos como tocados y validar.
    const camposRequeridos: (keyof FormViaje)[] = [
      "titulo", "puntoEncuentro", "fechaIdaLocal", "fechaVueltaLocal",
      "montoTotal", "montoReserva", "cuposMaximos",
    ];
    const nuevosErrores: Partial<Record<keyof FormViaje, string>> = {};
    for (const campo of camposRequeridos) {
      const err = validarCampo(campo, form[campo]);
      if (err) nuevosErrores[campo] = err;
    }
    setErroresCampo(nuevosErrores);
    setTocados(Object.fromEntries(camposRequeridos.map((c) => [c, true])));
    if (Object.keys(nuevosErrores).length > 0) {
      setErrorForm("Corrige los errores marcados en el formulario.");
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
        eliminarBorradorDeStorage(editandoId);
      } else {
        await viajesService.crearViaje(request);
        setAviso({ tipo: "ok", texto: `Viaje "${request.titulo}" creado.` });
        eliminarBorradorDeStorage(null);
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

  async function archivar(viaje: Viaje) {
    if (viaje.estado !== "cerrado") {
      setAviso({
        tipo: "error",
        texto: "Para archivar un viaje, su estado debe ser 'cerrado'. Ciérralo primero antes de archivar.",
      });
      return;
    }
    if (
      !window.confirm(
        `¿Deseas archivar el viaje "${viaje.titulo}"? Podrás consultarlo y desarchivarlo en cualquier momento desde la sección de Viajes Archivados.`
      )
    ) {
      return;
    }
    setOcupado(viaje.idViaje);
    try {
      await viajesService.archivarViaje(viaje.idViaje);
      setAviso({ tipo: "ok", texto: `Viaje "${viaje.titulo}" archivado correctamente.` });
      await cargarViajes();
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeDeError(e, "No se pudo archivar el viaje.") });
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
        <div className="flex items-center gap-sm">
          <button
            onClick={() => setModalArchivadosAbierto(true)}
            className="border border-admin-border bg-admin-surface text-admin-text px-sm py-xs rounded-md flex items-center gap-sm hover:bg-admin-bg transition-colors text-sm font-medium"
            title="Ver y restaurar viajes archivados"
          >
            <Archive size={18} className="text-admin-muted" />
            Viajes Archivados
          </button>
          <button
            onClick={abrirCrear}
            className="bg-admin-accent text-white px-sm py-xs rounded-md flex items-center gap-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Nuevo Viaje
          </button>
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
                        onClick={() => archivar(viaje)}
                        disabled={ocupado === viaje.idViaje || viaje.estado !== "cerrado"}
                        className={`p-xs rounded-sm transition-colors ${
                          viaje.estado === "cerrado"
                            ? "text-admin-muted hover:text-admin-accent hover:bg-admin-bg cursor-pointer"
                            : "text-neutral-border opacity-40 cursor-not-allowed"
                        }`}
                        title={
                          viaje.estado === "cerrado"
                            ? "Archivar viaje"
                            : "Solo los viajes con estado 'Cerrado' pueden archivarse"
                        }
                      >
                        <Archive size={16} />
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
        <div className="flex items-center justify-between flex-wrap gap-2 mb-lg">
          <h3 className="text-xl font-bold text-admin-text">
            {editandoId !== null ? "Editar Viaje" : "Crear Nuevo Viaje"}
          </h3>
          {editandoId !== null ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Modificación en curso
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Creación en proceso
            </span>
          )}
        </div>
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
          <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-2 gap-md" noValidate>
            <div className="md:col-span-2">
              <Campo
                label="Título del viaje"
                required
                valor={form.titulo}
                alCambiar={(v) => cambiarCampo("titulo", v)}
                error={erroresCampo.titulo}
                onBlur={() => tocar("titulo")}
                inputProps={{ maxLength: 200 }}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Descripción"
                multilinea
                valor={form.descripcion}
                alCambiar={(v) => cambiarCampo("descripcion", v)}
              />
            </div>
            <Campo
              label="Dificultad"
              opciones={[...DIFICULTADES]}
              valor={form.dificultad}
              alCambiar={(v) => cambiarCampo("dificultad", v as Dificultad)}
            />
            <Campo
              label="Punto de encuentro"
              required
              valor={form.puntoEncuentro}
              alCambiar={(v) => cambiarCampo("puntoEncuentro", v)}
              error={erroresCampo.puntoEncuentro}
              onBlur={() => tocar("puntoEncuentro")}
              inputProps={{ maxLength: 500 }}
            />
            <SelectorFechaHora
              label="Fecha y hora de ida"
              required
              valor={form.fechaIdaLocal}
              alCambiar={(v) => cambiarCampo("fechaIdaLocal", v)}
              min={aValorLocal(new Date().toISOString())}
              error={erroresCampo.fechaIdaLocal}
              onBlur={() => tocar("fechaIdaLocal")}
            />
            <SelectorFechaHora
              label="Fecha y hora de vuelta"
              required
              valor={form.fechaVueltaLocal}
              alCambiar={(v) => cambiarCampo("fechaVueltaLocal", v)}
              min={form.fechaIdaLocal || aValorLocal(new Date().toISOString())}
              error={erroresCampo.fechaVueltaLocal}
              onBlur={() => tocar("fechaVueltaLocal")}
            />
            <Campo
              label="Monto total (C$)"
              tipo="number"
              required
              valor={form.montoTotal}
              alCambiar={(v) => cambiarCampo("montoTotal", v)}
              error={erroresCampo.montoTotal}
              onBlur={() => tocar("montoTotal")}
            />
            <Campo
              label="Monto de reserva (C$)"
              tipo="number"
              required
              hint="Abono por persona; debe ser menor o igual al monto total."
              valor={form.montoReserva}
              alCambiar={(v) => cambiarCampo("montoReserva", v)}
              error={erroresCampo.montoReserva}
              onBlur={() => tocar("montoReserva")}
            />
            <Campo
              label="Cupos máximos"
              tipo="number"
              required
              valor={form.cuposMaximos}
              alCambiar={(v) => {
                // Solo permitir dígitos enteros positivos (sin punto decimal).
                if (v === "" || /^[1-9]\d*$/.test(v)) cambiarCampo("cuposMaximos", v);
              }}
              error={erroresCampo.cuposMaximos}
              onBlur={() => tocar("cuposMaximos")}
              inputProps={{
                min: 1,
                step: 1,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  // Bloquear '.', ',', '-', '+', 'e', 'E'
                  if (["-", "+", ".", ",", "e", "E"].includes(e.key)) e.preventDefault();
                },
              }}
            />
            <Campo
              label="Enlace de WhatsApp"
              placeholder="https://chat.whatsapp.com/..."
              valor={form.enlaceWhatsApp}
              alCambiar={(v) => cambiarCampo("enlaceWhatsApp", v)}
            />
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-muted">
                  Foto de Portada del Viaje
                </label>
              </div>

              {/* Widget visual de portada con integracion a Supabase Storage */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-lg border border-admin-border bg-admin-bg p-3">
                {form.imagenUrl ? (
                  <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-md border border-admin-border bg-white shadow-xs">
                    <Image
                      src={form.imagenUrl}
                      alt="Portada del viaje"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-44 shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-admin-border bg-white text-admin-muted">
                    <ImageIcon className="h-8 w-8 mb-1 text-admin-muted/40" />
                    <span className="text-[11px]">Sin portada</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-1 w-full">
                  <div>
                    <p className="text-xs font-semibold text-admin-text">
                      {form.imagenUrl ? "Imagen seleccionada" : "Selecciona o sube una imagen de portada"}
                    </p>
                    <p className="text-[11px] text-admin-muted mt-0.5 line-clamp-2 break-all">
                      {form.imagenUrl ? "" : "Explora las carpetas de imágenes o sube una nueva imagen."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setGaleriaAbierta(true)}
                      className="flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-admin-accent-hover transition-colors"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{form.imagenUrl ? "Cambiar desde Galería" : "Elegir desde Galería"}</span>
                    </button>

                    {form.imagenUrl && (
                      <button
                        type="button"
                        onClick={() => cambiarCampo("imagenUrl", "")}
                        className="rounded-md border border-admin-border bg-white px-3 py-1.5 text-xs font-medium text-error hover:bg-estado-rechazada-bg transition-colors"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Itinerario"
                multilinea
                hint="Una línea por paso."
                valor={form.itinerario}
                alCambiar={(v) => cambiarCampo("itinerario", v)}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Inclusiones adicionales"
                multilinea
                hint="Una línea por inclusión."
                valor={form.inclusionesAdicionales}
                alCambiar={(v) => cambiarCampo("inclusionesAdicionales", v)}
              />
            </div>
            <div className="md:col-span-2">
              <Campo
                label="Equipo requerido"
                multilinea
                hint="Una línea por elemento."
                valor={form.equipo}
                alCambiar={(v) => cambiarCampo("equipo", v)}
              />
            </div>
            {errorForm && (
              <p className="md:col-span-2 text-sm text-error" role="alert">
                {errorForm}
              </p>
            )}
            <div className="md:col-span-2 flex justify-end items-center gap-sm pt-2">
              <button
                type="button"
                onClick={limpiarCampos}
                className="px-md py-xs border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-bg rounded-md transition-colors text-sm font-medium"
                title="Vaciar los campos del formulario y borrar el borrador"
              >
                Limpiar campos
              </button>
              <Boton variante="contorno" onClick={cerrarModal}>
                Cancelar
              </Boton>
              <button
                type="submit"
                disabled={guardando}
                className="px-md py-xs bg-admin-accent text-white rounded-md hover:bg-admin-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar Viaje"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <GaleriaSupabaseModal
        abierto={galeriaAbierta}
        onCerrar={() => setGaleriaAbierta(false)}
        imagenSeleccionadaActual={form.imagenUrl}
        onSeleccionarImagen={(urlPublica) => {
          cambiarCampo("imagenUrl", urlPublica);
        }}
      />

      <ModalViajesArchivados
        abierto={modalArchivadosAbierto}
        onCerrar={() => setModalArchivadosAbierto(false)}
        onViajeDesarchivado={cargarViajes}
      />
    </div>
  );
}
