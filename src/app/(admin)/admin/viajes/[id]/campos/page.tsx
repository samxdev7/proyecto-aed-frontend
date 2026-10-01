"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { viajesService, opcionesDeCampo } from "@/services/viajes.service";
import { ApiError } from "@/lib/api-client";
import type { CampoFormulario, CrearCampoRequest, TipoCampoFormulario } from "@/types/viaje";
import {
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical,
  ListChecks,
  Edit2
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
  orden: string;
  obligatorio: boolean;
}

const FORM_VACIO: FormCampo = {
  etiquetaPregunta: "",
  tipoCampo: "texto",
  opciones: "",
  orden: "1",
  obligatorio: false,
};

export default function AdminCampoFormulario() {
  const params = useParams();
  const router = useRouter();
  const idViaje = Number(params.id);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  /* Modal crear/editar. */
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoCampo, setEditandoCampo] = useState<CampoFormulario | null>(null);
  const [form, setForm] = useState<FormCampo>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

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
    void cargarCampos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idViaje, reintentos]);

  function abrirCrear() {
    setEditandoCampo(null);
    setForm({ ...FORM_VACIO, orden: String(campos.length + 1) });
    setErrorForm("");
    setModalAbierto(true);
  }

  function abrirEditar(campo: CampoFormulario) {
    setEditandoCampo(campo);
    setForm({
      etiquetaPregunta: campo.etiquetaPregunta,
      tipoCampo: campo.tipoCampo,
      opciones: opcionesDeCampo(campo).join(", "),
      orden: String(campo.orden),
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
    const orden = Number(form.orden);
    if (!Number.isFinite(orden) || orden < 1) {
      setErrorForm("El orden debe ser un número mayor que cero.");
      return;
    }
    const request: CrearCampoRequest = {
      tipoCampo: form.tipoCampo,
      etiquetaPregunta: form.etiquetaPregunta.trim(),
      orden,
      obligatorio: form.obligatorio,
    };
    if (form.tipoCampo === "seleccion_unica" || form.tipoCampo === "seleccion_multiple") {
      const lista = form.opciones.split(",").map((opcion) => opcion.trim()).filter(Boolean);
      if (lista.length < 2) {
        setErrorForm("Ingresa al menos dos opciones separadas por coma.");
        return;
      }
      request.opcionesRespuesta = JSON.stringify(lista);
    }
    setGuardando(true);
    setErrorForm("");
    try {
      if (editandoCampo) {
        await viajesService.actualizarCampo(idViaje, editandoCampo.idCampo, request);
      } else {
        await viajesService.crearCampo(idViaje, request);
      }
      cerrarModal();
      await cargarCampos();
    } catch (e) {
      setErrorForm(mensajeDeError(e, "No se pudo guardar la pregunta."));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(campo: CampoFormulario) {
    if (!window.confirm(`¿Eliminar la pregunta "${campo.etiquetaPregunta}"?`)) return;
    try {
      await viajesService.eliminarCampo(idViaje, campo.idCampo);
      await cargarCampos();
    } catch (e) {
      setAviso(mensajeDeError(e, "No se pudo eliminar la pregunta."));
    }
  }

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md w-12"></th>
              <th className="p-md font-medium">Pregunta</th>
              <th className="p-md font-medium">Tipo</th>
              <th className="p-md font-medium">Opciones</th>
              <th className="p-md font-medium">Obligatoria</th>
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
            <h2 className="text-2xl font-bold text-admin-text">Preguntas Personalizadas</h2>
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

      {aviso && (
        <div role="status" className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm font-medium text-estado-rechazada-text">
          {aviso}
        </div>
      )}

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
                <th className="p-md w-12"></th>
                <th className="p-md font-medium">Pregunta</th>
                <th className="p-md font-medium">Tipo</th>
                <th className="p-md font-medium">Opciones</th>
                <th className="p-md font-medium">Obligatoria</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {campos.map((campo) => (
                <tr key={campo.idCampo} className="hover:bg-admin-bg transition-colors">
                  <td className="p-md text-admin-muted">
                    <div className="flex items-center">
                      <GripVertical size={16} />
                      <span className="text-xs ml-xs">{campo.orden}</span>
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
              ))}
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
          <div className="grid grid-cols-2 gap-md">
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
            <div className="space-y-xs">
              <label className="text-xs font-bold text-admin-muted uppercase">Orden</label>
              <input
                type="number"
                min={1}
                className={INPUT_CLASES}
                required
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: e.target.value })}
              />
            </div>
          </div>
          {(form.tipoCampo === "seleccion_unica" || form.tipoCampo === "seleccion_multiple") && (
            <div className="space-y-xs">
              <label className="text-xs font-bold text-admin-muted uppercase">Opciones</label>
              <input
                type="text"
                className={INPUT_CLASES}
                placeholder="Sí, No, Tal vez"
                value={form.opciones}
                onChange={(e) => setForm({ ...form, opciones: e.target.value })}
              />
              <p className="text-xs text-admin-muted">Separadas por coma. Mínimo dos.</p>
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
