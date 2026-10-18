import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const { usuario } = useAuth();

  return (
    <div className="error-page-container">
      <div className="error-card">
        <header>
          <span className="error-code" aria-hidden="true">403</span>
          <h1>Acceso Denegado</h1>
        </header>
        <p>No tienes los permisos requeridos para acceder a este recurso o funcionalidad.</p>
        {usuario && (
          <p className="role-info">
            Estás autenticado como: <strong>{usuario.nombre}</strong> con rol{' '}
            <span className={`badge badge-${usuario.rol.toLowerCase()}`}>{usuario.rol}</span>.
          </p>
        )}
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
