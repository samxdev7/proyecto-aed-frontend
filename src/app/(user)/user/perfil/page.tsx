"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/user.service";
import { UsuarioPerfil } from "@/types/usuario";
import { User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function UserProfile() {
  const [profile, setProfile] = useState<UsuarioPerfil | null>(null);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    userService
      .getMyProfile()
      .then(setProfile)
      .catch(() => setError(true));
  }, [reintentos]);

  function reintentar() {
    setError(false);
    setReintentos((n) => n + 1);
  }

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface p-8 rounded-lg shadow-sm border border-neutral-border flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold">
          {profile.primerNombre[0]}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold text-primary">{profile.nombreCompleto}</h2>
          <p className="text-text-muted">{profile.correo}</p>
          <div className="flex gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-sand text-primary rounded-sm text-xs font-medium capitalize">
              {profile.rol}
            </span>
            <span className="px-3 py-1 bg-surface-alt text-text-muted rounded-sm text-xs font-medium">
              Miembro desde {new Date(profile.fechaRegistro).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-6">
          <h3 className="text-lg font-bold text-primary border-b border-neutral-border pb-2">Información Personal</h3>
          <div className="space-y-4">
            <DetailItem icon={<Mail size={18}/>} label="Correo Electrónico" value={profile.correo} />
            <DetailItem icon={<Phone size={18}/>} label="Teléfono" value={profile.telefono} />
            <DetailItem icon={<MapPin size={18}/>} label="Nacionalidad" value={profile.nacionalidad} />
            <DetailItem icon={<User size={18}/>} label="Identificación" value={`${profile.tipoIdentificacion}: ${profile.numeroIdentificacion}`} />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-border pb-2">
            <h3 className="text-lg font-bold text-primary">Preferencias</h3>
            <Link href="/user/settings" className="text-sm text-primary hover:underline">
              Editar
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-alt rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface rounded-md shadow-sm"><Bell size={18} className="text-primary"/></div>
                <span className="text-sm font-medium">Notificaciones Push</span>
              </div>
              <input
                type="checkbox"
                checked={profile.notificacionesHabilitadas}
                readOnly
                className="w-4 h-4 accent-primary"
              />
            </div>
            <div className="p-3 bg-surface-alt rounded-lg flex items-center gap-3">
              <div className="p-2 bg-surface rounded-md shadow-sm"><CreditCard size={18} className="text-primary"/></div>
              <span className="text-sm font-medium">Método de pago predeterminado</span>
              <span className="text-xs text-text-muted ml-auto">No configurado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-sand rounded-lg text-primary">{icon}</div>
      <div>
        <p className="text-xs text-text-muted uppercase font-bold">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Bell({ size, className }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0v6a6 6 0 0 1-12 0V8Z"/><path d="M12 14v4"/><path d="M10 18h4"/></svg>;
}
