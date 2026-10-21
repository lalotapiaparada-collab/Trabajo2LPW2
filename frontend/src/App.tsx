import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { RoleGuard } from './features/auth/RoleGuard';
import { Layout } from './components/Layout';
import { AccessDeniedPage } from './routes/AccessDeniedPage';
import { NotFoundPage } from './routes/NotFoundPage';

import { CanchasListPage } from './features/canchas/CanchasListPage';
import { CanchaDetailPage } from './features/canchas/CanchaDetailPage';
import { CanchaFormPage } from './features/canchas/CanchaFormPage';
import { TiposCanchaPage } from './features/tipos-cancha/TiposCanchaPage';
import { ModulosHubPage } from './features/modulos/ModulosHubPage';

import { RouteAccessibilityAnnouncer } from './components/RouteAccessibilityAnnouncer';

// Instancia global de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteAccessibilityAnnouncer />
        <AuthProvider>
          <Routes>
            {/* Ruta pública de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas dentro del Layout semántico */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Página Principal: Módulos Rápidos unificados para todos los usuarios */}
                <Route path="/" element={<ModulosHubPage />} />
                <Route path="/modulos" element={<ModulosHubPage />} />

                {/* Catálogo y Ficha de Canchas */}
                <Route path="/canchas" element={<CanchasListPage />} />
                <Route path="/canchas/:id" element={<CanchaDetailPage />} />

                {/* Rutas de gestión restringidas a Trabajador y Administrador */}
                <Route element={<RoleGuard rolesPermitidos={['Trabajador', 'Administrador']} />}>
                  <Route path="/canchas/nueva" element={<CanchaFormPage />} />
                  <Route path="/canchas/:id/editar" element={<CanchaFormPage />} />
                  <Route path="/tipos-cancha" element={<TiposCanchaPage />} />
                </Route>
              </Route>
            </Route>

            {/* Páginas de error y acceso denegado */}
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
