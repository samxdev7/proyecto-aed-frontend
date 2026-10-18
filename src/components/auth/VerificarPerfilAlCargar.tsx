"use client";

import { useEffect } from "react";
import { obtenerSesion, perfilEstaCompleto, marcarPerfilCompleto } from "@/lib/auth";
import { userService } from "@/services/user.service";

/**
 * Verifica el perfil del usuario la primera vez que carga una página pública
 * (catálogo, home, etc.) y guarda el resultado por usuario. Así, al navegar a
 * un viaje e intentar reservar, la inscripción ya sabe si el perfil está
 * completo sin esperar a cargarlo.
 */
export default function VerificarPerfilAlCargar() {
  useEffect(() => {
    const sesion = obtenerSesion();
    if (!sesion || sesion.rol === "administrador") return;

    userService
      .getMyProfile()
      .then((perfil) => {
        marcarPerfilCompleto(sesion.idUsuario, perfilEstaCompleto(perfil));
      })
      .catch(() => {
        /* sin conexión: la inscripción lo reintentará */
      });
  }, []);

  return null;
}
