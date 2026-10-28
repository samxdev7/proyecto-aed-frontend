"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { leerPerfilCompleto, obtenerSesion, EVENTO_SESION } from "@/lib/auth";
import { reservaService } from "@/services/reserva.service";
import type { HistorialReservaResumen } from "@/types/reserva";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import CompletarPerfilPopup from "@/components/auth/CompletarPerfilPopup";

const ESTADOS_BLOQUEANTES: HistorialReservaResumen["estado"][] = [
  "pendiente",
  "aprobada",
  "expirada",
];

/**
 * Botón "Reservar" del detalle de viaje:
 * - si ya tiene reserva previa → botón "Ver el estado de mi reserva" con estado visual.
 * - no autenticado → modal central invitando a iniciar sesión para reservar.
 * - admin → alerta de que no puede reservar.
 * - perfil incompleto → popup para completarlo.
 * - cliente listo → flujo de inscripción.
 */
export default function BotonReservar({ idViaje }: { idViaje: number }) {
  const router = useRouter();
  const [adminBloqueado, setAdminBloqueado] = useState(false);
  const [loginModalAbierto, setLoginModalAbierto] = useState(false);
  const [perfilPopupAbierto, setPerfilPopupAbierto] = useState(false);
  const [reservaExistente, setReservaExistente] = useState<
    HistorialReservaResumen | null | undefined
  >(undefined);

  useEffect(() => {
    function verificarReserva() {
      const sesion = obtenerSesion();
      if (!sesion || sesion.rol === "administrador") {
        setReservaExistente(null);
        return;
      }
      let activo = true;
      reservaService
        .listarMisReservas(0, 50)
        .then((pagina) => {
          if (activo) {
            const match = pagina.content.find(
              (r) =>
                r.viaje.idViaje === idViaje &&
                ESTADOS_BLOQUEANTES.includes(r.estado),
            );
            setReservaExistente(match ?? null);
          }
        })
        .catch(() => {
          if (activo) setReservaExistente(null);
        });
      return () => {
        activo = false;
      };
    }

    verificarReserva();
    window.addEventListener(EVENTO_SESION, verificarReserva);
    return () => window.removeEventListener(EVENTO_SESION, verificarReserva);
  }, [idViaje]);

  function reservar() {
    const sesion = obtenerSesion();

    if (!sesion) {
      setLoginModalAbierto(true);
      return;
    }

    if (sesion.rol === "administrador") {
      setAdminBloqueado(true);
      return;
    }

    if (reservaExistente) {
      router.push(`/user/reservas/${reservaExistente.idReserva}`);
      return;
    }

    if (leerPerfilCompleto(sesion.idUsuario) === false) {
      setPerfilPopupAbierto(true);
      return;
    }

    router.push(`/inscripcion/${idViaje}`);
  }

  return (
    <>
      {reservaExistente ? (
        <div className="space-y-sm">
          <div className="space-y-xs rounded-sm border border-neutral-border bg-surface-alt p-sm">
            <div className="flex items-center justify-between gap-xs">
              <span className="text-xs font-semibold text-primary">
                Ya tienes una reserva
              </span>
              <Chip estado={reservaExistente.estado} />
            </div>
            <p className="text-xs text-text-muted">
              Ya cuentas con una inscripción registrada para esta expedición.
            </p>
          </div>

          <Boton
            href={`/user/reservas/${reservaExistente.idReserva}`}
            fullWidth
          >
            Ver el estado de mi reserva
          </Boton>
        </div>
      ) : (
        <Boton type="button" fullWidth onClick={reservar}>
          Reservar
        </Boton>
      )}

      <CompletarPerfilPopup
        abierto={perfilPopupAbierto}
        onCerrar={() => setPerfilPopupAbierto(false)}
        alCompletar={() => {
          setPerfilPopupAbierto(false);
          router.push(`/inscripcion/${idViaje}`);
        }}
        textoOmitir="Omitir y seguir viendo"
      />

      {/* Modal central: iniciar sesión antes de reservar */}
      <Modal
        abierto={loginModalAbierto}
        onCerrar={() => setLoginModalAbierto(false)}
        titulo="Inicia sesión para reservar"
        className="max-w-md p-lg"
      >
        <button
          type="button"
          onClick={() => setLoginModalAbierto(false)}
          aria-label="Cerrar ventana"
          className="absolute right-sm top-sm flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-alt hover:text-text-main"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-md text-center py-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-primary">
            <LogIn size={26} aria-hidden="true" />
          </div>
          <div className="space-y-xs">
            <h2 className="text-xl font-bold text-text-main">
              Inicia sesión para reservar
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Para reservar tu cupo en esta expedición necesitas iniciar sesión en tu cuenta.
            </p>
          </div>

          <div className="w-full space-y-sm pt-xs">
            <Boton
              href={`/iniciar-sesion?redir=/inscripcion/${idViaje}`}
              fullWidth
              className="font-medium"
            >
              Iniciar sesión
            </Boton>
            <p className="text-xs text-text-muted">
              ¿No tienes cuenta aún?{" "}
              <Link
                href={`/registro?redir=/inscripcion/${idViaje}`}
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        abierto={adminBloqueado}
        onCerrar={() => setAdminBloqueado(false)}
        titulo="Reserva no disponible"
        className="max-w-md p-lg"
      >
        <button
          type="button"
          onClick={() => setAdminBloqueado(false)}
          aria-label="Cerrar alerta"
          className="absolute right-sm top-sm flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-alt hover:text-error"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-md text-center">
          <svg
            viewBox="0 0 512 512"
            className="h-16 w-16 text-error"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M335.188 154.188 256 233.375l-79.188-79.187-22.624 22.624L233.375 256l-79.187 79.188 22.624 22.624L256 278.625l79.188 79.187 22.624-22.624L278.625 256l79.187-79.188z" />
            <path d="M256 0C114.609 0 0 114.609 0 256s114.609 256 256 256 256-114.609 256-256S397.391 0 256 0m0 472c-119.297 0-216-96.703-216-216S136.703 40 256 40s216 96.703 216 216-96.703 216-216 216" />
          </svg>
          <h2 className="text-lg font-bold text-text-main">
            Los administradores no pueden reservar cupos
          </h2>
          <p className="text-sm text-text-muted">
            Esta cuenta tiene rol de administrador. Para reservar un cupo, usa
            una cuenta de cliente.
          </p>
        </div>
      </Modal>
    </>
  );
}
