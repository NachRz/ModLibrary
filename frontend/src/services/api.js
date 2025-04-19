import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Necesario para las cookies de autenticación si se usa Sanctum
});

// Interceptor para agregar el token a todas las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
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

export default apiClient; 