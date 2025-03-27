import React, { useState, useEffect } from 'react';
import { extraerAgenciasYPaquetesCompletos } from './extractor-agencias-paquetes';

const TestExtractor: React.FC = () => {
  const [agencias, setAgencias] = useState<string[]>([]);
  const [paquetes, setPaquetes] = useState<string[]>([]);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Función para añadir logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const ejecutarExtraccion = async () => {
      try {
        addLog('Iniciando extracción...');
        setCargando(true);
        setError(null);
        
        const resultado = await extraerAgenciasYPaquetesCompletos();
        
        addLog(`Extracción completada: ${resultado.agencias.length} agencias, ${resultado.paquetes.length} paquetes, ${resultado.totalRegistros} registros totales`);
        
        setAgencias(resultado.agencias);
        setPaquetes(resultado.paquetes);
        setTotalRegistros(resultado.totalRegistros);
        
        addLog('Estados actualizados correctamente');
      } catch (err: any) {
        const errorMessage = err?.message || 'Error desconocido';
        addLog(`ERROR: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setCargando(false);
      }
    };
    
    ejecutarExtraccion();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Test de Extracción de Datos</h1>
      
      {cargando ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <span className="ml-3 text-lg">Cargando datos...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Total de registros procesados:</span> {totalRegistros}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Agencias encontradas:</span> {agencias.length}
            </p>
            <p className="text-gray-700 mb-4">
              <span className="font-semibold">Paquetes encontrados:</span> {paquetes.length}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Agencias ({agencias.length})</h2>
              <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                {agencias.length > 0 ? (
                  <ul className="space-y-1">
                    {agencias.map((agencia, idx) => (
                      <li key={idx} className="text-sm border-b border-gray-200 py-1">
                        {agencia || '(vacío)'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No se encontraron agencias</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Paquetes ({paquetes.length})</h2>
              <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                {paquetes.length > 0 ? (
                  <ul className="space-y-1">
                    {paquetes.map((paquete, idx) => (
                      <li key={idx} className="text-sm border-b border-gray-200 py-1">
                        {paquete === 'null' ? '(sin paquete)' : paquete || '(vacío)'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No se encontraron paquetes</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Log de ejecución</h2>
            <div className="bg-gray-800 text-gray-100 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
              {logs.map((log, idx) => (
                <p key={idx}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-right">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
        >
          Recargar
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default TestExtractor;