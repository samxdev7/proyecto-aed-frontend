import Link from "next/link";
import { LoaderCircle } from "lucide-react";

type Variante =
  | "primario"
  | "oscuro"
  | "contorno"
  | "danger"
  | "contornoClaro"
  | "contornoOscuro";

type Tamano = "sm" | "md";

const variantes: Record<Variante, string> = {
  primario: "bg-clay text-white hover:bg-clay-dark",
  oscuro: "bg-primary text-sand hover:bg-primary-dark",
  contorno: "border border-neutral-border text-text-main hover:bg-surface-alt",
  danger: "bg-error text-white hover:bg-error/90",
  contornoClaro: "border border-sand/40 text-sand hover:bg-sand/10",
  contornoOscuro: "border border-navy/30 text-navy hover:bg-navy/5",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

interface BotonProps {
  children: React.ReactNode;
  href?: string;
  variante?: Variante;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tamano?: Tamano;
  fullWidth?: boolean;
}

export default function Boton({
  children,
  href,
  variante = "primario",
  className = "",
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  tamano = "md",
  fullWidth = false,
}: BotonProps) {
  const clases = `inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${tamanos[tamano]} ${variantes[variante]} ${fullWidth ? "w-full" : ""} ${className}`;
  const contenido = (
    <>
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={clases}>
        {contenido}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clases}
    >
      {contenido}
    </button>
  );
}
