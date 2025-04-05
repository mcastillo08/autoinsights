import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgenciaSelector, { AgenciaNombre } from './AgenciaSelector';
import { logout, getCurrentUser } from '../service/AuthService';
import { IoLogOut } from "react-icons/io5";
import AdminPanel from './AdminPanel';

interface NavbarProps {
  agenciaActual: AgenciaNombre;
  onAgenciaChange: (agencia: AgenciaNombre) => void;
  isLoading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ agenciaActual, onAgenciaChange, isLoading }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Solo mostramos el botón de Admin si el usuario es superusuario
  const isSuperUser = currentUser?.isSuperuser;

  return (
    <>
      <div className="bg-[#673AB7] shadow-md">
        <div className="w-full px-0">
          <div className="flex items-center h-14 relative">
            {/* Logo posicionado en el extremo izquierdo sin margen */}
            <div className="absolute left-5 flex items-center space-x-4">
              <img src="/img/icon.png" alt="Logo" className="h-16 w-auto" />
              
              {/* Botón de Panel Admin - solo visible para superusuarios */}
              {isSuperUser && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="bg-purple-900 hover:bg-purple-950 text-white px-4 py-1 rounded-md text-sm transition-colors"
                >
                  Panel Admin
                </button>
              )}
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
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
              >
                <IoLogOut className="text-white" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Administración como componente separado */}
      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </>
  );
};

export default Navbar;