import React from 'react';
import type { UsePaginacionReturn, ItemsPorPagina } from '../hooks/usePaginacion';
import { ITEMS_POR_PAGINA_OPCIONES } from '../hooks/usePaginacion';

interface PaginacionControlsProps<T> extends Pick<
  UsePaginacionReturn<T>,
  | 'paginaActual'
  | 'totalPaginas'
  | 'itemsPorPagina'
  | 'totalItems'
  | 'desde'
  | 'hasta'
  | 'irAPagina'
  | 'paginaAnterior'
  | 'paginaSiguiente'
  | 'cambiarItemsPorPagina'
> {
  /** Etiqueta para aria-label, ej. "Canchas" */
  etiqueta: string;
}

/**
 * Barra de paginación reutilizable.
 * Muestra: "Mostrando X–Y de N · filas por página · ◀ 1 2 3 ▶"
 */
export function PaginacionControls<T>({
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  totalItems,
  desde,
  hasta,
  irAPagina,
  paginaAnterior,
  paginaSiguiente,
  cambiarItemsPorPagina,
  etiqueta,
}: PaginacionControlsProps<T>) {
  if (totalItems === 0) return null;

  // Genera rangos de páginas visibles (máx. 5 botones)
  const paginas: (number | '...')[] = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
  } else {
    paginas.push(1);
    if (paginaActual > 3) paginas.push('...');
    for (let i = Math.max(2, paginaActual - 1); i <= Math.min(totalPaginas - 1, paginaActual + 1); i++) {
      paginas.push(i);
    }
    if (paginaActual < totalPaginas - 2) paginas.push('...');
    paginas.push(totalPaginas);
  }

  return (
    <nav
      className="pagination"
      aria-label={`Paginación de ${etiqueta}`}
      style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}
    >
      {/* Info: "Mostrando 1–10 de 47 registros" */}
      <div className="pagination-info">
        Mostrando <strong>{desde}</strong>–<strong>{hasta}</strong> de{' '}
        <strong>{totalItems}</strong>{' '}
        {totalItems === 1 ? 'registro' : 'registros'}
      </div>

      {/* Selector de filas por página */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label
          htmlFor={`rows-per-page-${etiqueta.toLowerCase()}`}
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}
        >
          Filas por página:
        </label>
        <select
          id={`rows-per-page-${etiqueta.toLowerCase()}`}
          value={itemsPorPagina}
          onChange={(e) => cambiarItemsPorPagina(Number(e.target.value) as ItemsPorPagina)}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          {ITEMS_POR_PAGINA_OPCIONES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Botones de navegación */}
      <div className="pagination-buttons">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => irAPagina(1)}
          disabled={paginaActual === 1}
          aria-label="Primera página"
          title="Primera página"
        >
          «
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={paginaAnterior}
          disabled={paginaActual === 1}
          aria-label="Página anterior"
        >
          ‹ Anterior
        </button>

        {paginas.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ padding: '0.25rem 0.5rem', color: 'var(--color-text-secondary)' }}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${p === paginaActual ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => irAPagina(p as number)}
              aria-label={`Ir a página ${p}`}
              aria-current={p === paginaActual ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={paginaSiguiente}
          disabled={paginaActual === totalPaginas}
          aria-label="Página siguiente"
        >
          Siguiente ›
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => irAPagina(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          aria-label="Última página"
          title="Última página"
        >
          »
        </button>
      </div>
    </nav>
  );
}
