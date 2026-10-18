import Image from "next/image";

type LogoProps = {
  className?: string;
};

/**
 * URL pública del logo oficial en Supabase Storage (bucket: cnm-files).
 */
export const LOGO_CNM_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://gnotslrwwptblfoofgsx.supabase.co/storage/v1/object/public/cnm-files/cnm-logo.png";

export default function Logo({ className = "h-9 w-9" }: LogoProps) {
  return (
    <Image
      src={LOGO_CNM_URL}
      alt="Logo del Club Nicaragüense de Montañismo"
      width={48}
      height={48}
      priority
      className={className}
    />
  );
}