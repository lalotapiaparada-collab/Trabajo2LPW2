import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  useCanchas,
  useSedes,
  useTiposCanchaDisponibles,
  useEliminarCancha,
} from './useCanchasQuery';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';
import { EstadosCancha } from '../../types';
import type { CanchaResponse } from '../../types';

const ITEMS_POR_PAGINA = 10;

export const CanchasListPage: React.FC = () => {
  const { usuario } = useAuth();

  // Estados de filtros
  const [sedeId, setSedeId] = useState<number | undefined>(undefined);
  const [tipoCanchaId, setTipoCanchaId] = useState<number | undefined>(undefined);
  const [estado, setEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados para diálogo de eliminación y notificaciones
  const [canchaAEliminar, setCanchaAEliminar] = useState<CanchaResponse | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const esAdmin = usuario?.rol === 'Administrador';
  const esTrabajador = usuario?.rol === 'Trabajador';
  const puedeGestionar = esAdmin || esTrabajador;

  // Consultas con TanStack Query
  const { data: canchas, isLoading, isError, error, refetch } = useCanchas({
    sedeId,
    tipoCanchaId,
    estado: estado || undefined,
  });

  const { data: sedes } = useSedes();
  const { data: tipos } = useTiposCanchaDisponibles();
  const eliminarMutation = useEliminarCancha();

  const agregarToast = (tipo: ToastMessage['tipo'], texto: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, tipo, texto }]);
  };

  const descartarToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filtrado adicional en memoria por texto de búsqueda (id, número, sede, tipo, estado)
  const canchasFiltradas = useMemo(() => {
    if (!canchas) return [];
    if (!busqueda.trim()) return canchas;

    const query = busqueda.toLowerCase().trim();
    return canchas.filter(
      (c) =>
        c.id.toString() === query ||
        c.numero.toString().includes(query) ||
        c.sedeNombre.toLowerCase().includes(query) ||
        c.tipoCanchaNombre.toLowerCase().includes(query) ||
        c.estado.toLowerCase().includes(query)
    );
  }, [canchas, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(canchasFiltradas.length / ITEMS_POR_PAGINA) || 1;
  const canchasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return canchasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [canchasFiltradas, paginaActual]);

  const handleLimpiarFiltros = () => {
    setSedeId(undefined);
    setTipoCanchaId(undefined);
    setEstado('');
    setBusqueda('');
    setPaginaActual(1);
  };

  const handleConfirmarEliminar = async () => {
    if (!canchaAEliminar) return;
    try {
      await eliminarMutation.mutateAsync(canchaAEliminar.id);
      agregarToast('success', `Cancha N° ${canchaAEliminar.numero} eliminada correctamente.`);
      setCanchaAEliminar(null);
    } catch {
      agregarToast('error', 'Error al intentar eliminar la cancha. Verifica tus permisos.');
    }
  };

  return (
    <div className="canchas-page">
      <Toast toasts={toasts} onDismiss={descartarToast} />

      <header className="page-header">
        <div>
          <h1>Canchas Deportivas</h1>
          <p>Consulta la disponibilidad y gestiona las canchas del recinto.</p>
        </div>

        {puedeGestionar && (
          <Link to="/canchas/nueva" className="btn btn-primary" aria-label="Crear una nueva cancha">
            + Nueva Cancha
          </Link>
        )}
      </header>

      {/* Barra de Filtros y Búsqueda */}
      <section className="filters-section" aria-label="Filtros de búsqueda de canchas">
        <div className="filters-grid">
          <div className="filter-item">
            <label htmlFor="filtro-busqueda">Búsqueda rápida</label>
            <input
              id="filtro-busqueda"
              type="search"
              placeholder="Ej: Cancha 1, Fútbol, Sede Norte..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filtro-sede">Sede</label>
            <select
              id="filtro-sede"
              value={sedeId ?? ''}
              onChange={(e) => {
                setSedeId(e.target.value ? Number(e.target.value) : undefined);
                setPaginaActual(1);
              }}
            >
              <option value="">Todas las sedes</option>
              {sedes?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filtro-tipo">Tipo de Cancha</label>
            <select
              id="filtro-tipo"
              value={tipoCanchaId ?? ''}
              onChange={(e) => {
                setTipoCanchaId(e.target.value ? Number(e.target.value) : undefined);
                setPaginaActual(1);
              }}
            >
              <option value="">Todos los tipos</option>
              {tipos?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filtro-estado">Estado</label>
            <select
              id="filtro-estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="">Todos los estados</option>
              {EstadosCancha.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleLimpiarFiltros}
              aria-label="Limpiar todos los filtros"
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      {/* Estados de la vista: Carga, Error y Vacío */}
      {isLoading && (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <span>Cargando canchas deportivas...</span>
        </div>
      )}

      {isError && (
        <div className="alert alert-danger" role="alert">
          <p>{(error as Error)?.message || 'Error al cargar el listado de canchas.'}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !isError && canchasFiltradas.length === 0 && (
        <div className="empty-state" role="status">
          <span className="empty-icon" aria-hidden="true">📋</span>
          <h2>No se encontraron canchas</h2>
          <p>No hay canchas que coincidan con los filtros de búsqueda aplicados.</p>
          <button type="button" className="btn btn-primary" onClick={handleLimpiarFiltros}>
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Listado en formato Tabla y Tarjetas Responsivas */}
      {!isLoading && !isError && canchasFiltradas.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="data-table" aria-label="Tabla de canchas deportivas">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">N°</th>
                  <th scope="col">Sede</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Precio / Hora</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {canchasPaginadas.map((cancha) => {
                  const estadoBadgeClass = cancha.estado.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <tr key={cancha.id}>
                      <td className="font-mono text-muted">#{cancha.id}</td>
                      <td className="font-bold">Cancha {cancha.numero}</td>
                      <td>
                        {cancha.sedeNombre}
                        <span className="text-muted text-xs block">ID: #{cancha.sedeId}</span>
                      </td>
                      <td>
                        {cancha.tipoCanchaNombre}
                        <span className="text-muted text-xs block">ID: #{cancha.tipoCanchaId}</span>
                      </td>
                      <td>${cancha.precioPorHora.toLocaleString('es-CL')}</td>
                      <td>
                        <span className={`badge badge-${estadoBadgeClass}`}>
                          {cancha.estado}
                        </span>
                      </td>
                      <td className="table-actions">
                        <Link
                          to={`/canchas/${cancha.id}`}
                          className="btn btn-sm btn-outline"
                          aria-label={`Ver detalles de Cancha número ${cancha.numero}`}
                        >
                          Ver
                        </Link>

                        {puedeGestionar && (
                          <Link
                            to={`/canchas/${cancha.id}/editar`}
                            className="btn btn-sm btn-outline"
                            aria-label={`Editar Cancha número ${cancha.numero}`}
                          >
                            Editar
                          </Link>
                        )}

                        {esAdmin && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => setCanchaAEliminar(cancha)}
                            aria-label={`Eliminar Cancha número ${cancha.numero}`}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas Mobile First (se muestran cuando la pantalla es menor a 768px vía CSS) */}
          <div className="cards-grid" aria-label="Tarjetas de canchas deportivas">
            {canchasPaginadas.map((cancha) => {
              const estadoBadgeClass = cancha.estado.toLowerCase().replace(/\s+/g, '-');
              return (
                <article key={cancha.id} className="cancha-card">
                  <header className="card-header">
                    <div>
                      <span className="card-id-tag font-mono">ID #{cancha.id}</span>
                      <h2>Cancha N° {cancha.numero}</h2>
                    </div>
                    <span className={`badge badge-${estadoBadgeClass}`}>{cancha.estado}</span>
                  </header>
                  <div className="card-body">
                    <p><strong>ID Cancha:</strong> #{cancha.id}</p>
                    <p><strong>Sede:</strong> {cancha.sedeNombre} <span className="text-muted">(ID: #{cancha.sedeId})</span></p>
                    <p><strong>Tipo:</strong> {cancha.tipoCanchaNombre} <span className="text-muted">(ID: #{cancha.tipoCanchaId})</span></p>
                    <p><strong>Precio:</strong> ${cancha.precioPorHora.toLocaleString('es-CL')} / hr</p>
                  </div>
                  <footer className="card-footer">
                    <Link
                      to={`/canchas/${cancha.id}`}
                      className="btn btn-sm btn-outline"
                      aria-label={`Ver detalles de Cancha ${cancha.numero}`}
                    >
                      Ver
                    </Link>
                    {puedeGestionar && (
                      <Link
                        to={`/canchas/${cancha.id}/editar`}
                        className="btn btn-sm btn-outline"
                        aria-label={`Editar Cancha ${cancha.numero}`}
                      >
                        Editar
                      </Link>
                    )}
                    {esAdmin && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setCanchaAEliminar(cancha)}
                        aria-label={`Eliminar Cancha ${cancha.numero}`}
                      >
                        Eliminar
                      </button>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>

          {/* Controles de Paginación Accesible */}
          <nav className="pagination" aria-label="Navegación de páginas">
            <span className="pagination-info">
              Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({canchasFiltradas.length} canchas)
            </span>

            <div className="pagination-buttons">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                aria-label="Ir a la página anterior"
              >
                ← Anterior
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
                aria-label="Ir a la página siguiente"
              >
                Siguiente →
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Diálogo accesible de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={Boolean(canchaAEliminar)}
        titulo="¿Eliminar cancha?"
        mensaje={`¿Estás seguro de que deseas eliminar la Cancha N° ${canchaAEliminar?.numero} (${canchaAEliminar?.sedeNombre})? Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, Eliminar"
        textoCancelar="Cancelar"
        isLoading={eliminarMutation.isPending}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setCanchaAEliminar(null)}
      />
    </div>
  );
};
