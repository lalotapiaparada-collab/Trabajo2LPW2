import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import { CanchaFormPage } from '../features/canchas/CanchaFormPage';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/httpClient';
import { TOKEN_TRABAJADOR_MOCK } from './mocks/handlers';

describe('CanchaFormPage – Creación y validación de canchas', () => {
  beforeEach(() => {
    sessionStorage.clear();
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
  });

  it('permite enviar el formulario y muestra notificación accesible de éxito', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CanchaFormPage />);

    // Esperar a que los selects se carguen de la API mock
    await screen.findByRole('option', { name: /sede central/i });

    const inputNumero = screen.getByLabelText(/número de cancha/i);
    const botonGuardar = screen.getByRole('button', { name: /guardar cancha/i });

    await user.clear(inputNumero);
    await user.type(inputNumero, '105');
    await user.click(botonGuardar);

    // Debe mostrar la notificación Toast de éxito con role="status"
    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent(/cancha creada exitosamente/i);
  });

  it('muestra error de validación retornado por el servidor (400)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CanchaFormPage />);

    await screen.findByRole('option', { name: /sede central/i });

    const inputNumero = screen.getByLabelText(/número de cancha/i);
    const botonGuardar = screen.getByRole('button', { name: /guardar cancha/i });

    // El número 999 está configurado en MSW para responder 400 con error específico
    await user.clear(inputNumero);
    await user.type(inputNumero, '999');
    await user.click(botonGuardar);

    // Debe mostrar mensaje de error de campo y alerta general
    await waitFor(() => {
      expect(screen.getByText(/el número 999 ya existe en esta sede/i)).toBeInTheDocument();
      expect(screen.getByText(/datos inválidos/i)).toBeInTheDocument();
    });
  });
});
