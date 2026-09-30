import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Club Nicaragüense de Montañismo",
  description:
    "Exploramos, cuidamos y disfrutamos las montañas y volcanes. Únete a la próxima expedición.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${merriweather.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}