import { useState, useEffect, useCallback } from 'react';
import gameService from '../services/api/gameService';
import authService from '../services/api/authService';

// Caché global para almacenar los estados de favoritos
// Esto evita tener que hacer llamadas innecesarias a la API
let favoritesCache = {
  favoriteGames: [], // lista de juegos favoritos
  favoriteStatus: {}, // objeto con formato {gameId: boolean}
  lastFetched: null, // timestamp de la última actualización
  statusLastFetched: {}, // objeto con formato {gameId: timestamp}
  isFetching: false,
  isStatusFetching: {} // objeto con formato {gameId: boolean}
};

// Tiempo de expiración de la caché en milisegundos (3 minutos)
const CACHE_EXPIRATION = 3 * 60 * 1000;

/**
 * Hook personalizado para manejar los favoritos de un juego específico
 * @param {number} gameId - ID del juego (opcional)
 * @returns {Array} - [isFavorite, toggleFavorite, loading, error, message]
 */
export const useFavorite = (gameId) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const isAuthenticated = authService.isAuthenticated();

  // Función para mostrar un mensaje temporal
  const showMessage = useCallback((msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    }
  }, []);

  // Verificar si el juego está en favoritos
  const checkFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated || !gameId) {
      setIsFavorite(false);
      return;
    }

    setLoading(true);

    try {
      // Verificar si tenemos el estado en caché y si no está expirado
      const cachedStatus = favoritesCache.favoriteStatus[gameId];
      const lastFetched = favoritesCache.statusLastFetched[gameId];
      const isCacheExpired = !lastFetched || (Date.now() - lastFetched > CACHE_EXPIRATION);

      // Si el estado está en caché y no está expirado, lo usamos
      if (cachedStatus !== undefined && !isCacheExpired) {
        setIsFavorite(cachedStatus);
        setLoading(false);
        return;
      }

      // Si no está en caché o está expirado, hacemos la petición al servidor
      if (!favoritesCache.isStatusFetching[gameId]) {
        favoritesCache.isStatusFetching[gameId] = true;

        const status = await gameService.isFavorite(gameId);

        // Guardamos en la caché
        favoritesCache.favoriteStatus[gameId] = status;
        favoritesCache.statusLastFetched[gameId] = Date.now();

        setIsFavorite(status);

        favoritesCache.isStatusFetching[gameId] = false;
      }
    } catch (err) {
      console.error('Error al verificar estado de favorito:', err);
      setIsFavorite(false);
    } finally {
      setLoading(false);
    }
  }, [gameId, isAuthenticated]);

  // Alternar estado de favorito
  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || !gameId) {
      showMessage('Debes iniciar sesión para gestionar favoritos', true);
      return false;
    }

    setLoading(true);

    try {
      let response;
      const newStatus = !isFavorite;

      // Usar la función adecuada según el estado actual
      if (isFavorite) {
        response = await gameService.removeFromFavorites(gameId);
      } else {
        response = await gameService.addToFavorites(gameId);
      }

      if (response.status === 'success') {
        // Actualizamos el estado local
        setIsFavorite(newStatus);

        // Actualizamos la caché
        favoritesCache.favoriteStatus[gameId] = newStatus;
        favoritesCache.statusLastFetched[gameId] = Date.now();

        // Invalidamos la caché de la lista de favoritos para que se actualice
        favoritesCache.lastFetched = null;

        // Mostrar mensaje de confirmación
        showMessage(
          newStatus
            ? 'Juego añadido a favoritos'
            : 'Juego eliminado de favoritos'
        );

        return true;
      }
    } catch (err) {
      console.error('Error al alternar favorito:', err);

      // Manejar específicamente el error de no autenticación
      if (err.message === 'Unauthenticated.' || err.status === 401) {
        showMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', true);
      } else {
        showMessage(err?.message || 'Error al actualizar favoritos', true);
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [gameId, isFavorite, isAuthenticated, showMessage]);

  // Verificar el estado inicial
  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return [isFavorite, toggleFavorite, loading, error, message];
};

/**
 * Hook personalizado para manejar la lista de juegos favoritos
 * @returns {Array} - [favoriteGames, loading, error, refreshFavorites]
 */
export const useFavorites = () => {
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthenticated = authService.isAuthenticated();

  // Obtener lista de juegos favoritos
  const fetchFavoriteGames = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteGames([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar si tenemos los datos en caché y si no están expirados
      const isCacheExpired = !favoritesCache.lastFetched ||
        (Date.now() - favoritesCache.lastFetched > CACHE_EXPIRATION);

      // Si los datos están en caché y no están expirados, los usamos
      if (favoritesCache.favoriteGames.length > 0 && !isCacheExpired) {
        setFavoriteGames(favoritesCache.favoriteGames);
        setLoading(false);
        return;
      }

      // Si no están en caché o están expirados, hacemos la petición al servidor
      if (!favoritesCache.isFetching) {
        favoritesCache.isFetching = true;

        const games = await gameService.getFavoriteGames();

        // Guardamos en la caché
        favoritesCache.favoriteGames = games;
        favoritesCache.lastFetched = Date.now();

        // También actualizamos la caché de estados individuales
        games.forEach(game => {
          favoritesCache.favoriteStatus[game.id] = true;
          favoritesCache.statusLastFetched[game.id] = Date.now();
        });

        setFavoriteGames(games);

        favoritesCache.isFetching = false;
      }
    } catch (err) {
      console.error('Error al obtener juegos favoritos:', err);
      setError(err?.message || 'Error al obtener juegos favoritos');
      setFavoriteGames([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refrescar lista de favoritos
  const refreshFavorites = useCallback(() => {
    // Invalidar caché y recargar
    favoritesCache.lastFetched = null;
    fetchFavoriteGames();
  }, [fetchFavoriteGames]);

  // Obtener la lista inicial
  useEffect(() => {
    fetchFavoriteGames();
  }, [fetchFavoriteGames]);

  return [favoriteGames, loading, error, refreshFavorites];
};

/**
 * Hook para buscar en juegos favoritos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - [filteredGames, loading, error]
 */
export const useSearchFavorites = (searchTerm = '') => {
  const [favoriteGames, loading, error] = useFavorites();
  const [filteredGames, setFilteredGames] = useState([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGames(favoriteGames);
    } else {
      const filtered = favoriteGames.filter(game =>
        game.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered);
    }
  }, [favoriteGames, searchTerm]);

  return [filteredGames, loading, error];
};

// Función para limpiar la caché (útil al cerrar sesión)
export const clearFavoritesCache = () => {
  favoritesCache = {
    favoriteGames: [],
    favoriteStatus: {},
    lastFetched: null,
    statusLastFetched: {},
    isFetching: false,
    isStatusFetching: {}
  };
};

export default useFavorite; 