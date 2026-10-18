import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../api/httpClient';
import { authService } from '../../services/authService';
import { UsuarioResponseSchema } from '../../types';
import type { LoginRequest, UsuarioResponse } from '../../types';

interface AuthContextType {
  token: string | null;
  usuario: UsuarioResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credenciales: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función auxiliar para decodificar la fecha de expiración del JWT
function obtenerExpiracionJwt(token: string): number | null {
  try {
    const partes = token.split('.');
    if (partes.length < 2) return null;
    const base64Url = partes[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Manejo seguro de fallo en sessionStorage
    }
    setToken(null);
    setUsuario(null);
  }, []);

  // Carga inicial y validación de expiración
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUserRaw = sessionStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUserRaw) {
        const expMs = obtenerExpiracionJwt(storedToken);
        const ahora = Date.now();

        if (expMs && expMs <= ahora) {
          // Token ya expirado
          logout();
        } else {
          const parsedUser = UsuarioResponseSchema.safeParse(JSON.parse(storedUserRaw));
          if (parsedUser.success) {
            setToken(storedToken);
            setUsuario(parsedUser.data);

            // Programar cierre de sesión al expirar
            if (expMs) {
              const msRestantes = expMs - ahora;
              const timer = setTimeout(() => {
                logout();
              }, msRestantes);
              setIsLoading(false);
              return () => clearTimeout(timer);
            }
          } else {
            logout();
          }
        }
      }
    } catch {
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (credenciales: LoginRequest) => {
    const data = await authService.login(credenciales);
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.usuario));
    } catch {
      // Manejo seguro en caso de cuota excedida o bloqueo de storage
    }
    setToken(data.token);
    setUsuario(data.usuario);

    const expMs = obtenerExpiracionJwt(data.token);
    if (expMs) {
      const msRestantes = expMs - Date.now();
      if (msRestantes > 0) {
        setTimeout(() => {
          logout();
        }, msRestantes);
      }
    }
  };

  const value = useMemo(
    () => ({
      token,
      usuario,
      isAuthenticated: Boolean(token && usuario),
      isLoading,
      login,
      logout,
    }),
    [token, usuario, isLoading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
