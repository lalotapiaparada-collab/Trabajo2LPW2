import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canchasService } from '../../services/canchasService';
import { sedesService } from '../../services/sedesService';
import { tiposCanchaService } from '../../services/tiposCanchaService';
import type { CanchaFormData, FiltrosCancha } from '../../types';

export const CANCHAS_QUERY_KEY = 'canchas';
export const SEDES_QUERY_KEY = 'sedes';
export const TIPOS_CANCHA_QUERY_KEY = 'tipos-cancha';

// Hook para listar canchas con filtros
export const useCanchas = (filtros?: FiltrosCancha) => {
  return useQuery({
    queryKey: [CANCHAS_QUERY_KEY, filtros],
    queryFn: () => canchasService.listarCanchas(filtros),
  });
};

// Hook para obtener el detalle de una cancha por ID
export const useCancha = (id: number) => {
  return useQuery({
    queryKey: [CANCHAS_QUERY_KEY, id],
    queryFn: () => canchasService.obtenerCancha(id),
    enabled: id > 0,
  });
};

// Hook para crear una nueva cancha
export const useCrearCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: CanchaFormData) => canchasService.crearCancha(datos),
    onSuccess: () => {
      // Invalida la lista de canchas para refrescar los datos automáticamente
      queryClient.invalidateQueries({ queryKey: [CANCHAS_QUERY_KEY] });
    },
  });
};

// Hook para actualizar una cancha existente
export const useActualizarCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CanchaFormData }) =>
      canchasService.actualizarCancha(id, datos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CANCHAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CANCHAS_QUERY_KEY, variables.id] });
    },
  });
};

// Hook para eliminar una cancha
export const useEliminarCancha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => canchasService.eliminarCancha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANCHAS_QUERY_KEY] });
    },
  });
};

// Hook para obtener las sedes disponibles (para selects de formularios y filtros)
export const useSedes = () => {
  return useQuery({
    queryKey: [SEDES_QUERY_KEY],
    queryFn: () => sedesService.listarSedes(),
  });
};

// Hook para obtener los tipos de cancha disponibles
export const useTiposCanchaDisponibles = () => {
  return useQuery({
    queryKey: [TIPOS_CANCHA_QUERY_KEY],
    queryFn: () => tiposCanchaService.listarTiposCancha(),
  });
};
