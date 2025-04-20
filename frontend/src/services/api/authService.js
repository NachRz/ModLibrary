import apiClient from './apiClient';

const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/login', {
        correo: credentials.email,
        contrasina: credentials.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },
  
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', {
        nome: userData.username,
        correo: userData.email,
        contrasina: userData.password,
        nombre: userData.username, // Usando username como nombre por simplicidad
        apelidos: 'Usuario' // Valor por defecto, se podría añadir este campo al formulario
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },
  
  // Cerrar sesión
  logout: async () => {
    try {
      await apiClient.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar el almacenamiento local de todos modos
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // Obtener el usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService; 