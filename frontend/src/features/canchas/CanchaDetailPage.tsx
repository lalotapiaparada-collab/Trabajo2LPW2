import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCancha, useEliminarCancha, useSedes, useTiposCanchaDisponibles } from './useCanchasQuery';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';

export const CanchaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const canchaId = Number(id) || 0;
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const esAdmin = usuario?.rol === 'Administrador';
  const esTrabajador = usuario?.rol === 'Trabajador';
  const puedeGestionar = esAdmin || esTrabajador;

  const { data: cancha, isLoading, isError, error } = useCancha(canchaId);
  const { data: sedes = [] } = useSedes();
  const { data: tipos = [] } = useTiposCanchaDisponibles();
  const eliminarMutation = useEliminarCancha();

  const sede = sedes.find((s) => s.id === cancha?.sedeId);
  const tipo = tipos.find((t) => t.id === cancha?.tipoCanchaId);

  const agregarToast = (tipo: ToastMessage['tipo'], texto: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, tipo, texto }]);
  };

  const descartarToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarMutation.mutateAsync(canchaId);
      agregarToast('success', 'Cancha eliminada con éxito.');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch {
      agregarToast('error', 'No se pudo eliminar la cancha. Verifica permisos en el backend.');
      setMostrarModalEliminar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <span>Cargando detalles de la cancha...</span>
      </div>
    );
  }

  if (isError || !cancha) {
    return (
      <div className="empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">⚠️</span>
        <h2>No se pudo cargar la información</h2>
        <p>{(error as Error)?.message || 'La cancha solicitada no existe o fue eliminada.'}</p>
        <Link to="/" className="btn btn-primary">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const estadoBadgeClass = cancha.estado.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="cancha-detail-page">
      <Toast toasts={toasts} onDismiss={descartarToast} />

      <header className="page-header">
        <div>
          <nav aria-label="Ruta de navegación" className="breadcrumb">
            <Link to="/">Canchas</Link> / <span>Detalle</span>
          </nav>
          <h1>Cancha N° {cancha.numero}</h1>
        </div>

        <div className="header-actions">
          <Link to="/" className="btn btn-outline" aria-label="Volver a la lista de canchas">
            ← Volver
          </Link>
          <Link to="/modulos" className="btn btn-primary" aria-label="Reservar cancha en módulo de reservas">
            📅 Reservar Cancha
          </Link>
          {puedeGestionar && (
            <Link to={`/canchas/${cancha.id}/editar`} className="btn btn-outline">
              Editar Cancha
            </Link>
          )}
          {esAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setMostrarModalEliminar(true)}
            >
              Eliminar Cancha
            </button>
          )}
        </div>
      </header>

      <section className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">ID Cancha</span>
            <span className="detail-value font-mono">#{cancha.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Número de Cancha</span>
            <span className="detail-value font-bold">Cancha {cancha.numero}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Estado Operativo</span>
            <span className={`badge badge-${estadoBadgeClass}`}>{cancha.estado}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Precio por Hora</span>
            <span className="detail-value font-bold">${cancha.precioPorHora.toLocaleString('es-CL')} / hr</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Sede Deportiva</span>
            <span className="detail-value">
              {cancha.sedeNombre} <span className="text-muted font-normal text-xs">(ID #{cancha.sedeId})</span>
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Dirección de Sede</span>
            <span className="detail-value">{sede?.direccion || 'No especificada'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Teléfono de Sede</span>
            <span className="detail-value">{sede?.telefono || 'Sin teléfono'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Tipo de Cancha</span>
            <span className="detail-value">
              {cancha.tipoCanchaNombre} <span className="text-muted font-normal text-xs">(ID #{cancha.tipoCanchaId})</span>
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Descripción del Tipo</span>
            <span className="detail-value">{tipo?.descripcion || 'Cancha reglamentaria estándar'}</span>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={mostrarModalEliminar}
        titulo="¿Eliminar cancha?"
        mensaje={`¿Estás seguro de que deseas eliminar permanentemente la Cancha N° ${cancha.numero}?`}
        textoConfirmar="Sí, Eliminar"
        textoCancelar="Cancelar"
        isLoading={eliminarMutation.isPending}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setMostrarModalEliminar(false)}
      />
    </div>
  );
};
