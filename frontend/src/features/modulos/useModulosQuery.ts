import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulosService } from '../../services/modulosService';

// Sedes
export const useSedesList = () =>
  useQuery({
    queryKey: ['sedes-modulo'],
    queryFn: () => modulosService.listarSedes(),
  });

export const useCrearSede = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { nombre: string; direccion: string; telefono?: string }) =>
      modulosService.crearSede(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes-modulo'] });
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });
};

// Reservas
export const useReservasList = () =>
  useQuery({
    queryKey: ['reservas'],
    queryFn: () => modulosService.listarReservas(),
  });

export const useCrearReserva = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: {
      canchaId: number;
      fechaInicio: string;
      fechaFin: string;
      usuarioId?: number;
      trabajadorId?: number;
    }) => modulosService.crearReserva(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
  });
};

// Pagos
export const usePagosList = () =>
  useQuery({
    queryKey: ['pagos'],
    queryFn: () => modulosService.listarPagos(),
  });

export const useCrearPago = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { reservaId: number; monto: number; metodoPago: string }) =>
      modulosService.crearPago(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
  });
};

// Comprobantes
export const useComprobantesList = () =>
  useQuery({
    queryKey: ['comprobantes'],
    queryFn: () => modulosService.listarComprobantes(),
  });

export const useCrearComprobante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { pagoId: number; numeroComprobante: string; tipo: string }) =>
      modulosService.crearComprobante(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
    },
  });
};

// Mantenimientos
export const useMantenimientosList = () =>
  useQuery({
    queryKey: ['mantenimientos'],
    queryFn: () => modulosService.listarMantenimientos(),
  });

export const useCrearMantenimiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: {
      canchaId: number;
      trabajadorId: number;
      descripcion: string;
      fechaInicio: string;
      fechaFin?: string;
    }) => modulosService.crearMantenimiento(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
    },
  });
};

// Reseñas
export const useResenasList = () =>
  useQuery({
    queryKey: ['resenas'],
    queryFn: () => modulosService.listarResenas(),
  });

export const useCrearResena = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { reservaId: number; calificacion: number; comentario?: string }) =>
      modulosService.crearResena(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resenas'] });
    },
  });
};

// Notificaciones
export const useNotificacionesList = () =>
  useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => modulosService.listarNotificaciones(),
  });

export const useCrearNotificacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { usuarioId: number; mensaje: string }) =>
      modulosService.crearNotificacion(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
};

// Trabajadores
export const useTrabajadoresList = () =>
  useQuery({
    queryKey: ['trabajadores'],
    queryFn: () => modulosService.listarTrabajadores(),
  });

export const useCrearTrabajador = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { usuarioId: number; cargo: string; turno: string }) =>
      modulosService.crearTrabajador(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajadores'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-modulo'] });
    },
  });
};

// Usuarios
export const useUsuariosList = () =>
  useQuery({
    queryKey: ['usuarios-modulo'],
    queryFn: () => modulosService.listarUsuarios(),
  });

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: { nombre: string; email: string; password: string; rol?: string }) =>
      modulosService.crearUsuario(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-modulo'] });
    },
  });
};

// Horarios
export const useHorariosList = () =>
  useQuery({
    queryKey: ['horarios'],
    queryFn: () => modulosService.listarHorarios(),
  });

export const useCrearHorario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: {
      canchaId: number;
      diaSemana: number;
      horaApertura: string;
      horaCierre: string;
    }) => modulosService.crearHorario(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
};
