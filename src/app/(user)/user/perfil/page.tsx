"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { UsuarioPerfil } from "@/types/usuario";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Shield,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

interface FormPerfilState {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
  sexo: string;
  nacionalidad: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}

export default function UserProfile() {
  const { user: authUser, actualizarUsuario } = useAuth();
  const [profile, setProfile] = useState<UsuarioPerfil | null>(authUser);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  // Modo edición
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<FormPerfilState>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    sexo: "M",
    nacionalidad: "Nicaragüense",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        setFormData({
          primerNombre: p.primerNombre || "",
          segundoNombre: p.segundoNombre || "",
          primerApellido: p.primerApellido || "",
          segundoApellido: p.segundoApellido || "",
          telefono: p.telefono || "",
          sexo: p.sexo || "M",
          nacionalidad: p.nacionalidad || "Nicaragüense",
          tipoIdentificacion: p.tipoIdentificacion || "cedula",
          numeroIdentificacion: p.numeroIdentificacion || "",
        });
      })
      .catch(() => setError(true));
  }, [reintentos, authUser]);

  function reintentar() {
    setError(false);
    setReintentos((n) => n + 1);
  }

  function iniciarEdicion() {
    if (!profile) return;
    setFormData({
      primerNombre: profile.primerNombre || "",
      segundoNombre: profile.segundoNombre || "",
      primerApellido: profile.primerApellido || "",
      segundoApellido: profile.segundoApellido || "",
      telefono: profile.telefono || "",
      sexo: profile.sexo || "M",
      nacionalidad: profile.nacionalidad || "Nicaragüense",
      tipoIdentificacion: profile.tipoIdentificacion || "cedula",
      numeroIdentificacion: profile.numeroIdentificacion || "",
    });
    setErrorEdicion(null);
    setModoEdicion(true);
  }

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEdicion(null);

    if (!formData.primerNombre.trim() || !formData.primerApellido.trim()) {
      setErrorEdicion("El primer nombre y primer apellido son obligatorios.");
      return;
    }
    if (!formData.telefono.trim()) {
      setErrorEdicion("El número de teléfono de contacto es obligatorio.");
      return;
    }
    if (!formData.numeroIdentificacion.trim()) {
      setErrorEdicion("El número de documento de identificación es obligatorio.");
      return;
    }

    try {
      setGuardando(true);
      const actualizado = await userService.actualizarPerfil({
        primerNombre: formData.primerNombre.trim(),
        segundoNombre: formData.segundoNombre.trim() || undefined,
        primerApellido: formData.primerApellido.trim(),
        segundoApellido: formData.segundoApellido.trim() || undefined,
        telefono: formData.telefono.trim(),
        sexo: formData.sexo,
        nacionalidad: formData.nacionalidad.trim(),
        tipoIdentificacion: formData.tipoIdentificacion,
        numeroIdentificacion: formData.numeroIdentificacion.trim(),
      });

      setProfile(actualizado);
      actualizarUsuario(actualizado);
      setModoEdicion(false);
      setMensajeExito("Tus datos personales se han actualizado correctamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      setErrorEdicion(
        err instanceof Error ? err.message : "Error al actualizar los datos del perfil."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tu perfil"
        descripcion="Ocurrió un error al obtener tus datos. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alerta de notificación temporal */}
      {mensajeExito && (
        <div className="bg-success/15 border border-success/30 text-success px-md py-sm rounded-lg flex items-center justify-between text-sm animate-in fade-in">
          <span className="flex items-center gap-xs font-medium">
            <CheckCircle size={16} />
            {mensajeExito}
          </span>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-xs text-text-muted hover:text-text-primary ml-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tarjeta de Encabezado */}
      <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-sm border border-neutral-border flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
            {profile.primerNombre?.[0] || "U"}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
              {profile.nombreCompleto}
            </h2>
            <p className="text-sm text-text-muted">{profile.correo}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
              <span className="px-3 py-0.5 bg-sand text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
                {profile.rol}
              </span>
              <span className="px-3 py-0.5 bg-surface-alt text-text-muted rounded-full text-xs font-medium">
                Miembro desde {new Date(profile.fechaRegistro).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {!modoEdicion ? (
          <button
            onClick={iniciarEdicion}
            className="px-md py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-colors text-sm font-semibold flex items-center gap-xs shadow-sm"
          >
            <Edit3 size={16} />
            Editar Perfil
          </button>
        ) : (
          <button
            onClick={() => setModoEdicion(false)}
            className="px-md py-2 text-text-muted hover:bg-surface-alt rounded-md transition-colors text-sm font-medium flex items-center gap-xs"
          >
            <X size={16} />
            Cancelar
          </button>
        )}
      </div>

      {modoEdicion ? (
        /* Formulario Interactivo de Edición */
        <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-sm border border-neutral-border space-y-6">
          <div className="border-b border-neutral-border pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-primary">Editar Información Personal</h3>
              <p className="text-xs text-text-muted">
                Mantén tus datos actualizados para agilizar tus inscripciones en expediciones.
              </p>
            </div>
          </div>

          {errorEdicion && (
            <div className="bg-error/10 border border-error/30 text-error p-sm rounded-md text-xs flex items-center gap-xs">
              <AlertTriangle size={15} />
              {errorEdicion}
            </div>
          )}

          <form onSubmit={handleGuardarPerfil} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primerNombre}
                  onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Segundo Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={formData.segundoNombre}
                  onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primerApellido}
                  onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Segundo Apellido (opcional)
                </label>
                <input
                  type="text"
                  value={formData.segundoApellido}
                  onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+505 8888-8888"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Sexo *</label>
                <select
                  value={formData.sexo}
                  onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="No especificado">Prefiero no responder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Nacionalidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nicaragüense"
                  value={formData.nacionalidad}
                  onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Tipo de Documento *
                </label>
                <select
                  value={formData.tipoIdentificacion}
                  onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="cedula">Cédula de Identidad</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="cedula_residencia">Cédula de Residencia</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Número de Identificación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="001-000000-0000A"
                  value={formData.numeroIdentificacion}
                  onChange={(e) => setFormData({ ...formData, numeroIdentificacion: e.target.value })}
                  className="w-full px-sm py-2 border border-neutral-border rounded-md text-sm text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-sm pt-4 border-t border-neutral-border">
              <button
                type="button"
                disabled={guardando}
                onClick={() => setModoEdicion(false)}
                className="px-md py-2 text-text-muted hover:bg-surface-alt rounded-md transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-md py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-semibold flex items-center gap-xs shadow-sm"
              >
                {guardando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Vista de Información */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-6">
            <h3 className="text-lg font-bold text-primary border-b border-neutral-border pb-2 flex items-center gap-xs">
              <Shield size={18} />
              Información Personal
            </h3>
            <div className="space-y-4">
              <DetailItem
                icon={<Mail size={18} />}
                label="Correo Electrónico (Cuenta)"
                value={profile.correo}
              />
              <DetailItem
                icon={<Phone size={18} />}
                label="Teléfono de Contacto"
                value={profile.telefono}
              />
              <DetailItem
                icon={<MapPin size={18} />}
                label="Nacionalidad"
                value={profile.nacionalidad}
              />
              <DetailItem
                icon={<User size={18} />}
                label="Documento de Identidad"
                value={`${
                  profile.tipoIdentificacion === "cedula"
                    ? "Cédula"
                    : profile.tipoIdentificacion === "pasaporte"
                    ? "Pasaporte"
                    : "Cédula de Residencia"
                }: ${profile.numeroIdentificacion}`}
              />
              <DetailItem
                icon={<User size={18} />}
                label="Sexo Registrado"
                value={
                  profile.sexo === "M"
                    ? "Masculino"
                    : profile.sexo === "F"
                    ? "Femenino"
                    : profile.sexo
                }
              />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-border pb-2">
              <h3 className="text-lg font-bold text-primary">Preferencias del Sistema</h3>
              <Link href="/user/settings" className="text-sm text-primary hover:underline">
                Gestionar
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-alt rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface rounded-md shadow-sm">
                    <Bell size={18} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Notificaciones Push</span>
                    <span className="text-xs text-text-muted">
                      {profile.notificacionesHabilitadas ? "Activadas" : "Desactivadas"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificacionesHabilitadas}
                  readOnly
                  aria-label="Estado de notificaciones push"
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div className="p-3 bg-surface-alt rounded-lg flex items-center gap-3">
                <div className="p-2 bg-surface rounded-md shadow-sm">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Método de pago habitual</span>
                  <span className="text-xs text-text-muted">Transferencia Bancaria Banpro / BAC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-sand rounded-lg text-primary shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm font-medium text-text-primary break-all">{value}</p>
      </div>
    </div>
  );
}
