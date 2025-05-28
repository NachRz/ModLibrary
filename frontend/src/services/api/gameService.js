import apiClient from './apiClient';

// Datos de ejemplo para cuando el backend no está disponible
const MOCK_GAMES = [
  { 
    id: 1, 
    title: 'Skyrim Special Edition',
    background_image: 'https://media.rawg.io/media/games/62c/62c7c8b28a27b83680b22fb9d33fc619.jpg',
    total_mods: 110200,
    rating: 4.8,
    release_date: '2016-10-28',
    genres: ['RPG', 'Acción', 'Aventura'],
    platforms: ['PC', 'PS4', 'Xbox One']
  },
  { 
    id: 2, 
    title: 'Fallout 4',
    background_image: 'https://media.rawg.io/media/games/d82/d82990b9c67ba0d2d09d4e6fa88885a7.jpg',
    total_mods: 65700,
    rating: 4.5,
    release_date: '2015-11-10',
    genres: ['RPG', 'Acción', 'Shooter'],
    platforms: ['PC', 'PS4', 'Xbox One']
  },
  { 
    id: 3, 
    title: 'The Witcher 3: Wild Hunt',
    background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    total_mods: 7700,
    rating: 4.9,
    release_date: '2015-05-18',
    genres: ['RPG', 'Acción', 'Aventura', 'Fantasía'],
    platforms: ['PC', 'PS4', 'Xbox One', 'Nintendo Switch']
  },
  { 
    id: 4, 
    title: 'Cyberpunk 2077',
    background_image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
    total_mods: 15200,
    rating: 4.0,
    release_date: '2020-12-10',
    genres: ['RPG', 'Acción', 'Ciencia ficción'],
    platforms: ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series X|S']
  },
  { 
    id: 5, 
    title: 'Stardew Valley',
    background_image: 'https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg',
    total_mods: 22800,
    rating: 4.7,
    release_date: '2016-02-26',
    genres: ['RPG', 'Simulación', 'Indie'],
    platforms: ['PC', 'PS4', 'Xbox One', 'Nintendo Switch', 'Mobile']
  }
];

// Caché global para almacenar datos de juegos
let gamesCache = {
  allGames: [],
  gameDetails: {},
  lastFetched: null,
  isFetching: false
};

// Tiempo de expiración de la caché en milisegundos (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

