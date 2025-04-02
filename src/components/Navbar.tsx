import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgenciaSelector, { AgenciaNombre } from './AgenciaSelector';
import { logout, getCurrentUser } from '../service/AuthService';

interface NavbarProps {
  agenciaActual: AgenciaNombre;
  onAgenciaChange: (agencia: AgenciaNombre) => void;
  isLoading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ agenciaActual, onAgenciaChange, isLoading }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-[#673AB7] shadow-md">
      <div className="w-full px-0">
        <div className="flex items-center h-14 relative">
          {/* Logo posicionado en el extremo izquierdo sin margen */}
          <div className="absolute left-5">
            <img src="/img/icon.png" alt="Logo" className="h-16 w-auto" />
          </div>

          {/* Selector de Agencias centrado */}
          <div className="mx-auto w-40">
            <AgenciaSelector 
              agenciaActual={agenciaActual} 
              onAgenciaChange={onAgenciaChange}
              cargando={isLoading}
            />
          </div>
          
          {/* Información de usuario y botón de cierre de sesión */}
          <div className="absolute right-5 flex items-center space-x-4">
            {currentUser && (
              <div className="text-white text-xs">
                <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;