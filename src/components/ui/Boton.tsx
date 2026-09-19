import Link from "next/link";

type Variante = "primario" | "contornoClaro" | "contornoOscuro";

const variantes: Record<Variante, string> = {
  primario: "bg-clay text-white hover:bg-[#a9582f]",
  contornoClaro: "border border-sand/40 text-sand hover:bg-sand/10",
  contornoOscuro: "border border-navy/30 text-navy hover:bg-navy/5",
};

interface BotonProps {
  children: React.ReactNode;
  href?: string;
  variante?: Variante;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

export default function Boton({
  children,
  href,
  variante = "primario",
  className = "",
  type = "button",
  onClick,
}: BotonProps) {
  const clases = `inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition ${variantes[variante]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={clases}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={clases}>
      {children}
    </button>
  );
}