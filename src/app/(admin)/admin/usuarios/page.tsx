"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { ApiError } from "@/lib/api-client";
import type { UsuarioPerfil } from "@/types/usuario";
import type { HistorialReservaResumen } from "@/types/reserva";
import { formatoCordobas, formatoFechaCorta } from "@/lib/format";
import { History, Users } from "lucide-react";
import Skeleton, { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Chip from "@/components/ui/Chip";
import DatoSensible from "@/components/admin/DatoSensible";

/** Mensaje del backend (ApiError) o un texto por defecto genérico. */
function mensajeDeError(e: unknown, porDefecto: string): string {
  return e instanceof ApiError && e.message ? e.message : porDefecto;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [reintentos, setReintentos] = useState(0);
  /* Modal de historial del usuario. */
  const [usuarioHistorial, setUsuarioHistorial] = useState<UsuarioPerfil | null>(null);
  const [historial, setHistorial] = useState<HistorialReservaResumen[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState("");

  useEffect(() => {
    adminService
      .listarUsuarios(0, 50)
      .then((respuesta) => setUsuarios(respuesta.content))
      .catch((e) => {
        setMensaje(mensajeDeError(e, "Ocurrió un error al obtener la lista. Inténtalo de nuevo."));
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [reintentos]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  /* Filtro y búsqueda 100% client-side sobre los usuarios ya cargados. */
  const visibles = usuarios.filter((usuario) => {
    const porRol = !rolFiltro || usuario.rol === rolFiltro;
    const termino = busqueda.trim().toLowerCase();
    const porTexto =
      !termino ||
      usuario.nombreCompleto.toLowerCase().includes(termino) ||
      usuario.correo.toLowerCase().includes(termino);
    return porRol && porTexto;
  });

  async function abrirHistorial(usuario: UsuarioPerfil) {
    setUsuarioHistorial(usuario);
    setHistorial([]);
    setErrorHistorial("");
    setCargandoHistorial(true);
    try {
      const respuesta = await adminService.historialUsuario(usuario.idUsuario, 0, 20);
      setHistorial(respuesta.content);
    } catch (e) {
      setErrorHistorial(mensajeDeError(e, "No pudimos cargar el historial del usuario."));
    } finally {
      setCargandoHistorial(false);
    }
  }

  function cerrarHistorial() {
    setUsuarioHistorial(null);
    setHistorial([]);
    setErrorHistorial("");
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
              <th className="p-4 font-medium">Teléfono</th>
              <th className="p-4 font-medium">Identificación</th>
              <th className="p-4 font-medium">Notif.</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <FilaTablaSkeleton columnas={7} />
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar los usuarios"
        descripcion={mensaje}
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-admin-muted">Administra las cuentas y perfiles de la comunidad.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Buscar por nombre o correo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="p-2 border border-admin-border bg-admin-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-admin-accent"
          />
          <select
            className="p-2 border border-admin-border bg-admin-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-admin-accent"
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="cliente">Clientes</option>
            <option value="administrador">Administradores</option>
          </select>
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          icono={Users}
          titulo="Sin usuarios"
          descripcion="No hay cuentas que coincidan con el filtro o la búsqueda."
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-sm text-admin-muted border-b border-admin-border">
              <tr>
                <th className="p-4 font-medium">Nombre Completo</th>
                <th className="p-4 font-medium">Correo</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Teléfono</th>
                <th className="p-4 font-medium">Identificación</th>
                <th className="p-4 font-medium">Notif.</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {visibles.map((user) => (
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
                  <td className="p-4 text-sm">{user.telefono || "—"}</td>
                  <td className="p-4 text-sm">
                    <DatoSensible valor={user.numeroIdentificacion} />
                  </td>
                  <td className="p-4 text-xs">
                    {user.notificacionesHabilitadas ? "Sí" : "No"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => abrirHistorial(user)}
                      className="p-2 text-admin-accent hover:bg-admin-bg rounded-md transition-colors"
                      title="Ver Historial"
                    >
                      <History size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de historial de reservas del usuario */}
      <Modal
        abierto={usuarioHistorial !== null}
        onCerrar={cerrarHistorial}
        titulo={`Historial de ${usuarioHistorial?.nombreCompleto ?? ""}`}
        className="max-w-2xl p-lg"
      >
        {cargandoHistorial ? (
          <div className="space-y-sm">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : errorHistorial ? (
          <p className="text-sm text-error">{errorHistorial}</p>
        ) : historial.length === 0 ? (
          <p className="text-sm text-admin-muted italic">Este usuario todavía no tiene reservas.</p>
        ) : (
          <ul className="divide-y divide-admin-border">
            {historial.map((item) => (
              <li key={item.idReserva} className="flex items-center justify-between gap-md py-sm">
                <div>
                  <p className="text-sm font-medium">{item.viaje.titulo}</p>
                  <p className="text-xs text-admin-muted">
                    Salida {formatoFechaCorta(item.viaje.fechaHoraIda)} · Reservada{" "}
                    {formatoFechaCorta(item.fechaReserva)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Chip estado={item.estado} />
                  <p className="text-xs text-admin-muted">
                    <DatoSensible valor={formatoCordobas(item.montoReserva)} ultimos={0} /> / persona
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
