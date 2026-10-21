import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import colocoloLogo from '../assets/colo-colo-logo-footylogos.png';

interface ModuloQuickLink {
  id: string;
  nombre: string;
  icono: string;
  ruta: string;
  categoria: string;
  adminOnly?: boolean;
}

const MODULOS_SISTEMA: ModuloQuickLink[] = [
  // Instalaciones
  { id: 'canchas', nombre: 'Canchas', icono: '⚽', ruta: '/?tab=canchas', categoria: 'Instalaciones' },
  { id: 'tipos', nombre: 'Tipos de Cancha', icono: '🏷️', ruta: '/?tab=tipos', categoria: 'Instalaciones' },
  { id: 'sedes', nombre: 'Sedes', icono: '🏢', ruta: '/?tab=sedes', categoria: 'Instalaciones' },
  { id: 'horarios', nombre: 'Horarios', icono: '⏰', ruta: '/?tab=horarios', categoria: 'Instalaciones' },

  // Operaciones
  { id: 'reservas', nombre: 'Reservas', icono: '📅', ruta: '/?tab=reservas', categoria: 'Operaciones' },
  { id: 'pagos', nombre: 'Pagos', icono: '💳', ruta: '/?tab=pagos', categoria: 'Operaciones' },
  { id: 'comprobantes', nombre: 'Comprobantes', icono: '📄', ruta: '/?tab=comprobantes', categoria: 'Operaciones' },

  // Servicios
  { id: 'mantenimientos', nombre: 'Mantenimientos', icono: '🔧', ruta: '/?tab=mantenimientos', categoria: 'Servicios' },
  { id: 'resenas', nombre: 'Reseñas', icono: '⭐', ruta: '/?tab=resenas', categoria: 'Servicios' },
  { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔', ruta: '/?tab=notificaciones', categoria: 'Servicios' },

  // Administración
  { id: 'trabajadores', nombre: 'Trabajadores', icono: '👷', ruta: '/?tab=trabajadores', categoria: 'Administración', adminOnly: true },
  { id: 'usuarios', nombre: 'Usuarios', icono: '👥', ruta: '/?tab=usuarios', categoria: 'Administración', adminOnly: true },
];

export const Layout: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuModulosAbierto, setMenuModulosAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const esAdmin = usuario?.rol === 'Administrador';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Cerrar menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuModulosAbierto) {
        setMenuModulosAbierto(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuModulosAbierto(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuModulosAbierto]);

  const irAModulo = (ruta: string) => {
    setMenuModulosAbierto(false);
    navigate(ruta);
  };

  const modulosVisibles = MODULOS_SISTEMA.filter((m) => !m.adminOnly || esAdmin);
  const categorias = Array.from(new Set(modulosVisibles.map((m) => m.categoria)));

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
              <div className="brand-crest-wrap">
                <img src={colocoloLogo} alt="Escudo Oficial Colo-Colo" className="brand-crest" />
              </div>
              <div className="brand-text-container">
                <span className="brand-text">CanchasYa</span>
                <span className="brand-badge">CSD COLO-COLO</span>
              </div>
            </Link>
          </div>

          <nav className="main-nav" aria-label="Navegación principal" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <ul>
              {/* Acceso Principal a Módulos Rápidos en Inicio */}
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  ⚡ Módulos Rápidos
                </NavLink>
              </li>

              {/* Selector Rápido por Categorías y Módulos */}
              <li style={{ position: 'relative' }}>
                <div className="modules-nav-dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${menuModulosAbierto ? 'active' : ''}`}
                    onClick={() => setMenuModulosAbierto((prev) => !prev)}
                    aria-expanded={menuModulosAbierto}
                    aria-haspopup="true"
                    aria-label="Seleccionar categoría o módulo directo"
                  >
                    <span>Ir a Categoría ▾</span>
                  </button>

                  {menuModulosAbierto && (
                    <div className="nav-dropdown-menu" role="menu">
                      {categorias.map((cat) => (
                        <div key={cat} className="dropdown-group">
                          <div className="dropdown-group-title">{cat}</div>
                          <div className="dropdown-items-grid">
                            {modulosVisibles
                              .filter((m) => m.categoria === cat)
                              .map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  className="dropdown-item-btn"
                                  role="menuitem"
                                  onClick={() => irAModulo(m.ruta)}
                                >
                                  <span className="dropdown-item-left">
                                    <span aria-hidden="true">{m.icono}</span>
                                    <span>{m.nombre}</span>
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </nav>

          <div className="user-menu">
            {usuario && (
              <div className="user-profile">
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
            <span className="security-tag" title="Control de Acceso Basado en Roles Activo">🛡️ RBAC / BOLA</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
