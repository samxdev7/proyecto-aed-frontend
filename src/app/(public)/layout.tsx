import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VerificarPerfilAlCargar from "@/components/auth/VerificarPerfilAlCargar";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <VerificarPerfilAlCargar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}