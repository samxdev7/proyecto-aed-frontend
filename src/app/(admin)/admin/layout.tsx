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
import { limpiarRolDemo } from "@/lib/demo";

/* demo.ts solo modela "anon" | "client" y no exporta su clave; para el mock E6
   el rol admin se siembra a mano: localStorage.setItem("cnm_demo_rol", "admin"). */
const CLAVE_ROL_DEMO = "cnm_demo_rol";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  /* Guard de rol (mock E6): localStorage es store externo; serverSnapshot=false
     evita mismatch de hidratación y el valor real se resuelve en el cliente. */
  const esAdmin = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem(CLAVE_ROL_DEMO) === "admin",
    () => false,
  );

  /* El redirect decide leyendo localStorage EN el efecto (post-hidratación):
     condicionar sobre esAdmin dispara router.replace desde el render de
     hidratación (server snapshot=false) antes de aplicar el snapshot cliente
     y manda a login aunque la sesión admin sea válida. */
  useEffect(() => {
    if (localStorage.getItem(CLAVE_ROL_DEMO) !== "admin") {
      router.replace("/iniciar-sesion");
    }
  }, [router]);

  function cerrarSesion() {
    limpiarRolDemo();
    router.push("/");
  }

  if (!esAdmin) return null;

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Viajes", href: "/admin/viajes", icon: Map },
    { name: "Reservas", href: "/admin/reservas", icon: CalendarCheck },
    { name: "Usuarios", href: "/admin/usuarios", icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-admin-bg text-admin-text">
      {/* Sidebar */}
      <aside className="w-full shrink-0 md:w-64 bg-admin-sidebar text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/10">
          CNM Admin
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
          <button
            onClick={cerrarSesion}
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-admin-muted">Administrador</span>
            <div className="w-8 h-8 bg-admin-accent rounded-full" />
          </div>
        </header>
        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
