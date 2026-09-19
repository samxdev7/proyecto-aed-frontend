interface EncabezadoSeccionProps {
  titulo: string;
  descripcion?: string;
  tituloClase?: string;
  descripcionClase?: string;
}

export default function EncabezadoSeccion({
  titulo,
  descripcion,
  tituloClase = "text-navy",
  descripcionClase = "text-ink/65",
}: EncabezadoSeccionProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div
        aria-hidden="true"
        className="mx-auto h-1 w-12 rounded-full bg-clay"
      />
      <h2
        className={`mt-4 font-serif text-3xl font-bold md:text-4xl ${tituloClase}`}
      >
        {titulo}
      </h2>
      {descripcion ? (
        <p className={`mt-4 leading-relaxed ${descripcionClase}`}>
          {descripcion}
        </p>
      ) : null}
    </div>
  );
}