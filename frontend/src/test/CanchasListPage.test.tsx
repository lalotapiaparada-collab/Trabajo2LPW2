import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import { CanchasListPage } from '../features/canchas/CanchasListPage';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/httpClient';
import { TOKEN_CLIENTE_MOCK, TOKEN_TRABAJADOR_MOCK } from './mocks/handlers';

describe('CanchasListPage – Pruebas de integración con MSW', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('muestra estado de carga inicial con rol status accesible', () => {
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

    renderWithProviders(<CanchasListPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/cargando canchas/i)).toBeInTheDocument();
  });

  it('renderiza la lista de canchas correctamente una vez cargados los datos', async () => {
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

    renderWithProviders(<CanchasListPage />);

    // Esperar a que la tabla accesible se renderice
    const tabla = await screen.findByRole('table');
    expect(tabla).toBeInTheDocument();

    // Verificar contenido de canchas mockeadas
    expect(screen.getAllByText(/cancha 101/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cancha 102/i).length).toBeGreaterThan(0);
  });

  it('filtra canchas por texto de búsqueda reactivamente', async () => {
    const user = userEvent.setup();
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

    renderWithProviders(<CanchasListPage />);

    await screen.findByRole('table');

    const inputBusqueda = screen.getByLabelText(/búsqueda rápida/i);
    await user.type(inputBusqueda, 'Pádel');

    await waitFor(() => {
      // Cancha 102 (Pádel) debe estar visible
      expect(screen.getAllByText(/cancha 102/i).length).toBeGreaterThan(0);
      // Cancha 101 (Fútbol 7) no debe estar visible
      expect(screen.queryByText(/cancha 101/i)).not.toBeInTheDocument();
    });
  });

  it('oculta el botón de Crear Cancha para usuarios con rol Cliente', async () => {
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

    renderWithProviders(<CanchasListPage />);
    await screen.findByRole('table');

    // Cliente NO debe ver el botón "+ Nueva Cancha"
    expect(screen.queryByRole('link', { name: /\+ nueva cancha/i })).not.toBeInTheDocument();
  });
});
