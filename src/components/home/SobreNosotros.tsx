import Image from "next/image";
import EncabezadoSeccion from "@/components/ui/EncabezadoSeccion";

const estadisticas = [
  { valor: "150+", etiqueta: "Miembros felices" },
  { valor: "30+", etiqueta: "Excursiones realizadas" },
  { valor: "12", etiqueta: "Organizadores" },
];

const pilares = [
  {
    titulo: "Nuestra Trayectoria",
    descripcion:
      "Grupo experimentado en senderismo y montañismo, explorando y abriendo rutas en las montañas más icónicas de la región, con ética, seguridad y conservación ambiental.",
    icono: (
      <path d="M5 21V4m0 0h11l-1.5 4L16 12H5" />
    ),
  },
  {
    titulo: "Nuestra Misión",
    descripcion:
      "Inspirar pasión por el montañismo, capacitando a nuestros miembros con habilidades técnicas, valores humanos y respeto por el medio ambiente.",
    icono: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
  },
  {
    titulo: "Nuestra Visión",
    descripcion:
      "Ser el club formativo líder en Nicaragua, referente en la práctica segura y responsable del montañismo, documentando cada cumbre y ruta.",
    icono: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  },
];

export default function SobreNosotros() {
  return (
    <section id="about" className="bg-sand px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <EncabezadoSeccion
          titulo="Sobre Nosotros"
          descripcion="Comunidad dedicada a la exploración, conservación y disfrute responsable de las montañas y la naturaleza."
        />

        <div className="mt-14 grid items-stretch gap-10 md:grid-cols-2">
          <div className="relative min-h-[260px] overflow-hidden rounded-lg bg-steel">
            <Image
              src="/Presentaciones/historia/SanCristobalGrupalDron.jpg"
              alt="Expedición del club al volcán San Cristóbal"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="rounded-lg bg-surface p-8 shadow-sm ring-1 ring-ink/5">
            <h3 className="font-serif text-xl font-bold text-navy">
              Nuestra Historia
            </h3>
            <p className="mt-4 leading-relaxed text-ink/65">
              Fundado en 2024, el Club Nicaragüense de Montañismo promueve el
              montañismo seguro, la educación ambiental y la integración de
              personas apasionadas por la naturaleza de Nicaragua.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-ink/70">
              <li className="flex items-start gap-3">
                <CheckIcon />
                Excursiones guiadas a volcanes y montañas emblemáticas
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                Talleres de técnicas de montañismo y primeros auxilios
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                Voluntariado ambiental y conservación de rutas
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {estadisticas.map((estadistica) => (
            <div
              key={estadistica.etiqueta}
              className="rounded-lg bg-surface py-8 text-center ring-1 ring-ink/5"
            >
              <p className="font-serif text-3xl font-black text-navy">
                {estadistica.valor}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink/50">
                {estadistica.etiqueta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pilares.map((pilar) => (
            <div
              key={pilar.titulo}
              className="rounded-lg bg-surface p-7 ring-1 ring-ink/5"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9 text-clay"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {pilar.icono}
              </svg>
              <h3 className="mt-4 font-semibold text-navy">{pilar.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {pilar.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 h-5 w-5 shrink-0 text-clay"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}