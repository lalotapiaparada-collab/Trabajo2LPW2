import { describe, it, expect, beforeEach } from 'vitest';
import { httpClient, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/httpClient';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

describe('HttpClient Interceptor – Comportamiento de seguridad', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('limpia sessionStorage ante una respuesta 401 en un endpoint protegido', async () => {
    // Simular sesión activa
    sessionStorage.setItem(TOKEN_STORAGE_KEY, 'token-expirado-123');
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ id: 1, email: 'user@test.cl' }));

    // Configurar handler temporal que responde 401
    server.use(
      http.get('https://localhost:7269/api/v1/recurso-protegido', () => {
        return HttpResponse.json({ status: 401, title: 'Unauthorized' }, { status: 401 });
      })
    );

    try {
      await httpClient.get('/api/v1/recurso-protegido');
    } catch {
      // Se espera rechazo de la promesa
    }

    // Verificar que el token y usuario fueron eliminados de sessionStorage
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it('adjunta la cabecera Authorization Bearer si existe un token en sessionStorage', async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, 'token-valido-xyz');

    let cabeceraAuthorization: string | null = null;
    server.use(
      http.get('https://localhost:7269/api/v1/verificar-auth', ({ request }) => {
        cabeceraAuthorization = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      })
    );

    await httpClient.get('/api/v1/verificar-auth');

    expect(cabeceraAuthorization).toBe('Bearer token-valido-xyz');
  });
});
