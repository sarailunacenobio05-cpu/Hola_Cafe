import { api } from './client';

export interface RespuestaPaginada<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export async function obtenerPaginado<T>(
  endpoint: string,
  params: {
    page: number;
    size: number;
    search?: string;
    filtro?: string;
    categoria?: string;
    estado?: string;
  },
  datosLocalesFiltrados: T[],
  mapear?: (item: any) => T
): Promise<RespuestaPaginada<T>> {
  try {
    const res = await api.get<RespuestaPaginada<any>>(endpoint, { params });
    const rawContent = Array.isArray(res.data?.content) ? res.data.content : [];
    const content = mapear ? rawContent.map(mapear) : (rawContent as T[]);
    return {
      content,
      totalPages: res.data?.totalPages || 1,
      totalElements: res.data?.totalElements ?? content.length,
      number: res.data?.number || params.page,
    };
  } catch {
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