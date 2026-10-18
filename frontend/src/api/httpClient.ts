import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

// Claves de sessionStorage
export const TOKEN_STORAGE_KEY = 'canchas_auth_token';
export const USER_STORAGE_KEY = 'canchas_auth_user';

// URL base leída de variables de entorno (nunca hardcodeada)
const baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7269';

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: inyecta el token Bearer si existe una sesión activa
httpClient.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        // Adjunta el token mediante cabecera Authorization estándar (nunca por URL)
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Manejo seguro si sessionStorage no está disponible
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: normaliza los errores a un tipo estándar ApiError
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; detail?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    const requestUrl = error.config?.url || '';

    let message = 'Ocurrió un error inesperado.';
    let fieldErrors: Record<string, string[]> | undefined;

    if (!error.response) {
      // Error de red o CORS bloqueado
      message = 'No se pudo conectar con el servidor. Verifica tu conexión o certificado HTTPS.';
    } else if (status === 400 || status === 422) {
      message = data?.error || data?.detail || 'Datos inválidos. Revisa el formulario.';
      if (data?.errors) {
        fieldErrors = data.errors;
      }
    } else if (status === 401) {
      // Distinguir entre login fallido y sesión expirada
      if (requestUrl.includes('/login')) {
        message = 'Correo o contraseña incorrectos.';
      } else {
        message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(USER_STORAGE_KEY);
          // Redirigir a login si expiró en ruta protegida
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=1';
          }
        } catch {
          // sessionStorage protegido
        }
      }
    } else if (status === 403) {
      message = 'Acceso denegado: no tienes permisos para realizar esta acción.';
    } else if (status === 404) {
      message = data?.error || data?.detail || 'El recurso solicitado no fue encontrado.';
    } else if (status === 429) {
      message = 'Demasiados intentos. Por favor espera un minuto antes de reintentar.';
    } else if (status >= 500) {
      message = 'Error interno del servidor. Por favor intenta más tarde.';
    }

    const apiError: ApiError = {
      status,
      message,
      fieldErrors,
    };

    return Promise.reject(apiError);
  }
);
