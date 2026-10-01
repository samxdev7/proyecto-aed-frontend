"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  CalendarCheck,
  LogOut
} from "lucide-react";
import {
  EVENTO_SESION,
  cerrarSesion,
  esAdministrador,
  obtenerSesion
} from "@/lib/auth";

/* localStorage es un store externo: serverSnapshot=null evita mismatch de
   hidratación y el valor real se resuelve en el primer render del cliente. */
function suscribirSesion(callback: () => void) {
  window.addEventListener(EVENTO_SESION, callback);
  return () => window.removeEventListener(EVENTO_SESION, callback);
}

function iniciales(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Viajes", href: "/admin/viajes", icon: Map },
  { name: "Reservas", href: "/admin/reservas", icon: CalendarCheck },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sesion = useSyncExternalStore(suscribirSesion, obtenerSesion, () => null);
  const esAdmin = esAdministrador(sesion);

  /* El redirect se decide en el efecto (post-hidratación); mientras no haya
     sesión admin válida no se renderiza nada de /admin. */
  useEffect(() => {
    if (!esAdmin) router.replace("/iniciar-sesion?redir=/admin");
  }, [esAdmin, router]);

  function salir() {
    cerrarSesion();
    router.push("/");
  }

  if (!esAdmin) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-admin-bg text-admin-text">
      {/* Sidebar */}
      <aside className="w-full shrink-0 md:w-64 bg-admin-sidebar text-white flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <span className="text-2xl font-bold">CNM Admin</span>
          <Link
            href="/"
            title="Volver al catálogo y sitio web"
            className="text-xs text-white/70 hover:text-white transition-colors underline underline-offset-4"
          >
            Sitio web &rarr;
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="px-3 pb-1 text-sm font-semibold truncate" title={sesion.nombreCompleto}>
            {sesion.nombreCompleto}
          </p>
          <p className="px-3 pb-3 text-xs text-white/60">Administrador</p>
          <button
            onClick={salir}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-error transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-admin-surface border-b border-admin-border flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
          <div className="flex items-center gap-md">
            <Link
              href="/"
              className="text-xs font-medium text-admin-muted hover:text-admin-text transition-colors flex items-center gap-1"
            >
              <span>Ver sitio web</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <div className="flex items-center gap-sm border-l border-admin-border pl-md">
              <span className="text-sm text-admin-muted">{sesion.nombreCompleto}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-accent text-xs font-bold text-white">
                {iniciales(sesion.nombreCompleto)}
              </div>
            </div>
          </div>
        </header>
        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
