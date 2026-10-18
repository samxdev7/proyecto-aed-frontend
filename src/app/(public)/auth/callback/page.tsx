"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { guardarSesion, perfilEstaCompleto } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirParam = searchParams.get("redir");
  const redir = redirParam && redirParam.startsWith("/") ? redirParam : null;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function procesarOAuth() {
      try {
        // 1. Si viene un código PKCE en la query, intercambiarlo por sesión
        const code = searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // 2. Obtener sesión actual de Supabase
        const {
          data: { session },
          error: supabaseError,
        } = await supabase.auth.getSession();

        if (supabaseError) {
          throw supabaseError;
        }

        let token = session?.access_token;

        // Si no está de inmediato (ej. hash fragment en proceso de parseo), esperar evento de auth
        if (!token) {
          const sesionEvento = await new Promise<string | null>((resolve) => {
            const {
              data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
              if (nuevaSesion?.access_token) {
                subscription.unsubscribe();
                resolve(nuevaSesion.access_token);
              }
            });

            // Timeout de 5 segundos si no se recibe sesión
            setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 5000);
          });

          token = sesionEvento ?? undefined;
        }

        if (!token) {
          throw new Error("No pudimos obtener la sesión de Google desde Supabase.");
        }

        if (!activo) return;

        // 3. Sincronizar con el Backend Spring Boot vía POST /auth/google
        const sesionBackend = await authService.loginGoogle(token);
        guardarSesion(sesionBackend);

        // 4. Evaluar si el usuario tiene su perfil completo (nombre, identificación, nacionalidad)
        const perfil = await userService.getMyProfile();

        if (!activo) return;

        if (!perfilEstaCompleto(perfil)) {
          // Usuario nuevo o con perfil incompleto: enviar a completar perfil
          const destino = redir
            ? `/completar-perfil?redir=${encodeURIComponent(redir)}`
            : "/completar-perfil";
          router.replace(destino);
        } else {
          // Usuario recurrente con perfil completo: enviar al destino o catálogo
          router.replace(redir || "/viajes");
        }
      } catch (e) {
        if (!activo) return;
        setError(
          e instanceof Error
            ? e.message
            : "Ocurrió un error al procesar el inicio de sesión con Google.",
        );
      }
    }

    procesarOAuth();

    return () => {
      activo = false;
    };
  }, [router, searchParams, redir]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <div className="w-full max-w-md space-y-md rounded-lg border border-neutral-border bg-surface p-lg text-center shadow-sm md:p-xl">
        {error ? (
          <div className="space-y-md">
            <div className="mx-auto inline-flex rounded-full bg-estado-rechazada-bg p-sm text-estado-rechazada-text">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-xl font-bold text-text-main">
              Error de Autenticación
            </h1>
            <p className="text-sm text-text-muted">{error}</p>
            <div className="pt-sm">
              <Link
                href="/iniciar-sesion"
                className="inline-block rounded-sm bg-primary px-md py-sm text-sm font-semibold text-white hover:bg-primary-light transition"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-md py-lg">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h1 className="text-lg font-semibold text-text-main">
              Conectando con Google...
            </h1>
            <p className="text-xs text-text-muted">
              Estamos configurando tu sesión de forma segura. Serás redirigido en un momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-bg-main">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
