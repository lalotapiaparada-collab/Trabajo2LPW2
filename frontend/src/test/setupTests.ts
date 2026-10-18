import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Iniciar interceptor de MSW antes de todas las pruebas
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Resetear handlers entre pruebas para evitar contaminación de estado
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
});

// Cerrar el servidor MSW al finalizar
afterAll(() => server.close());

// Polyfill de HTMLDialogElement para jsdom (showModal, close)
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
}

// Mock de window.matchMedia para jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
