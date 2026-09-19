import EncabezadoSeccion from "@/components/ui/EncabezadoSeccion";

const pasos = [
  {
    numero: 1,
    titulo: "Explora el catálogo",
    descripcion: "Revisa nuestras próximas excursiones y rutas disponibles.",
  },
  {
    numero: 2,
    titulo: "Elige la expedición",
    descripcion: "Escoge la que se ajuste a tu nivel de experiencia.",
  },
  {
    numero: 3,
    titulo: "Aparta tu cupo",
    descripcion: "Realiza el abono correspondiente y guarda tu lugar.",
  },
  {
    numero: 4,
    titulo: "Prepárate y únete",
    descripcion: "Alista el equipo recomendado y vive la aventura.",
  },
];

export default function ComoInscribirse() {
  return (
    <section id="how-to-book" className="bg-navy px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <EncabezadoSeccion
          titulo="¿Cómo Inscribirte a un Viaje?"
          descripcion="El paso a paso para asegurar tu lugar en nuestras expediciones"
          tituloClase="text-sand"
        />

        <div className="mt-14 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
          {pasos.map((paso, indice) => (
            <div key={paso.numero} className="flex flex-1 items-center gap-4">
              <div className="flex-1 rounded-xl bg-white/5 p-7 text-center ring-1 ring-sand/10">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-clay font-serif text-lg font-bold text-white">
                  {paso.numero}
                </span>
                <h3 className="mt-4 font-semibold text-sand">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand/65">
                  {paso.descripcion}
                </p>
              </div>
              {indice < pasos.length - 1 ? (
                <svg
                  viewBox="0 0 24 24"
                  className="hidden h-6 w-6 shrink-0 text-sand/40 md:block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}