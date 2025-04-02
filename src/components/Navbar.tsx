import React from 'react';
import AgenciaSelector, { AgenciaNombre } from './AgenciaSelector';

interface NavbarProps {
  agenciaActual: AgenciaNombre;
  onAgenciaChange: (agencia: AgenciaNombre) => void;
  isLoading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ agenciaActual, onAgenciaChange, isLoading }) => {
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
          
          {/* Espacio a la derecha para equilibrar */}
          <div className="w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;