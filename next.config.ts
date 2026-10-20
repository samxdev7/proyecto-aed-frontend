import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Assets locales del club */
    localPatterns: [{ pathname: "/Presentaciones/**", search: "" }],
    /* Almacenamiento remoto de Supabase Storage para fotos de viajes y comprobantes */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
