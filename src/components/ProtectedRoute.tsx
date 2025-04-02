import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../service/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated()) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el componente hijo
  return <>{children}</>;
};

export default ProtectedRoute;