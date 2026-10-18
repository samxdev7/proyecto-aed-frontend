import test from "node:test";
import assert from "node:assert/strict";
import { authService } from "@/services/auth.service";
import { ApiClient } from "@/lib/api-client";
import { perfilEstaCompleto } from "@/lib/auth";
import type { UsuarioPerfil } from "@/types/usuario";

test("Google Auth - Servicio y Operadores REST", async (t) => {
  const originalPost = ApiClient.post;

  t.afterEach(() => {
    ApiClient.post = originalPost;
  });

  await t.test("loginGoogle debe invocar POST /auth/google con idToken", async () => {
    let rutaLlamada = "";
    let cuerpoLlamada: unknown = null;

    ApiClient.post = async <T>(url: string, body?: unknown): Promise<T> => {
      rutaLlamada = url;
      cuerpoLlamada = body;
      return {
        token: "jwt-backend-simulado",
        idUsuario: 77,
        correo: "usuario.google@gmail.com",
        nombreCompleto: "Usuario Google",
        rol: "cliente",
        notificacionesHabilitadas: true,
      } as unknown as T;
    };

    const respuesta = await authService.loginGoogle("test-google-id-token");

    assert.equal(rutaLlamada, "/auth/google");
    assert.deepEqual(cuerpoLlamada, { idToken: "test-google-id-token" });
    assert.equal(respuesta.idUsuario, 77);
    assert.equal(respuesta.correo, "usuario.google@gmail.com");
  });
});

test("Google Auth - Regla de Evaluación de Perfil Completo", () => {
  // Caso 1: Nulo o indefinido
  assert.equal(perfilEstaCompleto(null), false);
  assert.equal(perfilEstaCompleto(undefined), false);

  // Caso 2: Nuevo usuario de Google (solo correo y nombre preliminar, sin cédula ni nacionalidad)
  const perfilGoogleNuevo: Partial<UsuarioPerfil> = {
    idUsuario: 10,
    correo: "nuevo@gmail.com",
    primerNombre: "Carlos",
    primerApellido: "López",
    numeroIdentificacion: null as unknown as string,
    nacionalidad: null as unknown as string,
  };
  assert.equal(perfilEstaCompleto(perfilGoogleNuevo as UsuarioPerfil), false);

  // Caso 3: Usuario con espacios en blanco en campos obligatorios
  const perfilEspacios: Partial<UsuarioPerfil> = {
    idUsuario: 10,
    correo: "nuevo@gmail.com",
    primerNombre: "  ",
    primerApellido: "López",
    numeroIdentificacion: "001-000000-0000A",
    nacionalidad: "Nicaragüense",
  };
  assert.equal(perfilEstaCompleto(perfilEspacios as UsuarioPerfil), false);

  // Caso 4: Perfil completo
  const perfilCompleto: Partial<UsuarioPerfil> = {
    idUsuario: 10,
    correo: "completo@gmail.com",
    primerNombre: "María",
    primerApellido: "Pérez",
    numeroIdentificacion: "001-123456-0000B",
    nacionalidad: "Nicaragüense",
  };
  assert.equal(perfilEstaCompleto(perfilCompleto as UsuarioPerfil), true);
});

test("Google Auth - Decisión de Redirección (Registro Inicial vs Usuario Recurrente)", () => {
  function decidirDestino(
    perfil: UsuarioPerfil | null,
    redir: string | null,
  ): string {
    if (!perfilEstaCompleto(perfil)) {
      return redir
        ? `/completar-perfil?redir=${encodeURIComponent(redir)}`
        : "/completar-perfil";
    }
    return redir && redir.startsWith("/") ? redir : "/viajes";
  }

  const perfilIncompleto: UsuarioPerfil = {
    idUsuario: 1,
    correo: "google@user.com",
    primerNombre: "Juan",
    primerApellido: "",
    segundoNombre: undefined,
    segundoApellido: undefined,
    nombreCompleto: "Juan",
    rol: "cliente",
    telefono: "",
    sexo: "",
    nacionalidad: "",
    tipoIdentificacion: "",
    numeroIdentificacion: "",
    notificacionesHabilitadas: true,
    fechaRegistro: "2026-10-18T10:00:00Z",
  };

  const perfilCompleto: UsuarioPerfil = {
    ...perfilIncompleto,
    primerApellido: "Pérez",
    nacionalidad: "Nicaragüense",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "001-010101-0001A",
  };

  // Primera vez sin redir
  assert.equal(decidirDestino(perfilIncompleto, null), "/completar-perfil");

  // Primera vez con redir a reserva
  assert.equal(
    decidirDestino(perfilIncompleto, "/inscripcion/4"),
    "/completar-perfil?redir=%2Finscripcion%2F4",
  );

  // Usuario recurrente con perfil completo sin redir
  assert.equal(decidirDestino(perfilCompleto, null), "/viajes");

  // Usuario recurrente con perfil completo con redir
  assert.equal(decidirDestino(perfilCompleto, "/inscripcion/4"), "/inscripcion/4");
});
