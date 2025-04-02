import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../service/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;