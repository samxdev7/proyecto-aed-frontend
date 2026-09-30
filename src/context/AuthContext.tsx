"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { UsuarioPerfil } from "@/types/usuario";
import type { RegistroRequest } from "@/types/auth";
import { EVENTO_SESION_DEMO } from "@/lib/demo";

export interface AuthContextType {
  user: UsuarioPerfil | null;
  token: string | null;
  rol: "cliente" | "administrador" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  registro: (datos: RegistroRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLAVE_STORAGE = "cnm_auth_user";
const CLAVE_USERS_DB = "cnm_registered_users";

// Usuarios de prueba preconfigurados
const USUARIOS_DEMO: Array<{ usuario: UsuarioPerfil; passwordHash: string }> = [
  {
    usuario: {
      idUsuario: 100,
      primerNombre: "Administrador",
      primerApellido: "CNM",
      nombreCompleto: "Administrador CNM",
      correo: "admin@cnm.org.ni",
      rol: "administrador",
      telefono: "+505 8888-0000",
      sexo: "M",
      nacionalidad: "Nicaragüense",
      tipoIdentificacion: "cedula",
      numeroIdentificacion: "001-010180-0001A",
      notificacionesHabilitadas: true,
      fechaRegistro: "2026-01-01T08:00:00Z",
    },
    passwordHash: "admin123",
  },
  {
    usuario: {
      idUsuario: 1,
      primerNombre: "Carlos",
      primerApellido: "González",
      nombreCompleto: "Carlos González",
      correo: "carlos@example.com",
      rol: "cliente",
      telefono: "+505 8888-9999",
      sexo: "M",
      nacionalidad: "Nicaragüense",
      tipoIdentificacion: "cedula",
      numeroIdentificacion: "001-150890-0001A",
      notificacionesHabilitadas: true,
      fechaRegistro: "2026-05-10T10:00:00Z",
    },
    passwordHash: "cliente123",
  },
];

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`)
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

function obtenerSesionInicial(): { user: UsuarioPerfil | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const cookieToken = getCookie("cnm_token");
    const cookieUser = getCookie("cnm_user");
    if (cookieToken && cookieUser) {
      return { user: JSON.parse(cookieUser) as UsuarioPerfil, token: cookieToken };
    }
    const stored = localStorage.getItem(CLAVE_STORAGE);
    if (stored) {
      const { user: u, token: t } = JSON.parse(stored);
      if (u && t) return { user: u, token: t };
    }
  } catch (e) {
    console.error("Error al restaurar sesión inicial:", e);
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<{ user: UsuarioPerfil | null; token: string | null }>(
    () => obtenerSesionInicial()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar almacén local de usuarios registrados si no existe
  const obtenerBaseUsuarios = useCallback((): Array<{ usuario: UsuarioPerfil; passwordHash: string }> => {
    if (typeof window === "undefined") return USUARIOS_DEMO;
    try {
      const stored = localStorage.getItem(CLAVE_USERS_DB);
      if (!stored) {
        localStorage.setItem(CLAVE_USERS_DB, JSON.stringify(USUARIOS_DEMO));
        return USUARIOS_DEMO;
      }
      return JSON.parse(stored);
    } catch {
      return USUARIOS_DEMO;
    }
  }, []);

  const persistirUsuarioEnSesion = (u: UsuarioPerfil, t: string) => {
    setSesion({ user: u, token: t });
    setCookie("cnm_token", t, 7);
    setCookie("cnm_rol", u.rol, 7);
    setCookie("cnm_user", JSON.stringify(u), 7);
    if (typeof window !== "undefined") {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ user: u, token: t }));
      localStorage.setItem("cnm_demo_rol", u.rol === "administrador" ? "admin" : "client");
      window.dispatchEvent(new Event(EVENTO_SESION_DEMO));
    }
  };

  const limpiarSesion = () => {
    setSesion({ user: null, token: null });
    deleteCookie("cnm_token");
    deleteCookie("cnm_rol");
    deleteCookie("cnm_user");
    if (typeof window !== "undefined") {
      localStorage.removeItem(CLAVE_STORAGE);
      localStorage.removeItem("cnm_demo_rol");
      window.dispatchEvent(new Event(EVENTO_SESION_DEMO));
    }
  };

  // Sincronizar cookies si la sesión venía de localStorage en el primer render
  useEffect(() => {
    if (sesion.user && sesion.token) {
      if (!getCookie("cnm_token")) {
        setCookie("cnm_token", sesion.token, 7);
        setCookie("cnm_rol", sesion.user.rol, 7);
        setCookie("cnm_user", JSON.stringify(sesion.user), 7);
      }
    }
  }, [sesion]);

  const login = async (correo: string, contrasena: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const usuarios = obtenerBaseUsuarios();
      const match = usuarios.find(
        (entry) => entry.usuario.correo.toLowerCase() === correo.trim().toLowerCase()
      );

      if (!match) {
        return { success: false, error: "No existe una cuenta asociada a este correo electrónico." };
      }

      if (match.passwordHash !== contrasena) {
        return { success: false, error: "Contraseña incorrecta. Por favor verifícala." };
      }

      const generatedToken = `cnm-mock-jwt-${match.usuario.idUsuario}-${Date.now()}`;
      persistirUsuarioEnSesion(match.usuario, generatedToken);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (datos: RegistroRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const usuarios = obtenerBaseUsuarios();
      const existe = usuarios.some(
        (entry) => entry.usuario.correo.toLowerCase() === datos.correo.trim().toLowerCase()
      );

      if (existe) {
        return { success: false, error: "El correo electrónico ya se encuentra registrado." };
      }

      const idNuevo = 1000 + usuarios.length;
      const nombreCompleto = [
        datos.primerNombre,
        datos.segundoNombre,
        datos.primerApellido,
        datos.segundoApellido,
      ]
        .filter(Boolean)
        .join(" ");

      const nuevoUsuario: UsuarioPerfil = {
        idUsuario: idNuevo,
        primerNombre: datos.primerNombre,
        segundoNombre: datos.segundoNombre,
        primerApellido: datos.primerApellido,
        segundoApellido: datos.segundoApellido,
        nombreCompleto,
        correo: datos.correo,
        rol: "cliente",
        telefono: datos.telefono,
        sexo: datos.sexo || "No especificado",
        nacionalidad: datos.nacionalidad || "Nicaragüense",
        tipoIdentificacion: datos.tipoIdentificacion || "cedula",
        numeroIdentificacion: datos.numeroIdentificacion,
        notificacionesHabilitadas: true,
        fechaRegistro: new Date().toISOString(),
      };

      const nuevaLista = [...usuarios, { usuario: nuevoUsuario, passwordHash: datos.password }];
      if (typeof window !== "undefined") {
        localStorage.setItem(CLAVE_USERS_DB, JSON.stringify(nuevaLista));
      }

      const generatedToken = `cnm-mock-jwt-${nuevoUsuario.idUsuario}-${Date.now()}`;
      persistirUsuarioEnSesion(nuevoUsuario, generatedToken);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    limpiarSesion();
  };

  return (
    <AuthContext.Provider
      value={{
        user: sesion.user,
        token: sesion.token,
        rol: sesion.user ? sesion.user.rol : null,
        isAuthenticated: !!sesion.user && !!sesion.token,
        isLoading,
        login,
        registro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
