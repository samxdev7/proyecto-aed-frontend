"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import NotificacionesDrawer from "@/components/clientes/NotificacionesDrawer";
import { EVENTO_SESION, cerrarSesion, obtenerSesion } from "@/lib/auth";
import { userService } from "@/services/user.service";
import type { Sesion } from "@/types/auth";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/viajes", label: "Catálogo de viajes" },
];

/** Menú del avatar: solo "Mi cuenta" (más "Cerrar sesión" en el dropdown).
 * "Mis Inscripciones y Reservas" vive como ítem propio del nav, no aquí.
 * Las notificaciones viven solo en el drawer de la campana. */
const enlacesCuenta = [{ href: "/user/perfil", label: "Mi Cuenta" }];

function iniciales(nombreCompleto: string): string {
  return (
    nombreCompleto
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "·"
  );
}

export default function Header() {
  const [abierto, setAbierto] = useState(false);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [sesionLista, setSesionLista] = useState(false);
  const [notisAbierta, setNotisAbierta] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  const ruta = usePathname();
  const refNotis = useRef<HTMLDivElement>(null);
  const refPerfil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const actualizar = () => {
      setSesion(obtenerSesion());
      setSesionLista(true);
    };
    actualizar();
    window.addEventListener(EVENTO_SESION, actualizar);
    return () => window.removeEventListener(EVENTO_SESION, actualizar);
  }, []);

  const cargarNoLeidas = useCallback(() => {
    if (!obtenerSesion()) {
      setNoLeidas(0);
      return;
    }
    userService
      .getMyNotifications(0, 20)
      .then((pagina) =>
        setNoLeidas(pagina.content.filter((notificacion) => !notificacion.leida).length),
      )
      .catch(() => setNoLeidas(0));
  }, []);

  useEffect(() => {
    if (!sesionLista) return;
    cargarNoLeidas();
  }, [sesionLista, sesion, cargarNoLeidas]);

  useEffect(() => {
    const alClicFuera = (evento: MouseEvent) => {
      if (
        refPerfil.current &&
        !refPerfil.current.contains(evento.target as Node)
      ) {
        setPerfilAbierto(false);
      }
    };
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setNotisAbierta(false);
        setPerfilAbierto(false);
      }
    };
    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alPresionarEscape);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, []);

  const claseEnlace = (href: string) =>
    ruta === href
      ? "border-b-2 border-ochre pb-0.5 font-medium text-sand"
      : "transition hover:text-sand";

  const conSesion = sesionLista && sesion !== null;

  const cerrarSesionHeader = () => {
    cerrarSesion();
    setPerfilAbierto(false);
    setAbierto(false);
  };

  const botonCampana = (onclick: () => void, ariaExpanded: boolean) => (
    <button
      type="button"
      onClick={onclick}
      aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ""}`}
      aria-expanded={ariaExpanded}
      className="relative rounded p-2 text-sand transition hover:bg-white/10"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {noLeidas > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-sm bg-clay px-1 text-[10px] font-bold text-white">
          {noLeidas > 9 ? "9+" : noLeidas}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            aria-label="Inicio"
            className="flex min-w-0 items-center gap-2.5"
          >
            <Logo className="h-10 w-10 shrink-0 md:h-12 md:w-12" />
            <span className="truncate text-sm font-semibold text-sand md:text-base">
              Club Nicaragüense de Montañismo
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <nav className="flex items-center gap-8 text-sm text-sand/80">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  className={claseEnlace(enlace.href)}
                >
                  {enlace.label}
                </Link>
              ))}
              {conSesion ? (
                <Link
                  href="/user/reservas"
                  className={
                    ruta.startsWith("/user/reservas")
                      ? "border-b-2 border-ochre pb-0.5 font-medium text-sand"
                      : "transition hover:text-sand"
                  }
                >
                  Mis Inscripciones y Reservas
                </Link>
              ) : null}
            </nav>

            {conSesion && sesion ? (
              <div className="flex items-center gap-1">
                <div ref={refNotis}>
                  {botonCampana(
                    () => {
                      setNotisAbierta((valor) => !valor);
                      setPerfilAbierto(false);
                    },
                    notisAbierta,
                  )}
                </div>

                <div ref={refPerfil}>
                  <button
                    type="button"
                    onClick={() => {
                      setPerfilAbierto((valor) => !valor);
                      setNotisAbierta(false);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={perfilAbierto}
                    className="flex items-center gap-2 rounded py-1 pl-1 pr-2 text-sand transition hover:bg-white/10"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ochre text-xs font-bold text-navy">
                      {iniciales(sesion.nombreCompleto)}
                    </span>
                    <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
                      {sesion.nombreCompleto.split(" ")[0]}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className="hidden h-4 w-4 text-sand/60 md:block"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {perfilAbierto ? (
                    <div
                      role="menu"
                      className="absolute right-4 top-[calc(100%+10px)] w-56 rounded-md bg-navy p-1 shadow-2xl ring-1 ring-sand/15"
                    >
                      <div className="border-b border-sand/10 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-sand">
                          {sesion.nombreCompleto}
                        </p>
                        <p className="truncate text-xs text-sand/50">
                          {sesion.correo}
                        </p>
                      </div>
                      {enlacesCuenta.map((enlace) => (
                        <Link
                          key={enlace.href}
                          role="menuitem"
                          href={enlace.href}
                          onClick={() => setPerfilAbierto(false)}
                          className="block rounded-sm px-3 py-2 text-sm text-sand/90 transition hover:bg-white/10"
                        >
                          {enlace.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={cerrarSesionHeader}
                        className="mt-1 w-full rounded-md bg-clay px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-clay-dark"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/iniciar-sesion"
                  className="rounded-md border border-sand/40 px-4 py-2 text-sm text-sand transition hover:bg-sand/10"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-white transition hover:bg-clay-dark"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {conSesion
              ? botonCampana(
                  () => {
                    setNotisAbierta((valor) => !valor);
                    setPerfilAbierto(false);
                  },
                  notisAbierta,
                )
              : null}

            <button
              type="button"
              onClick={() => setAbierto((valor) => !valor)}
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto}
              className="text-sand"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {abierto ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {abierto ? (
          <div className="border-t border-sand/15 bg-navy px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-4 text-sm text-sand/90">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setAbierto(false)}
                  className={claseEnlace(enlace.href)}
                >
                  {enlace.label}
                </Link>
              ))}

              {conSesion && sesion ? (
                <>
                  {enlacesCuenta.map((enlace) => (
                    <Link
                      key={enlace.href}
                      href={enlace.href}
                      onClick={() => setAbierto(false)}
                      className={claseEnlace(enlace.href)}
                    >
                      {enlace.label}
                    </Link>
                  ))}
                  <Link
                    href="/user/reservas"
                    onClick={() => setAbierto(false)}
                    className={claseEnlace("/user/reservas")}
                  >
                    Mis Inscripciones y Reservas
                  </Link>
                  <div className="mt-2 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={cerrarSesionHeader}
                      className="rounded-md bg-clay px-md py-sm text-center font-medium text-white"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-3">
                  <Link
                    href="/iniciar-sesion"
                    onClick={() => setAbierto(false)}
                    className="rounded-md border border-sand/40 px-md py-sm text-center text-sand"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setAbierto(false)}
                    className="rounded-md bg-clay px-md py-sm text-center font-medium text-white"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <NotificacionesDrawer
        abierta={notisAbierta}
        onCerrar={() => setNotisAbierta(false)}
        onCambio={cargarNoLeidas}
      />
    </>
  );
}
