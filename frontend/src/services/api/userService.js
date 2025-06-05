import apiClient from './apiClient';

const userService = {
  // Obtener perfil del usuario actual
  getCurrentProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // Subir imagen de perfil
  uploadProfileImage: async (formData) => {
    try {
      const response = await apiClient.post('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al subir imagen' };
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/user/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estadísticas' };
    }
  },

  // Obtener juegos favoritos del usuario
  getFavoriteGames: async () => {
    try {
      const response = await apiClient.get('/juegos/favoritos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener juegos favoritos' };
    }
  },

  // Buscar usuarios por nombre
  searchUsers: async (query) => {
    try {
      const response = await apiClient.get(`/usuarios/buscar?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al buscar usuarios' };
    }
  }
};

export default userService; 