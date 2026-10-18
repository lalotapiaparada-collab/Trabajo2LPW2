import { z } from 'zod';
import { httpClient } from '../api/httpClient';
import { SedeResponse, SedeResponseSchema } from '../types';

export const sedesService = {
  async listarSedes(): Promise<SedeResponse[]> {
    const response = await httpClient.get('/api/v1/sedes');
    return z.array(SedeResponseSchema).parse(response.data);
  },
};
