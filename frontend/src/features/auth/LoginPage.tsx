import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoginRequestSchema } from '../../types';
import type { LoginRequest, ApiError } from '../../types';
import colocoloLogo from '../../assets/colo-colo-logo-footylogos.png';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  // Contador regresivo para bloqueo por Rate Limiting (429)
  React.useEffect(() => {
    if (segundosRestantes <= 0) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setErrorGeneral(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [segundosRestantes]);

  // Ruta a la que intentaba acceder antes del login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const sesionExpirada = searchParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setErrorGeneral(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 429) {
        setSegundosRestantes(60);
        setErrorGeneral(
          apiError.message ||
            'Has superado el límite de intentos permitidos (5 intentos/min). Por tu seguridad, espera un momento.'
        );
      } else {
        setErrorGeneral(apiError.message || 'Credenciales incorrectas.');
      }
    }
  };

  const esRateLimited = segundosRestantes > 0;

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <div className="login-crest-box">
            <img src={colocoloLogo} alt="Escudo Oficial Colo-Colo" className="login-crest" />
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Recinto Deportivo – CSD Colo-Colo</p>
        </header>

        {sesionExpirada && (
          <div role="alert" className="alert alert-warning" aria-live="polite">
            Tu sesión ha expirado por seguridad. Por favor, ingresa tus credenciales nuevamente.
          </div>
        )}

        {errorGeneral && (
          <div role="alert" className="alert alert-danger" aria-live="assertive">
            {errorGeneral}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting || esRateLimited}
              {...register('email')}
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting || esRateLimited}
              {...register('password')}
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || esRateLimited}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? 'Verificando...'
              : esRateLimited
                ? `Espera ${segundosRestantes}s para reintentar`
                : 'Ingresar'}
          </button>
        </form>

        <footer className="login-footer">
          <details>
            <summary>Usuarios de prueba (Desarrollo)</summary>
            <ul>
              <li><strong>Admin:</strong> admin@canchas.cl</li>
              <li><strong>Trabajador:</strong> trabajador@canchas.cl</li>
              <li><strong>Cliente:</strong> cliente@canchas.cl</li>
            </ul>
          </details>
        </footer>
      </div>
    </div>
  );
};
