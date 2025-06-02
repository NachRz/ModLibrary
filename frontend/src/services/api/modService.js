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
  
  // Obtener mods por ID de juego
  getModsByGame: async (juegoId) => {
    try {
      const response = await apiClient.get(`/mods/juego/${juegoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los mods del juego' };
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
  
  // Obtener mods eliminados del usuario autenticado
  getMyDeletedMods: async () => {
    try {
      const response = await apiClient.get('/mods/mis-mods/eliminados');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener tus mods eliminados' };
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
      // Si ya es un FormData (viene de CrearMod.jsx con archivos), enviarlo directamente
      if (formData instanceof FormData) {
        const response = await apiClient.post('/mods', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
      
      // Si no es FormData, crear uno nuevo y procesar los datos (casos sin archivos)
      const data = new FormData();
      
      // Añadir cada campo al FormData, asegurando que juego_id sea un número
      Object.keys(formData).forEach(key => {
        if (key === 'imagen' || key === 'imagen_banner') {
          if (formData[key]) {
            data.append('imagen_banner', formData[key]);
          }
        } else if (key === 'juego_id') {
          data.append(key, Number(formData[key]));
        } else if (key === 'etiquetas') {
          // Las etiquetas se envían como array
          formData[key].forEach(etiqueta => {
            data.append('etiquetas[]', etiqueta);
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      const response = await apiClient.post('/mods', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
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
      let config = {};
      
      // Si formData es una instancia de FormData, configurar headers para multipart
      if (formData instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        // Si son datos JSON, dejar que axios configure automáticamente el Content-Type
        config.headers = {
          'Content-Type': 'application/json'
        };
      }
      
      const response = await apiClient.put(`/mods/${modId}`, formData, config);
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
  },

  // Obtener los mods guardados del usuario
  getSavedMods: async () => {
    try {
      const response = await apiClient.get('/mods/guardados');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los mods guardados' };
    }
  },

  // Guardar un mod
  saveMod: async (modId) => {
    try {
      const response = await apiClient.post(`/mods/${modId}/guardar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al guardar el mod' };
    }
  },

  // Eliminar un mod de guardados
  removeFromSaved: async (modId) => {
    try {
      const response = await apiClient.delete(`/mods/${modId}/guardar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el mod de guardados' };
    }
  },

  // Verificar si un mod está guardado
  isModSaved: async (modId) => {
    try {
      const response = await apiClient.get(`/mods/${modId}/guardado`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar el estado del mod' };
    }
  },
  
  // Obtener la valoración del usuario para un mod específico
  getUserRating: async (modId) => {
    try {
      const response = await apiClient.get(`/mods/${modId}/valoracion`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener tu valoración' };
    }
  },
  
  // Valorar un mod
  rateMod: async (modId, rating) => {
    try {
      const response = await apiClient.post(`/mods/${modId}/valoracion`, { 
        puntuacion: rating 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al valorar el mod' };
    }
  },
  
  // Eliminar valoración de un mod
  deleteRating: async (modId) => {
    try {
      const response = await apiClient.delete(`/mods/${modId}/valoracion`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar tu valoración' };
    }
  },

  // Obtener lista de juegos
  getJuegos: async () => {
    try {
      const response = await apiClient.get('/juegos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener los juegos' };
    }
  },

  // =============== MÉTODOS DE SOFT DELETE (SOLO ADMINS) ===============
  
  // Eliminar mod con soft delete
  softDeleteMod: async (modId) => {
    try {
      const response = await apiClient.delete(`/admin/mods/${modId}/soft`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al desactivar mod');
    }
  },

  // Obtener mods eliminados (soft deleted)
  getDeletedMods: async () => {
    try {
      const response = await apiClient.get('/admin/mods/deleted');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener mods eliminados' };
    }
  },

  // Restaurar mod eliminado
  restoreMod: async (modId) => {
    try {
      const response = await apiClient.post(`/admin/mods/${modId}/restore`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al restaurar mod');
    }
  },

  // Eliminar mod definitivamente (force delete)
  forceDeleteMod: async (modId) => {
    try {
      const response = await apiClient.delete(`/admin/mods/${modId}/force`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al eliminar mod definitivamente');
    }
  },
};

export default modService; 