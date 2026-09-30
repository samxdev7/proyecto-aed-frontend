"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { limpiarRolDemo } from "@/lib/demo";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    limpiarRolDemo();
    router.replace("/");
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg-main">
      <p className="text-sm text-text-muted">Cerrando sesión…</p>
    </main>
  );
}
