import { test, expect } from '@playwright/test';

/**
 * Prueba End-to-End (E2E) – Flujo Principal de Trabajo
 * 1. Inicio de sesión como Trabajador.
 * 2. Navegación al formulario de nueva cancha.
 * 3. Creación exitosa de una cancha deportiva.
 * 4. Verificación de presencia en el listado principal.
 */
test.describe('Flujo E2E – Gestión de Canchas por Trabajador', () => {
  test('debe permitir autenticarse como Trabajador, crear una cancha y verla en el listado', async ({ page }) => {
    // Generar un número de cancha único para evitar colisiones
    const numeroCanchaUnico = Math.floor(1000 + Math.random() * 9000);

    // 1. Acceder a la página de login
    await page.goto('/login');
    await expect(page).toHaveTitle(/iniciar sesión/i);

    // 2. Ingresar credenciales del usuario Trabajador
    await page.getByLabel(/correo electrónico/i).fill('trabajador@canchas.cl');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /ingresar/i }).click();

    // 3. Confirmar llegada al listado principal
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /canchas deportivas/i })).toBeVisible();

    // 4. Navegar a la creación de nueva cancha
    await page.getByRole('link', { name: /\+ nueva cancha/i }).click();
    await expect(page).toHaveURL('/canchas/nueva');
    await expect(page.getByRole('heading', { name: /nueva cancha/i })).toBeVisible();

    // 5. Rellenar formulario accesible
    await page.getByLabel(/número de cancha/i).fill(numeroCanchaUnico.toString());
    
    // Seleccionar sede y tipo si están disponibles
    const selectSede = page.getByLabel(/sede/i);
    await selectSede.waitFor({ state: 'visible' });

    // 6. Guardar la nueva cancha
    await page.getByRole('button', { name: /guardar cancha/i }).click();

    // 7. Verificar redirección y presencia de la cancha creada en el listado
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText(`Cancha ${numeroCanchaUnico}`)).toBeVisible();
  });
});
