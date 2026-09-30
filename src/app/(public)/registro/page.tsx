"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, Phone, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { RegistroRequest } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { registro } = useAuth();

  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    telefono: "",
    sexo: "masculino",
    nacionalidad: "Nicaragüense",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function handleChange(campo: string, valor: string) {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones del cliente
    if (!formData.primerNombre.trim()) {
      setError("El primer nombre es obligatorio.");
      return;
    }
    if (!formData.primerApellido.trim()) {
      setError("El primer apellido es obligatorio.");
      return;
    }
    if (!formData.correo.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }
    if (formData.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!formData.telefono.trim()) {
      setError("El número de teléfono es obligatorio.");
      return;
    }
    if (!formData.numeroIdentificacion.trim()) {
      setError("El número de identificación es obligatorio.");
      return;
    }

    const payload: RegistroRequest = {
      primerNombre: formData.primerNombre.trim(),
      segundoNombre: formData.segundoNombre.trim() || undefined,
      primerApellido: formData.primerApellido.trim(),
      segundoApellido: formData.segundoApellido.trim() || undefined,
      correo: formData.correo.trim().toLowerCase(),
      password: formData.contrasena,
      telefono: formData.telefono.trim(),
      sexo: formData.sexo,
      nacionalidad: formData.nacionalidad.trim(),
      tipoIdentificacion: formData.tipoIdentificacion,
      numeroIdentificacion: formData.numeroIdentificacion.trim(),
    };

    setEnviando(true);
    try {
      const res = await registro(payload);
      if (!res.success) {
        setError(res.error || "Error al registrar la cuenta.");
        setEnviando(false);
        return;
      }

      const destino = new URLSearchParams(window.location.search).get("redir");
      router.push(destino && destino.startsWith("/") ? destino : "/");
    } catch {
      setError("Ocurrió un error inesperado durante el registro.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-12">
      <div className="max-w-2xl w-full bg-surface rounded-lg shadow-xl border border-neutral-border p-8 md:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary text-white rounded-md mb-2">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary font-serif">Crea tu cuenta</h1>
          <p className="text-sm text-text-muted">
            Únete a la comunidad de expedicionarios del Club Nicaragüense de Montañismo
          </p>
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

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Primer Nombre <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.primerNombre}
              onChange={(e) => handleChange("primerNombre", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej. Carlos"
              disabled={enviando}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Segundo Nombre
            </label>
            <input
              type="text"
              value={formData.segundoNombre}
              onChange={(e) => handleChange("segundoNombre", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej. Eduardo (opcional)"
              disabled={enviando}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Primer Apellido <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.primerApellido}
              onChange={(e) => handleChange("primerApellido", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej. González"
              disabled={enviando}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Segundo Apellido
            </label>
            <input
              type="text"
              value={formData.segundoApellido}
              onChange={(e) => handleChange("segundoApellido", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej. López (opcional)"
              disabled={enviando}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Correo Electrónico <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                required
                value={formData.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="correo@ejemplo.com"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Contraseña <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                required
                value={formData.contrasena}
                onChange={(e) => handleChange("contrasena", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="Mínimo 6 caracteres"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Confirmar Contraseña <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                required
                value={formData.confirmarContrasena}
                onChange={(e) => handleChange("confirmarContrasena", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="Repite la contraseña"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Teléfono / WhatsApp <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="+505 8888-0000"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Sexo <span className="text-error">*</span>
            </label>
            <select
              value={formData.sexo}
              onChange={(e) => handleChange("sexo", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm bg-surface"
              disabled={enviando}
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Nacionalidad <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                required
                value={formData.nacionalidad}
                onChange={(e) => handleChange("nacionalidad", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                placeholder="Nicaragüense"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Tipo Identificación <span className="text-error">*</span>
            </label>
            <select
              value={formData.tipoIdentificacion}
              onChange={(e) => handleChange("tipoIdentificacion", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm bg-surface"
              disabled={enviando}
            >
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Número de Identificación <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.numeroIdentificacion}
              onChange={(e) => handleChange("numeroIdentificacion", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="001-000000-0000A"
              disabled={enviando}
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md disabled:opacity-50 text-base flex items-center justify-center gap-2"
            >
              {enviando ? (
                "Creando cuenta..."
              ) : (
                <>
                  <CheckCircle2 size={18} /> Crear mi Cuenta
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-text-muted">
              Al registrarte aceptas las normas de seguridad y convivencia del Club.
            </p>
          </div>
        </form>

        <div className="text-center border-t border-neutral-border pt-6">
          <p className="text-sm text-text-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/iniciar-sesion" className="text-primary font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
