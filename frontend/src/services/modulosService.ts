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
  // Sedes
  async listarSedes(): Promise<SedeResponse[]> {
    const response = await httpClient.get('/api/v1/sedes');
    return Array.isArray(response.data)
      ? response.data.map((item) => SedeResponseSchema.parse(item))
      : [];
  },

  async crearSede(datos: {
    nombre: string;
    direccion: string;
    telefono?: string;
  }): Promise<SedeResponse> {
    const response = await httpClient.post('/api/v1/sedes', datos);
    return SedeResponseSchema.parse(response.data);
  },

  async eliminarSede(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/sedes/${id}`);
  },

  // Reservas
  async listarReservas(): Promise<ReservaResponse[]> {
    const response = await httpClient.get('/api/v1/reservas');
    return Array.isArray(response.data)
      ? response.data.map((item) => ReservaResponseSchema.parse(item))
      : [];
  },

  async crearReserva(datos: {
    canchaId: number;
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: number;
    trabajadorId?: number;
  }): Promise<ReservaResponse> {
    const response = await httpClient.post('/api/v1/reservas', datos);
    return ReservaResponseSchema.parse(response.data);
  },

  async eliminarReserva(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/reservas/${id}`);
  },

  // Pagos
  async listarPagos(): Promise<PagoResponse[]> {
    const response = await httpClient.get('/api/v1/pagos');
    return Array.isArray(response.data)
      ? response.data.map((item) => PagoResponseSchema.parse(item))
      : [];
  },

  async crearPago(datos: {
    reservaId: number;
    monto: number;
    metodoPago: string;
  }): Promise<PagoResponse> {
    const response = await httpClient.post('/api/v1/pagos', datos);
    return PagoResponseSchema.parse(response.data);
  },

  async eliminarPago(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/pagos/${id}`);
  },

  // Comprobantes
  async listarComprobantes(): Promise<ComprobanteResponse[]> {
    const response = await httpClient.get('/api/v1/comprobantes');
    return Array.isArray(response.data)
      ? response.data.map((item) => ComprobanteResponseSchema.parse(item))
      : [];
  },

  async crearComprobante(datos: {
    pagoId: number;
    numeroComprobante: string;
    tipo: string;
  }): Promise<ComprobanteResponse> {
    const response = await httpClient.post('/api/v1/comprobantes', datos);
    return ComprobanteResponseSchema.parse(response.data);
  },

  async eliminarComprobante(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/comprobantes/${id}`);
  },

  // Mantenimientos
  async listarMantenimientos(): Promise<MantenimientoResponse[]> {
    const response = await httpClient.get('/api/v1/mantenimientos');
    return Array.isArray(response.data)
      ? response.data.map((item) => MantenimientoResponseSchema.parse(item))
      : [];
  },

  async crearMantenimiento(datos: {
    canchaId: number;
    trabajadorId: number;
    descripcion: string;
    fechaInicio: string;
    fechaFin?: string;
  }): Promise<MantenimientoResponse> {
    const response = await httpClient.post('/api/v1/mantenimientos', datos);
    return MantenimientoResponseSchema.parse(response.data);
  },

  async eliminarMantenimiento(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/mantenimientos/${id}`);
  },

  // Reseñas
  async listarResenas(): Promise<ResenaResponse[]> {
    const response = await httpClient.get('/api/v1/resenas');
    return Array.isArray(response.data)
      ? response.data.map((item) => ResenaResponseSchema.parse(item))
      : [];
  },

  async crearResena(datos: {
    reservaId: number;
    calificacion: number;
    comentario?: string;
  }): Promise<ResenaResponse> {
    const response = await httpClient.post('/api/v1/resenas', datos);
    return ResenaResponseSchema.parse(response.data);
  },

  async eliminarResena(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/resenas/${id}`);
  },

  // Notificaciones
  async listarNotificaciones(): Promise<NotificacionResponse[]> {
    const response = await httpClient.get('/api/v1/notificaciones');
    return Array.isArray(response.data)
      ? response.data.map((item) => NotificacionResponseSchema.parse(item))
      : [];
  },

  async crearNotificacion(datos: {
    usuarioId: number;
    mensaje: string;
  }): Promise<NotificacionResponse> {
    const response = await httpClient.post('/api/v1/notificaciones', datos);
    return NotificacionResponseSchema.parse(response.data);
  },

  async eliminarNotificacion(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/notificaciones/${id}`);
  },

  // Trabajadores
  async listarTrabajadores(): Promise<TrabajadorResponse[]> {
    const response = await httpClient.get('/api/v1/trabajadores');
    return Array.isArray(response.data)
      ? response.data.map((item) => TrabajadorResponseSchema.parse(item))
      : [];
  },

  async crearTrabajador(datos: {
    usuarioId: number;
    cargo: string;
    turno: string;
  }): Promise<TrabajadorResponse> {
    const response = await httpClient.post('/api/v1/trabajadores', datos);
    return TrabajadorResponseSchema.parse(response.data);
  },

  async eliminarTrabajador(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/trabajadores/${id}`);
  },

  // Usuarios
  async listarUsuarios(): Promise<UsuarioResponse[]> {
    const response = await httpClient.get('/api/v1/usuarios');
    return Array.isArray(response.data)
      ? response.data.map((item) => UsuarioResponseSchema.parse(item))
      : [];
  },

  async crearUsuario(datos: {
    nombre: string;
    email: string;
    password: string;
    rol?: string;
  }): Promise<UsuarioResponse> {
    const response = await httpClient.post('/api/v1/usuarios/registro', datos);
    return UsuarioResponseSchema.parse(response.data);
  },

  async eliminarUsuario(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/usuarios/${id}`);
  },

  // Horarios
  async listarHorarios(): Promise<HorarioResponse[]> {
    const response = await httpClient.get('/api/v1/horarios');
    return Array.isArray(response.data)
      ? response.data.map((item) => HorarioResponseSchema.parse(item))
      : [];
  },

  async crearHorario(datos: {
    canchaId: number;
    diaSemana: number;
    horaApertura: string;
    horaCierre: string;
  }): Promise<HorarioResponse> {
    const response = await httpClient.post('/api/v1/horarios', datos);
    return HorarioResponseSchema.parse(response.data);
  },

  async eliminarHorario(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/horarios/${id}`);
  },
};
