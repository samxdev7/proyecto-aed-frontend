"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { UsuarioPerfil } from "@/types/usuario";
import {
  Trash2,
  Search,
  UserCheck,
  Users
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import DatoSensible from "@/components/admin/DatoSensible";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rolFilter, setRolFilter] = useState<string>("");
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    adminService
      .listarUsuarios(0, 10)
      .then((response) => {
        // Simple client-side filter for this demo
        const filtered = rolFilter
          ? response.content.filter((u) => u.rol === rolFilter)
          : response.content;
        setUsuarios(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [rolFilter, reintentos]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
            <tr>
              <th className="p-4 font-medium">Nombre Completo</th>
              <th className="p-4 font-medium">Correo</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium">Identificación</th>
              <th className="p-4 font-medium text-right">Acciones</th>
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
        titulo="No pudimos cargar los usuarios"
        descripcion="Ocurrió un error al obtener la lista. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-admin-muted">Administra las cuentas y perfiles de la comunidad.</p>
        </div>
        <div className="flex gap-3">
          <select
            className="p-2 border border-admin-border bg-admin-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-admin-accent"
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="cliente">Clientes</option>
            <option value="administrador">Administradores</option>
          </select>
          <button className="bg-admin-surface border border-admin-border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-admin-bg transition-colors text-sm">
            <Search size={18} /> Buscar
          </button>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <EmptyState
          icono={Users}
          titulo="Sin usuarios"
          descripcion="No hay cuentas que coincidan con el filtro seleccionado."
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
              <tr>
                <th className="p-4 font-medium">Nombre Completo</th>
                <th className="p-4 font-medium">Correo</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Identificación</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {usuarios.map((user) => (
                <tr key={user.idUsuario} className="hover:bg-admin-bg transition-colors">
                  <td className="p-4 font-medium">{user.nombreCompleto}</td>
                  <td className="p-4 text-sm">
                    <DatoSensible valor={user.correo} />
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                      user.rol === 'administrador'
                        ? 'bg-admin-bg text-admin-accent'
                        : 'bg-admin-bg text-admin-muted'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <DatoSensible valor={user.numeroIdentificacion} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-2 text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                        title="Ver Historial"
                      >
                        <UserCheck size={18} />
                      </button>
                      <button
                        className="p-2 text-error hover:bg-estado-rechazada-bg rounded-md transition-colors"
                        title="Eliminar Usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
