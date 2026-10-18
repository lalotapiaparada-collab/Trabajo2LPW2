import { z } from 'zod';

// Roles del sistema
export type RolUsuario = 'Cliente' | 'Trabajador' | 'Administrador';

// Estados permitidos para una cancha
export const EstadosCancha = ['Disponible', 'Mantenimiento', 'Fuera de servicio'] as const;
export type EstadoCancha = typeof EstadosCancha[number];

// --- ESQUEMAS Y TIPOS DE USUARIO Y AUTENTICACIÓN ---

export const UsuarioResponseSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  email: z.string().email(),
  rol: z.enum(['Cliente', 'Trabajador', 'Administrador']),
  fechaCreacion: z.string(),
});
export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;

export const LoginResponseSchema = z.object({
  token: z.string().min(1),
  usuario: UsuarioResponseSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es requerido').email('Formato de correo no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegistroRequestSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
export type RegistroRequest = z.infer<typeof RegistroRequestSchema>;

// --- ESQUEMAS Y TIPOS DE SEDES ---

export const SedeResponseSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  direccion: z.string(),
  telefono: z.string().nullable().optional(),
});
export type SedeResponse = z.infer<typeof SedeResponseSchema>;

// --- ESQUEMAS Y TIPOS DE TIPOS DE CANCHA ---

export const TipoCanchaResponseSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  precioPorHora: z.number(),
});
export type TipoCanchaResponse = z.infer<typeof TipoCanchaResponseSchema>;

export const TipoCanchaFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
  precioPorHora: z.coerce.number().positive('El precio por hora debe ser mayor a 0'),
});
export type TipoCanchaFormData = z.infer<typeof TipoCanchaFormSchema>;

// --- ESQUEMAS Y TIPOS DE CANCHAS ---

export const CanchaResponseSchema = z.object({
  id: z.number(),
  numero: z.number(),
  sedeId: z.number(),
  sedeNombre: z.string(),
  tipoCanchaId: z.number(),
  tipoCanchaNombre: z.string(),
  precioPorHora: z.number(),
  estado: z.enum(['Disponible', 'Mantenimiento', 'Fuera de servicio']),
});
export type CanchaResponse = z.infer<typeof CanchaResponseSchema>;

export const CanchaFormSchema = z.object({
  numero: z.coerce.number().int().positive('El número de cancha debe ser mayor a 0'),
  sedeId: z.coerce.number().int().positive('Selecciona una sede válida'),
  tipoCanchaId: z.coerce.number().int().positive('Selecciona un tipo de cancha'),
  estado: z.enum(['Disponible', 'Mantenimiento', 'Fuera de servicio']),
});
export type CanchaFormData = z.infer<typeof CanchaFormSchema>;

export interface FiltrosCancha {
  sedeId?: number;
  tipoCanchaId?: number;
  estado?: string;
  busqueda?: string;
}

// --- TIPO NORMALIZADO DE ERROR DE API ---

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
