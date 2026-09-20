import Link from "next/link";
import Logo from "@/components/layout/Logo";

interface TarjetaCuentaProps {
  tipo: "registro" | "inicio";
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  textoNavegacion: string;
  enlaceNavegacion: string;
  textoEnlace: string;
}

export default function TarjetaCuenta({
  tipo,
  titulo,
  subtitulo,
  children,
  textoNavegacion,
  enlaceNavegacion,
  textoEnlace,
}: TarjetaCuentaProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-ink/5">
        <Link
          href="/"
          className="mx-auto flex w-fit"
          aria-label="Volver al inicio"
        >
          <Logo className="h-12 w-12" />
        </Link>

        <h1 className="mt-5 text-center font-serif text-2xl font-bold text-navy">
          {titulo}
        </h1>
        <p className="mt-2 text-center text-sm text-ink/60">{subtitulo}</p>

        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M21.35 11.1H12v3.15h5.35c-.45 2.37-2.5 3.75-5.35 3.75a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.35-2.35A9.36 9.36 0 0 0 12 2.3c-5.35 0-9.7 4.35-9.7 9.7S6.65 21.7 12 21.7c5.6 0 9.3-3.95 9.3-9.5 0-.65-.05-1.15-.15-1.65Z"
              fill="currentColor"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="text-xs text-ink/45">o</span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <div className="space-y-4">{children}</div>

        <button
          type="button"
          className="mt-6 w-full rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a9582f]"
        >
          {tipo === "registro" ? "Crear cuenta" : "Iniciar sesión"}
        </button>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm">
          <Link
            href="/"
            className="text-xs font-medium text-ink/60 transition hover:text-navy"
          >
            ← Volver al Inicio
          </Link>
          <p className="text-ink/60">
            {textoNavegacion}{" "}
            <Link
              href={enlaceNavegacion}
              className="font-medium text-clay transition hover:text-[#a9582f]"
            >
              {textoEnlace}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}