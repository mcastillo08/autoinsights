import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Business from '../Business';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal, redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Ruta de login pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida del dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Business />
            </ProtectedRoute>
          } 
        />
        
        {/* Cualquier otra ruta redirige al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;