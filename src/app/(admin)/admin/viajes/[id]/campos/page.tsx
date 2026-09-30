"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService, CampoFormulario } from "@/services/admin.service";
import {
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical,
  ListChecks
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

export default function AdminCampoFormulario() {
  const params = useParams();
  const router = useRouter();
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState<Partial<CampoFormulario> | null>(null);

  useEffect(() => {
    if (params.id) {
      adminService
        .listarCampos(Number(params.id))
        .then((data) => {
          setCampos(data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for save/update
    setIsModalOpen(false);
    setEditingCampo(null);
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
            <tr>
              <th className="p-md w-12"></th>
              <th className="p-md font-medium">Pregunta</th>
              <th className="p-md font-medium">Tipo</th>
              <th className="p-md font-medium">Obligatorio</th>
              <th className="p-md font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <FilaTablaSkeleton columnas={5} />
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar las preguntas"
        descripcion="Ocurrió un error al obtener el formulario. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => router.back()}
            className="p-xs border border-admin-border rounded-sm hover:bg-admin-bg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="ml-sm">
            <h2 className="text-2xl font-bold text-admin-text">Preguntas Personalizadas</h2>
            <p className="text-sm text-admin-muted">Define la información adicional requerida para este viaje.</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingCampo({ tipoCampo: 'texto', obligatorio: false, orden: campos.length + 1 }); setIsModalOpen(true); }}
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
          accion={{
            etiqueta: "Agregar Pregunta",
            onClick: () => { setEditingCampo({ tipoCampo: 'texto', obligatorio: false, orden: 1 }); setIsModalOpen(true); },
          }}
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md w-12"></th>
                <th className="p-md font-medium">Pregunta</th>
                <th className="p-md font-medium">Tipo</th>
                <th className="p-md font-medium">Obligatorio</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {campos.map((campo) => (
                <tr key={campo.idCampo} className="hover:bg-admin-bg transition-colors">
                  <td className="p-md text-admin-muted">
                    <GripVertical size={16} />
                  </td>
                  <td className="p-md text-sm font-medium">{campo.etiquetaPregunta}</td>
                  <td className="p-md">
                    <span className="px-2 py-1 rounded-sm bg-admin-bg text-admin-muted text-xs font-medium capitalize">
                      {campo.tipoCampo === 'texto' ? 'Texto' : 'Opción Única'}
                    </span>
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
                        onClick={() => { setEditingCampo(campo); setIsModalOpen(true); }}
                        className="p-xs text-admin-accent hover:bg-admin-bg rounded-sm transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-xs text-error hover:bg-estado-rechazada-bg rounded-sm transition-colors"
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

      <Modal
        abierto={isModalOpen}
        onCerrar={() => setIsModalOpen(false)}
        titulo={editingCampo?.idCampo ? "Editar Pregunta" : "Nueva Pregunta"}
        className="max-w-lg p-lg"
      >
        <h3 className="text-xl font-bold mb-lg text-admin-text">
          {editingCampo?.idCampo ? "Editar Pregunta" : "Nueva Pregunta"}
        </h3>
        <form onSubmit={handleSave} className="space-y-md">
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Pregunta</label>
            <input
              type="text"
              className="w-full p-sm border border-admin-border rounded-sm outline-none focus:ring-1 focus:ring-admin-accent"
              defaultValue={editingCampo?.etiquetaPregunta}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-xs font-bold text-admin-muted uppercase">Tipo de Respuesta</label>
              <select className="w-full p-sm border border-admin-border rounded-sm outline-none focus:ring-1 focus:ring-admin-accent">
                <option value="texto">Texto Libre</option>
                <option value="seleccion_unica">Opción Única</option>
              </select>
            </div>
            <div className="flex items-center gap-xs pt-6">
              <input type="checkbox" id="req" className="accent-admin-accent" defaultChecked={editingCampo?.obligatorio} />
              <label htmlFor="req" className="text-sm font-medium text-admin-muted">Obligatoria</label>
            </div>
          </div>
          <div className="flex justify-end gap-sm mt-lg">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-md py-xs text-admin-muted hover:bg-admin-bg rounded-sm transition-colors text-sm"
            >
              Cancelar
            </button>
            <button type="submit" className="px-md py-xs bg-admin-accent text-white rounded-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium">
              Guardar Pregunta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Edit2({ size }: { size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 20.5L12 15l5 5"/></svg>;
}
