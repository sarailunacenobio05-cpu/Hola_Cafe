import axios, { AxiosError } from "axios";

// Clave donde se guarda el token JWT en el navegador
export const TOKEN_STORAGE_KEY = "holacafe_token";
export const USER_STORAGE_KEY = "holacafe_user";

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor de RESPONSE: Maneja errores 401 (sesión expirada) y errores de red
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Error de red (servidor apagado o sin conexión)
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message:
          "No se pudo conectar con el servidor. Verifica tu conexión a internet o que el backend esté activo.",
      } satisfies ApiErrorResponse);
    }

    const { status, data } = error.response;

    // 401 Unauthorized: Token inválido o expirado -> limpiar sesión
    if (status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject({
      status,
      message: data?.message || "Ocurrió un error al procesar la solicitud.",
      errors: data?.errors,
    } satisfies ApiErrorResponse);
  },
);
