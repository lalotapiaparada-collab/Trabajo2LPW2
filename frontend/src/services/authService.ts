import { httpClient } from '../api/httpClient';
import { LoginResponseSchema, UsuarioResponseSchema } from '../types';
import type { LoginRequest, LoginResponse, RegistroRequest, UsuarioResponse } from '../types';

export const authService = {
  async login(credenciales: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post('/api/v1/usuarios/login', credenciales);
    // Validación de esquema con Zod (Mitigación OWASP API10: Consumo Inseguro de APIs)
    return LoginResponseSchema.parse(response.data);
  },

  async registro(datos: RegistroRequest): Promise<UsuarioResponse> {
    const response = await httpClient.post('/api/v1/usuarios/registro', datos);
    return UsuarioResponseSchema.parse(response.data);
  },
};
