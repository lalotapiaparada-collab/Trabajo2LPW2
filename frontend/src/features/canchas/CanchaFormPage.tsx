import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CanchaFormSchema, EstadosCancha } from '../../types';
import type { CanchaFormData, ApiError } from '../../types';
import {
  useCancha,
  useCrearCancha,
  useActualizarCancha,
  useSedes,
  useTiposCanchaDisponibles,
} from './useCanchasQuery';
import { Toast } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';

export const CanchaFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = Boolean(id);
  const canchaId = Number(id) || 0;
  const navigate = useNavigate();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  // Queries para selects de sedes y tipos de cancha
  const { data: sedes = [], isLoading: cargandoSedes } = useSedes();
  const { data: tiposCancha = [], isLoading: cargandoTipos } = useTiposCanchaDisponibles();

  // Query para obtener datos si estamos editando
  const { data: canchaExistente, isLoading: cargandoCancha } = useCancha(canchaId);

  // Mutaciones para crear y actualizar
  const crearMutation = useCrearCancha();
  const actualizarMutation = useActualizarCancha();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CanchaFormData>({
    resolver: zodResolver(CanchaFormSchema),
    defaultValues: {
      numero: 1,
      sedeId: 1,
      tipoCanchaId: 1,
      estado: 'Disponible',
    },
  });

  // Al cargar la cancha en modo edición, poblar el formulario
  useEffect(() => {
    if (esEdicion && canchaExistente) {
      reset({
        numero: canchaExistente.numero,
        sedeId: canchaExistente.sedeId,
        tipoCanchaId: canchaExistente.tipoCanchaId,
        estado: canchaExistente.estado,
      });
    }
  }, [esEdicion, canchaExistente, reset]);

  const agregarToast = (tipo: ToastMessage['tipo'], texto: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, tipo, texto }]);
  };

  const descartarToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const onSubmit = async (datos: CanchaFormData) => {
    setErrorServidor(null);
    try {
      if (esEdicion) {
        await actualizarMutation.mutateAsync({ id: canchaId, datos });
        agregarToast('success', 'Cancha actualizada correctamente.');
      } else {
        await crearMutation.mutateAsync(datos);
        agregarToast('success', 'Cancha creada exitosamente.');
      }

      // Redirigir al listado principal tras un breve instante
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([campo, mensajes]) => {
          const campoForm = campo.toLowerCase() as keyof CanchaFormData;
          setError(campoForm, {
            type: 'server',
            message: mensajes[0],
          });
        });
      }
      setErrorServidor(apiError.message || 'Error al guardar la cancha. Verifica los datos ingresados.');
      agregarToast('error', 'No se pudo guardar la cancha.');
    }
  };

  if (esEdicion && cargandoCancha) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <span>Cargando datos de la cancha...</span>
      </div>
    );
  }

  const titulo = esEdicion ? `Editar Cancha N° ${canchaExistente?.numero ?? ''}` : 'Nueva Cancha';
  const guardando = isSubmitting || crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="cancha-form-page">
      <Toast toasts={toasts} onDismiss={descartarToast} />

      <header className="page-header">
        <div>
          <nav aria-label="Ruta de navegación" className="breadcrumb">
            <Link to="/">Canchas</Link> / <span>{esEdicion ? 'Editar' : 'Nueva'}</span>
          </nav>
          <h1>{titulo}</h1>
          <p>{esEdicion ? 'Modifica los datos de la cancha.' : 'Registra una nueva cancha en el sistema.'}</p>
        </div>
      </header>

      <section className="form-card">
        {errorServidor && (
          <div className="alert alert-danger" role="alert" aria-live="assertive">
            {errorServidor}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Número de Cancha */}
          <div className="form-group">
            <label htmlFor="numero">
              Número de Cancha <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="numero"
              type="number"
              min="1"
              disabled={guardando}
              aria-invalid={errors.numero ? 'true' : 'false'}
              aria-describedby={errors.numero ? 'numero-error' : undefined}
              {...register('numero')}
            />
            {errors.numero && (
              <span id="numero-error" className="field-error" role="alert">
                {errors.numero.message}
              </span>
            )}
          </div>

          {/* Sede */}
          <div className="form-group">
            <label htmlFor="sedeId">
              Sede <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <select
              id="sedeId"
              disabled={guardando || cargandoSedes}
              aria-invalid={errors.sedeId ? 'true' : 'false'}
              aria-describedby={errors.sedeId ? 'sede-error' : undefined}
              {...register('sedeId')}
            >
              {cargandoSedes ? (
                <option value="">Cargando sedes...</option>
              ) : (
                sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} - {s.direccion}
                  </option>
                ))
              )}
            </select>
            {errors.sedeId && (
              <span id="sede-error" className="field-error" role="alert">
                {errors.sedeId.message}
              </span>
            )}
          </div>

          {/* Tipo de Cancha */}
          <div className="form-group">
            <label htmlFor="tipoCanchaId">
              Tipo de Cancha <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <select
              id="tipoCanchaId"
              disabled={guardando || cargandoTipos}
              aria-invalid={errors.tipoCanchaId ? 'true' : 'false'}
              aria-describedby={errors.tipoCanchaId ? 'tipo-error' : undefined}
              {...register('tipoCanchaId')}
            >
              {cargandoTipos ? (
                <option value="">Cargando tipos...</option>
              ) : (
                tiposCancha.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} (${t.precioPorHora.toLocaleString('es-CL')}/hr)
                  </option>
                ))
              )}
            </select>
            {errors.tipoCanchaId && (
              <span id="tipo-error" className="field-error" role="alert">
                {errors.tipoCanchaId.message}
              </span>
            )}
          </div>

          {/* Estado de la Cancha */}
          <div className="form-group">
            <label htmlFor="estado">
              Estado Operativo <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <select
              id="estado"
              disabled={guardando}
              aria-invalid={errors.estado ? 'true' : 'false'}
              aria-describedby={errors.estado ? 'estado-error' : undefined}
              {...register('estado')}
            >
              {EstadosCancha.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {errors.estado && (
              <span id="estado-error" className="field-error" role="alert">
                {errors.estado.message}
              </span>
            )}
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <Link to="/" className="btn btn-outline" tabIndex={guardando ? -1 : 0}>
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? (
                <>
                  <span className="spinner" style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />
                  <span>Guardando...</span>
                </>
              ) : esEdicion ? (
                'Actualizar Cancha'
              ) : (
                'Guardar Cancha'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
export default CanchaFormPage;
