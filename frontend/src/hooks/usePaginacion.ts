import { useState, useMemo, useCallback } from 'react';

export const ITEMS_POR_PAGINA_OPCIONES = [5, 10, 20, 50] as const;
export type ItemsPorPagina = typeof ITEMS_POR_PAGINA_OPCIONES[number];

export interface UsePaginacionReturn<T> {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: ItemsPorPagina;
  totalItems: number;
  datosPagina: T[];
  irAPagina: (pagina: number) => void;
  paginaAnterior: () => void;
  paginaSiguiente: () => void;
  cambiarItemsPorPagina: (n: ItemsPorPagina) => void;
  desde: number;
  hasta: number;
}

/**
 * Hook de paginación reutilizable para cualquier arreglo de datos.
 * Recalcula automáticamente cuando cambia el array origen o el filtro.
 */
export function usePaginacion<T>(
  datos: T[],
  itemsInicialesPorPagina: ItemsPorPagina = 10,
): UsePaginacionReturn<T> {
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<ItemsPorPagina>(itemsInicialesPorPagina);

  const totalItems = datos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));

  // Cuando cambia el contenido o el tamaño de página, volvemos a la página 1
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const datosPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * itemsPorPagina;
    return datos.slice(inicio, inicio + itemsPorPagina);
  }, [datos, paginaSegura, itemsPorPagina]);

  const desde = totalItems === 0 ? 0 : (paginaSegura - 1) * itemsPorPagina + 1;
  const hasta = Math.min(paginaSegura * itemsPorPagina, totalItems);

  const irAPagina = useCallback(
    (pagina: number) => {
      const p = Math.max(1, Math.min(pagina, totalPaginas));
      setPaginaActual(p);
    },
    [totalPaginas],
  );

  const paginaAnterior = useCallback(() => irAPagina(paginaSegura - 1), [irAPagina, paginaSegura]);
  const paginaSiguiente = useCallback(() => irAPagina(paginaSegura + 1), [irAPagina, paginaSegura]);

  const cambiarItemsPorPagina = useCallback((n: ItemsPorPagina) => {
    setItemsPorPagina(n);
    setPaginaActual(1);
  }, []);

  return {
    paginaActual: paginaSegura,
    totalPaginas,
    itemsPorPagina,
    totalItems,
    datosPagina,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    cambiarItemsPorPagina,
    desde,
    hasta,
  };
}
