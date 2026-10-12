const WHATSAPP_CNM = "50557164892";
const ENLACE_WHATSAPP = `https://wa.me/${WHATSAPP_CNM}?text=${encodeURIComponent(
  "Hola, quiero información del Club Nicaragüense de Montañismo.",
)}`;

// Logo oficial de WhatsApp (mismo path que usa Footer).
const iconoWhatsApp = (
  <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.35 9.35 0 0 1 6.65 2.76 9.34 9.34 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.41 9.41Zm8-17.41A11.29 11.29 0 0 0 12.05.75C5.83.75.77 5.8.77 12.02c0 2 .52 3.94 1.51 5.66L.7 23.25l5.72-1.5a11.25 11.25 0 0 0 5.62 1.43h.01c6.21 0 11.27-5.05 11.27-11.27 0-3.01-1.17-5.84-3.3-7.97Z" />
);

export default function Contacto() {
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
                href={ENLACE_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-sm transition hover:text-navy"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded bg-navy text-sand">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {iconoWhatsApp}
                  </svg>
                </span>
                +505 5716 4892
              </a>
            </li>
          </ul>
        </div>

        {/* CTA directo a WhatsApp — reemplaza al formulario. */}
        <div className="flex w-full max-w-lg flex-col items-center gap-md rounded-lg bg-surface p-xl text-center shadow-sm ring-1 ring-ink/5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="currentColor"
              aria-hidden="true"
            >
              {iconoWhatsApp}
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-bold text-navy">
              Habla directo con el club
            </h3>
            <p className="mt-xs text-sm text-ink/65">
              Sin formularios ni esperas: te atendemos por WhatsApp.
            </p>
          </div>
          <a
            href={ENLACE_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-sm rounded-md bg-[#25D366] px-lg py-sm font-semibold text-white transition hover:bg-[#1fb859]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              {iconoWhatsApp}
            </svg>
            Escríbenos por WhatsApp
          </a>
          <p className="text-xs text-text-muted">
            Se abrirá WhatsApp con un mensaje listo para enviar.
          </p>
        </div>
      </div>
    </section>
  );
}
