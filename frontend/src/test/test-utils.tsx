import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthContext';

// Helper para crear un QueryClient aislado con reintentos desactivados
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const queryClient = options?.queryClient || createTestQueryClient();

  const Wrapper: React.FC<AllTheProvidersProps> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
};