const gameService = {
  // Obtener todos los juegos
  getAllGames: async () => {
    try {
      // Verificar si hay datos en caché y si son válidos
      if (
        gamesCache.allGames.length > 0 &&
        gamesCache.lastFetched &&
        Date.now() - gamesCache.lastFetched < CACHE_EXPIRATION
      ) {
        return gamesCache.allGames;
      }

      const response = await apiClient.get('/juegos');
      
      if (response.data.status === 'success') {
        gamesCache.allGames = response.data.data;
        gamesCache.lastFetched = Date.now();
        return response.data.data;
      }
      
      throw new Error('Error al obtener los juegos');
    } catch (error) {
      console.error('Error en getAllGames:', error);
      
      // Si hay un error de red, devolver datos de ejemplo
      if (error.code === 'ERR_NETWORK') {
        console.log('Usando datos de ejemplo mientras el backend no está disponible');
        return MOCK_GAMES;
      }
      
      throw error.response?.data || { message: 'Error al obtener los juegos' };
    }
  },

  // Obtener un juego por ID
  getGameById: async (id) => {
    try {
      // Verificar si el juego está en caché y si los datos son válidos
      if (
        gamesCache.gameDetails[id] &&
        gamesCache.gameDetails[id].lastFetched &&
        Date.now() - gamesCache.gameDetails[id].lastFetched < CACHE_EXPIRATION
      ) {
        return gamesCache.gameDetails[id].data;
      }

      const response = await apiClient.get(`/juegos/${id}`);
      
      if (response.data.status === 'success') {
        // Guardar en caché
        gamesCache.gameDetails[id] = {
          data: response.data.data,
          lastFetched: Date.now()
        };
        return response.data.data;
      }
      
      throw new Error('Error al obtener el juego');
    } catch (error) {
      console.error('Error en getGameById:', error);
      
      // Si hay un error de red, devolver el juego de ejemplo correspondiente
      if (error.code === 'ERR_NETWORK') {
        const mockGame = MOCK_GAMES.find(game => game.id === id);
        if (mockGame) return mockGame;
        throw new Error('Juego no encontrado');
      }
      
      throw error.response?.data || { message: 'Error al obtener el juego' };
    }
  },

  // Buscar juegos
  searchGames: async (query) => {
    try {
      const response = await apiClient.get('/juegos/buscar', {
        params: { query }
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Error al buscar juegos');
    } catch (error) {
      console.error('Error en searchGames:', error);
      
      // Si hay un error de red, filtrar los datos de ejemplo
      if (error.code === 'ERR_NETWORK') {
        return MOCK_GAMES.filter(game => 
          game.title.toLowerCase().includes(query.toLowerCase()) ||
          game.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      throw error.response?.data || { message: 'Error al buscar juegos' };
    }
  },

  // Obtener juegos filtrados
  getFilteredGames: async (filters) => {
    try {
      const response = await apiClient.get('/juegos/filtrar', { params: filters });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Error al filtrar juegos');
    } catch (error) {
      console.error('Error en getFilteredGames:', error);
      
      // Si hay un error de red, filtrar los datos de ejemplo
      if (error.code === 'ERR_NETWORK') {
        let filteredGames = [...MOCK_GAMES];
        
        // Aplicar filtros
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredGames = filteredGames.filter(game => 
            game.title.toLowerCase().includes(searchTerm) ||
            game.genres.some(genre => genre.toLowerCase().includes(searchTerm))
          );
        }
        
        if (filters.genre) {
          filteredGames = filteredGames.filter(game =>
            game.genres.some(genre => 
              genre.toLowerCase() === filters.genre.toLowerCase()
            )
          );
        }
        
        // Ordenar resultados
        if (filters.sort) {
          filteredGames.sort((a, b) => {
            switch (filters.sort) {
              case 'title':
                return a.title.localeCompare(b.title);
              case 'rating':
                return b.rating - a.rating;
              case 'release_date':
                return new Date(b.release_date) - new Date(a.release_date);
              case 'total_mods':
                return b.total_mods - a.total_mods;
              default:
                return 0;
            }
          });
        }
        
        // Invertir orden si es descendente
        if (filters.order === 'desc') {
          filteredGames.reverse();
        }
        
        return filteredGames;
      }
      
      throw error.response?.data || { message: 'Error al filtrar juegos' };
    }
  },

  // Sincronizar un juego con RAWG
  syncGame: async (id) => {
    try {
      const response = await apiClient.post(`/juegos/${id}/sincronizar`);
      
      if (response.data.status === 'success') {
        // Actualizar caché
        if (gamesCache.gameDetails[id]) {
          gamesCache.gameDetails[id] = {
            data: response.data.data,
            lastFetched: Date.now()
          };
        }
        return response.data.data;
      }
      
      throw new Error('Error al sincronizar el juego');
    } catch (error) {
      console.error('Error en syncGame:', error);
      throw error.response?.data || { message: 'Error al sincronizar el juego' };
    }
  },

  // Limpiar caché
  clearCache: () => {
    gamesCache = {
      allGames: [],
      gameDetails: {},
      lastFetched: null,
      isFetching: false
    };
  },

  // Buscar juegos en RAWG directamente
  searchRawgGames: async (query) => {
    try {
      const response = await apiClient.get('/juegos/buscar', {
        params: { query }
      });
      
      if (response.data && response.data.results) {
        return response.data.results.map(game => ({
          id: game.id,
          title: game.name,
          background_image: game.background_image,
          release_date: game.released,
          rating: game.rating
        }));
      }
      
      throw new Error('Error al buscar juegos en RAWG');
    } catch (error) {
      console.error('Error en searchRawgGames:', error);
      throw error.response?.data || { message: 'Error al buscar juegos en RAWG' };
    }
  },

  // Obtener juegos iniciales ordenados alfabéticamente
  getInitialGames: async () => {
    try {
      const response = await apiClient.get('/juegos/buscar', {
        params: { 
          search: '',
          ordering: 'name',
          page: 1,
          page_size: 40,
          key: process.env.REACT_APP_RAWG_API_KEY
        }
      });
      
      if (response.data && response.data.results) {
        const sortedGames = response.data.results
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(game => ({
            id: game.id,
            title: game.name,
            background_image: game.background_image,
            release_date: game.released,
            rating: game.rating
          }));
        
        return sortedGames;
      }
      
      throw new Error('Error al obtener los juegos iniciales');
    } catch (error) {
      console.error('Error en getInitialGames:', error);
      
      // Si hay un error de red, devolver datos de ejemplo ordenados
      if (error.code === 'ERR_NETWORK') {
        return MOCK_GAMES
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 40);
      }
      
      throw error.response?.data || { message: 'Error al obtener los juegos iniciales' };
    }
  },

  // Verificar y sincronizar un juego por su RAWG ID
  verifyAndSyncGame: async (rawgId) => {
    try {
      const response = await apiClient.post(`/juegos/${rawgId}/verify-sync`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al verificar/sincronizar el juego');
    } catch (error) {
      console.error('Error en verifyAndSyncGame:', error);
      throw error.response?.data || { message: 'Error al verificar/sincronizar el juego' };
    }
  },

  // ========== FUNCIONES DE FAVORITOS ==========

  // Obtener juegos favoritos del usuario
  getFavoriteGames: async () => {
    try {
      const response = await apiClient.get('/juegos/favoritos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener juegos favoritos:', error);
      throw error.response?.data || { message: 'Error al obtener juegos favoritos' };
    }
  },

  // Verificar si un juego está en favoritos
  isFavorite: async (gameId) => {
    try {
      const response = await apiClient.get(`/juegos/${gameId}/favorito`);
      return response.data.data?.es_favorito || false;
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      throw error.response?.data || { message: 'Error al verificar el estado del favorito' };
    }
  },

  // Añadir juego a favoritos
  addToFavorites: async (gameId) => {
    try {
      const response = await apiClient.post(`/juegos/${gameId}/favorito`);
      return response.data;
    } catch (error) {
      console.error('Error al añadir a favoritos:', error);
      throw error.response?.data || { message: 'Error al añadir el juego a favoritos' };
    }
  },

  // Quitar juego de favoritos
  removeFromFavorites: async (gameId) => {
    try {
      const response = await apiClient.delete(`/juegos/${gameId}/favorito`);
      return response.data;
    } catch (error) {
      console.error('Error al quitar de favoritos:', error);
      throw error.response?.data || { message: 'Error al quitar el juego de favoritos' };
    }
  }
};

export default gameService; 