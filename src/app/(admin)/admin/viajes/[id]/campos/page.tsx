"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  adminService,
  CampoFormulario,
  CrearCampoFormularioRequest,
  ActualizarCampoFormularioRequest,
} from "@/services/admin.service";
import type { TipoCampoFormulario } from "@/types/viaje";
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ListChecks,
  Pencil,
  X,
  FileText,
  Calendar,
  UploadCloud,
  CheckSquare,
  CircleDot,
  AlertCircle,
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

const TIPOS_CAMPO: Array<{
  valor: TipoCampoFormulario;
  etiqueta: string;
  descripcion: string;
  icono: React.ElementType;
}> = [
  {
    valor: "texto",
    etiqueta: "Texto Libre",
    descripcion: "Respuesta escrita breve o de párrafo (ej. observaciones o alergias)",
    icono: FileText,
  },
  {
    valor: "seleccion_unica",
    etiqueta: "Selección Única",
    descripcion: "El viajero elige una sola opción de una lista (ej. nivel de experiencia)",
    icono: CircleDot,
  },
  {
    valor: "seleccion_multiple",
    etiqueta: "Selección Múltiple",
    descripcion: "El viajero puede marcar varias opciones (ej. equipo propio)",
    icono: CheckSquare,
  },
  {
    valor: "fecha",
    etiqueta: "Fecha",
    descripcion: "Selector de calendario (ej. fecha de chequeo médico)",
    icono: Calendar,
  },
  {
    valor: "archivo",
    etiqueta: "Archivo / Adjunto",
    descripcion: "Carga de documento o certificado médico en PDF o imagen",
    icono: UploadCloud,
  },
];

