import { cerrarSesion, obtenerToken } from "@/lib/auth";

/** Error de API con status HTTP; message viene del ErrorResponseDto del backend. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Sanitiza un mensaje de error proveniente del backend o de una excepción, evitando
 * mostrar detalles internos de bases de datos, consultas SQL, nombres de esquemas/columnas
 * o trazas de frameworks al usuario final.
 */
export function sanitizarMensajeError(
  mensaje: string,
  porDefecto: string = "Ocurrió un error inesperado al procesar la solicitud. Por favor intenta de nuevo."
): string {
  if (!mensaje || typeof mensaje !== "string") return porDefecto;

  const patronesTecnicos = [
    /could not execute statement/i,
    /sql\s*\[/i,
    /insert into/i,
    /update\s+\w+/i,
    /delete from/i,
    /select\s+.+from/i,
    /character varying/i,
    /psqlexception/i,
    /hibernateexception/i,
    /syntax error/i,
    /violates .* constraint/i,
    /value too long for type/i,
    /rewrite or cast the expression/i,
    /org\.(hibernate|postgresql|springframework)/i,
    /column ".*" is of type/i,
    /position:\s*\d+/i,
    /relation ".*" does not exist/i,
  ];

  if (patronesTecnicos.some((patron) => patron.test(mensaje))) {
    return porDefecto;
  }

  return mensaje;
}

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  private static headers(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window === "undefined" ? null : obtenerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  /** Levanta ApiError con el message del backend; 401 limpia la sesión local. */
  private static async fallar(response: Response): Promise<never> {
    let mensaje = `Error ${response.status}`;
    try {
      const cuerpo = (await response.json()) as { message?: string };
      if (cuerpo?.message) mensaje = cuerpo.message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    if (response.status === 401 && typeof window !== "undefined") {
      cerrarSesion();
    }
    throw new ApiError(response.status, sanitizarMensajeError(mensaje));
  }

  /** fetch envuelto: backend caído o sin conexión -> ApiError(0) con mensaje amigable. */
  private static async request(endpoint: string, init: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...init,
        headers: this.headers(),
      });
    } catch {
      throw new ApiError(
        0,
        "No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.",
      );
    }
    if (!response.ok) return this.fallar(response);
    return response;
  }

  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    const response = await this.request(`${endpoint}${query}`, {});
    return response.json();
  }

  static async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return response.json();
  }

  static async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return response.json();
  }

  static async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return response.json();
  }

  static async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { method: "DELETE" });
  }
}
