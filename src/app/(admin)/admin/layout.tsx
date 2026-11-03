"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  CalendarCheck,
  LogOut,
  Globe,
  Bell,
  Menu,
  X,
} from "lucide-react";
import {
  EVENTO_SESION,
  cerrarSesion,
  esAdministrador,
  obtenerSesion
} from "@/lib/auth";
import { userService } from "@/services/user.service";
import { adminService } from "@/services/admin.service";
import NotificacionesDrawer from "@/components/clientes/NotificacionesDrawer";

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
  const pathname = usePathname();
  const sesion = useSyncExternalStore(suscribirSesion, obtenerSesion, () => null);
  const esAdmin = esAdministrador(sesion);
  const [noLeidas, setNoLeidas] = useState(0);
  const [reservasPendientes, setReservasPendientes] = useState(0);
  const [notisAbierta, setNotisAbierta] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  // Cerrar el drawer móvil al cambiar de ruta
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarAbierta(false);
  }, [pathname]);

  const cargarNoLeidas = useCallback(async () => {
    if (!sesion) {
      setNoLeidas(0);
      return;
    }
    try {
      const pagina = await userService.getMyNotifications(0, 50);
      const pendientes = pagina.content.filter((n) => !n.leida).length;
      setNoLeidas(pendientes);
    } catch {
      // Ignorar error no bloqueante
    }
  }, [sesion]);

  const cargarReservasPendientes = useCallback(async () => {
    if (!sesion || sesion.rol !== "administrador") {
      setReservasPendientes(0);
      return;
    }
    try {
      const pagina = await adminService.listarReservas({ estado: "pendiente" }, 0, 1);
      setReservasPendientes(pagina.totalElements);
    } catch {
      // Ignorar error no bloqueante
    }
  }, [sesion]);

  useEffect(() => {
    if (esAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void cargarNoLeidas();
      void cargarReservasPendientes();
    }
  }, [esAdmin, cargarNoLeidas, cargarReservasPendientes]);

  /* El redirect se decide en el efecto (post-hidratación); mientras no haya
     sesión admin válida no se renderiza nada de /admin. */
  useEffect(() => {
    if (!esAdministrador(obtenerSesion())) {
      router.replace("/iniciar-sesion?redir=/admin");
    }
  }, [router]);

  function salir() {
    cerrarSesion();
    router.push("/iniciar-sesion");
  }

  if (!esAdmin) return null;

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text">
      {/* Desktop Sidebar: fija según viewport independiente del contenido */}
      <aside className="hidden md:flex md:fixed md:top-0 md:bottom-0 md:left-0 md:w-64 bg-admin-sidebar text-white flex-col md:h-screen md:overflow-y-auto z-30">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">CNM Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const esActivo = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  esActivo
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={20} className={esActivo ? "text-admin-accent" : ""} />
                <span className="flex-1 flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.name === "Reservas" && reservasPendientes > 0 && (
                    <span
                      className="ml-2 flex min-w-4 h-4 items-center justify-center rounded-xs bg-error px-1 text-[10px] font-bold leading-none text-white shadow-xs"
                      title={`${reservasPendientes} reservas pendientes`}
                    >
                      {reservasPendientes > 99 ? "99+" : reservasPendientes}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="px-3 pb-0.5 text-sm font-semibold truncate" title={sesion.nombreCompleto}>
            {sesion.nombreCompleto}
          </p>
          <p className="px-3 pb-3 text-xs text-white/60">Administrador</p>
          <button
            onClick={salir}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium hover:bg-error transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (animado con overlay) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          sidebarAbierta ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!sidebarAbierta}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            sidebarAbierta ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarAbierta(false)}
        />

        {/* Drawer panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-admin-sidebar text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarAbierta ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight">CNM Admin</span>
            <button
              type="button"
              onClick={() => setSidebarAbierta(false)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const esActivo = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarAbierta(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    esActivo
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={20} className={esActivo ? "text-admin-accent" : ""} />
                  <span className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.name === "Reservas" && reservasPendientes > 0 && (
                      <span
                        className="ml-2 flex min-w-4 h-4 items-center justify-center rounded-xs bg-error px-1 text-[10px] font-bold leading-none text-white shadow-xs"
                        title={`${reservasPendientes} reservas pendientes`}
                      >
                        {reservasPendientes > 99 ? "99+" : reservasPendientes}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <p className="px-3 pb-0.5 text-sm font-semibold truncate" title={sesion.nombreCompleto}>
              {sesion.nombreCompleto}
            </p>
            <p className="px-3 pb-3 text-xs text-white/60">Administrador</p>
            <button
              onClick={salir}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium hover:bg-error transition-colors"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col md:pl-64">
        <header className="h-14 sm:h-16 bg-admin-surface border-b border-admin-border flex items-center justify-between px-3 sm:px-6 md:px-8 shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarAbierta(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-admin-muted hover:text-admin-text hover:bg-admin-bg transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate text-admin-text">
              <span className="hidden md:inline">Panel de Administración</span>
              <span className="md:hidden inline font-bold">CNM Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md bg-admin-bg px-2 sm:px-2.5 py-1 text-xs font-semibold text-admin-text ring-1 ring-admin-border transition hover:bg-admin-border/40"
              title="Ir al Sitio Web"
            >
              <Globe className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />
              <span className="hidden sm:inline">Sitio Web</span>
            </Link>
            <button
              type="button"
              onClick={() => setNotisAbierta(true)}
              aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ""}`}
              className="relative rounded-md p-1.5 sm:p-2 text-admin-muted transition hover:bg-admin-bg hover:text-admin-text"
            >
              <Bell size={20} aria-hidden="true" />
              {noLeidas > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {noLeidas > 9 ? "9+" : noLeidas}
                </span>
              ) : null}
            </button>
            <div className="flex items-center gap-2 border-l border-admin-border pl-2 sm:pl-3">
              <span className="text-sm text-admin-muted hidden lg:inline max-w-[140px] truncate" title={sesion.nombreCompleto}>
                {sesion.nombreCompleto}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-accent text-xs font-bold text-white shrink-0"
                title={sesion.nombreCompleto}
              >
                {iniciales(sesion.nombreCompleto)}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 md:p-8 min-w-0 flex-1">
          {children}
        </div>
      </main>

      <NotificacionesDrawer
        abierta={notisAbierta}
        onCerrar={() => setNotisAbierta(false)}
        onCambio={cargarNoLeidas}
      />
    </div>
  );
}
