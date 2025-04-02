interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isSuperuser: boolean;
    agencia?: string;
  }
  
  const USER_KEY = 'autoinsights_user';
  const API_URL = 'http://localhost:3001';
  
  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  export const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Intentando login con email: ${email}`);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Error en respuesta:', data);
        throw new Error(data.message || 'Error al iniciar sesión');
      }
  
      // Guardar información del usuario en localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  
      console.log('Login exitoso:', data.user);
      return data.user;
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw error;
    }
  };
  
  /**
   * Cierra la sesión del usuario actual
   */
  export const logout = (): void => {
    localStorage.removeItem(USER_KEY);
    // Redirigir a la página de inicio de sesión se maneja en el componente
  };
  
  /**
   * Verifica si hay un usuario autenticado
   */
  export const isAuthenticated = (): boolean => {
    const user = localStorage.getItem(USER_KEY);
    return user !== null;
  };
  
  /**
   * Obtiene la información del usuario autenticado
   */
  export const getCurrentUser = (): User | null => {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      logout(); // Si hay error al leer el usuario, cerrar sesión
      return null;
    }
  };