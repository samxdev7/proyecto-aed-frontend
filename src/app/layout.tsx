import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { MensajesProvider } from "@/contexts/MensajesContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
});

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/icon.png";
const appleLogoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/apple-icon.png";

export const metadata: Metadata = {
  title: "Club Nicaragüense de Montañismo",
  description:
    "Exploramos, cuidamos y disfrutamos las montañas y volcanes. Únete a la próxima expedición.",
  icons: {
    icon: [
      {
        url: logoUrl,
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: appleLogoUrl,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${merriweather.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <MensajesProvider>{children}</MensajesProvider>
      </body>
    </html>
  );
}