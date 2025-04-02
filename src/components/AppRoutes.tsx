import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Business from '../Business';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal, redirige a Business */}
        <Route path="/" element={<Navigate to="/business" replace />} />
        
        {/* Ruta de login pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida de Business */}
        <Route 
          path="/business" 
          element={
            <ProtectedRoute>
              <Business />
            </ProtectedRoute>
          } 
        />
        
        {/* Cualquier otra ruta redirige a Business */}
        <Route path="*" element={<Navigate to="/business" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;