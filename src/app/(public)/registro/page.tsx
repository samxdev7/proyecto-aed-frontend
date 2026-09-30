"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, Phone, Globe } from "lucide-react";
import { establecerRolDemo } from "@/lib/demo";

export default function RegisterPage() {
  const router = useRouter();

  // Demo: el registro entra directo como cliente, sin backend.
  function registrarDemo() {
    establecerRolDemo("client");
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-12">
      <div className="max-w-2xl w-full bg-surface rounded-lg shadow-xl border p-8 md:p-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary text-white rounded-md mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary">Crea tu cuenta</h1>
          <p className="text-text-muted">Únete a nuestra comunidad de aventureros</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); registrarDemo(); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Primer Nombre</label>
            <input type="text" className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Segundo Nombre</label>
            <input type="text" className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Primer Apellido</label>
            <input type="text" className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Segundo Apellido</label>
            <input type="text" className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text-muted">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="email" className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="password" className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="••••••••" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="password" className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="••••••••" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="+505 0000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Nacionalidad</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Nicaragüense" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Tipo Identificación</label>
            <select className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all">
              <option>Cédula</option>
              <option>Pasaporte</option>
              <option>Carnet de Extranjería</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Número Identificación</label>
            <input type="text" className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="001-000000-0000A" />
          </div>

          <div className="md:col-span-2 pt-6">
            <button type="submit" className="w-full py-4 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 text-lg">
              Crear mi Cuenta
            </button>
            <p className="mt-2 text-center text-xs text-text-muted">
              Demo: la cuenta se crea como cliente y entras de inmediato.
            </p>
          </div>
        </form>

        <div className="text-center border-t pt-8">
          <p className="text-sm text-text-muted">
            ¿Ya tienes una cuenta? <Link href="/iniciar-sesion" className="text-primary font-bold hover:underline">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
