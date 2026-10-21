import { httpClient } from '../api/httpClient';
import {
  ReservaResponseSchema,
  PagoResponseSchema,
  ComprobanteResponseSchema,
  MantenimientoResponseSchema,
  ResenaResponseSchema,
  NotificacionResponseSchema,
  TrabajadorResponseSchema,
  UsuarioResponseSchema,
  HorarioResponseSchema,
  SedeResponseSchema,
} from '../types';
import type {
  ReservaResponse,
  PagoResponse,
  ComprobanteResponse,
  MantenimientoResponse,
  ResenaResponse,
  NotificacionResponse,
  TrabajadorResponse,
  UsuarioResponse,
  HorarioResponse,
  SedeResponse,
} from '../types';

export const modulosService = {
  async listarSedes(): Promise<SedeResponse[]> {
    const response = await httpClient.get('/api/v1/sedes');
    return Array.isArray(response.data)
      ? response.data.map((item) => SedeResponseSchema.parse(item))
      : [];
  },

  async listarReservas(): Promise<ReservaResponse[]> {
    const response = await httpClient.get('/api/v1/reservas');
    return Array.isArray(response.data)
      ? response.data.map((item) => ReservaResponseSchema.parse(item))
      : [];
  },

  async listarPagos(): Promise<PagoResponse[]> {
    const response = await httpClient.get('/api/v1/pagos');
    return Array.isArray(response.data)
      ? response.data.map((item) => PagoResponseSchema.parse(item))
      : [];
  },

  async listarComprobantes(): Promise<ComprobanteResponse[]> {
    const response = await httpClient.get('/api/v1/comprobantes');
    return Array.isArray(response.data)
      ? response.data.map((item) => ComprobanteResponseSchema.parse(item))
      : [];
  },

  async listarMantenimientos(): Promise<MantenimientoResponse[]> {
    const response = await httpClient.get('/api/v1/mantenimientos');
    return Array.isArray(response.data)
      ? response.data.map((item) => MantenimientoResponseSchema.parse(item))
      : [];
  },

  async listarResenas(): Promise<ResenaResponse[]> {
    const response = await httpClient.get('/api/v1/resenas');
    return Array.isArray(response.data)
      ? response.data.map((item) => ResenaResponseSchema.parse(item))
      : [];
  },

  async listarNotificaciones(): Promise<NotificacionResponse[]> {
    const response = await httpClient.get('/api/v1/notificaciones');
    return Array.isArray(response.data)
      ? response.data.map((item) => NotificacionResponseSchema.parse(item))
      : [];
  },

  async listarTrabajadores(): Promise<TrabajadorResponse[]> {
    const response = await httpClient.get('/api/v1/trabajadores');
    return Array.isArray(response.data)
      ? response.data.map((item) => TrabajadorResponseSchema.parse(item))
      : [];
  },

  async listarUsuarios(): Promise<UsuarioResponse[]> {
    const response = await httpClient.get('/api/v1/usuarios');
    return Array.isArray(response.data)
      ? response.data.map((item) => UsuarioResponseSchema.parse(item))
      : [];
  },

  async listarHorarios(): Promise<HorarioResponse[]> {
    const response = await httpClient.get('/api/v1/horarios');
    return Array.isArray(response.data)
      ? response.data.map((item) => HorarioResponseSchema.parse(item))
      : [];
  },
};
