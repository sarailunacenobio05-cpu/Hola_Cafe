import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./client";

const REMEMBERED_EMAIL_KEY = "holacafe_remembered_email";

export interface LoginPayload {
  correo: string;
  password: string;
  remember?: boolean;
}
export interface UsuarioDTO {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
  avatarUrl?: string;
}
export interface AuthResponse {
  token: string;
  tipo: string;
  usuario: UsuarioDTO;
}
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      correo: payload.correo,
      password: payload.password,
    });
    const storage = payload.remember ? localStorage : sessionStorage;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    storage.setItem(TOKEN_STORAGE_KEY, data.token);
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(data.usuario));
    if (payload.remember) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, payload.correo.trim().toLowerCase());
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    return data;
  },
  getRememberedEmail(): string {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  },
  clearRememberedEmail() {
    try {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch { }
  },
  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  },
  getUsuarioActual(): UsuarioDTO | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  },
};
