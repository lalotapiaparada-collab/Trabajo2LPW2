import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulosService } from '../../services/modulosService';

export const useSedesList = () =>
  useQuery({
    queryKey: ['sedes-modulo'],
    queryFn: () => modulosService.listarSedes(),
  });

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

export const usePagosList = () =>
  useQuery({
    queryKey: ['pagos'],
    queryFn: () => modulosService.listarPagos(),
  });

export const useComprobantesList = () =>
  useQuery({
    queryKey: ['comprobantes'],
    queryFn: () => modulosService.listarComprobantes(),
  });

export const useMantenimientosList = () =>
  useQuery({
    queryKey: ['mantenimientos'],
    queryFn: () => modulosService.listarMantenimientos(),
  });

export const useResenasList = () =>
  useQuery({
    queryKey: ['resenas'],
    queryFn: () => modulosService.listarResenas(),
  });

export const useNotificacionesList = () =>
  useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => modulosService.listarNotificaciones(),
  });

export const useTrabajadoresList = () =>
  useQuery({
    queryKey: ['trabajadores'],
    queryFn: () => modulosService.listarTrabajadores(),
  });

export const useUsuariosList = () =>
  useQuery({
    queryKey: ['usuarios-modulo'],
    queryFn: () => modulosService.listarUsuarios(),
  });

export const useHorariosList = () =>
  useQuery({
    queryKey: ['horarios'],
    queryFn: () => modulosService.listarHorarios(),
  });
