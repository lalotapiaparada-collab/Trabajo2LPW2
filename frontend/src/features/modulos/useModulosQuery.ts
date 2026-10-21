import { useQuery } from '@tanstack/react-query';
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
