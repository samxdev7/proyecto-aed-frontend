"use client";

import { useState } from "react";
import Campo from "@/components/ui/Campo";
import Boton from "@/components/ui/Boton";

const WHATSAPP_CNM = "50557164892";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  function enviar() {
    const remitente = correo ? `${nombre} <${correo}>` : nombre;
    window.open(
      `https://wa.me/${WHATSAPP_CNM}?text=${encodeURIComponent(
        `${remitente}: ${mensaje}`,
      )}`,
      "_blank",
    );
  }

  return (
    <section id="contact" className="bg-sand px-md py-20 md:px-lg md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-lg md:flex-row">
        <div className="max-w-md">
          <div aria-hidden="true" className="h-1 w-12 rounded bg-clay" />
          <h2 className="mt-sm font-serif text-3xl font-bold text-navy md:text-4xl">
            Contáctanos
          </h2>
          <p className="mt-sm leading-relaxed text-ink/65">
            ¿Listo para la aventura? Escríbenos y te responderemos a la
            brevedad.
          </p>
          <ul className="mt-lg space-y-md text-sm text-ink/75">
            <li className="flex items-center gap-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-navy text-sand">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="11" r="4" />
                  <path d="m12 20-4.5-5.5A6.2 6.2 0 0 1 12 5a6.2 6.2 0 0 1 4.5 9.5Z" />
                </svg>
              </span>
              Managua, Nicaragua
            </li>
            <li className="flex items-center gap-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-navy text-sand">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 5h4l1.5 4L7 11a12 12 0 0 0 6 6l2-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 2 7a2 2 0 0 1 2-2Z" />
                </svg>
              </span>
              cnmontanismo@gmail.com
            </li>
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_CNM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-sm transition hover:text-navy"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded bg-navy text-sand">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 4a7 7 0 0 1 6 6M14 9a3 3 0 0 1 1 2.5" />
                    <path d="M3 12V5a2 2 0 0 1 2-2h4L11 6l-2.5 2.5a12 12 0 0 0 7 7L18 13l3 1v4a2 2 0 0 1-2 2A16 16 0 0 1 3 12Z" />
                  </svg>
                </span>
                +505 5716 4892
              </a>
            </li>
          </ul>
        </div>

        <div className="w-full max-w-lg rounded-lg bg-surface p-lg shadow-sm ring-1 ring-ink/5">
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
            <Campo
              label="Nombre"
              placeholder="Tu nombre"
              valor={nombre}
              alCambiar={setNombre}
            />
            <Campo
              label="Correo electrónico"
              tipo="email"
              placeholder="correo@ejemplo.com"
              valor={correo}
              alCambiar={setCorreo}
            />
          </div>
          <div className="mt-sm">
            <Campo
              label="Mensaje"
              placeholder="Cuéntanos tu idea"
              multilinea
              valor={mensaje}
              alCambiar={setMensaje}
            />
          </div>
          <Boton fullWidth className="mt-md" onClick={enviar}>
            Enviar mensaje
          </Boton>
          <p className="mt-xs text-center text-xs text-text-muted">
            Se abrirá WhatsApp con tu mensaje listo para enviar.
          </p>
        </div>
      </div>
    </section>
  );
}
