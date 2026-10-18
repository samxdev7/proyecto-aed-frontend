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
  icons: {
    icon: [
      {
        url: "https://gnotslrwwptblfoofgsx.supabase.co/storage/v1/object/public/cnm-files/cnm-logo.png",
        type: "image/png",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "https://gnotslrwwptblfoofgsx.supabase.co/storage/v1/object/public/cnm-files/cnm-logo.png",
      },
      {
        url: "/apple-icon.png",
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
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}