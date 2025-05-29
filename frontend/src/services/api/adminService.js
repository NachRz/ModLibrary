import apiClient from './apiClient';

const adminService = {
  // Obtener todos los usuarios (solo para admins)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  // Actualizar usuario (rol, nombre de usuario, nombre, apellidos, foto de perfil)
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar usuario' };
    }
  },

  // Mantener método legacy para compatibilidad
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, {
        rol: role
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar rol' };
    }
  },

  // Actualizar estado de usuario
  updateUserStatus: async (userId, status) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/status`, {
        estado: status
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar estado' };
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      // Asegurar que el mensaje del backend se pase correctamente
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al eliminar usuario');
    }
  },

  // Eliminar usuario con soft delete (mantiene los mods)
  softDeleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/soft`);
      return response.data;
    } catch (error) {
      // Asegurar que el mensaje del backend se pase correctamente
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al desactivar usuario');
    }
  },

  // Eliminar usuario forzadamente (incluso si tiene mods)
  forceDeleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/force`);
      return response.data;
    } catch (error) {
      // Asegurar que el mensaje del backend se pase correctamente
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al eliminar usuario forzadamente');
    }
  },

  // Obtener usuarios eliminados (soft deleted)
  getDeletedUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users/deleted');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios eliminados' };
    }
  },

  // Restaurar usuario eliminado
  restoreUser: async (userId) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/restore`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al restaurar usuario');
    }
  },

  // Eliminar usuario definitivamente
  permanentDeleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/permanent`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al eliminar usuario definitivamente');
    }
  },

  // Eliminar usuario definitivamente con todos sus mods
  permanentDeleteUserWithMods: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/permanent-with-mods`);
      return response.data;
    } catch (error) {
      const backendError = error.response?.data;
      if (backendError && backendError.message) {
        throw new Error(backendError.message);
      }
      throw new Error('Error al eliminar usuario con mods definitivamente');
    }
  },

  // Obtener detalles de un usuario específico
  getUserDetails: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener detalles del usuario' };
    }
  },

  // Subir imagen de perfil
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post('/admin/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al subir la imagen' };
    }
  }
};

export default adminService; 