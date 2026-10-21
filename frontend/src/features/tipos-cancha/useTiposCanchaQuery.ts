import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposCanchaService } from '../../services/tiposCanchaService';
import { TIPOS_CANCHA_QUERY_KEY } from '../canchas/useCanchasQuery';
import type { TipoCanchaFormData } from '../../types';

export const useTiposCancha = () => {
  return useQuery({
    queryKey: [TIPOS_CANCHA_QUERY_KEY],
    queryFn: () => tiposCanchaService.listarTiposCancha(),
  });
};

export const useCrearTipoCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: TipoCanchaFormData) => tiposCanchaService.crearTipoCancha(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_CANCHA_QUERY_KEY] });
    },
  });
};

export const useActualizarTipoCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: TipoCanchaFormData }) =>
      tiposCanchaService.actualizarTipoCancha(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_CANCHA_QUERY_KEY] });
    },
  });
};

export const useEliminarTipoCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tiposCanchaService.eliminarTipoCancha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_CANCHA_QUERY_KEY] });
    },
  });
};
