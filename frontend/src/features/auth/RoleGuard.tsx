import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { RolUsuario } from '../../types';

interface RoleGuardProps {
  rolesPermitidos: RolUsuario[];
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ rolesPermitidos, children }) => {
  const { usuario } = useAuth();

  if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
    // Si el rol del usuario no está dentro de los permitidos, redirige a la vista de Acceso Denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
