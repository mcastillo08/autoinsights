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
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Sección izquierda: Servicio */}
          <div className="flex items-center space-x-4">
            
          </div>

          {/* Sección central: Selector de Agencias */}
          <div className="min-w-32">
            <AgenciaSelector 
              agenciaActual={agenciaActual} 
              onAgenciaChange={onAgenciaChange}
              cargando={isLoading}
            />
          </div>

          {/* Sección derecha: Bases de datos */}
          <div className="flex items-center space-x-4">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;