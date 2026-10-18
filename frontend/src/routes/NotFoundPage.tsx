import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="error-page-container">
      <div className="error-card">
        <header>
          <span className="error-code" aria-hidden="true">404</span>
          <h1>Página No Encontrada</h1>
        </header>
        <p>La dirección a la que intentas acceder no existe o fue movida.</p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
