"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CLAVE_SESION, EVENTO_SESION } from "@/lib/auth";
import type { Sesion } from "@/types/auth";

/**
 * Lector cacheado para useSyncExternalStore: localStorage devuelve un objeto
 * nuevo en cada lectura, así que cacheamos por string crudo para que el
 * snapshot sea estable entre renders.
 */
let cache: { cruda: string | null; valor: Sesion | null } = {
  cruda: undefined as unknown as string | null,
  valor: null,
};

function leerSesion(): Sesion | null {
  const cruda =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(CLAVE_SESION);
  if (cruda === cache.cruda) return cache.valor;
  try {
    cache = {
      cruda,
      valor: cruda ? (JSON.parse(cruda) as Sesion) : null,
    };
  } catch {
    cache = { cruda, valor: null };
  }
  return cache.valor;
}

function suscribirSesion(callback: () => void) {
  window.addEventListener(EVENTO_SESION, callback);
  return () => window.removeEventListener(EVENTO_SESION, callback);
}

/**
 * Área de cliente: páginas APARTE del sitio, no una sección anidada. Usa el
 * mismo chrome público (Header + Footer) para que el usuario nunca pierda la
 * navegación; solo añade el guard de sesión y un contenedor consistente.
 */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getServerSnapshot = null: en SSR no hay sesión; el redirect lo decide el
  // efecto post-hidratación (nunca desde el render de hidratación).
  const sesion = useSyncExternalStore(suscribirSesion, leerSesion, () => null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!sesion) {
      router.replace(`/iniciar-sesion?redir=${pathname}`);
    }
  }, [sesion, router, pathname]);

  if (!sesion) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-lg py-lg">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
