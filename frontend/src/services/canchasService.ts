import { z } from 'zod';
import { httpClient } from '../api/httpClient';
import {
  CanchaFormData,
  CanchaResponse,
  CanchaResponseSchema,
  FiltrosCancha,
} from '../types';

export const canchasService = {
  async listarCanchas(filtros?: FiltrosCancha): Promise<CanchaResponse[]> {
    const params = new URLSearchParams();
    if (filtros?.sedeId) params.append('sedeId', filtros.sedeId.toString());
    if (filtros?.tipoCanchaId) params.append('tipoCanchaId', filtros.tipoCanchaId.toString());
    if (filtros?.estado) params.append('estado', filtros.estado);

    const response = await httpClient.get('/api/v1/canchas', { params });
    // Validación de la lista de respuestas con Zod (Mitigación OWASP API10)
    return z.array(CanchaResponseSchema).parse(response.data);
  },

  async obtenerCancha(id: number): Promise<CanchaResponse> {
    const response = await httpClient.get(`/api/v1/canchas/${id}`);
    return CanchaResponseSchema.parse(response.data);
  },

  async crearCancha(datos: CanchaFormData): Promise<CanchaResponse> {
    const response = await httpClient.post('/api/v1/canchas', datos);
    return CanchaResponseSchema.parse(response.data);
  },

  async actualizarCancha(id: number, datos: CanchaFormData): Promise<CanchaResponse> {
    const response = await httpClient.put(`/api/v1/canchas/${id}`, datos);
    return CanchaResponseSchema.parse(response.data);
  },

  async eliminarCancha(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/canchas/${id}`);
  },
};
