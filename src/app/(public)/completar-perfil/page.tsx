"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import { userService } from "@/services/user.service";
import type { UsuarioPerfil } from "@/types/usuario";
import Skeleton from "@/components/ui/Skeleton";
import SeccionCompletarPerfil from "@/components/auth/SeccionCompletarPerfil";

function perfilEstaCompleto(p: UsuarioPerfil): boolean {
  return (
    !!p.primerNombre?.trim() &&
    !!p.primerApellido?.trim() &&
    !!p.numeroIdentificacion?.trim() &&
    !!p.nacionalidad?.trim()
  );
}

function ContenidoCompletarPerfil() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redir = searchParams.get("redir");

  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const sesion = obtenerSesion();
    if (!sesion) {
      const loginUrl = redir
        ? `/iniciar-sesion?redir=${encodeURIComponent(`/completar-perfil?redir=${encodeURIComponent(redir)}`)}`
        : "/iniciar-sesion?redir=/completar-perfil";
      router.replace(loginUrl);
      return;
    }

    let activo = true;
    userService
      .getMyProfile()
      .then((perfil) => {
        if (!activo) return;
        if (perfilEstaCompleto(perfil)) {
          // Si el perfil ya estaba completo, continuar al destino o a viajes
          router.replace(redir && redir.startsWith("/") ? redir : "/viajes");
        } else {
          setVerificando(false);
        }
      })
      .catch(() => {
        if (activo) setVerificando(false);
      });

    return () => {
      activo = false;
    };
  }, [router, redir]);

  if (verificando) {
    return (
      <div className="w-full max-w-xl space-y-md rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
        <Skeleton className="h-10 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-4/5 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <SeccionCompletarPerfil
      redir={redir}
      titulo="Completa tu perfil de usuario"
      descripcion="Tus datos personales son necesarios para formalizar reservas y asegurar tus cupos en las expediciones."
    />
  );
}

export default function CompletarPerfilPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <Suspense
        fallback={
          <div className="w-full max-w-xl space-y-md rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-4/5 mx-auto" />
          </div>
        }
      >
        <ContenidoCompletarPerfil />
      </Suspense>
    </div>
  );
}
