import Campo from "@/components/ui/Campo";

export default function Contacto() {
  return (
    <section id="contact" className="bg-sand px-6 py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row">
        <div className="max-w-md">
          <div aria-hidden="true" className="h-1 w-12 rounded-full bg-clay" />
          <h2 className="mt-4 font-serif text-3xl font-bold text-navy md:text-4xl">
            Contáctanos
          </h2>
          <p className="mt-4 leading-relaxed text-ink/65">
            ¿Listo para la aventura? Escríbenos y te responderemos a la
            brevedad.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-ink/75">
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sand">
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
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sand">
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
                  href="https://wa.me/50557164892"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition hover:text-navy"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sand">
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

        <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm ring-1 ring-ink/5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo label="Nombre" placeholder="Tu nombre" />
            <Campo
              label="Correo electrónico"
              tipo="email"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="mt-5">
            <Campo label="Mensaje" placeholder="Cuéntanos tu idea" multilinea />
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a9582f]"
          >
            Enviar mensaje
          </button>
        </div>
      </div>
    </section>
  );
}