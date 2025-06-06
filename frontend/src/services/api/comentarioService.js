import apiClient from './apiClient';

const comentarioService = {
  /**
   * Obtener comentarios de un mod específico
   * @param {number} modId - ID del mod
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise} - Promise con la respuesta de comentarios
   */
  getComentarios: async (modId, options = {}) => {
    try {
      const params = new URLSearchParams();

      if (options.page) params.append('page', options.page);
      if (options.perPage) params.append('per_page', options.perPage);
      if (options.sortBy) params.append('sort_by', options.sortBy);
      if (options.sortOrder) params.append('sort_order', options.sortOrder);

      const response = await apiClient.get(`/mods/${modId}/comentarios?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error.response?.data || {
        status: 'error',
        message: 'Error al cargar los comentarios'
      };
    }
  },

  /**
   * Crear un nuevo comentario
   * @param {number} modId - ID del mod
   * @param {string} contenido - Contenido del comentario
   * @returns {Promise} - Promise con el comentario creado
   */
  crearComentario: async (modId, contenido) => {
    try {
      const response = await apiClient.post(`/mods/${modId}/comentarios`, {
        contenido: contenido.trim()
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error.response?.data || {
        status: 'error',
        message: 'Error al publicar el comentario'
      };
    }
  },

  /**
   * Actualizar un comentario existente
   * @param {number} modId - ID del mod
   * @param {number} comentarioId - ID del comentario
   * @param {string} contenido - Nuevo contenido del comentario
   * @returns {Promise} - Promise con el comentario actualizado
   */
  actualizarComentario: async (modId, comentarioId, contenido) => {
    try {
      const response = await apiClient.put(`/mods/${modId}/comentarios/${comentarioId}`, {
        contenido: contenido.trim()
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error.response?.data || {
        status: 'error',
        message: 'Error al actualizar el comentario'
      };
    }
  },

  /**
   * Eliminar un comentario
   * @param {number} modId - ID del mod
   * @param {number} comentarioId - ID del comentario
   * @returns {Promise} - Promise con la confirmación de eliminación
   */
  eliminarComentario: async (modId, comentarioId) => {
    try {
      const response = await apiClient.delete(`/mods/${modId}/comentarios/${comentarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error.response?.data || {
        status: 'error',
        message: 'Error al eliminar el comentario'
      };
    }
  },

  /**
   * Obtener estadísticas de comentarios de un mod
   * @param {number} modId - ID del mod
   * @returns {Promise} - Promise con las estadísticas
   */
  getEstadisticas: async (modId) => {
    try {
      const response = await apiClient.get(`/mods/${modId}/comentarios/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de comentarios:', error);
      throw error.response?.data || {
        status: 'error',
        message: 'Error al cargar las estadísticas'
      };
    }
  }
};

export default comentarioService; 