import EncabezadoSeccion from "@/components/ui/EncabezadoSeccion";

const servicios = [
  {
    titulo: "Excursiones Guiadas",
    descripcion:
      "Organización de rutas y ascensos a volcanes y montañas emblemáticas de Nicaragua.",
    icono: (
      <path d="M9 20 3.6 21.8V6L9 4.2m0 15.8 6-2m-6 2V4.2m6 13.8 5.4 1.8V4.2L15 6m0 12V6m0 0L9 4.2" />
    ),
  },
  {
    titulo: "Talleres y Capacitaciones",
    descripcion:
      "Formación en técnicas de montañismo, seguridad, primeros auxilios y educación ambiental.",
    icono: (
      <>
        <path d="M22 9 12 4 2 9l10 5 10-5Z" />
        <path d="M6 11.5V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" />
      </>
    ),
  },
  {
    titulo: "Voluntariado Ambiental",
    descripcion:
      "Conservación y limpieza de rutas, reforestación y educación comunitaria.",
    icono: (
      <path d="M20 4C10 4 4 9 4 17c0 1 .1 2 .3 3C8 14 13 11 19 10c-5 2-9 5-11 10 8 0 12-5 12-16Z" />
    ),
  },
  {
    titulo: "Comunidad y Amistad",
    descripcion:
      "Fomentamos la amistad, el trabajo en equipo y el respeto por la naturaleza.",
    icono: (
      <>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
        <circle cx="10" cy="8" r="3" />
        <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3 3 0 0 1 0 5.6" />
      </>
    ),
  },
];

export default function PorQueNosotros() {
  return (
    <section id="services" className="bg-surface px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <EncabezadoSeccion
          titulo="¿Por qué viajar con nosotros?"
          descripcion="Ofrecemos actividades, talleres y excursiones para todos los niveles, promoviendo la seguridad y el respeto ambiental."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.titulo}
              className="rounded-lg bg-sand/60 p-7 text-center ring-1 ring-ink/5"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-navy text-sand">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {servicio.icono}
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-navy">
                {servicio.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {servicio.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}