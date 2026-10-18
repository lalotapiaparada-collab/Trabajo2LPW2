import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import { LoginPage } from '../features/auth/LoginPage';
import { TOKEN_STORAGE_KEY } from '../api/httpClient';

describe('LoginPage – Pruebas de accesibilidad y autenticación', () => {
  it('muestra errores de validación accesibles al enviar campos vacíos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    // Buscar botón de ingreso por su rol accesible
    const botonIngresar = screen.getByRole('button', { name: /ingresar/i });
    await user.click(botonIngresar);

    // Verificar que aparezcan los mensajes de error asociados a los campos
    await waitFor(() => {
      expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('muestra mensaje de alerta accesible ante credenciales incorrectas (401)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    // Rellenar formulario con credenciales inválidas
    const inputEmail = screen.getByLabelText(/correo electrónico/i);
    const inputPassword = screen.getByLabelText(/contraseña/i);
    const botonIngresar = screen.getByRole('button', { name: /ingresar/i });

    await user.type(inputEmail, 'error@canchas.cl');
    await user.type(inputPassword, 'WrongPassword!');
    await user.click(botonIngresar);

    // Debe mostrar la alerta con role="alert"
    const alertaError = await screen.findByRole('alert');
    expect(alertaError).toBeInTheDocument();
    expect(alertaError).toHaveTextContent(/correo o contraseña incorrectos|credenciales/i);
  });

  it('inicia sesión con éxito y almacena el token en sessionStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const inputEmail = screen.getByLabelText(/correo electrónico/i);
    const inputPassword = screen.getByLabelText(/contraseña/i);
    const botonIngresar = screen.getByRole('button', { name: /ingresar/i });

    await user.type(inputEmail, 'trabajador@canchas.cl');
    await user.type(inputPassword, 'Password123!');
    await user.click(botonIngresar);

    await waitFor(() => {
      const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      expect(token).toBeTruthy();
    });
  });

  it('bloquea el formulario y muestra mensaje cuando se recibe HTTP 429', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const inputEmail = screen.getByLabelText(/correo electrónico/i);
    const inputPassword = screen.getByLabelText(/contraseña/i);
    const botonIngresar = screen.getByRole('button', { name: /ingresar/i });

    await user.type(inputEmail, 'rate@canchas.cl');
    await user.type(inputPassword, 'Password123!');
    await user.click(botonIngresar);

    // Esperar a que el botón se deshabilite y muestre el conteo
    await waitFor(() => {
      expect(botonIngresar).toBeDisabled();
      expect(botonIngresar).toHaveTextContent(/espera/i);
    });

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent(/demasiadas solicitudes|espera un minuto/i);
  });
});
