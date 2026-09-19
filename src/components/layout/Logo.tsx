import Image from "next/image";

type LogoProps = {
  className?: string;
};

export default function Logo({ className = "h-9 w-9" }: LogoProps) {
  return (
    <Image
      src="/Presentaciones/logo/Logo.jpg"
      alt="Logo del Club Nicaragüense de Montañismo"
      width={48}
      height={48}
      className={className}
    />
  );
}