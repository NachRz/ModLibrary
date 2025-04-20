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
  },
  
  // Obtener un mod específico por ID
  getModById: async (modId) => {
    try {
      const response = await apiClient.get(`/mods/${modId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el mod' };
    }
  },
  
  // Crear un nuevo mod
  createMod: async (formData) => {
    try {
      const response = await apiClient.post('/mods', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Necesario para enviar archivos
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el mod' };
    }
  },
  
  // Actualizar un mod existente
  updateMod: async (modId, formData) => {
    try {
      const response = await apiClient.put(`/mods/${modId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Necesario para enviar archivos
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el mod' };
    }
  },
  
  // Eliminar un mod
  deleteMod: async (modId) => {
    try {
      const response = await apiClient.delete(`/mods/${modId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el mod' };
    }
  },
  
  // Cambiar el estado de un mod (borrador/publicado)
  changeModStatus: async (modId, estado) => {
    try {
      const response = await apiClient.patch(`/mods/${modId}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar el estado del mod' };
    }
  },
  
  // Obtener todas las versiones de un mod
  getModVersions: async (modId) => {
    try {
      const response = await apiClient.get(`/mods/${modId}/versiones`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener las versiones del mod' };
    }
  },
  
  // Añadir una nueva versión a un mod
  addModVersion: async (modId, versionData) => {
    try {
      const response = await apiClient.post(`/mods/${modId}/versiones`, versionData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Necesario para enviar archivos
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al añadir la versión al mod' };
    }
  }
};

export default modService; 