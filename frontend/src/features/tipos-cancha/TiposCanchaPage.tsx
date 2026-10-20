import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TipoCanchaFormSchema } from '../../types';
import type { TipoCanchaFormData, TipoCanchaResponse, ApiError } from '../../types';
import {
  useTiposCancha,
  useCrearTipoCancha,
  useActualizarTipoCancha,
} from './useTiposCanchaQuery';
import { Toast } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';

export const TiposCanchaPage: React.FC = () => {
  const [tipoEnEdicion, setTipoEnEdicion] = useState<TipoCanchaResponse | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const { data: tiposCancha = [], isLoading, isError, error } = useTiposCancha();
  const crearMutation = useCrearTipoCancha();
  const actualizarMutation = useActualizarTipoCancha();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TipoCanchaFormData>({
    resolver: zodResolver(TipoCanchaFormSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precioPorHora: 15000,
    },
  });

  const agregarToast = (tipo: ToastMessage['tipo'], texto: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, tipo, texto }]);
  };

  const descartarToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const abrirFormularioCrear = () => {
    setTipoEnEdicion(null);
    reset({
      nombre: '',
      descripcion: '',
      precioPorHora: 15000,
    });
    setErrorServidor(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (tipo: TipoCanchaResponse) => {
    setTipoEnEdicion(tipo);
    reset({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      precioPorHora: tipo.precioPorHora,
    });
    setErrorServidor(null);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setTipoEnEdicion(null);
    setErrorServidor(null);
  };

  const onSubmit = async (datos: TipoCanchaFormData) => {
    setErrorServidor(null);
    try {
      if (tipoEnEdicion) {
        await actualizarMutation.mutateAsync({ id: tipoEnEdicion.id, datos });
        agregarToast('success', 'Tipo de cancha actualizado con éxito.');
      } else {
        await crearMutation.mutateAsync(datos);
        agregarToast('success', 'Tipo de cancha creado exitosamente.');
      }
      cerrarFormulario();
    } catch (err) {
      const apiError = err as ApiError;
      setErrorServidor(apiError.message || 'Error al guardar el tipo de cancha.');
      agregarToast('error', 'No se pudo guardar el tipo de cancha.');
    }
  };

  const guardando = isSubmitting || crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="tipos-cancha-page">
      <Toast toasts={toasts} onDismiss={descartarToast} />

      <header className="page-header">
        <div>
          <h1>Gestión de Tipos de Cancha</h1>
          <p>Administra los tipos de canchas y sus precios base por hora.</p>
        </div>
        <div>
          {!mostrarFormulario && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirFormularioCrear}
            >
              + Nuevo Tipo de Cancha
            </button>
          )}
        </div>
      </header>

      {/* Formulario desplegable para Crear o Editar */}
      {mostrarFormulario && (
        <section
          className="form-card mb-4"
          aria-labelledby="form-heading"
          style={{ marginBottom: '2rem' }}
        >
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h2 id="form-heading">
              {tipoEnEdicion ? `Editar: ${tipoEnEdicion.nombre}` : 'Crear Nuevo Tipo de Cancha'}
            </h2>
          </div>

          {errorServidor && (
            <div className="alert alert-danger" role="alert" aria-live="assertive">
              {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {tipoEnEdicion && (
              <div className="form-group">
                <label htmlFor="tipo-id-info">Identificador de Tipo (ID de Sistema)</label>
                <input
                  id="tipo-id-info"
                  type="text"
                  value={`#${tipoEnEdicion.id}`}
                  disabled
                  readOnly
                  className="form-control-readonly font-mono"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="tipo-nombre">
                Nombre <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                id="tipo-nombre"
                type="text"
                disabled={guardando}
                aria-invalid={errors.nombre ? 'true' : 'false'}
                aria-describedby={errors.nombre ? 'tipo-nombre-error' : undefined}
                {...register('nombre')}
              />
              {errors.nombre && (
                <span id="tipo-nombre-error" className="field-error" role="alert">
                  {errors.nombre.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tipo-descripcion">
                Descripción
              </label>
              <textarea
                id="tipo-descripcion"
                rows={3}
                disabled={guardando}
                placeholder="Características, superficie, equipamiento..."
                aria-invalid={errors.descripcion ? 'true' : 'false'}
                aria-describedby={errors.descripcion ? 'tipo-desc-error' : undefined}
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <span id="tipo-desc-error" className="field-error" role="alert">
                  {errors.descripcion.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tipo-precio">
                Precio Base por Hora ($ CLP) <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                id="tipo-precio"
                type="number"
                min="1"
                step="500"
                disabled={guardando}
                aria-invalid={errors.precioPorHora ? 'true' : 'false'}
                aria-describedby={errors.precioPorHora ? 'tipo-precio-error' : undefined}
                {...register('precioPorHora')}
              />
              {errors.precioPorHora && (
                <span id="tipo-precio-error" className="field-error" role="alert">
                  {errors.precioPorHora.message}
                </span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? (
                  <>
                    <span className="spinner" style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />
                    <span>Guardando...</span>
                  </>
                ) : tipoEnEdicion ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Tipo'
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Estados de carga o error */}
      {isLoading && (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <span>Cargando tipos de cancha...</span>
        </div>
      )}

      {isError && (
        <div className="alert alert-danger" role="alert">
          {(error as Error)?.message || 'No se pudieron cargar los tipos de cancha.'}
        </div>
      )}

      {/* Grid de tarjetas de Tipos de Cancha */}
      {!isLoading && !isError && (
        <section aria-label="Listado de tipos de cancha">
          {tiposCancha.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">📋</span>
              <h2>No hay tipos de cancha registrados</h2>
              <p>Presiona el botón superior para crear el primero.</p>
            </div>
          ) : (
            <div className="tipos-grid">
              {tiposCancha.map((tipo) => (
                <article key={tipo.id} className="tipo-card">
                  <div>
                    <span className="card-id-tag font-mono">ID #{tipo.id}</span>
                    <h3>{tipo.nombre}</h3>
                    {/* 
                      SEGURIDAD (Defensa contra XSS):
                      El campo descripcion se renderiza intencionalmente como texto plano dentro de <p>.
                      React escapa automáticamente cualquier carácter HTML o script inyectado, 
                      garantizando que nunca se interprete como código malicioso.
                    */}
                    <p>{tipo.descripcion || 'Sin descripción registrada.'}</p>
                  </div>

                  <div className="tipo-card-footer">
                    <div>
                      <span className="detail-label">Precio base:</span>
                      <div className="tipo-price">${tipo.precioPorHora.toLocaleString('es-CL')}/hr</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => abrirFormularioEditar(tipo)}
                      aria-label={`Editar tipo de cancha ${tipo.nombre}`}
                    >
                      Editar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
export default TiposCanchaPage;
