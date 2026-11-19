import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface ProtegerRutaProps {
  rolesPermitidos: UserRole[];
  children: React.ReactNode;
}

export const ProtegerRuta: React.FC<ProtegerRutaProps> = ({ rolesPermitidos, children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(currentUser.role)) {
    if (currentUser.role === 'Cocinero') return <Navigate to="/cocina" replace />;
    if (currentUser.role === 'Administrador') return <Navigate to="/admin/caja" replace />;
    return <Navigate to="/mesas" replace />;
  }

  return <>{children}</>;
};
