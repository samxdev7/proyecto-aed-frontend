"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { viajesService, opcionesDeCampo } from "@/services/viajes.service";
import { ApiError } from "@/lib/api-client";
import { useMensajes } from "@/contexts/MensajesContext";
import type { CampoFormulario, CrearCampoRequest, TipoCampoFormulario } from "@/types/viaje";
import {
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical,
  ListChecks,
  Edit2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

const ETIQUETAS_TIPO: Record<TipoCampoFormulario, string> = {
  texto: "Texto libre",
  seleccion_unica: "Opción única",
  seleccion_multiple: "Opción múltiple",
  fecha: "Fecha",
  archivo: "Archivo",
};

const INPUT_CLASES =
  "w-full p-sm border border-admin-border rounded-sm outline-none focus:ring-1 focus:ring-admin-accent text-sm";

/** Mensaje del backend (ApiError) o un texto por defecto genérico. */
function mensajeDeError(e: unknown, porDefecto: string): string {
  return e instanceof ApiError && e.message ? e.message : porDefecto;
}

/* Formulario como strings; se convierte a CrearCampoRequest al guardar. */
interface FormCampo {
  etiquetaPregunta: string;
  tipoCampo: TipoCampoFormulario;
  opciones: string;
  obligatorio: boolean;
}

const FORM_VACIO: FormCampo = {
  etiquetaPregunta: "",
  tipoCampo: "texto",
  opciones: "",
  obligatorio: false,
};

export default function AdminCampoFormulario() {
  const params = useParams();
  const router = useRouter();
  const { mostrarExito, mostrarError } = useMensajes();
  const idViaje = Number(params.id);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);
  /* Modal crear/editar. */
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoCampo, setEditandoCampo] = useState<CampoFormulario | null>(null);
  const [form, setForm] = useState<FormCampo>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  /* Drag and drop & reordenamiento con flechas. */
  const [reordenando, setReordenando] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function cargarCampos() {
    setLoading(true);
    setError(false);
    try {
      const data = await viajesService.listarCampos(idViaje);
      setCampos([...data].sort((a, b) => a.orden - b.orden));
    } catch (e) {
      setMensaje(mensajeDeError(e, "Ocurrió un error al obtener el formulario. Inténtalo de nuevo."));
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(idViaje)) return;
    let activo = true;
    viajesService
      .listarCampos(idViaje)
      .then((data) => {
        if (!activo) return;
        setCampos([...data].sort((a, b) => a.orden - b.orden));
        setLoading(false);
      })
      .catch((e) => {
        if (!activo) return;
        setMensaje(mensajeDeError(e, "Ocurrió un error al obtener el formulario. Inténtalo de nuevo."));
        setError(true);
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [idViaje, reintentos]);

  function abrirCrear() {
    setEditandoCampo(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setModalAbierto(true);
  }

  function abrirEditar(campo: CampoFormulario) {
    setEditandoCampo(campo);
    setForm({
      etiquetaPregunta: campo.etiquetaPregunta,
      tipoCampo: campo.tipoCampo,
      opciones: opcionesDeCampo(campo).join("\n"),
      obligatorio: campo.obligatorio,
    });
    setErrorForm("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoCampo(null);
    setErrorForm("");
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    const orden = editandoCampo ? editandoCampo.orden : campos.length + 1;
    const request: CrearCampoRequest = {
      tipoCampo: form.tipoCampo,
      etiquetaPregunta: form.etiquetaPregunta.trim(),
      orden,
      obligatorio: form.obligatorio,
    };
    if (form.tipoCampo === "seleccion_unica" || form.tipoCampo === "seleccion_multiple") {
      const lineas = form.opciones.split("\n").map((opcion) => opcion.trim()).filter(Boolean);
      // Soporte retrocompatible si se pegan opciones separadas por coma en una línea
      const lista =
        lineas.length === 1 && lineas[0].includes(",")
          ? lineas[0].split(",").map((opcion) => opcion.trim()).filter(Boolean)
          : lineas;

      if (lista.length < 2) {
        setErrorForm("Ingresa al menos dos opciones (una por línea).");
        return;
      }
      request.opcionesRespuesta = JSON.stringify(lista);
    }
    setGuardando(true);
    setErrorForm("");
    try {
      if (editandoCampo) {
        await viajesService.actualizarCampo(idViaje, editandoCampo.idCampo, request);
        mostrarExito("Pregunta modificada", "Los cambios de la pregunta se guardaron correctamente.");
      } else {
        await viajesService.crearCampo(idViaje, request);
        mostrarExito("Pregunta creada", "La pregunta fue agregada exitosamente al formulario.");
      }
      cerrarModal();
      await cargarCampos();
    } catch (e) {
      setErrorForm(mensajeDeError(e, "No se pudo guardar la pregunta."));
    } finally {
      setGuardando(false);
    }
  }

  async function aplicarNuevoOrden(nuevaLista: CampoFormulario[]) {
    const listaConNuevoOrden = nuevaLista.map((campo, index) => ({
      ...campo,
      orden: index + 1,
    }));

    const camposAnteriores = campos;
    setCampos(listaConNuevoOrden);

    const camposCambiados = listaConNuevoOrden.filter((campo) => {
      const original = camposAnteriores.find((c) => c.idCampo === campo.idCampo);
      return !original || original.orden !== campo.orden;
    });

    if (camposCambiados.length === 0) return;

    setReordenando(true);
    try {
      await Promise.all(
        camposCambiados.map((campo) => {
          const req: CrearCampoRequest = {
            tipoCampo: campo.tipoCampo,
            etiquetaPregunta: campo.etiquetaPregunta,
            opcionesRespuesta: campo.opcionesRespuesta ?? undefined,
            orden: campo.orden,
            obligatorio: campo.obligatorio,
          };
          return viajesService.actualizarCampo(idViaje, campo.idCampo, req);
        })
      );
    } catch (e) {
      setCampos(camposAnteriores);
      mostrarError("Error al ordenar preguntas", mensajeDeError(e, "No se pudo actualizar el orden de las preguntas."));
    } finally {
      setReordenando(false);
    }
  }

  function moverArriba(index: number) {
    if (index <= 0 || reordenando) return;
    const nuevaLista = [...campos];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index - 1];
    nuevaLista[index - 1] = temp;
    aplicarNuevoOrden(nuevaLista);
  }

  function moverAbajo(index: number) {
    if (index >= campos.length - 1 || reordenando) return;
    const nuevaLista = [...campos];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index + 1];
    nuevaLista[index + 1] = temp;
    aplicarNuevoOrden(nuevaLista);
  }

  function handleDragStart(e: React.DragEvent<HTMLTableRowElement>, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent<HTMLTableRowElement>, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const nuevaLista = [...campos];
    const [elementoRemovido] = nuevaLista.splice(draggedIndex, 1);
    nuevaLista.splice(targetIndex, 0, elementoRemovido);

    setDraggedIndex(null);
    setDragOverIndex(null);
    aplicarNuevoOrden(nuevaLista);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  async function eliminar(campo: CampoFormulario) {
    if (!window.confirm(`¿Eliminar la pregunta "${campo.etiquetaPregunta}"?`)) return;
    try {
      await viajesService.eliminarCampo(idViaje, campo.idCampo);
      mostrarExito("Pregunta eliminada", `La pregunta "${campo.etiquetaPregunta}" fue eliminada.`);
      await cargarCampos();
    } catch (e) {
      mostrarError("Error al eliminar", mensajeDeError(e, "No se pudo eliminar la pregunta."));
    }
  }

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md w-28 font-medium">Orden</th>
              <th className="p-md font-medium">Pregunta</th>
              <th className="p-md font-medium">Tipo</th>
              <th className="p-md font-medium">Opciones</th>
              <th className="p-md font-medium text-center">Obligatoria</th>
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
        titulo="No pudimos cargar las preguntas"
        descripcion={mensaje}
        accion={{ etiqueta: "Reintentar", onClick: () => setReintentos((n) => n + 1) }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => router.back()}
            className="p-xs border border-admin-border rounded-sm hover:bg-admin-bg transition-colors"
            title="Volver"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="ml-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-admin-text">Preguntas Personalizadas</h2>
              {reordenando && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-admin-accent bg-admin-bg px-2 py-0.5 rounded-sm animate-pulse">
                  <Loader2 size={12} className="animate-spin" /> Guardando orden...
                </span>
              )}
            </div>
            <p className="text-sm text-admin-muted">Define la información adicional requerida para este viaje.</p>
          </div>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-admin-accent text-white px-sm py-xs rounded-sm flex items-center gap-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Agregar Pregunta
        </button>
      </div>

      {campos.length === 0 ? (
        <EmptyState
          icono={ListChecks}
          titulo="Sin preguntas personalizadas"
          descripcion="Este viaje no requiere información adicional. Agrega una pregunta si la necesitas."
          accion={{ etiqueta: "Agregar Pregunta", onClick: abrirCrear }}
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md w-28 font-medium">Orden</th>
                <th className="p-md font-medium">Pregunta</th>
                <th className="p-md font-medium">Tipo</th>
                <th className="p-md font-medium">Opciones</th>
                <th className="p-md font-medium text-center">Obligatoria</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {campos.map((campo, index) => {
                const esArrastrado = draggedIndex === index;
                const esSobreEl = dragOverIndex === index && draggedIndex !== index;

                return (
                  <tr
                    key={campo.idCampo}
                    draggable={!reordenando}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors ${
                      esArrastrado ? "opacity-30 bg-admin-bg" : "hover:bg-admin-bg"
                    } ${esSobreEl ? "border-t-2 border-admin-accent bg-admin-bg/50" : ""}`}
                  >
                    <td className="p-md text-admin-muted">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 text-admin-muted hover:text-admin-text transition-colors"
                          title="Arrastrar para reordenar"
                        >
                          <GripVertical size={16} />
                        </div>
                        <span className="text-xs font-semibold text-admin-text w-4 text-center">
                          {index + 1}
                        </span>
                        <div className="flex flex-col gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => moverArriba(index)}
                            disabled={index === 0 || reordenando}
                            className="p-0.5 text-admin-muted hover:text-admin-accent disabled:opacity-20 disabled:hover:text-admin-muted transition-colors rounded hover:bg-admin-border/40"
                            title="Mover pregunta arriba"
                            aria-label="Mover pregunta arriba"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moverAbajo(index)}
                            disabled={index === campos.length - 1 || reordenando}
                            className="p-0.5 text-admin-muted hover:text-admin-accent disabled:opacity-20 disabled:hover:text-admin-muted transition-colors rounded hover:bg-admin-border/40"
                            title="Mover pregunta abajo"
                            aria-label="Mover pregunta abajo"
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-md text-sm font-medium">{campo.etiquetaPregunta}</td>
                    <td className="p-md">
                      <span className="px-2 py-1 rounded-sm bg-admin-bg text-admin-muted text-xs font-medium">
                        {ETIQUETAS_TIPO[campo.tipoCampo]}
                      </span>
                    </td>
                    <td className="p-md text-sm text-admin-muted">
                      {opcionesDeCampo(campo).length > 0 ? opcionesDeCampo(campo).join(" · ") : "—"}
                    </td>
                    <td className="p-md text-center">
                      {campo.obligatorio ? (
                        <span className="text-error text-xs font-bold">SÍ</span>
                      ) : (
                        <span className="text-admin-muted text-xs font-bold">NO</span>
                      )}
                    </td>
                    <td className="p-md text-right">
                      <div className="flex justify-end gap-xs">
                        <button
                          onClick={() => abrirEditar(campo)}
                          className="p-xs text-admin-accent hover:bg-admin-bg rounded-sm transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(campo)}
                          className="p-xs text-error hover:bg-estado-rechazada-bg rounded-sm transition-colors"
                          title="Eliminar"
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

      {/* Modal crear/editar pregunta */}
      <Modal
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        titulo={editandoCampo ? "Editar Pregunta" : "Nueva Pregunta"}
        className="max-w-lg p-lg"
      >
        <h3 className="text-xl font-bold mb-lg text-admin-text">
          {editandoCampo ? "Editar Pregunta" : "Nueva Pregunta"}
        </h3>
        <form onSubmit={guardar} className="space-y-md">
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Pregunta (máx. 100)</label>
            <input
              type="text"
              className={INPUT_CLASES}
              maxLength={100}
              required
              value={form.etiquetaPregunta}
              onChange={(e) => setForm({ ...form, etiquetaPregunta: e.target.value })}
            />
          </div>
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Tipo de respuesta</label>
            <select
              className={INPUT_CLASES}
              value={form.tipoCampo}
              onChange={(e) => setForm({ ...form, tipoCampo: e.target.value as TipoCampoFormulario })}
            >
              {Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </div>
          {(form.tipoCampo === "seleccion_unica" || form.tipoCampo === "seleccion_multiple") && (
            <div className="space-y-xs">
              <label className="text-xs font-bold text-admin-muted uppercase">Opciones</label>
              <textarea
                rows={4}
                className={INPUT_CLASES + " resize-y font-normal"}
                placeholder={`Opción 1\nOpción 2 con comas o detalles\nOpción 3`}
                value={form.opciones}
                onChange={(e) => setForm({ ...form, opciones: e.target.value })}
              />
              <p className="text-xs text-admin-muted">
                Ingresa una opción por línea (Enter para nueva opción). Mínimo dos opciones requeridas.
              </p>
            </div>
          )}
          <div className="flex items-center gap-xs">
            <input
              type="checkbox"
              id="obligatoria"
              className="accent-admin-accent"
              checked={form.obligatorio}
              onChange={(e) => setForm({ ...form, obligatorio: e.target.checked })}
            />
            <label htmlFor="obligatoria" className="text-sm font-medium text-admin-muted">
              Obligatoria
            </label>
          </div>
          {errorForm && (
            <p className="text-sm text-error" role="alert">
              {errorForm}
            </p>
          )}
          <div className="flex justify-end gap-sm">
            <button
              type="button"
              onClick={cerrarModal}
              className="px-md py-xs text-admin-muted hover:bg-admin-bg rounded-sm transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-md py-xs bg-admin-accent text-white rounded-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
            >
              Guardar Pregunta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
