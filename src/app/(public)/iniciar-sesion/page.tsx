"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock } from "lucide-react";
import { establecerRolDemo } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();

  // Demo: sin backend, cualquier envío entra como cliente y respeta ?redir=.
  function entrarDemo() {
    establecerRolDemo("client");
    const destino = new URLSearchParams(window.location.search).get("redir");
    router.push(destino?.startsWith("/") ? destino : "/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4">
      <div className="max-w-md w-full bg-surface rounded-lg shadow-xl border p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary text-white rounded-md mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary">Bienvenido de vuelta</h1>
          <p className="text-text-muted">Ingresa tus credenciales para acceder</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); entrarDemo(); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-muted">Contraseña</label>
              <Link href="/recuperar-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-xs text-text-muted">
          Demo: cualquier credencial inicia sesión como cliente.
        </p>

        <div className="text-center">
          <p className="text-sm text-text-muted">
            ¿No tienes una cuenta? <Link href="/registro" className="text-primary font-bold hover:underline">Regístrate aquí</Link>
          </p>
          <Link href="/viajes" className="mt-2 inline-block text-xs text-primary hover:underline">
            Continuar sin cuenta →
          </Link>
        </div>
      </div>
    </div>
  );
}
