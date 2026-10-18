import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export const Layout: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const puedeGestionar = usuario?.rol === 'Trabajador' || usuario?.rol === 'Administrador';

  return (
    <div className="app-layout">
      {/* Enlace de salto accesible para usuarios de teclado y lectores de pantalla (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <Link to="/" className="brand-logo" aria-label="Inicio - Sistema Reservas Canchas">
              <span className="brand-icon" aria-hidden="true">⚽</span>
              <span className="brand-text">CanchasApp</span>
            </Link>
          </div>

          <nav className="main-nav" aria-label="Navegación principal">
            <ul>
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  Canchas
                </NavLink>
              </li>

              {puedeGestionar && (
                <>
                  <li>
                    <NavLink to="/canchas/nueva" className={({ isActive }) => (isActive ? 'active' : '')}>
                      Nueva Cancha
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tipos-cancha" className={({ isActive }) => (isActive ? 'active' : '')}>
                      Tipos de Cancha
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="user-menu">
            {usuario && (
              <div className="user-profile">
                <span className="user-name">{usuario.nombre}</span>
                <span className={`badge badge-${usuario.rol.toLowerCase()}`} title={`Rol: ${usuario.rol}`}>
                  {usuario.rol}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline"
                  aria-label="Cerrar sesión actual"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <div className="main-container">
          <Outlet />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p>© 2026 CanchasApp - Sistema Seguro de Reservas de Canchas (LPW2 - UT2)</p>
          <p className="footer-badges">
            <span className="security-tag" title="Conexión encriptada mediante HTTPS">🔒 HTTPS Activo</span>
            <span className="security-tag" title="Autenticación basada en JWT con expiración estricta">🛡️ JWT Bearer</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
