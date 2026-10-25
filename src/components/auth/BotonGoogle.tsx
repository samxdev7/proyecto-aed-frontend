"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesionConGoogle } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { guardarSesion, perfilEstaCompleto } from "@/lib/auth";

interface BotonGoogleProps {
  redir?: string | null;
  texto?: string;
  className?: string;
}

export default function BotonGoogle({
  redir,
  texto = "Continuar con Google",
  className = "",
}: BotonGoogleProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState<number>(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gisListo, setGisListo] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Medir el ancho real del contenedor en el DOM
  useEffect(() => {
    if (!wrapperRef.current) return;

    const actualizarAncho = () => {
      if (wrapperRef.current) {
        const w = Math.round(wrapperRef.current.getBoundingClientRect().width);
        if (w > 0) {
          setAncho((prev) => (Math.abs(prev - w) >= 2 ? w : prev || w));
        }
      }
    };

    actualizarAncho();

    const resizeObserver = new ResizeObserver(() => {
      actualizarAncho();
    });
    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // Restablecer estado de recarga al regresar del selector de Google
    const alMostrarPagina = () => setCargando(false);
    const alRecuperarFoco = () => setCargando(false);
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") setCargando(false);
    };

    window.addEventListener("pageshow", alMostrarPagina);
    window.addEventListener("focus", alRecuperarFoco);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      window.removeEventListener("pageshow", alMostrarPagina);
      window.removeEventListener("focus", alRecuperarFoco);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  useEffect(() => {
    if (!clientId) return;

    let cancelado = false;

    function montarBotonGIS() {
      if (cancelado || !window.google?.accounts?.id || !contenedorRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) return;
            setCargando(true);
            setError(null);
            try {
              const sesionBackend = await authService.loginGoogle(response.credential);
              guardarSesion(sesionBackend);
              const perfil = await userService.getMyProfile();
              if (!perfilEstaCompleto(perfil)) {
                const destino = redir || "/viajes";
                const separador = destino.includes("?") ? "&" : "?";
                router.replace(`${destino}${separador}perfil=1`);
              } else {
                router.replace(redir || "/viajes");
              }
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "No pudimos iniciar sesión con Google. Inténtalo de nuevo."
              );
              setCargando(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Limpiar el contenedor antes de renderizar para evitar duplicados en re-render
        contenedorRef.current.innerHTML = "";

        // Medir ancho actual del wrapper o usar fallback exacto del formulario (368px)
        const anchoContenedor =
          ancho > 0
            ? ancho
            : wrapperRef.current?.getBoundingClientRect().width || 368;

        const anchoFinal = Math.min(
          400,
          Math.max(200, Math.round(anchoContenedor))
        );

        const esRegistro = texto.toLowerCase().includes("registr");

        window.google.accounts.id.renderButton(contenedorRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: esRegistro ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: anchoFinal,
          locale: "es",
        });

        setGisListo(true);
      } catch (err) {
        console.warn("No se pudo inicializar Google Identity Services:", err);
      }
    }

    if (window.google?.accounts?.id) {
      montarBotonGIS();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          montarBotonGIS();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 4000);

      return () => {
        cancelado = true;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      cancelado = true;
    };
  }, [clientId, ancho, redir, router, texto]);

  async function manejarClickFallback() {
    setCargando(true);
    setError(null);
    try {
      await iniciarSesionConGoogle(redir);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos conectar con Google. Inténtalo de nuevo."
      );
      setCargando(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`w-full space-y-xs ${className}`}>
      {/* Contenedor oficial para el botón de Google Identity Services */}
      <div
        ref={contenedorRef}
        className={`w-full flex justify-center min-h-[44px] ${
          !gisListo || cargando ? "hidden" : ""
        }`}
      />

      {/* Botón visual de fallback o estado de carga mientras se monta GIS o procesa login */}
      {(!gisListo || cargando) && (
        <button
          type="button"
          onClick={manejarClickFallback}
          disabled={cargando}
          className={`inline-flex w-full items-center justify-center gap-sm rounded-sm border border-neutral-border bg-surface px-md py-sm text-sm font-semibold text-text-main shadow-xs transition hover:bg-surface-alt hover:border-neutral-focus disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          {cargando ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{cargando ? "Iniciando sesión con Google..." : texto}</span>
        </button>
      )}

      {error ? (
        <p
          className="rounded-sm bg-estado-rechazada-bg px-sm py-xs text-center text-xs text-estado-rechazada-text"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
