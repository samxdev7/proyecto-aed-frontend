import Boton from "@/components/ui/Boton";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-sm px-lg text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="font-serif text-2xl font-bold text-text-main">
        Página no encontrada
      </h1>
      <p className="max-w-md text-sm text-text-muted">
        La ruta que buscas no existe o fue movida.
      </p>
      <Boton href="/" className="mt-sm">
        Volver al inicio
      </Boton>
    </main>
  );
}
