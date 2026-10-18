"use client";

import { Lottie } from "lottie-react";
import animacion from "@/assets/lottie/chekMarkSuccess.json";

/**
 * Confirmación de perfil completado: reproduce el Lottie UNA vez y muestra
 * el mensaje debajo. Sin botones — la alerta se cierra sola desde el padre.
 */
export default function PerfilExito() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <Lottie
        src={animacion}
        loop={false}
        autoplay
        style={{ width: 140, height: 140 }}
      />
      <p className="text-base font-semibold text-text-main">
        Perfil rellenado con éxito
      </p>
    </div>
  );
}
