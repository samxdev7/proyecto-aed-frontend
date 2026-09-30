"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function ejecutarLogin(email: string, pass: string) {
    setError(null);
    setEnviando(true);
    try {
      const res = await login(email, pass);
      if (!res.success) {
        setError(res.error || "Credenciales inválidas");
        setEnviando(false);
        return;
      }

      const destino = new URLSearchParams(window.location.search).get("redir");
      if (destino && destino.startsWith("/")) {
        router.push(destino);
      } else if (email === "admin@cnm.org.ni") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      setError("Ocurrió un error inesperado al iniciar sesión.");
      setEnviando(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo.trim() || !contrasena) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }
    ejecutarLogin(correo, contrasena);
  }

  // Atajos para pruebas rápidas
  function atajoAdmin() {
    setCorreo("admin@cnm.org.ni");
    setContrasena("admin123");
    ejecutarLogin("admin@cnm.org.ni", "admin123");
  }

  function atajoCliente() {
    setCorreo("carlos@example.com");
    setContrasena("cliente123");
    ejecutarLogin("carlos@example.com", "cliente123");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-8">
      <div className="max-w-md w-full bg-surface rounded-lg shadow-xl border border-neutral-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary text-white rounded-md mb-2">
            <LogIn size={28} />
          </div>
          <h1 className="text-2xl font-bold text-primary">Bienvenido de vuelta</h1>
          <p className="text-sm text-text-muted">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-3.5 bg-error/10 border border-error/30 text-error text-sm rounded-lg"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="correo@ejemplo.com"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Contraseña
              </label>
              <Link href="/recuperar-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                required
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="••••••••"
                disabled={enviando}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {enviando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="border-t border-neutral-border pt-4 space-y-2">
          <p className="text-xs font-medium text-text-muted text-center">Acceso rápido para demostración:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={atajoAdmin}
              disabled={enviando}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-neutral-border bg-surface-alt hover:bg-sand/30 text-navy transition-colors"
            >
              <Shield size={14} className="text-primary" /> Admin Demo
            </button>
            <button
              type="button"
              onClick={atajoCliente}
              disabled={enviando}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-neutral-border bg-surface-alt hover:bg-sand/30 text-navy transition-colors"
            >
              <User size={14} className="text-primary" /> Cliente Demo
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-text-muted">
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
          <Link href="/viajes" className="mt-2 inline-block text-xs text-text-muted hover:text-primary transition-colors">
            Explorar catálogo sin cuenta →
          </Link>
        </div>
      </div>
    </div>
  );
}
