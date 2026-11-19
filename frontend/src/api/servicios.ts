import { api } from './client';

export interface RespuestaPaginada<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export async function obtenerPaginado<T>(
  endpoint: string,
  params: { page: number; size: number; search?: string; filtro?: string },
  datosLocalesFiltrados: T[]
): Promise<RespuestaPaginada<T>> {
  try {
    const res = await api.get<RespuestaPaginada<T>>(endpoint, { params });
    return res.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const totalElements = datosLocalesFiltrados.length;
    const totalPages = Math.ceil(totalElements / params.size) || 1;
    const inicio = (params.page - 1) * params.size;
    const content = datosLocalesFiltrados.slice(inicio, inicio + params.size);

    return {
      content,
      totalPages,
      totalElements,
      number: params.page,
    };
  }
}