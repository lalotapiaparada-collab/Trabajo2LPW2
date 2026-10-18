import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Gestor de Accesibilidad de Rutas (WCAG 2.4.2 Page Titled, 2.4.3 Focus Order)
 * - Actualiza el título del documento según la ruta activa.
 * - Mueve el foco del teclado al encabezado principal <h1> de la vista cargada.
 * - Anuncia el cambio de página a tecnologías de asistencia mediante una región live.
 */
export const RouteAccessibilityAnnouncer: React.FC = () => {
  const location = useLocation();
  const [mensajeAnuncio, setMensajeAnuncio] = useState('');

  useEffect(() => {
    let titulo = 'CanchasYa - Gestión de Canchas';

    const path = location.pathname;
    if (path === '/') {
      titulo = 'Listado de Canchas - CanchasYa';
    } else if (path === '/login') {
      titulo = 'Iniciar Sesión - CanchasYa';
    } else if (path === '/canchas/nueva') {
      titulo = 'Crear Nueva Cancha - CanchasYa';
    } else if (path.startsWith('/canchas/') && path.endsWith('/editar')) {
      titulo = 'Editar Cancha - CanchasYa';
    } else if (path.startsWith('/canchas/')) {
      titulo = 'Detalle de Cancha - CanchasYa';
    } else if (path === '/tipos-cancha') {
      titulo = 'Gestión de Tipos de Cancha - CanchasYa';
    } else if (path === '/acceso-denegado') {
      titulo = 'Acceso Denegado (403) - CanchasYa';
    } else if (path === '/404') {
      titulo = 'Página No Encontrada (404) - CanchasYa';
    }

    document.title = titulo;
    setMensajeAnuncio(`Página cargada: ${titulo}`);

    // Mover el foco del teclado al <h1> principal de la nueva página (WCAG 2.4.3)
    const timeoutId = setTimeout(() => {
      const heading = document.querySelector('h1');
      if (heading) {
        if (!heading.getAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
        }
        heading.focus();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {mensajeAnuncio}
    </div>
  );
};
export default RouteAccessibilityAnnouncer;
