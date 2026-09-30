"use client";

import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { UsuarioPerfil } from "@/types/usuario";
import { ReservaAdmin } from "@/types/admin-ui";
import {
  Search,
  UserCheck,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import DatoSensible from "@/components/admin/DatoSensible";
import Modal from "@/components/ui/Modal";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rolFilter, setRolFilter] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [reintentos, setReintentos] = useState(0);

  // Estados para modal de historial de reservas
  const [usuarioHistorial, setUsuarioHistorial] = useState<UsuarioPerfil | null>(null);
  const [historial, setHistorial] = useState<ReservaAdmin[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    adminService
      .listarUsuarios(0, 50)
      .then((response) => {
        setUsuarios(response.content);
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

  const handleVerHistorial = async (user: UsuarioPerfil) => {
    setUsuarioHistorial(user);
    setCargandoHistorial(true);
    try {
      const reservas = await adminService.getHistorialUsuario(user.idUsuario);
      setHistorial(reservas);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Filtrado reactivo en cliente (por rol y búsqueda en nombre, correo o identificación)
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = !rolFilter || u.rol === rolFilter;
    if (!coincideRol) return false;

    if (!busqueda.trim()) return true;
    const query = busqueda.toLowerCase().trim();
    const nombre = (u.nombreCompleto || `${u.primerNombre} ${u.primerApellido}`).toLowerCase();
    const correo = u.correo.toLowerCase();
    const ident = (u.numeroIdentificacion || "").toLowerCase();

    return nombre.includes(query) || correo.includes(query) || ident.includes(query);
  });

  const renderBadgeEstado = (estado: ReservaAdmin["estado"]) => {
    if (estado === "aprobada") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
          <CheckCircle size={12} /> Aprobada
        </span>
      );
    }
    if (estado === "rechazada") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30">
          <XCircle size={12} /> Rechazada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
        <Clock size={12} /> Pendiente
      </span>
    );
  };

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
      {/* Encabezado y Barra de Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Gestión de Usuarios</h2>
          <p className="text-sm text-admin-muted">
            Administra las cuentas, consulta historiales de reservas y datos de clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Input de búsqueda en tiempo real */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-admin-surface border border-admin-border rounded-lg text-sm text-admin-text placeholder:text-admin-muted focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent outline-none transition-all"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Selector de rol */}
          <select
            className="p-2 border border-admin-border bg-admin-surface rounded-lg text-sm text-admin-text outline-none focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent"
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="cliente">Clientes</option>
            <option value="administrador">Administradores</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {usuariosFiltrados.length === 0 ? (
        <EmptyState
          icono={Users}
          titulo="Sin usuarios encontrados"
          descripcion="No hay cuentas que coincidan con el término de búsqueda o filtro seleccionado."
          accion={
            busqueda || rolFilter
              ? {
                  etiqueta: "Limpiar filtros",
                  onClick: () => {
                    setBusqueda("");
                    setRolFilter("");
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs font-semibold text-admin-muted uppercase tracking-wider border-b border-admin-border">
              <tr>
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Identificación</th>
                <th className="p-4 text-right">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {usuariosFiltrados.map((user) => (
                <tr key={user.idUsuario} className="hover:bg-admin-bg/50 transition-colors">
                  <td className="p-4 font-semibold text-sm text-admin-text">
                    {user.nombreCompleto}
                  </td>
                  <td className="p-4 text-sm">
                    <DatoSensible valor={user.correo} />
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        user.rol === "administrador"
                          ? "bg-admin-accent/15 text-admin-accent border border-admin-accent/30"
                          : "bg-neutral-bg text-neutral-muted border border-neutral-border"
                      }`}
                    >
                      {user.rol}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-mono">
                    <DatoSensible valor={user.numeroIdentificacion} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleVerHistorial(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-admin-bg hover:bg-admin-accent hover:text-white text-admin-accent text-xs font-medium rounded-md border border-admin-border transition-colors shadow-sm"
                      title="Consultar historial de expediciones reservadas"
                    >
                      <UserCheck size={15} />
                      <span>Ver Reservas</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Historial de Reservas del Usuario (RF4 / RF5 / H2) */}
      <Modal
        abierto={usuarioHistorial !== null}
        onCerrar={() => setUsuarioHistorial(null)}
        titulo={`Historial de Reservas - ${usuarioHistorial?.nombreCompleto || ""}`}
        className="max-w-3xl p-6"
      >
        <div className="space-y-4">
          <div className="border-b border-admin-border pb-3 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-admin-text">
                Historial de Reservas: {usuarioHistorial?.nombreCompleto}
              </h3>
              <p className="text-xs text-admin-muted mt-0.5">
                {usuarioHistorial?.correo} · Documento: {usuarioHistorial?.numeroIdentificacion}
              </p>
            </div>
            <button
              onClick={() => setUsuarioHistorial(null)}
              className="text-admin-muted hover:text-admin-text p-1"
            >
              <X size={18} />
            </button>
          </div>

          {cargandoHistorial ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-admin-muted text-sm">
              <Loader2 size={24} className="animate-spin text-admin-accent" />
              <span>Cargando reservas del usuario...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Calendar size={36} className="mx-auto text-admin-muted opacity-50" />
              <p className="text-sm font-semibold text-admin-text">
                No hay reservas registradas para este usuario.
              </p>
              <p className="text-xs text-admin-muted">
                El usuario aún no ha completado el formulario de inscripción a ninguna expedición.
              </p>
            </div>
          ) : (
            <div className="border border-admin-border rounded-lg overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-admin-bg text-xs text-admin-muted uppercase tracking-wider border-b border-admin-border">
                  <tr>
                    <th className="p-3">Ref / ID</th>
                    <th className="p-3">Expedición</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {historial.map((reserva) => (
                    <tr key={reserva.idReserva} className="hover:bg-admin-bg/40">
                      <td className="p-3 font-mono text-xs">
                        #{reserva.idReserva}
                        <span className="block text-[11px] text-admin-muted">
                          {reserva.numeroReferenciaPago || "Sin referencia"}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-admin-text">
                        {reserva.tituloViaje}
                        {reserva.numAcompanantes > 0 && (
                          <span className="block text-xs text-admin-muted">
                            +{reserva.numAcompanantes} acompañante(s)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-admin-muted">
                        {new Date(reserva.fechaCreacion).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-semibold text-admin-text">
                        C$ {reserva.montoTotal.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {renderBadgeEstado(reserva.estado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-admin-border">
            <button
              type="button"
              onClick={() => setUsuarioHistorial(null)}
              className="px-4 py-2 bg-admin-surface border border-admin-border hover:bg-admin-bg rounded-md text-sm font-medium text-admin-text transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
