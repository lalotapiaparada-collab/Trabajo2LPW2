import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthContext';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { RoleGuard } from '../features/auth/RoleGuard';
import { AccessDeniedPage } from '../routes/AccessDeniedPage';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/httpClient';
import { TOKEN_CLIENTE_MOCK, TOKEN_TRABAJADOR_MOCK } from './mocks/handlers';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderTestApp = (initialRoute = '/') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<h1>Página de Login</h1>} />
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<h1>Panel Principal</h1>} />

              {/* Ruta restringida para Trabajador y Administrador */}
              <Route element={<RoleGuard rolesPermitidos={['Trabajador', 'Administrador']} />}>
                <Route path="/gestion" element={<h1>Área de Gestión</h1>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProtectedRoute y RoleGuard – Control de acceso basado en roles', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('redirige a /login cuando el usuario no tiene sesión activa', () => {
    renderTestApp('/');
    expect(screen.getByRole('heading', { name: /página de login/i })).toBeInTheDocument();
  });

  it('permite el acceso a ruta protegida cuando el usuario tiene sesión válida', () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, TOKEN_TRABAJADOR_MOCK);
    sessionStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        id: 1,
        nombre: 'Trabajador Demo',
        email: 'trabajador@canchas.cl',
        rol: 'Trabajador',
        fechaCreacion: '2026-01-01',
      })
    );

    renderTestApp('/');
    expect(screen.getByRole('heading', { name: /panel principal/i })).toBeInTheDocument();
  });

  it('bloquea el acceso y redirige a /acceso-denegado cuando rol Cliente intenta acceder a gestión', () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, TOKEN_CLIENTE_MOCK);
    sessionStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        id: 2,
        nombre: 'Cliente Demo',
        email: 'cliente@canchas.cl',
        rol: 'Cliente',
        fechaCreacion: '2026-01-01',
      })
    );

    renderTestApp('/gestion');
    expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('permite el acceso a /gestion a un usuario con rol Trabajador', () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, TOKEN_TRABAJADOR_MOCK);
    sessionStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        id: 1,
        nombre: 'Trabajador Demo',
        email: 'trabajador@canchas.cl',
        rol: 'Trabajador',
        fechaCreacion: '2026-01-01',
      })
    );

    renderTestApp('/gestion');
    expect(screen.getByRole('heading', { name: /área de gestión/i })).toBeInTheDocument();
  });
});
