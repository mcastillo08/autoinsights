import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../service/AuthService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      console.log('Inicio de sesión exitoso como:', userData.firstName, userData.lastName);
      
      // Redirigir al dashboard después del login exitoso
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al conectar con el servidor. Por favor intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#222',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          flex: 1.5,
          backgroundColor: '#4a148c',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src="/img/icon.png"
          alt="Auto Insights Logo"
          style={{ maxWidth: '80%', maxHeight: '200px' }}
        />
        <h2 style={{ marginTop: '2rem', fontSize: '2rem', textAlign: 'center' }}>
          AUTO INSIGHTS
        </h2>
        <p style={{ marginTop: '1rem', color: '#e0e0e0', textAlign: 'center' }}>
          Plataforma de Business Intelligence
        </p>
      </div>

      <div
        style={{
          flex: 0.7,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Iniciar sesión</h1>
        <p style={{ marginBottom: '2rem', color: '#ccc', textAlign: 'center' }}>
          Accede a la plataforma de Business Intelligence
        </p>

        <form
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          onSubmit={handleSubmit}
        >
          <div style={{ marginBottom: '.5rem', width: '90%', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
              Correo
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="ejemplo@gruponissauto.com.mx"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#333',
                color: '#fff',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem', width: '90%', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="****************"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#333',
                color: '#fff',
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {errorMessage && (
            <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#673AB7',
              color: '#fff',
              padding: '0.85rem .5rem',
              borderRadius: '10px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: '90%',
              opacity: isLoading ? '0.7' : '1',
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Procesando...' : 'Iniciar sesión'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#aaa', fontSize: '0.9rem' }}>
            AUTO INSIGHTS © {new Date().getFullYear()}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;