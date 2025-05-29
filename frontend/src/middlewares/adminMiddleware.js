import authService from '../services/api/authService';
import apiClient from '../services/api/apiClient';

/**
 * Middleware para verificar si el usuario actual es administrador
 * @returns {Promise<boolean>} true si es admin, false en caso contrario
 */
export const isAdmin = async () => {
  try {
    // Verificar primero si está autenticado
    if (!authService.isAuthenticated()) {
      return false;
    }

    // Verificar rol de admin desde el backend
    const response = await apiClient.get('/user/is-admin');
    return response.data.is_admin;
  } catch (error) {
    console.error('Error al verificar permisos de admin:', error);
    return false;
  }
};

/**
 * Middleware para verificar si el usuario actual es administrador usando datos locales
 * (más rápido pero menos seguro)
 * @returns {boolean} true si es admin según los datos locales
 */
export const isAdminLocal = () => {
  try {
    const user = authService.getCurrentUser();
    return user && user.rol === 'admin';
  } catch (error) {
    console.error('Error al verificar datos locales de admin:', error);
    return false;
  }
};

/**
 * Hook personalizado para usar el middleware de admin en componentes React
 */
export const useAdminMiddleware = () => {
  return {
    isAdmin,
    isAdminLocal
  };
}; 