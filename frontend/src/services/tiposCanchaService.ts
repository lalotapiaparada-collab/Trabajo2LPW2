import { z } from 'zod';
import { httpClient } from '../api/httpClient';
import { TipoCanchaResponseSchema } from '../types';
import type { TipoCanchaFormData, TipoCanchaResponse } from '../types';

export const tiposCanchaService = {
  async listarTiposCancha(): Promise<TipoCanchaResponse[]> {
    const response = await httpClient.get('/api/v1/tipos-cancha');
    return z.array(TipoCanchaResponseSchema).parse(response.data);
  },

  async crearTipoCancha(datos: TipoCanchaFormData): Promise<TipoCanchaResponse> {
    const response = await httpClient.post('/api/v1/tipos-cancha', datos);
    return TipoCanchaResponseSchema.parse(response.data);
  },

  async actualizarTipoCancha(id: number, datos: TipoCanchaFormData): Promise<TipoCanchaResponse> {
    const response = await httpClient.put(`/api/v1/tipos-cancha/${id}`, datos);
    return TipoCanchaResponseSchema.parse(response.data);
  },
};
