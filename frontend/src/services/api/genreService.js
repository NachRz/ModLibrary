import apiClient from './apiClient';

// Caché para géneros
let genresCache = {
  allGenres: [],
  lastFetched: null,
  isFetching: false
};

// Tiempo de expiración de la caché (30 minutos)
const CACHE_EXPIRATION = 30 * 60 * 1000;

const genreService = {
  // Obtener todos los géneros
  getAllGenres: async () => {
    try {
      // Verificar caché
      if (
        genresCache.allGenres.length > 0 &&
        genresCache.lastFetched &&
        Date.now() - genresCache.lastFetched < CACHE_EXPIRATION &&
        !genresCache.isFetching
      ) {
        return genresCache.allGenres;
      }

      // Evitar múltiples peticiones simultáneas
      if (genresCache.isFetching) {
        return genresCache.allGenres;
      }

      genresCache.isFetching = true;

      const response = await apiClient.get('/generos');
      
      if (response.data.status === 'success') {
        genresCache.allGenres = response.data.data;
        genresCache.lastFetched = Date.now();
        genresCache.isFetching = false;
        
        return response.data.data;
      }
      
      throw new Error('Error al obtener géneros');
    } catch (error) {
      genresCache.isFetching = false;
      console.error('Error en getAllGenres:', error);
      
      // En caso de error, devolver géneros de ejemplo
      const mockGenres = [
        { id: 1, nombre: 'Acción', slug: 'action' },
        { id: 2, nombre: 'Aventura', slug: 'adventure' },
        { id: 3, nombre: 'RPG', slug: 'role-playing-games-rpg' },
        { id: 4, nombre: 'Estrategia', slug: 'strategy' },
        { id: 5, nombre: 'Simulación', slug: 'simulation' },
        { id: 6, nombre: 'Deportes', slug: 'sports' },
        { id: 7, nombre: 'Carreras', slug: 'racing' },
        { id: 8, nombre: 'Shooter', slug: 'shooter' },
        { id: 9, nombre: 'Casual', slug: 'casual' },
        { id: 10, nombre: 'Indie', slug: 'indie' }
      ];
      
      // Almacenar en caché los datos de ejemplo
      genresCache.allGenres = mockGenres;
      genresCache.lastFetched = Date.now();
      
      return mockGenres;
    }
  },

  // Obtener juegos filtrados por géneros
  getGamesByGenres: async (genreIds, filters = {}) => {
    try {
      const params = {
        generos: genreIds,
        page: filters.page || 1,
        per_page: filters.perPage || 20,
        ordenar_por: filters.sortBy || 'titulo',
        direccion: filters.order || 'asc'
      };

      const response = await apiClient.get('/generos/filtros/juegos', { params });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Error al filtrar juegos por géneros');
    } catch (error) {
      console.error('Error en getGamesByGenres:', error);
      throw error.response?.data || { message: 'Error al filtrar juegos por géneros' };
    }
  },

  // Obtener estadísticas de géneros
  getGenreStatistics: async () => {
    try {
      const response = await apiClient.get('/generos/estadisticas');
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Error al obtener estadísticas de géneros');
    } catch (error) {
      console.error('Error en getGenreStatistics:', error);
      throw error.response?.data || { message: 'Error al obtener estadísticas de géneros' };
    }
  },

  // Limpiar caché
  clearCache: () => {
    genresCache = {
      allGenres: [],
      lastFetched: null,
      isFetching: false
    };
  }
};

export default genreService; 