import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Solo assets locales del club; rutas con query string y URLs externas quedan bloqueadas. */
    localPatterns: [{ pathname: "/Presentaciones/**", search: "" }],
  },
};

export default nextConfig;
