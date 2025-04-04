import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, isAuthenticated } from '../service/AuthService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si hay un mensaje de sesión expirada en los parámetros de la URL
  const sessionExpiredParam = new URLSearchParams(location.search).get('sessionExpired');
  const [sessionExpired, setSessionExpired] = useState(sessionExpiredParam === 'true');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/business');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setSessionExpired(false); // Limpiar mensaje de sesión expirada cuando se intenta un nuevo login

    try {
      const userData = await login(email, password);
      console.log('Inicio de sesión exitoso como:', userData.firstName, userData.lastName);
      navigate('/business');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al conectar con el servidor. Por favor intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Lado izquierdo - Fondo con logo */}
      <div className="relative flex-1 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url("/img/iconautotest.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1)',
            transformOrigin: 'center'
          }}
        />
        
      </div>

      {/* Lado derecho - Formulario de login */}
      <div className="w-[500px] flex flex-col justify-center px-16 bg-black">
        <h2 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h2>
        <p className="text-gray-400 mb-8">Inicia sesión para acceder a tu cuenta</p>

        {/* Mensaje de sesión expirada */}
        {sessionExpired && (
          <div className="bg-yellow-500 text-black p-3 rounded-md mb-6 text-sm">
            Tu sesión ha expirado por inactividad. Por favor inicia sesión nuevamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white mb-2">Correo</label>
            <input
              type="email"
              id="email"
              placeholder="driver@grupogranaauto.com.mx"
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="****************"
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="text-red-400 text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-lg 
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Procesando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center text-gray-500 text-sm mt-8">
          AUTO INSIGHTS © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;