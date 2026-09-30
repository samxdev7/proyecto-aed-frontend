import React from "react";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  Bell, 
  LogOut, 
  Settings 
} from "lucide-react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: "Mi Perfil", href: "/user/perfil", icon: User },
    { name: "Mis Reservas", href: "/user/reservas", icon: Calendar },
    { name: "Notificaciones", href: "/user/notificaciones", icon: Bell },
    { name: "Configuración", href: "/user/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg-main text-text-main">
      <aside className="w-full shrink-0 lg:w-64 bg-surface border-b lg:border-r border-neutral-border flex flex-col">
        <div className="p-6 text-2xl font-bold text-primary border-b border-neutral-border">
          Mi Cuenta
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand transition-colors"
            >
              <item.icon size={20} className="text-primary" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-border">
          <Link 
            href="/logout" 
            className="flex items-center gap-3 p-3 rounded-lg text-error hover:bg-estado-rechazada-bg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-surface border-b border-neutral-border flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-primary">Área de Cliente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">Bienvenido, Carlos</span>
            <div className="w-8 h-8 bg-accent rounded-full" />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
