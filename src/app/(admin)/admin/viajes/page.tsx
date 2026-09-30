"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { Viaje } from "@/types/viaje";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Map
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ChipDificultad } from "@/components/ui/Chip";

export default function AdminViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);
  const [reintentos, setReintentos] = useState(0);

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

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  const handleOpenCreate = () => {
    setEditingViaje(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (viaje: Viaje) => {
    setEditingViaje(viaje);
    setIsModalOpen(true);
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
              <th className="p-md font-medium">Estado</th>
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
        titulo="No pudimos cargar los viajes"
        descripcion="Ocurrió un error al obtener la lista. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Gestión de Viajes</h2>
          <p className="text-sm text-admin-muted">Administra las expediciones y rutas disponibles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-admin-accent text-white px-sm py-xs rounded-md flex items-center gap-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Nuevo Viaje
        </button>
      </div>

      {viajes.length === 0 ? (
        <EmptyState
          icono={Map}
          titulo="Sin viajes creados"
          descripcion="Todavía no hay expediciones publicadas. Crea la primera."
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
                <th className="p-md font-medium">Estado</th>
                <th className="p-md font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {viajes.map((viaje) => (
                <tr key={viaje.idViaje} className="hover:bg-admin-bg transition-colors">
                  <td className="p-md font-medium text-sm">{viaje.titulo}</td>
                  <td className="p-md">
                    <ChipDificultad dificultad={viaje.dificultad} />
                  </td>
                  <td className="p-md text-sm">
                    {viaje.cuposDisponibles} / {viaje.cuposMaximos}
                  </td>
                  <td className="p-md">
                    <span className="flex items-center gap-xs text-sm text-success">
                      <CheckCircle size={14} /> Activo
                    </span>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex justify-end gap-xs">
                      <button
                        onClick={() => handleOpenEdit(viaje)}
                        className="p-xs text-admin-accent hover:bg-admin-bg rounded-sm transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
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

      <Modal
        abierto={isModalOpen}
        onCerrar={() => setIsModalOpen(false)}
        titulo={editingViaje ? "Editar Viaje" : "Crear Nuevo Viaje"}
        className="max-w-2xl p-lg"
      >
        <h3 className="text-xl font-bold mb-lg text-admin-text">
          {editingViaje ? "Editar Viaje" : "Crear Nuevo Viaje"}
        </h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="md:col-span-2 space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Título del Viaje</label>
            <input
              type="text"
              className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all"
              defaultValue={editingViaje?.titulo}
            />
          </div>
          <div className="md:col-span-2 space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Descripción</label>
            <textarea
              className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all h-24"
              defaultValue={editingViaje?.descripcion}
            />
          </div>
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Dificultad</label>
            <select className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all">
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </div>
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Monto Total</label>
            <input type="number" className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all" />
          </div>
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Cupos Máximos</label>
            <input type="number" className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all" />
          </div>
          <div className="space-y-xs">
            <label className="text-xs font-bold text-admin-muted uppercase">Monto Reserva</label>
            <input type="number" className="w-full p-sm border border-admin-border rounded-sm focus:ring-1 focus:ring-admin-accent outline-none transition-all" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-sm mt-md">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-md py-xs text-admin-muted hover:bg-admin-bg rounded-sm transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-md py-xs bg-admin-accent text-white rounded-sm hover:bg-admin-accent-hover transition-colors text-sm font-medium"
            >
              Guardar Viaje
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
