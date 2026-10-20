import Image from "next/image";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

/**
 * URL pública del logo oficial en Supabase Storage (bucket: cnm-files).
 * Las dimensiones originales del recurso son 490x383 px (proporción 1.28:1).
 */
export const LOGO_CNM_URL = process.env.NEXT_PUBLIC_LOGO_URL || "/icon.png";

export default function Logo({
  className = "h-10 w-auto",
  width = 490,
  height = 383,
}: LogoProps) {
  return (
    <Image
      src={LOGO_CNM_URL}
      alt="Logo del Club Nicaragüense de Montañismo"
      width={width}
      height={height}
      priority
      className={`object-contain ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  );
}