export default function AdminCampoFormulario() {
  const params = useParams();
  const router = useRouter();
  const idViaje = Number(params.id);

  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estado del Modal de Creación / Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [etiquetaPregunta, setEtiquetaPregunta] = useState("");
  const [tipoCampo, setTipoCampo] = useState<TipoCampoFormulario>("texto");
  const [obligatorio, setObligatorio] = useState(false);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para confirmación de eliminación
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (idViaje) {
      adminService
        .listarCampos(idViaje)
        .then((data) => {
          setCampos(data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [idViaje]);

  const abrirModalCrear = () => {
    setEditingId(null);
    setEtiquetaPregunta("");
    setTipoCampo("texto");
    setObligatorio(false);
    setOpciones([]);
    setNuevaOpcion("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (campo: CampoFormulario) => {
    setEditingId(campo.idCampo);
    setEtiquetaPregunta(campo.etiquetaPregunta);
    setTipoCampo(campo.tipoCampo);
    setObligatorio(campo.obligatorio);
    setOpciones(campo.opciones ? [...campo.opciones] : []);
    setNuevaOpcion("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAgregarOpcion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const limpia = nuevaOpcion.trim();
    if (!limpia) return;
    if (opciones.includes(limpia)) {
      setFormError("La opción ya está en la lista.");
      return;
    }
    setOpciones((prev) => [...prev, limpia]);
    setNuevaOpcion("");
    setFormError(null);
  };

  const handleRemoverOpcion = (indexToRemove: number) => {
    setOpciones((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const etiquetaLimpia = etiquetaPregunta.trim();
    if (!etiquetaLimpia) {
      setFormError("La etiqueta de la pregunta es obligatoria.");
      return;
    }

    const requiereOpciones =
      tipoCampo === "seleccion_unica" || tipoCampo === "seleccion_multiple";
    if (requiereOpciones && opciones.length < 2) {
      setFormError("Debes definir al menos 2 opciones para campos de selección.");
      return;
    }

    setGuardando(true);
    try {
      if (editingId) {
        // Actualizar campo existente (D3)
        const updatePayload: ActualizarCampoFormularioRequest = {
          etiquetaPregunta: etiquetaLimpia,
          tipoCampo,
          obligatorio,
          opciones: requiereOpciones ? opciones : undefined,
        };
        const actualizado = await adminService.actualizarCampo(
          idViaje,
          editingId,
          updatePayload
        );
        setCampos((prev) =>
          prev.map((c) => (c.idCampo === editingId ? actualizado : c))
        );
      } else {
        // Crear nuevo campo (D2)
        const createPayload: CrearCampoFormularioRequest = {
          etiquetaPregunta: etiquetaLimpia,
          tipoCampo,
          obligatorio,
          orden: campos.length + 1,
          opciones: requiereOpciones ? opciones : undefined,
        };
        const nuevo = await adminService.crearCampo(idViaje, createPayload);
        setCampos((prev) => [...prev, nuevo]);
      }
      setIsModalOpen(false);
    } catch {
      setFormError("Ocurrió un error al guardar la pregunta.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (idCampo: number) => {
    try {
      await adminService.eliminarCampo(idViaje, idCampo);
      setCampos((prev) => prev.filter((c) => c.idCampo !== idCampo));
      setDeletingId(null);
    } catch {
      alert("Error al eliminar la pregunta.");
    }
  };

  const handleMover = async (index: number, direccion: "up" | "down") => {
    const nuevoIndice = direccion === "up" ? index - 1 : index + 1;
    if (nuevoIndice < 0 || nuevoIndice >= campos.length) return;

    const copia = [...campos];
    const [movido] = copia.splice(index, 1);
    copia.splice(nuevoIndice, 0, movido);

    setCampos(copia);
    await adminService.reordenarCampos(idViaje, copia);
  };

  const renderBadgeTipo = (tipo: TipoCampoFormulario) => {
    const meta = TIPOS_CAMPO.find((t) => t.valor === tipo);
    const Icono = meta?.icono || FileText;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-admin-bg text-admin-muted text-xs font-medium">
        <Icono size={13} className="text-admin-accent" />
        {meta?.etiqueta || tipo}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md w-12 text-center">#</th>
              <th className="p-md font-medium">Pregunta</th>
              <th className="p-md font-medium">Tipo</th>
              <th className="p-md font-medium">Opciones</th>
              <th className="p-md font-medium text-center">Obligatorio</th>
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
        descripcion="Ocurrió un error al obtener el formulario de este viaje. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: () => window.location.reload() }}
      />
    );
  }

  const requiereOpciones =
    tipoCampo === "seleccion_unica" || tipoCampo === "seleccion_multiple";

  return (
    <div className="space-y-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => router.push("/admin/viajes")}
            className="p-2 border border-admin-border rounded-md hover:bg-admin-bg transition-colors text-admin-muted hover:text-admin-text"
            title="Volver a viajes"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-admin-text">Preguntas Personalizadas</h2>
            <p className="text-sm text-admin-muted">
              Define los campos dinámicos requeridos por viajero para la expedición #{idViaje}.
            </p>
          </div>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-admin-accent text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-admin-accent-hover transition-colors text-sm font-semibold shadow-sm"
        >
          <Plus size={16} /> Agregar Pregunta
        </button>
      </div>

      {campos.length === 0 ? (
        <EmptyState
          icono={ListChecks}
          titulo="Sin preguntas personalizadas"
          descripcion="Este viaje no requiere información adicional de los participantes. Agrega la primera pregunta si necesitas relevar datos de salud, experiencia o equipo."
          accion={{
            etiqueta: "Agregar Pregunta",
            onClick: abrirModalCrear,
          }}
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md w-16 text-center">Orden</th>
                <th className="p-md font-medium">Pregunta</th>
                <th className="p-md font-medium">Tipo</th>
                <th className="p-md font-medium">Opciones configuradas</th>
                <th className="p-md font-medium text-center">Obligatoria</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {campos.map((campo, index) => (
                <tr key={campo.idCampo} className="hover:bg-admin-bg transition-colors">
                  <td className="p-md text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMover(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-admin-muted hover:text-admin-text disabled:opacity-20 transition-colors"
                        title="Mover arriba"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="text-xs font-mono font-bold text-admin-muted w-4 text-center">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handleMover(index, "down")}
                        disabled={index === campos.length - 1}
                        className="p-1 text-admin-muted hover:text-admin-text disabled:opacity-20 transition-colors"
                        title="Mover abajo"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-md text-sm font-medium text-admin-text max-w-xs break-words">
                    {campo.etiquetaPregunta}
                  </td>
                  <td className="p-md">{renderBadgeTipo(campo.tipoCampo)}</td>
                  <td className="p-md text-xs text-admin-muted">
                    {campo.opciones && campo.opciones.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {campo.opciones.map((op, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-surface-alt border border-neutral-border text-[11px]"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-admin-muted/60">No aplica</span>
                    )}
                  </td>
                  <td className="p-md text-center">
                    {campo.obligatorio ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">
                        OBLIGATORIA
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-admin-bg text-admin-muted">
                        Opcional
                      </span>
                    )}
                  </td>
                  <td className="p-md text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => abrirModalEditar(campo)}
                        className="p-2 text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                        title="Editar pregunta"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(campo.idCampo)}
                        className="p-2 text-error hover:bg-estado-rechazada-bg rounded-md transition-colors"
                        title="Eliminar pregunta"
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

      {/* Modal de Creación / Edición */}
      <Modal
        abierto={isModalOpen}
        onCerrar={() => setIsModalOpen(false)}
        titulo={editingId ? "Editar Pregunta" : "Nueva Pregunta Personalizada"}
        className="max-w-xl p-6"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-admin-border pb-3">
            <div>
              <h3 className="text-xl font-bold text-admin-text">
                {editingId ? "Editar Pregunta" : "Nueva Pregunta Personalizada"}
              </h3>
              <p className="text-xs text-admin-muted">
                Configura cómo y qué debe responder cada viajero al inscribirse.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-admin-muted hover:text-admin-text p-1"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 bg-error/10 border border-error/30 text-error text-xs rounded-md"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase">
                Etiqueta / Pregunta <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={etiquetaPregunta}
                onChange={(e) => setEtiquetaPregunta(e.target.value)}
                placeholder="Ej. ¿Tienes alergias alimentarias o médicas?"
                className="w-full p-2.5 border border-admin-border rounded-md text-sm outline-none focus:ring-2 focus:ring-admin-accent bg-admin-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted uppercase">
                  Tipo de Campo <span className="text-error">*</span>
                </label>
                <select
                  value={tipoCampo}
                  onChange={(e) => {
                    const nuevo = e.target.value as TipoCampoFormulario;
                    setTipoCampo(nuevo);
                    if (
                      (nuevo === "seleccion_unica" || nuevo === "seleccion_multiple") &&
                      opciones.length === 0
                    ) {
                      setOpciones(["Opción 1", "Opción 2"]);
                    }
                  }}
                  className="w-full p-2.5 border border-admin-border rounded-md text-sm outline-none focus:ring-2 focus:ring-admin-accent bg-admin-surface"
                >
                  {TIPOS_CAMPO.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="campo-obligatorio"
                  checked={obligatorio}
                  onChange={(e) => setObligatorio(e.target.checked)}
                  className="h-4 w-4 accent-admin-accent rounded"
                />
                <label
                  htmlFor="campo-obligatorio"
                  className="text-sm font-medium text-admin-text cursor-pointer select-none"
                >
                  Respuesta obligatoria
                </label>
              </div>
            </div>

            <p className="text-xs text-admin-muted italic">
              {TIPOS_CAMPO.find((t) => t.valor === tipoCampo)?.descripcion}
            </p>

            {/* Administrador de opciones para seleccion_unica o seleccion_multiple */}
            {requiereOpciones && (
              <div className="space-y-2 border-t border-admin-border pt-3">
                <label className="text-xs font-bold text-admin-muted uppercase flex justify-between items-center">
                  <span>Opciones de Respuesta (mínimo 2)</span>
                  <span className="text-[11px] font-normal text-admin-muted">
                    {opciones.length} configuradas
                  </span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaOpcion}
                    onChange={(e) => setNuevaOpcion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAgregarOpcion();
                      }
                    }}
                    placeholder="Escribe una opción y presiona Añadir"
                    className="flex-1 p-2 border border-admin-border rounded-md text-sm outline-none focus:ring-1 focus:ring-admin-accent bg-admin-surface"
                  />
                  <button
                    type="button"
                    onClick={() => handleAgregarOpcion()}
                    className="px-3 py-2 bg-admin-bg border border-admin-border rounded-md text-xs font-semibold text-admin-text hover:bg-neutral-border transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[36px]">
                  {opciones.map((op, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sand/30 border border-ochre/30 text-xs text-navy font-medium"
                    >
                      {op}
                      <button
                        type="button"
                        onClick={() => handleRemoverOpcion(i)}
                        className="text-text-muted hover:text-error transition-colors"
                        title="Quitar opción"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-admin-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-admin-muted hover:bg-admin-bg rounded-md transition-colors"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 bg-admin-accent text-white rounded-md hover:bg-admin-accent-hover transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                {guardando ? "Guardando..." : editingId ? "Actualizar Pregunta" : "Guardar Pregunta"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        abierto={deletingId !== null}
        onCerrar={() => setDeletingId(null)}
        titulo="Eliminar Pregunta"
        className="max-w-md p-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-error">
            <Trash2 size={24} />
            <h3 className="text-lg font-bold text-admin-text">¿Eliminar esta pregunta?</h3>
          </div>
          <p className="text-sm text-admin-muted">
            Esta pregunta ya no se solicitará a futuros participantes de la expedición #{idViaje}.
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-admin-border">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-sm text-admin-muted hover:bg-admin-bg rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => deletingId && handleEliminar(deletingId)}
              className="px-4 py-2 bg-error text-white text-sm font-semibold rounded-md hover:bg-error/90 transition-colors"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
