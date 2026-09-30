/**
 * DTO estándar de error devuelto por la API de Spring Boot (GlobalExceptionHandler).
 */
export interface ErrorResponseDto {
  codigo?: string;
  mensaje?: string;
  detalles?: string[] | Record<string, string>;
  timestamp?: string;
}

export class ApiError extends Error {
  public status: number;
  public data?: ErrorResponseDto;

  constructor(status: number, message: string, data?: ErrorResponseDto) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function obtenerTokenAuth(): string | null {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )cnm_token=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cnm_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token) return parsed.token;
      }
    } catch {}
  }
  return null;
}

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  private static getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    const token = obtenerTokenAuth();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ErrorResponseDto | undefined;
      try {
        errorData = await response.json();
      } catch {}
      const mensaje = errorData?.mensaje || response.statusText || `Error HTTP ${response.status}`;
      throw new ApiError(response.status, mensaje, errorData);
    }
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    return response.json();
  }

  static async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<T> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    const response = await fetch(`${this.baseUrl}${endpoint}${query}`, {
      headers: this.getHeaders(headers),
    });
    return this.handleResponse<T>(response);
  }

  static async post<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(headers),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(headers),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(headers),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async delete(endpoint: string, headers?: Record<string, string>): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(headers),
    });
    if (!response.ok) {
      let errorData: ErrorResponseDto | undefined;
      try {
        errorData = await response.json();
      } catch {}
      const mensaje = errorData?.mensaje || response.statusText || `Error HTTP ${response.status}`;
      throw new ApiError(response.status, mensaje, errorData);
    }
  }
}
