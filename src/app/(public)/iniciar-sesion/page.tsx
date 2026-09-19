"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Campo from "@/components/ui/Campo";
import { establecerRolDemo } from "@/lib/demo";

export default function IniciarSesionPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  const entrarComoHikerGuy = () => {
    establecerRolDemo("client");
    router.push("/");
  };

  return (
    <div className="flex items-start justify-center bg-sand px-4 py-12 md:py-20">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-ink/5">
        <Link
          href="/"
          className="mx-auto flex w-fit"
          aria-label="Volver al inicio"
        >
          <Logo className="h-12 w-12" />
        </Link>

        <h1 className="mt-5 text-center font-serif text-2xl font-bold text-navy">
          Inicia sesión
        </h1>
        <p className="mt-2 text-center text-sm text-ink/60">
          Accede para reservar tu lugar en la próxima expedición.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(evento) => {
            evento.preventDefault();
            entrarComoHikerGuy();
          }}
        >
          <Campo
            label="Correo electrónico"
            tipo="email"
            placeholder="correo@ejemplo.com"
            valor={correo}
            alCambiar={setCorreo}
          />
          <Campo
            label="Contraseña"
            tipo="password"
            placeholder="Ingresa tu contraseña"
            valor={contraseña}
            alCambiar={setContraseña}
          />
          <button
            type="submit"
            className="w-full rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a9582f]"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="text-xs text-ink/45">o</span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          onClick={entrarComoHikerGuy}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 text-sm font-medium text-sand transition hover:bg-steel"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Entrar como HikerGuy
        </button>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm">
          <p className="text-ink/60">
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/registro"
              className="font-medium text-clay transition hover:text-[#a9582f]"
            >
              Regístrate
            </Link>
          </p>
          <Link
            href="/"
            className="text-xs font-medium text-ink/60 transition hover:text-navy"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}