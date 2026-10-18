import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E (End-to-End)
 * - Evalúa flujos reales contra el frontend HTTPS (puerto 5173) y backend ASP.NET Core (puerto 7269).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://localhost:5173',
    ignoreHTTPSErrors: true, // Acepta certificados locales autofirmados de desarrollo
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
