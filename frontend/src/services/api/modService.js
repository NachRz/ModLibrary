import apiClient from './apiClient';
import authService from './authService';

const modService = {
  // Obtener todos los mods con información básica del creador
  getAllMods: async () => {
    try {
      const response = await apiClient.get('/mods');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los mods' };
    }
  },
  
  // Obtener mods con estadísticas y detalles completos del creador
  getModsWithDetails: async () => {
    try {
      const response = await apiClient.get('/mods/con-detalles');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los detalles de los mods' };
    }
  },
  
  // Obtener mods por ID de creador
  getModsByCreatorId: async (creadorId) => {
    try {
      const response = await apiClient.get(`/mods/creador/${creadorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los mods del creador' };
    }
  },
  
  // Obtener mods por nombre de usuario del creador
  getModsByCreatorName: async (username) => {
    try {
      const response = await apiClient.get(`/mods/creador/nombre/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los mods del creador' };
    }
  },
  
  // Obtener mods del usuario autenticado con todos los detalles
  getMyMods: async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      throw { message: 'Usuario no autenticado' };
    }
    
    try {
      // En lugar de filtrar después, usamos directamente el endpoint específico para los mods del usuario
      const response = await apiClient.get(`/mods/creador/${user.id}`);
      
      // Si se obtienen correctamente, devolvemos los datos
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener tus mods' };
    }
  }
};

export default modService; 