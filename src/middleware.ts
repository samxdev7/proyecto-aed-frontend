import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("cnm_token")?.value;
  const rol = request.cookies.get("cnm_rol")?.value;
  const isAuthenticated = Boolean(token && rol);
  const esAdmin = rol === "administrador";

  // 1. Proteger panel de administración (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/iniciar-sesion", request.url);
      loginUrl.searchParams.set("redir", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!esAdmin) {
      // Cliente intentando entrar a ruta de administrador: redirigir a inicio
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // 2. Proteger área de cliente (/user/*) e inscripción (/inscripcion/*)
  if (pathname.startsWith("/user") || pathname.startsWith("/inscripcion")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/iniciar-sesion", request.url);
      loginUrl.searchParams.set("redir", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Redirigir usuarios ya autenticados fuera de login o registro
  if (pathname === "/iniciar-sesion" || pathname === "/registro") {
    if (isAuthenticated) {
      const redir = searchParams.get("redir");
      if (redir && redir.startsWith("/")) {
        return NextResponse.redirect(new URL(redir, request.url));
      }
      return NextResponse.redirect(
        new URL(esAdmin ? "/admin" : "/", request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/inscripcion/:path*",
    "/iniciar-sesion",
    "/registro",
  ],
};
